/**
 * An ingest: a single snapshot-upload session for a tenant. Its `id` is the
 * `snapshot_id` that batches and the finish call reference.
 */
export interface Ingest {
  /** Snapshot id (uuid), unique per upload session. */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Free-form source label reported by the client. */
  source?: string;
  /** Machine name reported by the client. */
  machine?: string;
  /** Application user reported by the client. */
  appUser?: string;
  /** Total parts the client expects to send, if reported. */
  totalReported?: number;
  /** Count of parts received so far. */
  received: number;
  /** Start timestamp in epoch milliseconds. */
  startedAt: number;
  /** Finish timestamp in epoch milliseconds, once completed. */
  finishedAt?: number;
}
