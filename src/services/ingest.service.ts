import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import type { ArticleUpsert } from "../models/article.js";
import { HttpError } from "../errors.js";
import { enrichPart } from "../lib/multilang.js";
import {
  countArticlesByTenant,
  deleteStaleArticles,
  upsertArticles,
} from "../repositories/article.repository.js";
import {
  createIngest,
  finishIngest as finishIngestRow,
  findIngestForTenant,
  incrementReceived,
} from "../repositories/ingest.repository.js";

/** Response of `POST /api/ingest/start`. */
export interface StartResult {
  ok: true;
  snapshot_id: string;
}

/** Response of `POST /api/ingest/batch`. */
export interface BatchResult {
  ok: true;
  received: number;
}

/** Response of `POST /api/ingest/finish`. */
export interface FinishResult {
  ok: true;
  total: number;
}

/** Narrow an unknown value to a plain (non-array) object or fail with 400. */
function asRecord(value: unknown): Record<string, unknown> {
  if (Object(value) !== value || Array.isArray(value)) {
    throw new HttpError(400, "invalid_body");
  }
  return value as Record<string, unknown>;
}

/** Read an optional string field, ignoring non-string values. */
function optString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

/** Read an optional number field, ignoring non-number values. */
function optNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" ? value : undefined;
}

/** Read a required non-empty string field or fail with 400. */
function reqString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new HttpError(400, `invalid_${key}`);
  }
  return value;
}

/**
 * Start an ingest: create a snapshot for the tenant and return its id.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed request body (`{ source?, machine?, user?, total? }`).
 * @returns `{ ok, snapshot_id }`.
 */
export async function startIngest(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<StartResult> {
  const record = asRecord(body);
  const snapshotId = crypto.randomUUID();

  await createIngest(env, {
    id: snapshotId,
    tenantId: tenant.id,
    source: optString(record, "source"),
    machine: optString(record, "machine"),
    appUser: optString(record, "user"),
    totalReported: optNumber(record, "total"),
    startedAt: Date.now(),
  });

  return { ok: true, snapshot_id: snapshotId };
}

/**
 * Ingest a batch of parts: verify snapshot ownership, enrich and UPSERT each
 * part, and advance the ingest's received counter.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ snapshot_id, seq, parts }`).
 * @returns `{ ok, received }` where `received` counts parts in this batch.
 * @throws {HttpError} 404 when the snapshot is not owned by the tenant.
 */
export async function ingestBatch(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<BatchResult> {
  const record = asRecord(body);
  const snapshotId = reqString(record, "snapshot_id");
  const parts = record["parts"];
  if (!Array.isArray(parts)) {
    throw new HttpError(400, "invalid_parts");
  }

  const ingest = await findIngestForTenant(env, snapshotId, tenant.id);
  if (ingest === undefined) {
    throw new HttpError(404, "not_found");
  }

  const now = Date.now();
  const rows: ArticleUpsert[] = parts.map((part) => {
    const enriched = enrichPart(asRecord(part));
    const partNumber = enriched["part_number"];
    if (typeof partNumber !== "string" || partNumber.length === 0) {
      throw new HttpError(400, "invalid_part_number");
    }
    const variant = enriched["variant"];
    const manufacturer = enriched["manufacturer"];
    const description = enriched["description"];
    return {
      tenantId: tenant.id,
      partNumber,
      variant: typeof variant === "string" ? variant : "",
      manufacturer: typeof manufacturer === "string" ? manufacturer : "",
      description: typeof description === "string" ? description : "",
      data: JSON.stringify(enriched),
      snapshotId,
      updatedAt: now,
    };
  });

  await upsertArticles(env, rows);
  await incrementReceived(env, snapshotId, tenant.id, rows.length);

  return { ok: true, received: rows.length };
}

/**
 * Finish an ingest: verify ownership, stamp `finished_at`, delete parts absent
 * from this snapshot, and return the tenant's resulting article count.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ snapshot_id, sent? }`).
 * @returns `{ ok, total }` where `total` is the tenant's article count.
 * @throws {HttpError} 404 when the snapshot is not owned by the tenant.
 */
export async function finishIngest(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<FinishResult> {
  const record = asRecord(body);
  const snapshotId = reqString(record, "snapshot_id");

  const ingest = await findIngestForTenant(env, snapshotId, tenant.id);
  if (ingest === undefined) {
    throw new HttpError(404, "not_found");
  }

  await finishIngestRow(env, snapshotId, tenant.id, Date.now());
  await deleteStaleArticles(env, tenant.id, snapshotId);
  const total = await countArticlesByTenant(env, tenant.id);

  return { ok: true, total };
}
