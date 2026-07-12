import type { GymMcp } from "./mcp/gym.js";

/**
 * Environment bindings available to the worker at runtime.
 */
export interface Env {
  /** D1 database binding declared in wrangler.jsonc. */
  DB: D1Database;
  /** Optional comma-separated list of origins allowed for CORS. */
  ALLOWED_ORIGINS?: string;
  /** Durable Object namespace hosting the Gym MCP agent. */
  GYM_MCP: DurableObjectNamespace<GymMcp>;
}
