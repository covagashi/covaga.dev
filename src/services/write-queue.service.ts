/**
 * Write-queue service: the EPLAN bridge polls for jobs, applies them locally,
 * and reports results. The cloud never writes EPLAN; it only hands out jobs and
 * records outcomes. Includes {@link jobToTxt}, the byte-exact line serialiser
 * the bridge parses.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import type { WriteChange, WriteJob } from "../models/write.js";
import { HttpError } from "../errors.js";
import {
  completeWriteJob,
  findWriteJob,
  listWriteJobs,
  requeueWriteJob,
  takeOldestPendingJob,
} from "../repositories/write.repository.js";
import { markJobProposalsApplied } from "../repositories/proposal.repository.js";

/** Sentinel body returned by the txt poll when no job is pending. */
export const POLL_NONE = "NONE\n";

/** A job as returned to clients, with results decoded from stored JSON. */
export interface WriteJobView {
  /** Job id (uuid). */
  id: string;
  /** Current lifecycle status. */
  status: string;
  /** Origin of the job. */
  source: string;
  /** Ordered list of field changes. */
  changes: WriteChange[];
  /** Creation timestamp in epoch milliseconds. */
  created_at: number;
  /** Take timestamp, when taken. */
  taken_at?: number;
  /** Completion timestamp, when done. */
  done_at?: number;
  /** Whether the last apply was a dry run. */
  dry_run: boolean;
  /** Free-text summary reported by the bridge. */
  summary: string;
  /** Decoded results reported by the bridge ('undefined' until reported). */
  results?: unknown;
}

/** Narrow an unknown value to a plain (non-array) object or fail with 400. */
function asRecord(value: unknown): Record<string, unknown> {
  if (Object(value) !== value || Array.isArray(value)) {
    throw new HttpError(400, "invalid_body");
  }
  return value as Record<string, unknown>;
}

/** Decode a stored results string into a value ('undefined' when empty). */
function decodeResults(results: string): unknown {
  if (results.length === 0) {
    return undefined;
  }
  try {
    return JSON.parse(results) as unknown;
  } catch {
    return results;
  }
}

/**
 * Serialise a job to the exact line format the bridge parses. Each field is
 * `encodeURIComponent`-encoded and tab-separated; the block ends with the
 * change count and a trailing newline.
 *
 * @param job - Job to serialise.
 * @returns The `JOB…/CHG…/END n\n` text block.
 */
export function jobToTxt(job: WriteJob): string {
  const enc = encodeURIComponent;
  const lines: string[] = [`JOB ${job.id}`];
  for (const change of job.changes) {
    lines.push(
      `CHG ${enc(change.part_number)}\t${enc(change.variant)}\t` +
        `${enc(change.field)}\t${enc(change.lang)}\t${enc(change.value)}`,
    );
  }
  lines.push(`END ${job.changes.length}`);
  return lines.join("\n") + "\n";
}

/** Map a domain {@link WriteJob} to its client-facing view. */
export function toJobView(job: WriteJob): WriteJobView {
  return {
    id: job.id,
    status: job.status,
    source: job.source,
    changes: job.changes,
    created_at: job.createdAt,
    taken_at: job.takenAt,
    done_at: job.doneAt,
    dry_run: job.dryRun,
    summary: job.summary,
    results: decodeResults(job.results),
  };
}

/**
 * Take the tenant's oldest pending job, flipping it to `taken`.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns The taken job, or `undefined` when none was pending.
 */
export async function pollJob(
  env: Env,
  tenant: Tenant,
): Promise<WriteJob | undefined> {
  return takeOldestPendingJob(env, tenant.id, Date.now());
}

/**
 * Record the bridge's result for a job: mark it `done` and, unless it was a dry
 * run, mark the job's proposals `applied`.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ job_id, dry_run?, summary?, results? }`).
 * @returns `{ ok: true }`.
 * @throws {HttpError} 400 for a missing `job_id`; 404 when the job is not the
 * tenant's.
 */
export async function submitResult(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<{ ok: true }> {
  const record = asRecord(body);
  const jobId = record["job_id"];
  if (typeof jobId !== "string" || jobId.length === 0) {
    throw new HttpError(400, "invalid_job_id");
  }

  const job = await findWriteJob(env, tenant.id, jobId);
  if (job === undefined) {
    throw new HttpError(404, "not_found");
  }

  const dryRun = record["dry_run"] === true;
  const summaryRaw = record["summary"];
  const summary = typeof summaryRaw === "string" ? summaryRaw : "";
  const resultsRaw = record["results"];
  const results = resultsRaw === undefined ? "" : JSON.stringify(resultsRaw);

  await completeWriteJob(env, tenant.id, jobId, {
    doneAt: Date.now(),
    dryRun,
    summary,
    results,
  });
  if (!dryRun) {
    await markJobProposalsApplied(env, tenant.id, jobId);
  }

  return { ok: true };
}

/**
 * Return a taken (not done) job to the pending queue.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ job_id }`).
 * @returns `{ ok: true }`.
 * @throws {HttpError} 400 for a missing `job_id`; 404 when the job is not the
 * tenant's.
 */
export async function requeueJob(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<{ ok: true }> {
  const record = asRecord(body);
  const jobId = record["job_id"];
  if (typeof jobId !== "string" || jobId.length === 0) {
    throw new HttpError(400, "invalid_job_id");
  }

  const job = await findWriteJob(env, tenant.id, jobId);
  if (job === undefined) {
    throw new HttpError(404, "not_found");
  }

  await requeueWriteJob(env, tenant.id, jobId);
  return { ok: true };
}

/**
 * List the tenant's write jobs (status / audit view).
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ jobs }` for the tenant, newest first.
 */
export async function listJobs(
  env: Env,
  tenant: Tenant,
): Promise<{ jobs: WriteJobView[] }> {
  const jobs = await listWriteJobs(env, tenant.id);
  return { jobs: jobs.map(toJobView) };
}
