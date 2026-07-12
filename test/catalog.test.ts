import { env, applyD1Migrations, type D1Migration } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";
import { hashApiKey } from "../src/lib/crypto.js";
import { enrichPart } from "../src/lib/multilang.js";
import type { Env } from "../src/env.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

const KEY_A = "catalog-key-a";
const TENANT_A = "t_catalog_a";
const KEY_B = "catalog-key-b";
const TENANT_B = "t_catalog_b";

/** A minimal part with all deliverables present, overridable per field. */
function part(overrides: Record<string, unknown>): Record<string, unknown> {
  const base: Record<string, unknown> = {
    part_number: "PN",
    variant: "",
    manufacturer: "ACME",
    // Multilang description (as EPLAN emits) -> non-empty description_i18n.
    description: "es_ES@una pieza;en_US@a part",
    has_photo: true,
    photo_path: "C:/img/pn.png",
    has_ul: true,
    ul_value: "E175199",
    has_ce: true,
    ce_value: "CE-1",
    has_erp: true,
    erp_number: "ERP-1",
    has_macro: true,
    macro_path: "C:/macro/pn.ema",
  };
  return enrichPart({ ...base, ...overrides });
}

/** Insert one enriched part row for a tenant. */
async function insertPart(
  tenantId: string,
  snapshotId: string,
  p: Record<string, unknown>,
): Promise<void> {
  await testEnv.DB.prepare(
    `INSERT INTO articles
       (tenant_id, part_number, variant, manufacturer, description, data, snapshot_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      tenantId,
      p["part_number"],
      p["variant"] ?? "",
      p["manufacturer"] ?? "",
      p["description"] ?? "",
      JSON.stringify(p),
      snapshotId,
      Date.now(),
    )
    .run();
}

beforeAll(async () => {
  await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);
  const [hashA, hashB] = await Promise.all([
    hashApiKey(KEY_A),
    hashApiKey(KEY_B),
  ]);
  const insert = testEnv.DB.prepare(
    "INSERT INTO tenants (id, name, api_key_hash, created_at) VALUES (?, ?, ?, ?)",
  );
  await testEnv.DB.batch([
    insert.bind(TENANT_A, "Catalog A", hashA, Date.now()),
    insert.bind(TENANT_B, "Catalog B", hashB, Date.now()),
  ]);

  // Tenant A catalog:
  //  - p_full  : ACME, everything present
  //  - p_no_ul : ACME, missing UL (no flag, no value)
  //  - p_no_photo_desc : Siemens, missing photo and description (no i18n)
  await insertPart(TENANT_A, "s1", part({ part_number: "p_full" }));
  await insertPart(
    TENANT_A,
    "s1",
    part({ part_number: "p_no_ul", has_ul: false, ul_value: "" }),
  );
  await insertPart(
    TENANT_A,
    "s1",
    part({
      part_number: "p_no_photo_desc",
      manufacturer: "Siemens",
      description: "",
      has_photo: false,
      photo_path: "",
    }),
  );

  // Tenant B: a single unrelated part, for isolation checks.
  await insertPart(TENANT_B, "s1", part({ part_number: "b_only", manufacturer: "Phoenix" }));
});

/** GET helper with an optional `X-Api-Key`. */
function get(path: string, key: string | undefined): Promise<Response> {
  const headers = new Headers();
  if (key !== undefined) {
    headers.set("X-Api-Key", key);
  }
  return Promise.resolve(
    worker.fetch(new Request(`https://x${path}`, { headers }), testEnv),
  );
}

/** POST helper with an optional `X-Api-Key`. */
function post(path: string, key: string | undefined): Promise<Response> {
  const headers = new Headers();
  if (key !== undefined) {
    headers.set("X-Api-Key", key);
  }
  return Promise.resolve(
    worker.fetch(
      new Request(`https://x${path}`, { method: "POST", headers }),
      testEnv,
    ),
  );
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

interface PartsPage {
  total: number;
  offset: number;
  limit: number;
  items: Array<Record<string, unknown>>;
}

describe("GET /api/parts", () => {
  it("requires auth", async () => {
    const res = await get("/api/parts", undefined);
    expect(res.status).toBe(401);
  });

  it("returns the { total, offset, limit, items } shape with all parts", async () => {
    const page = await readJson<PartsPage>(await get("/api/parts", KEY_A));
    expect(page.total).toBe(3);
    expect(page.offset).toBe(0);
    expect(page.limit).toBe(100);
    expect(page.items.length).toBe(3);
    // Items carry the full enriched part fields the UI reads.
    const numbers = page.items.map((p) => p["part_number"]).sort();
    expect(numbers).toEqual(["p_full", "p_no_photo_desc", "p_no_ul"]);
  });

  it("missing=ul returns only the ul-gap part", async () => {
    const page = await readJson<PartsPage>(
      await get("/api/parts?missing=ul", KEY_A),
    );
    expect(page.total).toBe(1);
    expect(page.items[0]?.["part_number"]).toBe("p_no_ul");
  });

  it("missing=photo returns only the photo-gap part", async () => {
    const page = await readJson<PartsPage>(
      await get("/api/parts?missing=photo", KEY_A),
    );
    expect(page.total).toBe(1);
    expect(page.items[0]?.["part_number"]).toBe("p_no_photo_desc");
  });

  it("missing=description uses the i18n-empty rule", async () => {
    const page = await readJson<PartsPage>(
      await get("/api/parts?missing=description", KEY_A),
    );
    expect(page.total).toBe(1);
    expect(page.items[0]?.["part_number"]).toBe("p_no_photo_desc");
  });

  it("q filters by substring over part_number/description/manufacturer", async () => {
    const byMfr = await readJson<PartsPage>(
      await get("/api/parts?q=siemens", KEY_A),
    );
    expect(byMfr.total).toBe(1);
    expect(byMfr.items[0]?.["part_number"]).toBe("p_no_photo_desc");

    const byPn = await readJson<PartsPage>(
      await get("/api/parts?q=p_no_ul", KEY_A),
    );
    expect(byPn.total).toBe(1);
  });

  it("mfr filters by exact (case-insensitive) manufacturer", async () => {
    const page = await readJson<PartsPage>(
      await get("/api/parts?mfr=acme", KEY_A),
    );
    expect(page.total).toBe(2);
  });

  it("paginates with offset/limit while total reflects the full match", async () => {
    const page = await readJson<PartsPage>(
      await get("/api/parts?limit=1&offset=1", KEY_A),
    );
    expect(page.total).toBe(3);
    expect(page.limit).toBe(1);
    expect(page.offset).toBe(1);
    expect(page.items.length).toBe(1);
  });

  it("caps limit at 500", async () => {
    const page = await readJson<PartsPage>(
      await get("/api/parts?limit=99999", KEY_A),
    );
    expect(page.limit).toBe(500);
  });

  it("isolates tenants (A never sees B's part)", async () => {
    const page = await readJson<PartsPage>(
      await get("/api/parts?q=phoenix", KEY_A),
    );
    expect(page.total).toBe(0);
  });
});

interface Facets {
  manufacturers: Array<{ name: string; count: number }>;
}

describe("GET /api/parts/facets", () => {
  it("returns manufacturer counts ordered by count desc", async () => {
    const facets = await readJson<Facets>(await get("/api/parts/facets", KEY_A));
    expect(facets.manufacturers).toEqual([
      { name: "ACME", count: 2 },
      { name: "Siemens", count: 1 },
    ]);
  });

  it("applies the missing filter but not mfr (list stays complete)", async () => {
    const facets = await readJson<Facets>(
      await get("/api/parts/facets?missing=photo&mfr=acme", KEY_A),
    );
    // Only the Siemens part has the photo gap; mfr=acme is ignored for facets.
    expect(facets.manufacturers).toEqual([{ name: "Siemens", count: 1 }]);
  });
});

interface Stats {
  total: number;
  manufacturer_count: number;
  coverage: Record<string, number>;
}

describe("GET /api/stats", () => {
  it("returns total, manufacturer_count and per-deliverable coverage", async () => {
    const stats = await readJson<Stats>(await get("/api/stats", KEY_A));
    expect(stats.total).toBe(3);
    expect(stats.manufacturer_count).toBe(2);
    // ul present in 2 of 3; photo present in 2 of 3; description present in 2 of 3.
    expect(stats.coverage.ul).toBe(2);
    expect(stats.coverage.photo).toBe(2);
    expect(stats.coverage.description).toBe(2);
    expect(stats.coverage.ce).toBe(3);
    expect(stats.coverage.erp).toBe(3);
    expect(stats.coverage.macro).toBe(3);
  });
});

interface Matrix {
  deliverables: string[];
  rows: Array<{ manufacturer: string; total: number; missing: Record<string, number> }>;
  rest?: { manufacturers: number; total: number; missing: Record<string, number> };
  total: number;
}

describe("GET /api/stats/matrix", () => {
  it("returns deliverables, per-manufacturer rows and the grand total", async () => {
    const matrix = await readJson<Matrix>(await get("/api/stats/matrix", KEY_A));
    expect(matrix.deliverables).toEqual([
      "photo",
      "ul",
      "ce",
      "erp",
      "macro",
      "description",
    ]);
    expect(matrix.total).toBe(3);
    const acme = matrix.rows.find((r) => r.manufacturer === "ACME");
    const siemens = matrix.rows.find((r) => r.manufacturer === "Siemens");
    expect(acme?.total).toBe(2);
    expect(acme?.missing.ul).toBe(1);
    expect(acme?.missing.photo).toBe(0);
    expect(siemens?.total).toBe(1);
    expect(siemens?.missing.photo).toBe(1);
    expect(siemens?.missing.description).toBe(1);
    // No tail with top default -> no rest bucket.
    expect(matrix.rest).toBeUndefined();
  });

  it("folds manufacturers beyond top into a rest bucket", async () => {
    const matrix = await readJson<Matrix>(
      await get("/api/stats/matrix?top=1", KEY_A),
    );
    expect(matrix.rows.length).toBe(1);
    expect(matrix.rows[0]?.manufacturer).toBe("ACME");
    expect(matrix.rest?.manufacturers).toBe(1);
    expect(matrix.rest?.total).toBe(1);
    expect(matrix.rest?.missing.photo).toBe(1);
  });
});

describe("POST /api/tenant/rotate-key", () => {
  it("rotates the key: new key authenticates, old one 401s", async () => {
    const before = await testEnv.DB.prepare(
      "SELECT api_key_hash FROM tenants WHERE id = ?",
    )
      .bind(TENANT_B)
      .first<{ api_key_hash: string }>();

    const result = await readJson<{ api_key: string }>(
      await post("/api/tenant/rotate-key", KEY_B),
    );
    expect(typeof result.api_key).toBe("string");
    expect(result.api_key.length).toBeGreaterThan(0);

    const after = await testEnv.DB.prepare(
      "SELECT api_key_hash FROM tenants WHERE id = ?",
    )
      .bind(TENANT_B)
      .first<{ api_key_hash: string }>();
    expect(after?.api_key_hash).not.toBe(before?.api_key_hash);
    expect(after?.api_key_hash).toBe(await hashApiKey(result.api_key));

    // The new key authenticates.
    const whoami = await get("/whoami", result.api_key);
    expect(whoami.status).toBe(200);
    expect(await readJson<{ id: string }>(whoami)).toEqual({ id: TENANT_B });

    // The old key no longer works.
    const old = await get("/whoami", KEY_B);
    expect(old.status).toBe(401);
  });

  it("requires auth", async () => {
    const res = await post("/api/tenant/rotate-key", undefined);
    expect(res.status).toBe(401);
  });
});
