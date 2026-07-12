/**
 * Production worker entry point.
 *
 * It re-exports the request handler from `index.ts` and the Gym MCP Durable
 * Object class so wrangler can bind `GYM_MCP` to it. `GymMcp` lives behind
 * this separate entry (rather than being exported from `index.ts` directly)
 * because it eagerly pulls the Agents SDK / MCP SDK graph, which the current
 * `@cloudflare/vitest-pool-workers` cannot load — the pinned MCP SDK's `ajv`
 * dependency performs `require("*.json")`, and the pool's module fallback
 * service does not serve JSON modules. Tests import `index.ts` (this graph's
 * agents-free half) so the suite stays green, while production points `main`
 * at this file so the Durable Object export is present.
 */
export { default } from "./index.js";
export { GymMcp } from "./mcp/gym.js";
