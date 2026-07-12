/**
 * Domain models for the write queue: the individual field changes the EPLAN
 * bridge applies, and the jobs that carry them from cloud to bridge.
 */

/** Lifecycle of a write job as it is drained by the bridge. */
export type WriteJobStatus = "pending" | "taken" | "done";

/**
 * A single field write the bridge applies to one part. Field names are
 * validated against the supported set before a change is ever enqueued.
 */
export interface WriteChange {
  /** Manufacturer part number to edit. */
  part_number: string;
  /** Variant discriminator ('' when the part has no variant). */
  variant: string;
  /** Field to write (e.g. 'description'); never 'erp_number' (read-only). */
  field: string;
  /** Target language ('' when the field is not language-scoped). */
  lang: string;
  /** New value to write into the field. */
  value: string;
}

/**
 * A unit of work the bridge polls for and applies. One job holds every change
 * approved together, so the bridge drains them in a single transaction.
 */
export interface WriteJob {
  /** Job id (uuid). */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Current lifecycle status. */
  status: WriteJobStatus;
  /** Origin of the job (currently always 'gym'). */
  source: string;
  /** Ordered list of field changes to apply. */
  changes: WriteChange[];
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
  /** When the bridge took the job ('undefined' while still pending). */
  takenAt?: number;
  /** When the bridge reported completion ('undefined' until done). */
  doneAt?: number;
  /** Whether the last apply was a dry run (no real EPLAN write). */
  dryRun: boolean;
  /** Free-text summary the bridge reported ('' until reported). */
  summary: string;
  /** Raw JSON results the bridge reported ('' until reported). */
  results: string;
}
