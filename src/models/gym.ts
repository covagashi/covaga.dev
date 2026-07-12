/**
 * Domain models for the Gym: tasks the LLM can pick up, article context it
 * reads, the result of a submitted proposal, and aggregate metrics.
 */

/** Kind of text gap a task closes. */
export type TaskType = "translate" | "describe";

/** A single unit of work offered to the Gym LLM. */
export interface Task {
  /** Opaque id encoding the task target (see `task-id.ts`). */
  task_id: string;
  /** Manufacturer part number. */
  part_number: string;
  /** Variant discriminator; empty string when the part has no variant. */
  variant: string;
  /** Kind of gap to close. */
  task_type: TaskType;
  /** Article field to edit (currently always `description`). */
  field: "description";
  /** Target language for `translate`; empty string for `describe`. */
  lang: string;
  /** Short human-readable hint about the article, to prime the LLM. */
  context_hint: string;
}

/** Read-only context about an article, returned to the LLM before it acts. */
export interface ArticleContext {
  /** Manufacturer part number. */
  part_number: string;
  /** Variant discriminator; empty string when the part has no variant. */
  variant: string;
  /** Manufacturer name (empty when absent). */
  manufacturer: string;
  /** Product group label (empty when absent). */
  product_group: string;
  /** Product subgroup label (empty when absent). */
  product_subgroup: string;
  /** Preferred single-language description (empty when absent). */
  description: string;
  /** Per-language description map. */
  description_i18n: Record<string, string>;
  /** Required languages still missing a translation. */
  missing_langs: string[];
}

/** Result of submitting a proposal. */
export interface SubmitResult {
  /** Whether the proposal passed validation and was stored. */
  accepted: boolean;
  /** Final status: `validated` when accepted, `rejected` otherwise. */
  status: "validated" | "rejected";
  /** Validator report explaining the verdict. */
  report: string;
  /** Id of the stored proposal, present only when accepted. */
  proposal_id?: string;
}

/** Remaining task counts per type. */
export interface RemainingByType {
  /** Outstanding translation tasks. */
  translate: number;
  /** Outstanding description tasks. */
  describe: number;
}

/** Aggregate Gym metrics, tenant-wide or scoped to one episode. */
export interface Metrics {
  /** Total proposals submitted. */
  submitted: number;
  /** Proposals that validated and were stored. */
  validated: number;
  /** Proposals that failed validation. */
  rejected: number;
  /** `validated / submitted`, or 0 when nothing was submitted. */
  success_rate: number;
  /** Outstanding tasks by type. */
  remaining_by_type: RemainingByType;
}
