import type { Env } from "../env.js";
import type { Ingest } from "../models/ingest.js";

/** Shape of a row in the `ingests` table (nullable columns as optional). */
interface IngestRow {
  id: string;
  tenant_id: string;
  source?: string;
  machine?: string;
  app_user?: string;
  total_reported?: number;
  received: number;
  started_at: number;
  finished_at?: number;
}

/** Column values needed to create an ingest row. */
export interface CreateIngestParams {
  /** Snapshot id (uuid). */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Source label, if reported. */
  source?: string;
  /** Machine name, if reported. */
  machine?: string;
  /** Application user, if reported. */
  appUser?: string;
  /** Expected part total, if reported. */
  totalReported?: number;
  /** Start timestamp in epoch milliseconds. */
  startedAt: number;
}

/** Map a raw D1 row to the domain `Ingest` model. */
function toIngest(row: IngestRow): Ingest {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    source: row.source ?? undefined,
    machine: row.machine ?? undefined,
    appUser: row.app_user ?? undefined,
    totalReported: row.total_reported ?? undefined,
    received: row.received,
    startedAt: row.started_at,
    finishedAt: row.finished_at ?? undefined,
  };
}

/**
 * Insert a new ingest row. Unreported optional metadata is stored as an empty
 * string (text) or `0` (total), keeping the domain free of nullish values.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param params - Column values for the new ingest.
 */
export async function createIngest(
  env: Env,
  params: CreateIngestParams,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO ingests
       (id, tenant_id, source, machine, app_user, total_reported, received, started_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
  )
    .bind(
      params.id,
      params.tenantId,
      params.source ?? "",
      params.machine ?? "",
      params.appUser ?? "",
      params.totalReported ?? 0,
      params.startedAt,
    )
    .run();
}

/**
 * Look up an ingest by snapshot id, scoped to its owning tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param snapshotId - Ingest / snapshot id.
 * @param tenantId - Tenant that must own the ingest.
 * @returns The ingest, or `undefined` if none matches for this tenant.
 */
export async function findIngestForTenant(
  env: Env,
  snapshotId: string,
  tenantId: string,
): Promise<Ingest | undefined> {
  const row = await env.DB.prepare(
    `SELECT id, tenant_id, source, machine, app_user, total_reported,
            received, started_at, finished_at
       FROM ingests
      WHERE id = ? AND tenant_id = ?`,
  )
    .bind(snapshotId, tenantId)
    .first<IngestRow>();
  return row ? toIngest(row) : undefined;
}

/**
 * Increment the `received` counter of an ingest.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param snapshotId - Ingest / snapshot id.
 * @param tenantId - Owning tenant id.
 * @param delta - Number of parts to add to the counter.
 */
export async function incrementReceived(
  env: Env,
  snapshotId: string,
  tenantId: string,
  delta: number,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE ingests SET received = received + ?
      WHERE id = ? AND tenant_id = ?`,
  )
    .bind(delta, snapshotId, tenantId)
    .run();
}

/**
 * Stamp an ingest as finished.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param snapshotId - Ingest / snapshot id.
 * @param tenantId - Owning tenant id.
 * @param finishedAt - Finish timestamp in epoch milliseconds.
 */
export async function finishIngest(
  env: Env,
  snapshotId: string,
  tenantId: string,
  finishedAt: number,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE ingests SET finished_at = ?
      WHERE id = ? AND tenant_id = ?`,
  )
    .bind(finishedAt, snapshotId, tenantId)
    .run();
}
