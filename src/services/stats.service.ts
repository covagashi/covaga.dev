/**
 * Statistics read service: coverage totals and the manufacturer x deliverable
 * matrix the materials UI renders. Mirrors the response shapes of the ported dashboard's
 * `server.py` (`/api/stats`, `/api/stats/matrix`) over Covaga Hub's D1
 * `articles` table, always tenant-scoped, and driven by the same
 * {@link missingOf} gap rule the catalog uses so every screen agrees.
 *
 * Reads scan at most the tenant's capped set of parts (see
 * {@link loadTenantParts}).
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import {
  GAP_KEYS,
  loadTenantParts,
  manufacturerOf,
  missingOf,
  type GapKey,
  type Part,
} from "./catalog.service.js";

/** A fresh per-deliverable counter initialised to zero. */
function zeroGaps(): Record<GapKey, number> {
  return { photo: 0, ul: 0, ce: 0, erp: 0, macro: 0, description: 0 };
}

/** Coverage/stats summary, mirroring the ported dashboard's `/api/stats` response. */
export interface Stats {
  /** Total parts scanned. */
  total: number;
  /** Distinct manufacturers (empty manufacturer counts as one bucket). */
  manufacturer_count: number;
  /** Count of parts that HAVE each deliverable (inverse of the gap). */
  coverage: Record<GapKey, number>;
}

/**
 * Compute coverage totals for a tenant: total parts, distinct manufacturers,
 * and how many parts have each deliverable (the complement of {@link missingOf}).
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ total, manufacturer_count, coverage }`.
 */
export async function computeStats(env: Env, tenant: Tenant): Promise<Stats> {
  const parts = await loadTenantParts(env, tenant);
  const coverage = zeroGaps();
  const manufacturers = new Set<string>();

  for (const part of parts) {
    manufacturers.add(manufacturerOf(part));
    const gaps = missingOf(part);
    for (const key of GAP_KEYS) {
      if (!gaps[key]) {
        coverage[key] += 1;
      }
    }
  }

  return {
    total: parts.length,
    manufacturer_count: manufacturers.size,
    coverage,
  };
}

/** One matrix row: a manufacturer's total and its per-deliverable gap counts. */
export interface MatrixRow {
  /** Manufacturer name (or the no-manufacturer placeholder). */
  manufacturer: string;
  /** Total parts for this manufacturer. */
  total: number;
  /** Count of parts MISSING each deliverable. */
  missing: Record<GapKey, number>;
}

/** Aggregate bucket for the manufacturers beyond the top-N. */
export interface MatrixRest {
  /** Number of manufacturers folded into this bucket. */
  manufacturers: number;
  /** Total parts across those manufacturers. */
  total: number;
  /** Combined per-deliverable missing counts. */
  missing: Record<GapKey, number>;
}

/** Manufacturer x deliverable matrix, mirroring the ported dashboard's `/api/stats/matrix`. */
export interface Matrix {
  /** Deliverable keys in column order. */
  deliverables: GapKey[];
  /** Top-N manufacturer rows, most parts first. */
  rows: MatrixRow[];
  /** Aggregate of the remaining manufacturers (omitted when there is no tail). */
  rest?: MatrixRest;
  /** Total parts scanned. */
  total: number;
}

/** Default number of manufacturer rows returned by the matrix. */
const DEFAULT_TOP = 15;

/** Maximum number of manufacturer rows returned by the matrix. */
const MAX_TOP = 50;

/** Clamp the `top` query param into `[1, MAX_TOP]`, defaulting to DEFAULT_TOP. */
function parseTop(params: URLSearchParams): number {
  const parsed = Number.parseInt(params.get("top") ?? "", 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TOP;
  }
  return Math.min(MAX_TOP, Math.max(1, parsed));
}

/** Accumulate one part's gaps into a running per-deliverable counter. */
function addGaps(into: Record<GapKey, number>, part: Part): void {
  const gaps = missingOf(part);
  for (const key of GAP_KEYS) {
    if (gaps[key]) {
      into[key] += 1;
    }
  }
}

/**
 * Build the manufacturer x deliverable matrix: one row per manufacturer sorted
 * by part count, keeping the top `top` (default 15, cap 50) and folding the
 * remainder into a `rest` bucket.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param params - Request query parameters (`top`).
 * @returns `{ deliverables, rows, rest?, total }`.
 */
export async function computeMatrix(
  env: Env,
  tenant: Tenant,
  params: URLSearchParams,
): Promise<Matrix> {
  const top = parseTop(params);
  const parts = await loadTenantParts(env, tenant);

  const byManufacturer = new Map<string, MatrixRow>();
  for (const part of parts) {
    const name = manufacturerOf(part);
    let row = byManufacturer.get(name);
    if (row === undefined) {
      row = { manufacturer: name, total: 0, missing: zeroGaps() };
      byManufacturer.set(name, row);
    }
    row.total += 1;
    addGaps(row.missing, part);
  }

  const ordered = [...byManufacturer.values()].sort(
    (a, b) => b.total - a.total || a.manufacturer.localeCompare(b.manufacturer),
  );
  const rows = ordered.slice(0, top);
  const tail = ordered.slice(top);

  const matrix: Matrix = {
    deliverables: [...GAP_KEYS],
    rows,
    total: parts.length,
  };

  if (tail.length > 0) {
    const missing = zeroGaps();
    let total = 0;
    for (const row of tail) {
      total += row.total;
      for (const key of GAP_KEYS) {
        missing[key] += row.missing[key];
      }
    }
    matrix.rest = { manufacturers: tail.length, total, missing };
  }

  return matrix;
}
