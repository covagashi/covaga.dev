/**
 * A tenant onboarded onto the platform.
 */
export interface Tenant {
  /** Stable unique identifier (e.g. `t_ab12...`). */
  id: string;
  /** Human-readable tenant name. */
  name: string;
  /** SHA-256 hex digest of the tenant's raw API key. */
  apiKeyHash: string;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}
