/**
 * D1 access for per-tenant UI settings. Settings are stored as one JSON blob
 * per tenant (`tenant_settings.data`); parsing and default-filling live in the
 * settings service, so this layer only reads and writes the raw text.
 */
import type { Env } from "../env.js";

/**
 * Read a tenant's raw settings JSON blob.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The stored JSON text, or `undefined` when the tenant has no row.
 */
export async function findSettingsData(
  env: Env,
  tenantId: string,
): Promise<string | undefined> {
  const row = await env.DB.prepare(
    "SELECT data FROM tenant_settings WHERE tenant_id = ?",
  )
    .bind(tenantId)
    .first<{ data: string }>();
  return row?.data;
}

/**
 * Insert or replace a tenant's settings JSON blob.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param data - Serialised settings object to store.
 */
export async function upsertSettingsData(
  env: Env,
  tenantId: string,
  data: string,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO tenant_settings (tenant_id, data) VALUES (?, ?)
     ON CONFLICT (tenant_id) DO UPDATE SET data = excluded.data`,
  )
    .bind(tenantId, data)
    .run();
}
