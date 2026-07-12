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

/** Parameters to insert a new tenant during self-service signup. */
export interface NewTenant {
  /** Stable unique identifier (e.g. `t_ab12...`). */
  id: string;
  /** Human-readable tenant name. */
  name: string;
  /** SHA-256 hex digest of the tenant's raw API key. */
  apiKeyHash: string;
  /** Contact email, already lowercased and trimmed. */
  email: string;
  /** Chosen plan id (see the plans model). */
  plan: string;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}

/**
 * Insert a new tenant. The caller owns id/key generation and validation; this
 * helper is pure D1 access. A duplicate email surfaces as the underlying D1
 * UNIQUE-constraint error for the service to translate.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Fully-formed tenant to persist.
 */
export async function insertTenant(env: Env, tenant: NewTenant): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO tenants (id, name, api_key_hash, email, plan, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      tenant.id,
      tenant.name,
      tenant.apiKeyHash,
      tenant.email,
      tenant.plan,
      tenant.createdAt,
    )
    .run();
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
 * Replace a tenant's stored API-key hash, rotating its credential.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Tenant whose key is rotated.
 * @param apiKeyHash - SHA-256 hex digest of the new raw API key.
 */
export async function updateTenantApiKeyHash(
  env: Env,
  tenantId: string,
  apiKeyHash: string,
): Promise<void> {
  await env.DB.prepare("UPDATE tenants SET api_key_hash = ? WHERE id = ?")
    .bind(apiKeyHash, tenantId)
    .run();
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
