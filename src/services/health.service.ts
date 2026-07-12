/**
 * Health adapter for the ported dashboard. byndr-dev's public `/health` stays a
 * bare unauthenticated `{ ok: true }`; this authenticated `/api/health` returns
 * the richer, tenant-scoped shape byndrrr's getHealth expects, so the Cambios
 * and Ajustes screens read the fields they need.
 *
 * Some byndrrr fields have no direct byndr-dev source and are approximated:
 *  - `pat` is always false — byndr-dev is the cloud API and holds no EPLAN
 *    DataPortal token (the byndrrr desktop server is where a PAT would live).
 *  - `bridge_last_poll` is derived from the newest write-job `taken_at`, the
 *    best available proxy for when the polling bridge last drained work.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import { countArticlesByTenant } from "../repositories/article.repository.js";
import { countProposalsByStatus } from "../repositories/proposal.repository.js";
import {
  findLastDoneDryRun,
  findLastTakenAt,
} from "../repositories/write.repository.js";

/** The `/api/health` response, matching byndrrr's `Health` type. */
export interface HealthView {
  /** Always true when the worker answers. */
  ok: true;
  /** Whether the tenant has ingested one or more parts. */
  snapshot: boolean;
  /** Number of ingested parts for the tenant. */
  parts: number;
  /** DataPortal token present — always false in the cloud (approximated). */
  pat: boolean;
  /** ISO time the bridge last took a job (omitted when it never has). */
  bridge_last_poll?: string;
  /** Dry-run flag of the last completed job (omitted when none completed). */
  last_write_dry_run?: boolean;
  /** Number of changes awaiting human approval (validated proposals). */
  pending_changes: number;
}

/**
 * Assemble the tenant's health snapshot from article, proposal and write-job
 * counters.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns The health view byndrrr's dashboard reads.
 */
export async function getHealth(
  env: Env,
  tenant: Tenant,
): Promise<HealthView> {
  const [parts, byStatus, lastTakenAt, lastDryRun] = await Promise.all([
    countArticlesByTenant(env, tenant.id),
    countProposalsByStatus(env, tenant.id),
    findLastTakenAt(env, tenant.id),
    findLastDoneDryRun(env, tenant.id),
  ]);

  const health: HealthView = {
    ok: true,
    snapshot: parts > 0,
    parts,
    pat: false,
    pending_changes: byStatus["validated"] ?? 0,
  };
  if (lastTakenAt !== undefined) {
    health.bridge_last_poll = new Date(lastTakenAt).toISOString();
  }
  if (lastDryRun !== undefined) {
    health.last_write_dry_run = lastDryRun;
  }
  return health;
}
