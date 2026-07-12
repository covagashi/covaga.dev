/**
 * Review service: a human treats validated gym proposals like a pull request —
 * listing them, approving (which enqueues one write job for the bridge) or
 * rejecting. All D1 access is delegated to the proposal / write repositories.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import type { WriteChange } from "../models/write.js";
import type { ProposalView } from "../repositories/proposal.repository.js";
import { HttpError } from "../errors.js";
import {
  findValidatedProposal,
  listProposalsByStatus,
  rejectValidatedProposal,
  setProposalApproved,
} from "../repositories/proposal.repository.js";
import { insertWriteJob } from "../repositories/write.repository.js";

/** Statuses a reviewer may filter the proposal list by. */
const LISTABLE_STATUSES = new Set([
  "validated",
  "approved",
  "applied",
  "rejected",
]);

/** Fields the EPLAN bridge is allowed to write. */
const WRITABLE_FIELDS = new Set([
  "photo_path",
  "macro_path",
  "order_number",
  "ul_value",
  "ce_value",
  "note",
  "description",
]);

/** Maximum number of changes a single approved write job may carry. */
const MAX_CHANGES = 500;

/** Response of `POST /api/gym/proposals/approve`. */
export interface ApproveResult {
  ok: true;
  /** The write job created to carry the approved changes. */
  job_id: string;
  /** Number of changes enqueued. */
  count: number;
}

/** Response of `POST /api/gym/proposals/reject`. */
export interface RejectResult {
  ok: true;
  /** Number of proposals moved to `rejected`. */
  count: number;
}

/** Narrow an unknown value to a plain (non-array) object or fail with 400. */
function asRecord(value: unknown): Record<string, unknown> {
  if (Object(value) !== value || Array.isArray(value)) {
    throw new HttpError(400, "invalid_body");
  }
  return value as Record<string, unknown>;
}

/**
 * Read a de-duplicated id list from a body accepting `{ ids }`, `{ id }` or
 * both. Non-string and empty entries are ignored.
 */
function readIds(record: Record<string, unknown>): string[] {
  const seen = new Set<string>();
  const raw = record["ids"];
  if (Array.isArray(raw)) {
    for (const value of raw) {
      if (typeof value === "string" && value.length > 0) {
        seen.add(value);
      }
    }
  }
  const single = record["id"];
  if (typeof single === "string" && single.length > 0) {
    seen.add(single);
  }
  return [...seen];
}

/** Reject a change that targets a read-only or unsupported field (400). */
function assertWritableField(field: string): void {
  if (field === "erp_number") {
    throw new HttpError(400, "erp_read_only");
  }
  if (!WRITABLE_FIELDS.has(field)) {
    throw new HttpError(400, "unsupported_field");
  }
}

/**
 * List the tenant's proposals in a given status (defaults to `validated`).
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param status - Requested status filter.
 * @returns `{ proposals }` for the tenant.
 * @throws {HttpError} 400 for an unknown status.
 */
export async function listProposals(
  env: Env,
  tenant: Tenant,
  status: string,
): Promise<{ proposals: ProposalView[] }> {
  if (!LISTABLE_STATUSES.has(status)) {
    throw new HttpError(400, "invalid_status");
  }
  const proposals = await listProposalsByStatus(env, tenant.id, status);
  return { proposals };
}

/**
 * Approve validated proposals: build one change per proposal, enqueue them as a
 * single pending write job, and flip the proposals to `approved` with the job
 * id. Ids that are not validated for the tenant are skipped.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ ids }` and/or `{ id }`).
 * @returns `{ ok, job_id, count }`.
 * @throws {HttpError} 400 for no ids, no valid proposals, a read-only /
 * unsupported field, or more than {@link MAX_CHANGES} changes.
 */
export async function approveProposals(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<ApproveResult> {
  const ids = readIds(asRecord(body));
  if (ids.length === 0) {
    throw new HttpError(400, "no_ids");
  }

  const changes: WriteChange[] = [];
  const approvedIds: string[] = [];
  for (const id of ids) {
    const proposal = await findValidatedProposal(env, tenant.id, id);
    if (proposal === undefined) {
      continue;
    }
    assertWritableField(proposal.field);
    changes.push({
      part_number: proposal.part_number,
      variant: proposal.variant,
      field: proposal.field,
      lang: proposal.lang,
      value: proposal.new_value,
    });
    approvedIds.push(id);
  }

  if (changes.length === 0) {
    throw new HttpError(400, "no_valid_proposals");
  }
  if (changes.length > MAX_CHANGES) {
    throw new HttpError(400, "too_many_changes");
  }

  const jobId = crypto.randomUUID();
  await insertWriteJob(env, {
    id: jobId,
    tenantId: tenant.id,
    source: "gym",
    changes: JSON.stringify(changes),
    createdAt: Date.now(),
  });
  for (const id of approvedIds) {
    await setProposalApproved(env, tenant.id, id, jobId);
  }

  return { ok: true, job_id: jobId, count: changes.length };
}

/**
 * Reject validated proposals. Ids that are not validated for the tenant are
 * silently skipped.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ ids }` and/or `{ id }`).
 * @returns `{ ok, count }` where `count` is the number rejected.
 * @throws {HttpError} 400 when no ids are supplied.
 */
export async function rejectProposals(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<RejectResult> {
  const ids = readIds(asRecord(body));
  if (ids.length === 0) {
    throw new HttpError(400, "no_ids");
  }

  let count = 0;
  for (const id of ids) {
    if (await rejectValidatedProposal(env, tenant.id, id)) {
      count += 1;
    }
  }
  return { ok: true, count };
}
