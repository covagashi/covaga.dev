import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import { HttpError } from "../errors.js";
import { hashApiKey } from "../lib/crypto.js";
import { findTenantByApiKeyHash } from "../repositories/tenant.repository.js";

/** Uniform error thrown for every authentication failure. */
const UNAUTHORIZED = new HttpError(401, "unauthorized");

/**
 * Authenticate the caller from the `X-Api-Key` header. The key is SHA-256
 * hashed and looked up against `tenants.api_key_hash`. Any failure throws a
 * uniform 401 that never reveals whether a tenant exists.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param request - Incoming request carrying the `X-Api-Key` header.
 * @returns The authenticated tenant.
 * @throws {HttpError} 401 when the key is missing or does not match.
 */
export async function authenticateTenant(
  env: Env,
  request: Request,
): Promise<Tenant> {
  const apiKey = request.headers.get("X-Api-Key") ?? undefined;
  if (apiKey === undefined || apiKey.length === 0) {
    throw UNAUTHORIZED;
  }

  const hash = await hashApiKey(apiKey);
  const tenant = await findTenantByApiKeyHash(env, hash);
  if (tenant === undefined) {
    throw UNAUTHORIZED;
  }
  return tenant;
}
