/**
 * Catalog read service: browse a tenant's ingested articles and compute the
 * per-deliverable "gap" view the materials UI renders. Mirrors the response
 * shapes of byndrrr's local `server.py` (`/api/parts`, `/api/parts/facets`) so
 * the dashboard port stays near-mechanical, but reads over byndr-dev's D1
 * `articles` table and is always tenant-scoped.
 *
 * Every catalog read scans at most {@link CATALOG_SCAN_CAP} of the tenant's
 * most-recently-updated rows and then filters / paginates in memory, matching
 * byndrrr's in-memory snapshot model.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import {
  CATALOG_SCAN_CAP,
  listArticleDataByTenant,
} from "../repositories/article.repository.js";

/**
 * A part is the enriched article object stored in `articles.data` — it carries
 * the flat fields the UI reads (`has_photo`, `photo_path`, `ul_value`,
 * `manufacturer`, `description`, `description_i18n`, ...).
 */
export type Part = Record<string, unknown>;

/** The six deliverable gap keys, in the canonical UI/matrix order. */
export const GAP_KEYS = [
  "photo",
  "ul",
  "ce",
  "erp",
  "macro",
  "description",
] as const;

/** One of the six deliverable gap keys. */
export type GapKey = (typeof GAP_KEYS)[number];

/** Per-deliverable booleans; `true` means the deliverable is MISSING. */
export type Gaps = Record<GapKey, boolean>;

/** Placeholder bucket name for parts with no manufacturer (matches byndrrr). */
export const NO_MANUFACTURER = "(sin fabricante)";

/** Read a string field, treating a non-string (or absent) value as ''. */
function str(part: Part, key: string): string {
  const value = part[key];
  return typeof value === "string" ? value : "";
}

/** Read a boolean flag field; only an explicit `true` counts as set. */
function flag(part: Part, key: string): boolean {
  return part[key] === true;
}

/** True when the part carries no `description_i18n` entries. */
function i18nEmpty(part: Part): boolean {
  const value = part["description_i18n"];
  if (Object(value) !== value || Array.isArray(value)) {
    return true;
  }
  return Object.keys(value as Record<string, unknown>).length === 0;
}

/**
 * Compute the six deliverable gaps for a part. A deliverable is missing when
 * neither its `has_*` flag nor its stored value is present; `description` is
 * missing when the `description_i18n` map is empty (byndrrr's exact rule).
 *
 * @param part - Enriched article object.
 * @returns The gap booleans (`true` == missing) for each deliverable.
 */
export function missingOf(part: Part): Gaps {
  return {
    photo: !flag(part, "has_photo") && str(part, "photo_path").length === 0,
    ul: !flag(part, "has_ul") && str(part, "ul_value").length === 0,
    ce: !flag(part, "has_ce") && str(part, "ce_value").length === 0,
    erp: !flag(part, "has_erp") && str(part, "erp_number").length === 0,
    macro: !flag(part, "has_macro") && str(part, "macro_path").length === 0,
    description: i18nEmpty(part),
  };
}

/** Manufacturer bucket name for a part ('' collapses to the placeholder). */
export function manufacturerOf(part: Part): string {
  const name = str(part, "manufacturer");
  return name.length === 0 ? NO_MANUFACTURER : name;
}

/** Narrow an arbitrary string to a {@link GapKey}, else `undefined`. */
function asGapKey(value: string): GapKey | undefined {
  return (GAP_KEYS as readonly string[]).includes(value)
    ? (value as GapKey)
    : undefined;
}

/** Parsed catalog filter; empty fields mean "no constraint". */
interface CatalogFilter {
  /** Missing-deliverable filter (unknown values are ignored). */
  missing?: GapKey;
  /** Case-insensitive exact manufacturer match. */
  mfr?: string;
  /** Case-insensitive substring over part_number / description / manufacturer. */
  q?: string;
}

/** Read, trim and lowercase a query param, returning `undefined` when empty. */
function lowerParam(params: URLSearchParams, key: string): string | undefined {
  const value = (params.get(key) ?? "").trim().toLowerCase();
  return value.length === 0 ? undefined : value;
}

/** Build a {@link CatalogFilter} from query params. */
function parseFilter(params: URLSearchParams): CatalogFilter {
  const missing = lowerParam(params, "missing");
  return {
    missing: missing === undefined ? undefined : asGapKey(missing),
    mfr: lowerParam(params, "mfr"),
    q: lowerParam(params, "q"),
  };
}

/** Test a part against a filter (all supplied constraints must hold). */
function matches(part: Part, filter: CatalogFilter): boolean {
  if (filter.q !== undefined) {
    const haystack = `${str(part, "part_number")}\n${str(part, "description")}\n${str(part, "manufacturer")}`.toLowerCase();
    if (!haystack.includes(filter.q)) {
      return false;
    }
  }
  if (filter.mfr !== undefined && str(part, "manufacturer").toLowerCase() !== filter.mfr) {
    return false;
  }
  if (filter.missing !== undefined && !missingOf(part)[filter.missing]) {
    return false;
  }
  return true;
}

/**
 * Parse the tenant's capped article JSON blobs into part objects. Shared by the
 * catalog and stats services so both read the same capped scan.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns The tenant's parts (up to {@link CATALOG_SCAN_CAP}).
 */
export async function loadTenantParts(env: Env, tenant: Tenant): Promise<Part[]> {
  const blobs = await listArticleDataByTenant(env, tenant.id, CATALOG_SCAN_CAP);
  const parts: Part[] = [];
  for (const blob of blobs) {
    try {
      const value = JSON.parse(blob) as unknown;
      if (Object(value) === value && !Array.isArray(value)) {
        parts.push(value as Part);
      }
    } catch {
      // Skip an unparseable row rather than fail the whole read.
    }
  }
  return parts;
}

/** Clamp an integer query param into `[min, max]`, falling back to `fallback`. */
function clampInt(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const parsed = raw === undefined ? Number.NaN : Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, parsed));
}

/** Default page size for `/api/parts`. */
const DEFAULT_LIMIT = 100;

/** Maximum page size for `/api/parts`. */
const MAX_LIMIT = 500;

/** A page of filtered parts, mirroring byndrrr's `/api/parts` response. */
export interface PartsPage {
  /** Number of parts matching the filter (within the scan cap). */
  total: number;
  /** Requested offset into the filtered list. */
  offset: number;
  /** Requested page size. */
  limit: number;
  /** The parts on this page (each the full enriched article object). */
  items: Part[];
}

/**
 * List a tenant's parts filtered by `missing` / `mfr` / `q` and paginated by
 * `offset` / `limit` (default 100, cap 500).
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param params - Request query parameters.
 * @returns `{ total, offset, limit, items }`.
 */
export async function listParts(
  env: Env,
  tenant: Tenant,
  params: URLSearchParams,
): Promise<PartsPage> {
  const filter = parseFilter(params);
  const offset = clampInt(params.get("offset") ?? undefined, 0, 0, Number.MAX_SAFE_INTEGER);
  const limit = clampInt(params.get("limit") ?? undefined, DEFAULT_LIMIT, 1, MAX_LIMIT);

  const parts = await loadTenantParts(env, tenant);
  const filtered = parts.filter((part) => matches(part, filter));

  return {
    total: filtered.length,
    offset,
    limit,
    items: filtered.slice(offset, offset + limit),
  };
}

/** One manufacturer facet: its bucket name and matching-part count. */
export interface ManufacturerFacet {
  /** Manufacturer name (or the no-manufacturer placeholder). */
  name: string;
  /** Number of matching parts for this manufacturer. */
  count: number;
}

/** Facet breakdown, mirroring byndrrr's `/api/parts/facets` response. */
export interface Facets {
  /** Manufacturers ordered by count desc, then name asc. */
  manufacturers: ManufacturerFacet[];
}

/**
 * Manufacturer facet counts over the parts matching `missing` / `q`. The `mfr`
 * filter is intentionally NOT applied so the manufacturer list (and the group
 * `%`) stays complete when a manufacturer is selected in the UI.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param params - Request query parameters (`missing`, `q`).
 * @returns `{ manufacturers: [{ name, count }] }`.
 */
export async function listFacets(
  env: Env,
  tenant: Tenant,
  params: URLSearchParams,
): Promise<Facets> {
  const filter: CatalogFilter = {
    missing: parseFilter(params).missing,
    q: lowerParam(params, "q"),
  };

  const parts = await loadTenantParts(env, tenant);
  const counts = new Map<string, number>();
  for (const part of parts) {
    if (!matches(part, filter)) {
      continue;
    }
    const name = manufacturerOf(part);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const manufacturers = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { manufacturers };
}
