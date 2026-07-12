/**
 * Subscription plans a tenant can choose at signup. No limits are enforced yet
 * -- the chosen plan is only recorded on the tenant row for later use.
 */

/** Plans available at signup, in display order. */
export const PLANS = ["free", "pro"] as const;

/** One of the available plan ids. */
export type PlanId = (typeof PLANS)[number];

/** Human-readable labels for each plan, for the signup UI. */
export const PLAN_LABELS: Readonly<Record<PlanId, string>> = {
  free: "Free",
  pro: "Pro",
};

/**
 * Type guard: is `value` a plan id the platform offers?
 *
 * @param value - Candidate plan id.
 * @returns `true` when the id is in {@link PLANS}.
 */
export function isPlan(value: string): value is PlanId {
  return (PLANS as readonly string[]).includes(value);
}
