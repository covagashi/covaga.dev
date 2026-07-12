/**
 * Tenant self-service operations. Currently just API-key rotation for the
 * Ajustes (settings) screen: mint a fresh key, persist only its hash, and hand
 * the raw key back exactly once.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import { generateApiKey, hashApiKey } from "../lib/crypto.js";
import { updateTenantApiKeyHash } from "../repositories/tenant.repository.js";

/** Result of an API-key rotation: the new raw key, returned once. */
export interface RotateKeyResult {
  /** Freshly minted API key; the caller must store it, only its hash is kept. */
  api_key: string;
}

/**
 * Rotate the authenticated tenant's API key. Generates a new key, replaces the
 * stored `api_key_hash`, and returns the raw key exactly once. After this call
 * the previous key no longer authenticates.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ api_key }` with the new raw key.
 */
export async function rotateApiKey(
  env: Env,
  tenant: Tenant,
): Promise<RotateKeyResult> {
  const apiKey = generateApiKey();
  const apiKeyHash = await hashApiKey(apiKey);
  await updateTenantApiKeyHash(env, tenant.id, apiKeyHash);
  return { api_key: apiKey };
}
