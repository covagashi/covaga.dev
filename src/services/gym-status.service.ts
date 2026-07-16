/**
 * Gym status adapter for the ported Gym screen. Mirrors the ported dashboard's
 * `/api/gym/status` shape (`{ available, episodes, proposals }`) over
 * Covaga Hub's real gym data: `gym_episodes` become the episode rows the curve
 * and table render, and `gym_proposals` grouped by status become the proposal
 * tallies. `available` is true once the tenant has one episode or proposal.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import { listEpisodes } from "../repositories/gym.repository.js";
import { countProposalsByStatus } from "../repositories/proposal.repository.js";

/** One episode row as the Gym table/curve reads it. */
export interface EpisodeView {
  /** Sequential episode number (1-based, in start order). */
  episode: number;
  /** Short task label; Covaga Hub episodes carry no per-task label. */
  task: string;
  /** Submissions made in the episode (the ported dashboard's "done"). */
  done: number;
  /** Submissions that validated in the episode (the ported dashboard's "ok"). */
  ok: number;
}

/** The `/api/gym/status` response. */
export interface GymStatusView {
  /** True once the tenant has one episode or proposal. */
  available: boolean;
  /** Episodes in start order, newest concerns last. */
  episodes: EpisodeView[];
  /** Proposal counts keyed by Covaga Hub status. */
  proposals: Record<string, number>;
}

/**
 * Build the Gym status view for a tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ available, episodes, proposals }`.
 */
export async function getGymStatus(
  env: Env,
  tenant: Tenant,
): Promise<GymStatusView> {
  const [rows, proposals] = await Promise.all([
    listEpisodes(env, tenant.id),
    countProposalsByStatus(env, tenant.id),
  ]);

  const episodes: EpisodeView[] = rows.map((row, index) => ({
    episode: index + 1,
    task: "",
    done: row.submitted,
    ok: row.validated,
  }));

  let proposalTotal = 0;
  for (const key of Object.keys(proposals)) {
    proposalTotal += proposals[key] ?? 0;
  }

  return {
    available: episodes.length > 0 || proposalTotal > 0,
    episodes,
    proposals,
  };
}
