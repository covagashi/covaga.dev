/**
 * Settings adapter for the ported Ajustes screen. Persists a per-tenant JSON
 * blob (`tenant_settings.data`); GET fills defaults when a tenant has no row,
 * POST merges the supplied keys. Mirrors the ported dashboard's `/api/settings`, whose only
 * key today is the `require_l0_approval` toggle.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import { HttpError } from "../errors.js";
import {
  findSettingsData,
  upsertSettingsData,
} from "../repositories/settings.repository.js";

/** Tenant settings surfaced to the UI. */
export interface Settings {
  /** Whether low-confidence gym output still needs human approval. */
  require_l0_approval: boolean;
}

/** Default settings for a tenant with no stored row (approval required). */
const DEFAULTS: Settings = { require_l0_approval: true };

/** Narrow an unknown value to a plain (non-array) object or fail with 400. */
function asRecord(value: unknown): Record<string, unknown> {
  if (Object(value) !== value || Array.isArray(value)) {
    throw new HttpError(400, "invalid_body");
  }
  return value as Record<string, unknown>;
}

/** Parse a stored JSON blob into settings, ignoring malformed/absent data. */
function parseSettings(data: string | undefined): Settings {
  if (data === undefined) {
    return { ...DEFAULTS };
  }
  try {
    const parsed = JSON.parse(data) as unknown;
    const record = Object(parsed) === parsed ? (parsed as Record<string, unknown>) : {};
    const flag = record["require_l0_approval"];
    return {
      require_l0_approval:
        typeof flag === "boolean" ? flag : DEFAULTS.require_l0_approval,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

/**
 * Read a tenant's settings, filling defaults when none are stored.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns The tenant's settings.
 */
export async function getSettings(
  env: Env,
  tenant: Tenant,
): Promise<Settings> {
  return parseSettings(await findSettingsData(env, tenant.id));
}

/**
 * Merge the supplied settings into the tenant's stored settings and persist
 * them. Only known keys are honoured; `require_l0_approval` must be a boolean.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed request body (`{ require_l0_approval }`).
 * @returns `{ ok: true }`.
 * @throws {HttpError} 400 when `require_l0_approval` is present but not boolean.
 */
export async function saveSettings(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<{ ok: true }> {
  const record = asRecord(body);
  const current = parseSettings(await findSettingsData(env, tenant.id));

  const flag = record["require_l0_approval"];
  if (flag !== undefined && typeof flag !== "boolean") {
    throw new HttpError(400, "invalid_require_l0_approval");
  }
  const merged: Settings = {
    require_l0_approval:
      typeof flag === "boolean" ? flag : current.require_l0_approval,
  };

  await upsertSettingsData(env, tenant.id, JSON.stringify(merged));
  return { ok: true };
}
