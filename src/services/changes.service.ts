/**
 * Changes adapter: presents byndr-dev's gym proposals as byndrrr "changesets"
 * so the ported Cambios screen renders unchanged. Each validated/approved/
 * applied/rejected proposal maps to one changeset; byndr-dev's `validated`
 * status surfaces as byndrrr's `pending` (awaiting human approval).
 *
 * Approve and reject reuse the existing review service (approve enqueues a
 * write job for the bridge; reject moves a validated proposal to rejected), so
 * this adapter only translates statuses and response shapes.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import type { ApproveResult, RejectResult } from "./review.service.js";
import type { ChangesetProposalRow } from "../repositories/proposal.repository.js";
import { approveProposals, rejectProposals } from "./review.service.js";
import {
  countProposalsByStatus,
  listApprovedProposalJobs,
  listChangesetProposals,
} from "../repositories/proposal.repository.js";

/** byndrrr change statuses, in the order the Cambios tabs render them. */
const BYNDRRR_STATUSES = ["pending", "approved", "applied", "rejected"] as const;

/** One of byndrrr's change statuses. */
type ByndrrrStatus = (typeof BYNDRRR_STATUSES)[number];

/** Map a byndr-dev proposal status to its byndrrr change status. */
const DEV_TO_BYNDRRR: Record<string, ByndrrrStatus> = {
  validated: "pending",
  approved: "approved",
  applied: "applied",
  rejected: "rejected",
};

/** Map a byndrrr change status to the byndr-dev proposal status it filters. */
const BYNDRRR_TO_DEV: Record<ByndrrrStatus, string> = {
  pending: "validated",
  approved: "approved",
  applied: "applied",
  rejected: "rejected",
};

/** One field change inside a changeset (byndrrr's `Required<ChangeItem>`). */
export interface ChangeItem {
  /** Manufacturer part number. */
  part_number: string;
  /** Variant discriminator ('' when none). */
  variant: string;
  /** Edited field. */
  field: string;
  /** Target language ('' when not language-scoped). */
  lang: string;
  /** Prior value ('' when absent). */
  old: string;
  /** Proposed value ('' when clearing). */
  new: string;
}

/** A byndrrr changeset built from one gym proposal. */
export interface Changeset {
  /** Changeset id (the proposal id). */
  id: string;
  /** byndrrr status (validated surfaces as pending). */
  status: ByndrrrStatus;
  /** Human title derived from the part number and field. */
  title: string;
  /** Author label; every changeset here originates from the gym. */
  author: string;
  /** Creation time as an ISO-8601 string. */
  created: string;
  /** The single field change this proposal carries. */
  items: ChangeItem[];
  /** Owning write job id ('' until approved). */
  job_id: string;
  /** Last apply result ('' — byndr-dev tracks results on write jobs). */
  last_result: string;
}

/** The `/api/changes` response: the filtered changesets plus per-status counts. */
export interface ChangesResponse {
  /** Changesets matching the requested status filter, newest first. */
  items: Changeset[];
  /** Count per byndrrr status ({@link BYNDRRR_STATUSES}), validated == pending. */
  counts: Record<ByndrrrStatus, number>;
}

/** The `/api/changes/apply` response, mirroring byndrrr's `{ queued }` shape. */
export interface ApplyResponse {
  /** Always true; approving already enqueued the work. */
  ok: true;
  /** Approved changes awaiting the bridge, as `{ change_id, job_id }`. */
  queued: { change_id: string; job_id: string }[];
}

/** Build a changeset title from a proposal's part number, field and language. */
function titleOf(row: ChangesetProposalRow): string {
  const suffix = row.lang.length > 0 ? ` · ${row.lang}` : "";
  return `${row.part_number} · ${row.field}${suffix}`;
}

/** Map one proposal row to its byndrrr changeset. */
function toChangeset(row: ChangesetProposalRow): Changeset {
  return {
    id: row.id,
    status: DEV_TO_BYNDRRR[row.status] ?? "pending",
    title: titleOf(row),
    author: "gym",
    created: new Date(row.created_at).toISOString(),
    items: [
      {
        part_number: row.part_number,
        variant: row.variant,
        field: row.field,
        lang: row.lang,
        old: row.old_value,
        new: row.new_value,
      },
    ],
    job_id: row.job_id,
    last_result: "",
  };
}

/**
 * List changesets for a tenant, optionally filtered by byndrrr status, plus the
 * per-status counts the Cambios tabs show. An unknown status yields no items
 * but still returns full counts.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param status - Optional byndrrr status filter ('' or absent for all).
 * @returns `{ items, counts }`.
 */
export async function listChanges(
  env: Env,
  tenant: Tenant,
  status: string,
): Promise<ChangesResponse> {
  const trimmed = status.trim();
  let rows: ChangesetProposalRow[];
  if (trimmed.length === 0) {
    rows = await listChangesetProposals(env, tenant.id);
  } else {
    const devStatus = BYNDRRR_TO_DEV[trimmed as ByndrrrStatus];
    rows =
      devStatus === undefined
        ? []
        : await listChangesetProposals(env, tenant.id, devStatus);
  }

  const byStatus = await countProposalsByStatus(env, tenant.id);
  const counts: Record<ByndrrrStatus, number> = {
    pending: byStatus["validated"] ?? 0,
    approved: byStatus["approved"] ?? 0,
    applied: byStatus["applied"] ?? 0,
    rejected: byStatus["rejected"] ?? 0,
  };

  return { items: rows.map(toChangeset), counts };
}

/**
 * Approve one changeset by id: delegates to the review service, which moves the
 * proposal `validated → approved` and enqueues a write job for the bridge.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param id - Changeset (proposal) id from the path.
 * @returns The review service's `{ ok, job_id, count }`.
 * @throws {HttpError} 400 when the id is not a validated proposal.
 */
export async function approveChange(
  env: Env,
  tenant: Tenant,
  id: string,
): Promise<ApproveResult> {
  return approveProposals(env, tenant, { id });
}

/**
 * Reject one changeset by id: delegates to the review service, moving the
 * proposal `validated → rejected`. The byndrrr reason is accepted but not
 * stored (byndr-dev keeps no reason column).
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param id - Changeset (proposal) id from the path.
 * @returns The review service's `{ ok, count }`.
 */
export async function rejectChange(
  env: Env,
  tenant: Tenant,
  id: string,
): Promise<RejectResult> {
  return rejectProposals(env, tenant, { id });
}

/**
 * Apply approved changes. In byndr-dev, approving already enqueued the work for
 * the bridge, so this is a no-op that reports what is currently queued —
 * keeping byndrrr's `{ queued: [{ change_id, job_id }] }` shape.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ ok, queued }`.
 */
export async function applyChanges(
  env: Env,
  tenant: Tenant,
): Promise<ApplyResponse> {
  const approved = await listApprovedProposalJobs(env, tenant.id);
  return {
    ok: true,
    queued: approved.map((row) => ({ change_id: row.id, job_id: row.job_id })),
  };
}
