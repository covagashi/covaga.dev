/**
 * D1 access for the Gym: episode bookkeeping and the overlay of validated
 * proposals. Never touches the `articles` table (proposals are overlay-only).
 */
import type { Env } from "../env.js";

/** Counters tracked per episode (and aggregated tenant-wide). */
export interface EpisodeCounts {
  /** Total proposals submitted. */
  submitted: number;
  /** Proposals that validated. */
  validated: number;
  /** Proposals that were rejected. */
  rejected: number;
}

/** Column values required to UPSERT one validated proposal. */
export interface ProposalUpsert {
  /** Proposal id (uuid); ignored on conflict where the existing id is kept. */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Manufacturer part number. */
  partNumber: string;
  /** Variant discriminator ('' when none). */
  variant: string;
  /** Task type: 'translate' | 'describe'. */
  taskType: string;
  /** Edited field (currently always 'description'). */
  field: string;
  /** Target language ('' for describe). */
  lang: string;
  /** Prior value of the field ('' when absent). */
  oldValue: string;
  /** Proposed, validated value. */
  newValue: string;
  /** Model-reported confidence in [0, 1]; 0 when not supplied. */
  confidence: number;
  /** Episode this proposal belongs to ('' when none). */
  episodeId: string;
  /** Validator report explaining acceptance. */
  validatorReport: string;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}

/**
 * Insert a fresh episode row.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param episode - Episode identity and start time.
 */
export async function insertEpisode(
  env: Env,
  episode: { id: string; tenantId: string; startedAt: number },
): Promise<void> {
  await env.DB.prepare(
    "INSERT INTO gym_episodes (id, tenant_id, started_at) VALUES (?, ?, ?)",
  )
    .bind(episode.id, episode.tenantId, episode.startedAt)
    .run();
}

/** One episode's counters plus its start time, for the status view. */
export interface EpisodeSummary {
  /** Episode start timestamp in epoch milliseconds. */
  startedAt: number;
  /** Total proposals submitted in the episode. */
  submitted: number;
  /** Proposals that validated in the episode. */
  validated: number;
}

/**
 * List a tenant's episodes oldest-first, with their submitted/validated
 * counters — the data the Gym status curve and table render.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The tenant's episodes in start order.
 */
export async function listEpisodes(
  env: Env,
  tenantId: string,
): Promise<EpisodeSummary[]> {
  const result = await env.DB.prepare(
    `SELECT started_at AS startedAt, submitted, validated
       FROM gym_episodes WHERE tenant_id = ?
      ORDER BY started_at ASC`,
  )
    .bind(tenantId)
    .all<EpisodeSummary>();
  return result.results;
}

/**
 * Read one episode's counters, scoped to the owning tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param episodeId - Episode id.
 * @returns The counters, or `undefined` when the episode is unknown.
 */
export async function findEpisodeCounts(
  env: Env,
  tenantId: string,
  episodeId: string,
): Promise<EpisodeCounts | undefined> {
  const row = await env.DB.prepare(
    `SELECT submitted, validated, rejected FROM gym_episodes
       WHERE id = ? AND tenant_id = ?`,
  )
    .bind(episodeId, tenantId)
    .first<EpisodeCounts>();
  return row ?? undefined;
}

/**
 * Aggregate every episode's counters for a tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns Tenant-wide submitted/validated/rejected totals.
 */
export async function aggregateEpisodeCounts(
  env: Env,
  tenantId: string,
): Promise<EpisodeCounts> {
  const row = await env.DB.prepare(
    `SELECT
       COALESCE(SUM(submitted), 0) AS submitted,
       COALESCE(SUM(validated), 0) AS validated,
       COALESCE(SUM(rejected), 0)  AS rejected
     FROM gym_episodes WHERE tenant_id = ?`,
  )
    .bind(tenantId)
    .first<EpisodeCounts>();
  return row ?? { submitted: 0, validated: 0, rejected: 0 };
}

/**
 * Bump an episode's counters after one submission. `submitted` always rises;
 * exactly one of `validated` / `rejected` rises too. No-op when the episode id
 * is empty or does not belong to the tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param episodeId - Episode id ('' to skip).
 * @param accepted - Whether the submission validated.
 */
export async function bumpEpisodeCounts(
  env: Env,
  tenantId: string,
  episodeId: string,
  accepted: boolean,
): Promise<void> {
  if (episodeId.length === 0) {
    return;
  }
  await env.DB.prepare(
    `UPDATE gym_episodes SET
       submitted = submitted + 1,
       validated = validated + ?,
       rejected  = rejected + ?
     WHERE id = ? AND tenant_id = ?`,
  )
    .bind(accepted ? 1 : 0, accepted ? 0 : 1, episodeId, tenantId)
    .run();
}

/**
 * UPSERT a validated proposal, keyed on the unique task index so re-submitting
 * the same (part, variant, type, field, lang) replaces the prior value.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param row - Proposal column values.
 */
export async function upsertProposal(
  env: Env,
  row: ProposalUpsert,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO gym_proposals
       (id, tenant_id, part_number, variant, task_type, field, lang,
        old_value, new_value, status, confidence, episode_id,
        validator_report, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'validated', ?, ?, ?, ?)
     ON CONFLICT (tenant_id, part_number, variant, task_type, field, lang)
     DO UPDATE SET
       old_value        = excluded.old_value,
       new_value        = excluded.new_value,
       status           = excluded.status,
       confidence       = excluded.confidence,
       episode_id       = excluded.episode_id,
       validator_report = excluded.validator_report,
       created_at       = excluded.created_at`,
  )
    .bind(
      row.id,
      row.tenantId,
      row.partNumber,
      row.variant,
      row.taskType,
      row.field,
      row.lang,
      row.oldValue,
      row.newValue,
      row.confidence,
      row.episodeId,
      row.validatorReport,
      row.createdAt,
    )
    .run();
}

/**
 * Read the id of the stored proposal for a task key, if one exists.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param partNumber - Manufacturer part number.
 * @param variant - Variant discriminator.
 * @param taskType - Task type.
 * @param field - Edited field.
 * @param lang - Target language.
 * @returns The proposal id, or `undefined` when none is stored.
 */
export async function findProposalId(
  env: Env,
  tenantId: string,
  partNumber: string,
  variant: string,
  taskType: string,
  field: string,
  lang: string,
): Promise<string | undefined> {
  const row = await env.DB.prepare(
    `SELECT id FROM gym_proposals
       WHERE tenant_id = ? AND part_number = ? AND variant = ?
         AND task_type = ? AND field = ? AND lang = ?`,
  )
    .bind(tenantId, partNumber, variant, taskType, field, lang)
    .first<{ id: string }>();
  return row?.id;
}

/**
 * Load the set of task keys that already have a validated proposal, so the
 * task lister can exclude closed gaps. Each key is
 * `part_number variant task_type field lang`.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns A set of encoded task keys.
 */
export async function loadValidatedTaskKeys(
  env: Env,
  tenantId: string,
): Promise<Set<string>> {
  const result = await env.DB.prepare(
    `SELECT part_number, variant, task_type, field, lang
       FROM gym_proposals WHERE tenant_id = ? AND status = 'validated'`,
  )
    .bind(tenantId)
    .all<{
      part_number: string;
      variant: string;
      task_type: string;
      field: string;
      lang: string;
    }>();
  const keys = new Set<string>();
  for (const row of result.results) {
    keys.add(
      [row.part_number, row.variant, row.task_type, row.field, row.lang].join(
        " ",
      ),
    );
  }
  return keys;
}
