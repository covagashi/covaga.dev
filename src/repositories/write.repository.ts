/**
 * D1 access for the write queue. Jobs are created when proposals are approved,
 * taken (atomically) by the polling bridge, and completed when it reports back.
 */
import type { Env } from "../env.js";
import type { WriteChange, WriteJob, WriteJobStatus } from "../models/write.js";

/** Shape of a row in the `write_jobs` table (nullable columns optional). */
interface WriteJobRow {
  id: string;
  tenant_id: string;
  status: string;
  source: string;
  changes: string;
  created_at: number;
  taken_at?: number;
  done_at?: number;
  dry_run: number;
  summary: string;
  results: string;
}

/** Column values needed to create a pending write job. */
export interface CreateWriteJobParams {
  /** Job id (uuid). */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Origin label (e.g. 'gym'). */
  source: string;
  /** Serialised JSON array of {@link WriteChange}. */
  changes: string;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}

/** Fields the bridge reports when it finishes a job. */
export interface CompleteWriteJobParams {
  /** Completion timestamp in epoch milliseconds. */
  doneAt: number;
  /** Whether the apply was a dry run. */
  dryRun: boolean;
  /** Free-text summary reported by the bridge. */
  summary: string;
  /** Raw JSON results reported by the bridge. */
  results: string;
}

/** Narrow one parsed change entry, dropping anything malformed. */
function toChange(value: unknown): WriteChange | undefined {
  if (Object(value) !== value || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const str = (key: string): string =>
    typeof record[key] === "string" ? (record[key] as string) : "";
  return {
    part_number: str("part_number"),
    variant: str("variant"),
    field: str("field"),
    lang: str("lang"),
    value: str("value"),
  };
}

/** Parse the stored `changes` JSON into a typed array (safe on error). */
function parseChanges(text: string): WriteChange[] {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    const out: WriteChange[] = [];
    for (const entry of parsed) {
      const change = toChange(entry);
      if (change !== undefined) {
        out.push(change);
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Map a raw D1 row to the domain {@link WriteJob} model. */
function toWriteJob(row: WriteJobRow): WriteJob {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    status: row.status as WriteJobStatus,
    source: row.source,
    changes: parseChanges(row.changes),
    createdAt: row.created_at,
    takenAt: row.taken_at ?? undefined,
    doneAt: row.done_at ?? undefined,
    dryRun: row.dry_run !== 0,
    summary: row.summary,
    results: row.results,
  };
}

/** Column list selected for every job read, keeping queries in sync. */
const JOB_COLUMNS =
  "id, tenant_id, status, source, changes, created_at, taken_at, done_at, dry_run, summary, results";

/**
 * Insert a fresh pending write job.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param params - Job identity, source and serialised changes.
 */
export async function insertWriteJob(
  env: Env,
  params: CreateWriteJobParams,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO write_jobs
       (id, tenant_id, status, source, changes, created_at, dry_run, summary, results)
     VALUES (?, ?, 'pending', ?, ?, ?, 0, '', '')`,
  )
    .bind(
      params.id,
      params.tenantId,
      params.source,
      params.changes,
      params.createdAt,
    )
    .run();
}

/**
 * Atomically take the tenant's oldest pending job: flip it to `taken` and stamp
 * `taken_at`, returning the taken job.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param takenAt - Take timestamp in epoch milliseconds.
 * @returns The taken job, or `undefined` when none was pending.
 */
export async function takeOldestPendingJob(
  env: Env,
  tenantId: string,
  takenAt: number,
): Promise<WriteJob | undefined> {
  const row = await env.DB.prepare(
    `UPDATE write_jobs
        SET status = 'taken', taken_at = ?
      WHERE id = (
              SELECT id FROM write_jobs
               WHERE tenant_id = ? AND status = 'pending'
               ORDER BY created_at ASC
               LIMIT 1
            )
      RETURNING ${JOB_COLUMNS}`,
  )
    .bind(takenAt, tenantId)
    .first<WriteJobRow>();
  return row ? toWriteJob(row) : undefined;
}

/**
 * Look up a job by id, scoped to its owning tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param jobId - Job id.
 * @returns The job, or `undefined` when none matches for this tenant.
 */
export async function findWriteJob(
  env: Env,
  tenantId: string,
  jobId: string,
): Promise<WriteJob | undefined> {
  const row = await env.DB.prepare(
    `SELECT ${JOB_COLUMNS} FROM write_jobs WHERE id = ? AND tenant_id = ?`,
  )
    .bind(jobId, tenantId)
    .first<WriteJobRow>();
  return row ? toWriteJob(row) : undefined;
}

/**
 * Mark a job `done`, recording the bridge's report. No-op when the job does not
 * belong to the tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param jobId - Job id.
 * @param params - Completion timestamp and reported fields.
 */
export async function completeWriteJob(
  env: Env,
  tenantId: string,
  jobId: string,
  params: CompleteWriteJobParams,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE write_jobs
        SET status = 'done', done_at = ?, dry_run = ?, summary = ?, results = ?
      WHERE id = ? AND tenant_id = ?`,
  )
    .bind(
      params.doneAt,
      params.dryRun ? 1 : 0,
      params.summary,
      params.results,
      jobId,
      tenantId,
    )
    .run();
}

/**
 * Return a `taken` (not yet done) job to `pending` and clear its `taken_at`.
 * No-op when the job is missing, not taken, or owned by another tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param jobId - Job id.
 */
export async function requeueWriteJob(
  env: Env,
  tenantId: string,
  jobId: string,
): Promise<void> {
  await env.DB.prepare(
    `UPDATE write_jobs
        SET status = 'pending', taken_at = NULL
      WHERE id = ? AND tenant_id = ? AND status = 'taken'`,
  )
    .bind(jobId, tenantId)
    .run();
}

/**
 * List every job for a tenant, newest first (status / audit view).
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The tenant's jobs.
 */
export async function listWriteJobs(
  env: Env,
  tenantId: string,
): Promise<WriteJob[]> {
  const result = await env.DB.prepare(
    `SELECT ${JOB_COLUMNS} FROM write_jobs
      WHERE tenant_id = ? ORDER BY created_at DESC`,
  )
    .bind(tenantId)
    .all<WriteJobRow>();
  return result.results.map(toWriteJob);
}
