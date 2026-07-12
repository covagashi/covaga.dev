/**
 * Environment bindings available to the worker at runtime.
 */
export interface Env {
  /** D1 database binding declared in wrangler.jsonc. */
  DB: D1Database;
  /** Optional comma-separated list of origins allowed for CORS. */
  ALLOWED_ORIGINS?: string;
}
