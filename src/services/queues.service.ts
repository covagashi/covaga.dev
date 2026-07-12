/**
 * Queues adapter: the work rail the ported QueuesRail renders. Mirrors
 * byndrrr's `/api/queues` shape (`{ system, saved }`, each queue
 * `{ id, label, filter, count }`) but computes counts from byndr-dev's D1
 * `articles` via the shared {@link missingOf} gap rule so every screen agrees.
 *
 * byndr-dev has no DataPortal or discontinued signal and no saved-queue
 * storage, so only the deliverable-gap system queues are produced and `saved`
 * is always empty. The queue ids match byndrrr's so the UI's `queue.<id>`
 * translations resolve.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import {
  GAP_KEYS,
  loadTenantParts,
  missingOf,
  type GapKey,
} from "./catalog.service.js";

/** One work queue: id (also the i18n key), label, filter and matching count. */
export interface Queue {
  /** Stable id; the UI resolves `queue.<id>` for its label. */
  id: string;
  /** Fallback label (Spanish, mirroring byndrrr's server). */
  label: string;
  /** Catalog filter this queue applies (`{}` for "all"). */
  filter: { missing?: GapKey };
  /** Number of parts matching the filter. */
  count: number;
}

/** The `/api/queues` response: system queues plus (empty) saved queues. */
export interface QueuesResponse {
  /** Built-in deliverable-gap queues. */
  system: Queue[];
  /** Saved queues (byndr-dev stores none; always empty). */
  saved: Queue[];
}

/** A system queue definition before its count is computed. */
interface QueueDef {
  id: string;
  label: string;
  /** The gap this queue filters on; omitted for the "all" queue. */
  gap?: GapKey;
}

/** System queues in byndrrr's order (DataPortal/discontinued ones omitted). */
const SYSTEM_QUEUES: readonly QueueDef[] = [
  { id: "all", label: "todo" },
  { id: "no_ul", label: "sin ul", gap: "ul" },
  { id: "no_photo", label: "sin foto", gap: "photo" },
  { id: "no_ce", label: "sin ce", gap: "ce" },
  { id: "no_erp", label: "sin erp", gap: "erp" },
  { id: "no_macro", label: "sin macro", gap: "macro" },
  { id: "no_description", label: "sin descripción", gap: "description" },
];

/**
 * Build the system work queues with live counts over the tenant's articles.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ system, saved }` with `saved` empty.
 */
export async function listQueues(
  env: Env,
  tenant: Tenant,
): Promise<QueuesResponse> {
  const parts = await loadTenantParts(env, tenant);

  const gapCounts: Record<GapKey, number> = {
    photo: 0,
    ul: 0,
    ce: 0,
    erp: 0,
    macro: 0,
    description: 0,
  };
  for (const part of parts) {
    const gaps = missingOf(part);
    for (const key of GAP_KEYS) {
      if (gaps[key]) {
        gapCounts[key] += 1;
      }
    }
  }

  const system: Queue[] = SYSTEM_QUEUES.map((def) => {
    if (def.gap === undefined) {
      return { id: def.id, label: def.label, filter: {}, count: parts.length };
    }
    return {
      id: def.id,
      label: def.label,
      filter: { missing: def.gap },
      count: gapCounts[def.gap],
    };
  });

  return { system, saved: [] };
}
