/**
 * D1 access for reviewing gym proposals: listing by status and moving them
 * through the `validated → approved → applied` (or `rejected`) lifecycle.
 * Proposals stay overlay-only; the `articles` table is never touched here.
 */
import type { Env } from "../env.js";

/** A proposal as surfaced to a human reviewer. */
export interface ProposalView {
  /** Proposal id (uuid). */
  id: string;
  /** Manufacturer part number. */
  part_number: string;
  /** Variant discriminator ('' when none). */
  variant: string;
  /** Task type: 'translate' | 'describe'. */
  task_type: string;
  /** Edited field. */
  field: string;
  /** Target language ('' for describe). */
  lang: string;
  /** Prior value of the field. */
  old_value: string;
  /** Proposed value. */
  new_value: string;
  /** Model-reported confidence in [0, 1]. */
  confidence: number;
  /** Current status. */
  status: string;
}

/** The subset of a validated proposal needed to build a write change. */
export interface ValidatedProposal {
  /** Manufacturer part number. */
  part_number: string;
  /** Variant discriminator ('' when none). */
  variant: string;
  /** Field to write. */
  field: string;
  /** Target language ('' when not language-scoped). */
  lang: string;
  /** Value to write (the proposal's new value). */
  new_value: string;
}

/** Raw row shape for a proposal list read (confidence may be NULL in D1). */
interface ProposalRow {
  id: string;
  part_number: string;
  variant: string;
  task_type: string;
  field: string;
  lang: string;
  old_value: string;
  new_value: string;
  confidence?: number;
  status: string;
}

/**
 * List a tenant's proposals in a given status, newest first.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param status - Lifecycle status to filter on.
 * @returns The matching proposals as reviewer views.
 */
export async function listProposalsByStatus(
  env: Env,
  tenantId: string,
  status: string,
): Promise<ProposalView[]> {
  const result = await env.DB.prepare(
    `SELECT id, part_number, variant, task_type, field, lang,
            old_value, new_value, confidence, status
       FROM gym_proposals
      WHERE tenant_id = ? AND status = ?
      ORDER BY created_at DESC`,
  )
    .bind(tenantId, status)
    .all<ProposalRow>();
  return result.results.map((row) => ({
    id: row.id,
    part_number: row.part_number,
    variant: row.variant,
    task_type: row.task_type,
    field: row.field,
    lang: row.lang,
    old_value: row.old_value,
    new_value: row.new_value,
    confidence: row.confidence ?? 0,
    status: row.status,
  }));
}

/**
 * Load one `validated` proposal for a tenant, ready to enqueue.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param id - Proposal id.
 * @returns The proposal, or `undefined` when it is missing or not validated.
 */
export async function findValidatedProposal(
  env: Env,
  tenantId: string,
  id: string,
): Promise<ValidatedProposal | undefined> {
  const row = await env.DB.prepare(
    `SELECT part_number, variant, field, lang, new_value
       FROM gym_proposals
      WHERE id = ? AND tenant_id = ? AND status = 'validated'`,
  )
    .bind(id, tenantId)
    .first<ValidatedProposal>();
  return row ?? undefined;
}

/**
 * Move a `validated` proposal to `approved` and stamp its owning job. No-op
 * when the proposal is missing, already advanced, or owned by another tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param id - Proposal id.
 * @param jobId - Write job that now owns this proposal.
 */
export async function setProposalApproved(
  env: Env,
  tenantId: string,
  id: string,
  jobId: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE gym_proposals
        SET status = 'approved', job_id = ?
      WHERE id = ? AND tenant_id = ? AND status = 'validated'`,
  )
    .bind(jobId, id, tenantId)
    .run();
}

/**
 * Move a `validated` proposal to `rejected`.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param id - Proposal id.
 * @returns `true` when a validated proposal was rejected, else `false`.
 */
export async function rejectValidatedProposal(
  env: Env,
  tenantId: string,
  id: string,
): Promise<boolean> {
  const result = await env.DB.prepare(
    `UPDATE gym_proposals
        SET status = 'rejected'
      WHERE id = ? AND tenant_id = ? AND status = 'validated'
      RETURNING id`,
  )
    .bind(id, tenantId)
    .all<{ id: string }>();
  return result.results.length > 0;
}

/** A proposal row shaped for a changeset. */
export interface ChangesetProposalRow {
  /** Proposal id (uuid); becomes the changeset id. */
  id: string;
  /** Manufacturer part number. */
  part_number: string;
  /** Variant discriminator ('' when none). */
  variant: string;
  /** Edited field. */
  field: string;
  /** Target language ('' for describe). */
  lang: string;
  /** Prior value of the field. */
  old_value: string;
  /** Proposed value. */
  new_value: string;
  /** proposal lifecycle status. */
  status: string;
  /** Owning write job id ('' until approved). */
  job_id: string;
  /** Creation timestamp in epoch milliseconds. */
  created_at: number;
}

/** Column list selected for changeset reads, keeping the two queries in sync. */
const CHANGESET_COLUMNS =
  "id, part_number, variant, field, lang, old_value, new_value, status, job_id, created_at";

/**
 * List a tenant's proposals as changeset rows, newest first. With `status` the
 * list is filtered to that lifecycle status; without it every proposal is
 * returned.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param status - Optional proposal lifecycle status to filter on.
 * @returns The matching proposal rows.
 */
export async function listChangesetProposals(
  env: Env,
  tenantId: string,
  status?: string,
): Promise<ChangesetProposalRow[]> {
  const query =
    status === undefined
      ? env.DB.prepare(
          `SELECT ${CHANGESET_COLUMNS} FROM gym_proposals
             WHERE tenant_id = ? ORDER BY created_at DESC`,
        ).bind(tenantId)
      : env.DB.prepare(
          `SELECT ${CHANGESET_COLUMNS} FROM gym_proposals
             WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC`,
        ).bind(tenantId, status);
  const result = await query.all<ChangesetProposalRow>();
  return result.results;
}

/**
 * Count a tenant's proposals grouped by lifecycle status.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns A record of status to proposal count (statuses with no rows absent).
 */
export async function countProposalsByStatus(
  env: Env,
  tenantId: string,
): Promise<Record<string, number>> {
  const result = await env.DB.prepare(
    `SELECT status, COUNT(*) AS n FROM gym_proposals
       WHERE tenant_id = ? GROUP BY status`,
  )
    .bind(tenantId)
    .all<{ status: string; n: number }>();
  const counts: Record<string, number> = {};
  for (const row of result.results) {
    counts[row.status] = row.n;
  }
  return counts;
}

/** A proposal already approved and awaiting the bridge. */
export interface ApprovedProposalJob {
  /** Proposal id. */
  id: string;
  /** Owning write job id. */
  job_id: string;
}

/**
 * List a tenant's approved proposals and their owning write job ids. These are
 * the changes already enqueued for the bridge to drain.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The approved proposals with their job ids, newest first.
 */
export async function listApprovedProposalJobs(
  env: Env,
  tenantId: string,
): Promise<ApprovedProposalJob[]> {
  const result = await env.DB.prepare(
    `SELECT id, job_id FROM gym_proposals
       WHERE tenant_id = ? AND status = 'approved'
       ORDER BY created_at DESC`,
  )
    .bind(tenantId)
    .all<ApprovedProposalJob>();
  return result.results;
}

/**
 * Mark every proposal owned by a completed job as `applied`.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param jobId - Write job whose proposals were applied.
 */
export async function markJobProposalsApplied(
  env: Env,
  tenantId: string,
  jobId: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE gym_proposals
        SET status = 'applied'
      WHERE tenant_id = ? AND job_id = ?`,
  )
    .bind(tenantId, jobId)
    .run();
}
