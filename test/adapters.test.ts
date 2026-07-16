import { env, applyD1Migrations, type D1Migration } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";
import { hashApiKey } from "../src/lib/crypto.js";
import { enrichPart } from "../src/lib/multilang.js";
import type { Env } from "../src/env.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

const KEY_A = "adapters-key-a";
const TENANT_A = "t_adapters_a";
const KEY_B = "adapters-key-b";
const TENANT_B = "t_adapters_b";

/** Request builder with an optional API key and JSON body. */
function req(
  path: string,
  method: string,
  key?: string,
  body?: unknown,
): Request {
  const headers = new Headers();
  if (key !== undefined) {
    headers.set("X-Api-Key", key);
  }
  const init: RequestInit = { method, headers };
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(body);
  }
  return new Request(`https://x${path}`, init);
}

/** Invoke the worker. */
function call(request: Request): Promise<Response> {
  return Promise.resolve(worker.fetch(request, testEnv));
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

/** Insert a validated gym proposal directly. */
async function seedProposal(
  tenantId: string,
  id: string,
  opts: {
    partNumber: string;
    variant?: string;
    taskType: string;
    field: string;
    lang: string;
    oldValue: string;
    newValue: string;
    status?: string;
  },
): Promise<void> {
  await testEnv.DB.prepare(
    `INSERT INTO gym_proposals
       (id, tenant_id, part_number, variant, task_type, field, lang,
        old_value, new_value, status, confidence, episode_id,
        validator_report, created_at, job_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.9, '', '', ?, '')`,
  )
    .bind(
      id,
      tenantId,
      opts.partNumber,
      opts.variant ?? "",
      opts.taskType,
      opts.field,
      opts.lang,
      opts.oldValue,
      opts.newValue,
      opts.status ?? "validated",
      Date.now(),
    )
    .run();
}

/** Read a proposal's current status. */
async function statusOf(id: string): Promise<string | undefined> {
  const row = await testEnv.DB.prepare(
    "SELECT status FROM gym_proposals WHERE id = ?",
  )
    .bind(id)
    .first<{ status: string }>();
  return row?.status;
}

/** A minimal enriched part with all deliverables present, overridable. */
function part(overrides: Record<string, unknown>): Record<string, unknown> {
  const base: Record<string, unknown> = {
    part_number: "PN",
    variant: "",
    manufacturer: "ACME",
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
  p: Record<string, unknown>,
): Promise<void> {
  await testEnv.DB.prepare(
    `INSERT INTO articles
       (tenant_id, part_number, variant, manufacturer, description, data, snapshot_id, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 's1', ?)`,
  )
    .bind(
      tenantId,
      p["part_number"],
      p["variant"] ?? "",
      p["manufacturer"] ?? "",
      p["description"] ?? "",
      JSON.stringify(p),
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
    insert.bind(TENANT_A, "Adapters A", hashA, Date.now()),
    insert.bind(TENANT_B, "Adapters B", hashB, Date.now()),
  ]);

  // Tenant A catalog: ACME full, ACME missing UL, Siemens missing photo+desc.
  await insertPart(TENANT_A, part({ part_number: "p_full" }));
  await insertPart(
    TENANT_A,
    part({ part_number: "p_no_ul", has_ul: false, ul_value: "" }),
  );
  await insertPart(
    TENANT_A,
    part({
      part_number: "p_no_photo_desc",
      manufacturer: "Siemens",
      description: "",
      has_photo: false,
      photo_path: "",
    }),
  );
});

describe("GET /api/changes", () => {
  it("requires auth", async () => {
    const res = await call(req("/api/changes?status=pending", "GET"));
    expect(res.status).toBe(401);
  });

  it("maps validated proposals to pending changesets with counts", async () => {
    await seedProposal(TENANT_A, "c_pending", {
      partNumber: "CP1",
      variant: "v2",
      taskType: "translate",
      field: "description",
      lang: "fr_FR",
      oldValue: "old text",
      newValue: "nouveau texte",
    });
    await seedProposal(TENANT_A, "c_applied", {
      partNumber: "CP2",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "an applied one",
      status: "applied",
    });

    const body = await readJson<{
      items: Array<{
        id: string;
        status: string;
        title: string;
        author: string;
        items: Array<Record<string, string>>;
      }>;
      counts: Record<string, number>;
    }>(await call(req("/api/changes?status=pending", "GET", KEY_A)));

    // Only the validated proposal surfaces under pending.
    expect(body.items).toHaveLength(1);
    const cs = body.items[0];
    expect(cs?.id).toBe("c_pending");
    expect(cs?.status).toBe("pending");
    expect(cs?.author).toBe("gym");
    expect(cs?.title).toContain("CP1");
    const item = cs?.items[0];
    expect(item).toMatchObject({
      part_number: "CP1",
      variant: "v2",
      field: "description",
      lang: "fr_FR",
      old: "old text",
      new: "nouveau texte",
    });

    // Counts always carry the four change statuses; validated == pending.
    expect(body.counts.pending).toBe(1);
    expect(body.counts.applied).toBe(1);
    expect(body.counts.approved).toBe(0);
    expect(body.counts.rejected).toBe(0);
  });

  it("returns every changeset when no status is given", async () => {
    await seedProposal(TENANT_A, "all1", {
      partNumber: "ALL1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "one",
    });
    await seedProposal(TENANT_A, "all2", {
      partNumber: "ALL2",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "two",
      status: "rejected",
    });
    const body = await readJson<{ items: unknown[] }>(
      await call(req("/api/changes", "GET", KEY_A)),
    );
    expect(body.items.length).toBeGreaterThanOrEqual(2);
  });
});

describe("POST /api/changes/:id/approve and /reject", () => {
  it("approve moves validated -> approved and enqueues a job", async () => {
    await seedProposal(TENANT_A, "ap1", {
      partNumber: "AP1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "A DIN-rail breaker, 16 A.",
    });
    const res = await call(req("/api/changes/ap1/approve", "POST", KEY_A, {}));
    expect(res.status).toBe(200);
    const body = await readJson<{ ok: boolean; job_id: string; count: number }>(
      res,
    );
    expect(body.ok).toBe(true);
    expect(body.count).toBe(1);
    expect(await statusOf("ap1")).toBe("approved");

    // A pending write job now exists for the bridge to poll.
    const job = await testEnv.DB.prepare(
      "SELECT status FROM write_jobs WHERE id = ?",
    )
      .bind(body.job_id)
      .first<{ status: string }>();
    expect(job?.status).toBe("pending");
  });

  it("reject moves validated -> rejected (reason ignored)", async () => {
    await seedProposal(TENANT_A, "rj1", {
      partNumber: "RJ1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "Nope.",
    });
    const res = await call(
      req("/api/changes/rj1/reject", "POST", KEY_A, { reason: "bad" }),
    );
    expect(res.status).toBe(200);
    expect(await statusOf("rj1")).toBe("rejected");
  });

  it("isolates tenants: B cannot approve A's changeset", async () => {
    await seedProposal(TENANT_A, "iso1", {
      partNumber: "ISO1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "A's private proposal.",
    });
    const res = await call(req("/api/changes/iso1/approve", "POST", KEY_B, {}));
    expect(res.status).toBe(400);
    expect(await statusOf("iso1")).toBe("validated");
  });
});

describe("POST /api/changes/apply", () => {
  it("reports approved changes awaiting the bridge", async () => {
    await seedProposal(TENANT_A, "apl1", {
      partNumber: "APL1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "Approve then apply.",
    });
    const approve = await readJson<{ job_id: string }>(
      await call(req("/api/changes/apl1/approve", "POST", KEY_A, {})),
    );

    const body = await readJson<{
      ok: boolean;
      queued: Array<{ change_id: string; job_id: string }>;
    }>(await call(req("/api/changes/apply", "POST", KEY_A, {})));
    expect(body.ok).toBe(true);
    const entry = body.queued.find((q) => q.change_id === "apl1");
    expect(entry?.job_id).toBe(approve.job_id);
  });
});

describe("GET /api/queues", () => {
  it("returns system queues with missingOf counts and empty saved", async () => {
    const body = await readJson<{
      system: Array<{ id: string; label: string; filter: Record<string, string>; count: number }>;
      saved: unknown[];
    }>(await call(req("/api/queues", "GET", KEY_A)));

    expect(body.saved).toEqual([]);
    const byId = new Map(body.system.map((q) => [q.id, q]));
    // 3 parts total; UL gap 1; photo gap 1; description gap 1; ce/erp/macro 0.
    expect(byId.get("all")?.count).toBe(3);
    expect(byId.get("all")?.filter).toEqual({});
    expect(byId.get("no_ul")?.count).toBe(1);
    expect(byId.get("no_ul")?.filter).toEqual({ missing: "ul" });
    expect(byId.get("no_photo")?.count).toBe(1);
    expect(byId.get("no_description")?.count).toBe(1);
    expect(byId.get("no_ce")?.count).toBe(0);
    expect(byId.get("no_erp")?.count).toBe(0);
    expect(byId.get("no_macro")?.count).toBe(0);
  });
});

describe("GET/POST /api/settings", () => {
  it("defaults to require_l0_approval true and round-trips a change", async () => {
    const initial = await readJson<{ require_l0_approval: boolean }>(
      await call(req("/api/settings", "GET", KEY_A)),
    );
    expect(initial.require_l0_approval).toBe(true);

    const saveRes = await call(
      req("/api/settings", "POST", KEY_A, { require_l0_approval: false }),
    );
    expect(saveRes.status).toBe(200);
    expect(await readJson<{ ok: boolean }>(saveRes)).toEqual({ ok: true });

    const after = await readJson<{ require_l0_approval: boolean }>(
      await call(req("/api/settings", "GET", KEY_A)),
    );
    expect(after.require_l0_approval).toBe(false);

    // Tenant B still sees the default (isolation).
    const b = await readJson<{ require_l0_approval: boolean }>(
      await call(req("/api/settings", "GET", KEY_B)),
    );
    expect(b.require_l0_approval).toBe(true);
  });

  it("rejects a non-boolean require_l0_approval", async () => {
    const res = await call(
      req("/api/settings", "POST", KEY_A, { require_l0_approval: "yes" }),
    );
    expect(res.status).toBe(400);
  });
});

describe("GET /api/gym/status", () => {
  it("returns available, episodes and proposals grouped by status", async () => {
    await testEnv.DB.prepare(
      `INSERT INTO gym_episodes (id, tenant_id, started_at, submitted, validated, rejected)
       VALUES ('ep_a', ?, ?, 4, 3, 1)`,
    )
      .bind(TENANT_A, Date.now())
      .run();
    await seedProposal(TENANT_A, "gs1", {
      partNumber: "GS1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "grouped",
    });

    const body = await readJson<{
      available: boolean;
      episodes: Array<{ episode: number; task: string; done: number; ok: number }>;
      proposals: Record<string, number>;
    }>(await call(req("/api/gym/status", "GET", KEY_A)));

    expect(body.available).toBe(true);
    const ep = body.episodes.find((e) => e.done === 4);
    expect(ep?.ok).toBe(3);
    expect(typeof ep?.episode).toBe("number");
    // The seeded validated proposal appears in the grouped tallies.
    expect(body.proposals["validated"]).toBeGreaterThan(0);
  });

  it("reports unavailable for a tenant with no gym data", async () => {
    const body = await readJson<{ available: boolean; episodes: unknown[] }>(
      await call(req("/api/gym/status", "GET", KEY_B)),
    );
    expect(body.available).toBe(false);
    expect(body.episodes).toEqual([]);
  });
});

describe("GET /api/health", () => {
  it("returns the ported Health fields", async () => {
    const body = await readJson<{
      ok: boolean;
      snapshot: boolean;
      parts: number;
      pat: boolean;
      pending_changes: number;
      bridge_last_poll?: string;
      last_write_dry_run?: boolean;
    }>(await call(req("/api/health", "GET", KEY_A)));

    expect(body.ok).toBe(true);
    expect(body.parts).toBe(3);
    expect(body.snapshot).toBe(true);
    expect(typeof body.pat).toBe("boolean");
    expect(typeof body.pending_changes).toBe("number");
    // A job was taken during the write-queue path? Not here, but the field is
    // optional; when present it must be an ISO string.
    if (body.bridge_last_poll !== undefined) {
      expect(Number.isNaN(Date.parse(body.bridge_last_poll))).toBe(false);
    }
  });

  it("requires auth", async () => {
    const res = await call(req("/api/health", "GET"));
    expect(res.status).toBe(401);
  });

  it("reports parts 0 / snapshot false for an empty tenant", async () => {
    const body = await readJson<{ parts: number; snapshot: boolean }>(
      await call(req("/api/health", "GET", KEY_B)),
    );
    expect(body.parts).toBe(0);
    expect(body.snapshot).toBe(false);
  });
});
