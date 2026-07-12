import { env, applyD1Migrations, type D1Migration } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";
import { hashApiKey } from "../src/lib/crypto.js";
import type { Env } from "../src/env.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

const KEY_A = "ingest-key-a";
const TENANT_A = "t_ingest_a";
const KEY_B = "ingest-key-b";
const TENANT_B = "t_ingest_b";

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
    insert.bind(TENANT_A, "Tenant A", hashA, Date.now()),
    insert.bind(TENANT_B, "Tenant B", hashB, Date.now()),
  ]);
});

/** POST helper: sends JSON with an optional `X-Api-Key`. */
function post(path: string, key: string | undefined, body: unknown): Promise<Response> {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (key !== undefined) {
    headers.set("X-Api-Key", key);
  }
  return Promise.resolve(
    worker.fetch(
      new Request(`https://x${path}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      }),
      testEnv,
    ),
  );
}

/** Read a response body as a typed value. */
async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

describe("ingest flow", () => {
  it("start -> batch -> finish enriches, stores and totals articles", async () => {
    const start = await readJson<{ ok: boolean; snapshot_id: string }>(
      await post("/api/ingest/start", KEY_A, { source: "eplan", total: 2 }),
    );
    expect(start.ok).toBe(true);
    const snapshotId = start.snapshot_id;

    const parts = [
      {
        part_number: "P1",
        manufacturer: "ACME",
        description: "es_ES@Hola;en_US@Hello;de_DE@Hallo",
      },
      { part_number: "P2", variant: "A", description: "plain text" },
    ];
    const batchRes = await post("/api/ingest/batch", KEY_A, {
      snapshot_id: snapshotId,
      seq: 0,
      parts,
    });
    expect(batchRes.status).toBe(200);
    expect(await batchRes.json()).toEqual({ ok: true, received: 2 });

    const row = await testEnv.DB.prepare(
      "SELECT description, data FROM articles WHERE tenant_id = ? AND part_number = ? AND variant = ''",
    )
      .bind(TENANT_A, "P1")
      .first<{ description: string; data: string }>();
    expect(row?.description).toBe("Hola");
    const data = JSON.parse(row?.data ?? "{}") as {
      description_raw: string;
      description_i18n: Record<string, string>;
    };
    expect(data.description_raw).toBe("es_ES@Hola;en_US@Hello;de_DE@Hallo");
    expect(data.description_i18n).toEqual({
      es_ES: "Hola",
      en_US: "Hello",
      de_DE: "Hallo",
    });

    const finish = await readJson<{ ok: boolean; total: number }>(
      await post("/api/ingest/finish", KEY_A, {
        snapshot_id: snapshotId,
        sent: 2,
      }),
    );
    expect(finish).toEqual({ ok: true, total: 2 });
  });

  it("a later snapshot omitting a part deletes the stale row", async () => {
    const s1 = await readJson<{ snapshot_id: string }>(
      await post("/api/ingest/start", KEY_A, {}),
    );
    await post("/api/ingest/batch", KEY_A, {
      snapshot_id: s1.snapshot_id,
      seq: 0,
      parts: [{ part_number: "X1" }, { part_number: "X2" }],
    });
    const f1 = await readJson<{ total: number }>(
      await post("/api/ingest/finish", KEY_A, { snapshot_id: s1.snapshot_id }),
    );
    expect(f1.total).toBe(2);

    const s2 = await readJson<{ snapshot_id: string }>(
      await post("/api/ingest/start", KEY_A, {}),
    );
    await post("/api/ingest/batch", KEY_A, {
      snapshot_id: s2.snapshot_id,
      seq: 0,
      parts: [{ part_number: "X1" }],
    });
    const f2 = await readJson<{ total: number }>(
      await post("/api/ingest/finish", KEY_A, { snapshot_id: s2.snapshot_id }),
    );
    expect(f2.total).toBe(1);

    const stale = await testEnv.DB.prepare(
      "SELECT part_number FROM articles WHERE tenant_id = ? AND part_number = ?",
    )
      .bind(TENANT_A, "X2")
      .first();
    expect(stale).toBeNull();
  });

  it("returns 404 for a batch against another tenant's snapshot", async () => {
    const start = await readJson<{ snapshot_id: string }>(
      await post("/api/ingest/start", KEY_A, {}),
    );
    const res = await post("/api/ingest/batch", KEY_B, {
      snapshot_id: start.snapshot_id,
      seq: 0,
      parts: [{ part_number: "Z1" }],
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("returns 401 when X-Api-Key is missing", async () => {
    const res = await post("/api/ingest/start", undefined, {});
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });
});
