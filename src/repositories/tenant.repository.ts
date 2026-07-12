import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";

/** Shape of a row in the `tenants` table. */
interface TenantRow {
  id: string;
  name: string;
  api_key_hash: string;
  created_at: number;
}

/** Map a raw D1 row to the domain `Tenant` model. */
function toTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    apiKeyHash: row.api_key_hash,
    createdAt: row.created_at,
  };
}

/**
 * Look up a tenant by its id.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param id - Tenant id.
 * @returns The tenant, or `undefined` if none exists.
 */
export async function findTenantById(
  env: Env,
  id: string,
): Promise<Tenant | undefined> {
  const row = await env.DB.prepare(
    "SELECT id, name, api_key_hash, created_at FROM tenants WHERE id = ?",
  )
    .bind(id)
    .first<TenantRow>();
  return row ? toTenant(row) : undefined;
}

/**
 * Look up a tenant by the SHA-256 hex hash of its API key.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param hash - SHA-256 hex digest of the raw API key.
 * @returns The tenant, or `undefined` if none matches.
 */
export async function findTenantByApiKeyHash(
  env: Env,
  hash: string,
): Promise<Tenant | undefined> {
  const row = await env.DB.prepare(
    "SELECT id, name, api_key_hash, created_at FROM tenants WHERE api_key_hash = ?",
  )
    .bind(hash)
    .first<TenantRow>();
  return row ? toTenant(row) : undefined;
}
