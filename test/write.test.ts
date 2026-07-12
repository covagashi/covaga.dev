import { env, applyD1Migrations, type D1Migration } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";
import { hashApiKey } from "../src/lib/crypto.js";
import type { Env } from "../src/env.js";
import type { WriteJob } from "../src/models/write.js";
import { jobToTxt } from "../src/services/write-queue.service.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

const KEY_A = "key-tenant-a";
const KEY_B = "key-tenant-b";
const TENANT_A = "t_write_a";
const TENANT_B = "t_write_b";

/** Insert a validated gym proposal directly. */
async function seedProposal(
  tenantId: string,
  id: string,
  opts: {
    partNumber: string;
    taskType: string;
    field: string;
    lang: string;
    oldValue: string;
    newValue: string;
  },
): Promise<void> {
  await testEnv.DB.prepare(
    `INSERT INTO gym_proposals
       (id, tenant_id, part_number, variant, task_type, field, lang,
        old_value, new_value, status, confidence, episode_id,
        validator_report, created_at, job_id)
     VALUES (?, ?, ?, '', ?, ?, ?, ?, ?, 'validated', 0.9, '', '', ?, '')`,
  )
    .bind(
      id,
      tenantId,
      opts.partNumber,
      opts.taskType,
      opts.field,
      opts.lang,
      opts.oldValue,
      opts.newValue,
      Date.now(),
    )
    .run();
}

/** Build a request with optional API key and JSON body. */
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

/** Invoke the worker's fetch handler. */
function call(request: Request): Promise<Response> {
  return Promise.resolve(worker.fetch(request, testEnv));
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

beforeAll(async () => {
  await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);
  for (const [id, key] of [
    [TENANT_A, KEY_A],
    [TENANT_B, KEY_B],
  ] as const) {
    const hash = await hashApiKey(key);
    await testEnv.DB.prepare(
      "INSERT INTO tenants (id, name, api_key_hash, created_at) VALUES (?, ?, ?, ?)",
    )
      .bind(id, id, hash, Date.now())
      .run();
  }
});

describe("jobToTxt", () => {
  it("serialises a job with 2 changes byte-for-byte", () => {
    const job: WriteJob = {
      id: "job-1",
      tenantId: TENANT_A,
      status: "pending",
      source: "gym",
      changes: [
        {
          part_number: "A1",
          variant: "",
          field: "description",
          lang: "",
          value: "Hello world",
        },
        {
          part_number: "B2",
          variant: "v2",
          field: "description",
          lang: "fr_FR",
          value: "Bonjour / Ç",
        },
      ],
      createdAt: 0,
      dryRun: false,
      summary: "",
      results: "",
    };
    expect(jobToTxt(job)).toBe(
      "JOB job-1\n" +
        "CHG A1\t\tdescription\t\tHello%20world\n" +
        "CHG B2\tv2\tdescription\tfr_FR\tBonjour%20%2F%20%C3%87\n" +
        "END 2\n",
    );
  });

  it("serialises an empty job to just the header and END 0", () => {
    const job: WriteJob = {
      id: "empty",
      tenantId: TENANT_A,
      status: "pending",
      source: "gym",
      changes: [],
      createdAt: 0,
      dryRun: false,
      summary: "",
      results: "",
    };
    expect(jobToTxt(job)).toBe("JOB empty\nEND 0\n");
  });
});

describe("review + write queue (integration)", () => {
  it("approves proposals into one pending job and applies them", async () => {
    await seedProposal(TENANT_A, "p1", {
      partNumber: "A1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "A DIN-rail circuit breaker, 16 A, type C.",
    });
    await seedProposal(TENANT_A, "p2", {
      partNumber: "A2",
      taskType: "translate",
      field: "description",
      lang: "fr_FR",
      oldValue: "",
      newValue: "Câble 2,5 mm²",
    });

    // List validated proposals.
    const listRes = await call(req("/api/gym/proposals", "GET", KEY_A));
    expect(listRes.status).toBe(200);
    const listed = (await listRes.json()) as {
      proposals: { id: string; status: string }[];
    };
    expect(listed.proposals).toHaveLength(2);
    expect(listed.proposals.every((p) => p.status === "validated")).toBe(true);

    // Approve both -> one pending job.
    const approveRes = await call(
      req("/api/gym/proposals/approve", "POST", KEY_A, { ids: ["p1", "p2"] }),
    );
    expect(approveRes.status).toBe(200);
    const approve = (await approveRes.json()) as {
      ok: boolean;
      job_id: string;
      count: number;
    };
    expect(approve.ok).toBe(true);
    expect(approve.count).toBe(2);
    expect(await statusOf("p1")).toBe("approved");
    expect(await statusOf("p2")).toBe("approved");

    const jobRow = await testEnv.DB.prepare(
      "SELECT job_id FROM gym_proposals WHERE id = 'p1'",
    ).first<{ job_id: string }>();
    expect(jobRow?.job_id).toBe(approve.job_id);

    // Poll as txt -> flips the job to taken and matches the exact format.
    const pollRes = await call(
      req("/api/write/poll?format=txt", "GET", KEY_A),
    );
    expect(pollRes.status).toBe(200);
    expect(pollRes.headers.get("Content-Type")).toContain("text/plain");
    const txt = await pollRes.text();
    expect(txt.startsWith(`JOB ${approve.job_id}\n`)).toBe(true);
    expect(txt.endsWith("END 2\n")).toBe(true);
    expect((txt.match(/^CHG /gm) ?? []).length).toBe(2);

    const takenStatus = await testEnv.DB.prepare(
      "SELECT status FROM write_jobs WHERE id = ?",
    )
      .bind(approve.job_id)
      .first<{ status: string }>();
    expect(takenStatus?.status).toBe("taken");

    // No more pending jobs -> NONE.
    const pollAgain = await call(
      req("/api/write/poll?format=txt", "GET", KEY_A),
    );
    expect(await pollAgain.text()).toBe("NONE\n");

    // Report a real (non dry-run) result -> proposals become applied.
    const resultRes = await call(
      req("/api/write/result", "POST", KEY_A, {
        job_id: approve.job_id,
        dry_run: false,
        summary: "applied 2 changes",
        results: [{ part_number: "A1", ok: true }],
      }),
    );
    expect(resultRes.status).toBe(200);
    expect(await statusOf("p1")).toBe("applied");
    expect(await statusOf("p2")).toBe("applied");

    // Jobs listing decodes changes + results.
    const jobsRes = await call(req("/api/write/jobs", "GET", KEY_A));
    const jobs = (await jobsRes.json()) as {
      jobs: {
        id: string;
        status: string;
        changes: unknown[];
        results?: unknown;
      }[];
    };
    const done = jobs.jobs.find((j) => j.id === approve.job_id);
    expect(done?.status).toBe("done");
    expect(done?.changes).toHaveLength(2);
    expect(done?.results).toEqual([{ part_number: "A1", ok: true }]);
  });

  it("leaves proposals approved after a dry-run result", async () => {
    await seedProposal(TENANT_A, "d1", {
      partNumber: "D1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "A dry-run description.",
    });
    const approve = (await (
      await call(req("/api/gym/proposals/approve", "POST", KEY_A, { id: "d1" }))
    ).json()) as { job_id: string };

    // Take then report a dry run.
    await call(req("/api/write/poll", "GET", KEY_A));
    const res = await call(
      req("/api/write/result", "POST", KEY_A, {
        job_id: approve.job_id,
        dry_run: true,
        summary: "preview only",
      }),
    );
    expect(res.status).toBe(200);
    expect(await statusOf("d1")).toBe("approved");
  });

  it("polls JSON with no job as { job: undefined } / NONE txt", async () => {
    const json = (await (
      await call(req("/api/write/poll", "GET", KEY_A))
    ).json()) as { job?: unknown };
    expect(json.job).toBeUndefined();
  });

  it("rejects validated proposals", async () => {
    await seedProposal(TENANT_A, "r1", {
      partNumber: "R1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "Nope.",
    });
    const res = await call(
      req("/api/gym/proposals/reject", "POST", KEY_A, { ids: ["r1"] }),
    );
    expect(res.status).toBe(200);
    expect((await res.json()) as unknown).toEqual({ ok: true, count: 1 });
    expect(await statusOf("r1")).toBe("rejected");
  });

  it("rejects an erp_number change with 400", async () => {
    await seedProposal(TENANT_A, "e1", {
      partNumber: "E1",
      taskType: "describe",
      field: "erp_number",
      lang: "",
      oldValue: "",
      newValue: "123",
    });
    const res = await call(
      req("/api/gym/proposals/approve", "POST", KEY_A, { id: "e1" }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()) as unknown).toEqual({ error: "erp_read_only" });
    expect(await statusOf("e1")).toBe("validated");
  });

  it("isolates tenants: B cannot approve or poll A's data", async () => {
    await seedProposal(TENANT_A, "iso1", {
      partNumber: "ISO1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "A's private proposal.",
    });

    // B approving A's id finds no validated proposal -> 400, A untouched.
    const bApprove = await call(
      req("/api/gym/proposals/approve", "POST", KEY_B, { id: "iso1" }),
    );
    expect(bApprove.status).toBe(400);
    expect(await statusOf("iso1")).toBe("validated");

    // A approves; B polling never sees A's job.
    await call(req("/api/gym/proposals/approve", "POST", KEY_A, { id: "iso1" }));
    const bPoll = await call(req("/api/write/poll?format=txt", "GET", KEY_B));
    expect(await bPoll.text()).toBe("NONE\n");
    // A's job is still pending (B did not take it).
    const aPoll = await call(req("/api/write/poll?format=txt", "GET", KEY_A));
    expect((await aPoll.text()).startsWith("JOB ")).toBe(true);
  });

  it("requeues a taken job back to pending", async () => {
    await seedProposal(TENANT_A, "q1", {
      partNumber: "Q1",
      taskType: "describe",
      field: "description",
      lang: "",
      oldValue: "",
      newValue: "Requeue me.",
    });
    const approve = (await (
      await call(req("/api/gym/proposals/approve", "POST", KEY_A, { id: "q1" }))
    ).json()) as { job_id: string };
    await call(req("/api/write/poll", "GET", KEY_A));

    const res = await call(
      req("/api/write/requeue", "POST", KEY_A, { job_id: approve.job_id }),
    );
    expect(res.status).toBe(200);
    const row = await testEnv.DB.prepare(
      "SELECT status, taken_at FROM write_jobs WHERE id = ?",
    )
      .bind(approve.job_id)
      .first<{ status: string; taken_at?: number }>();
    expect(row?.status).toBe("pending");
    expect(row?.taken_at ?? undefined).toBeUndefined();
  });

  it("returns 401 when the API key is missing", async () => {
    const res = await call(req("/api/write/poll", "GET"));
    expect(res.status).toBe(401);
    expect((await res.json()) as unknown).toEqual({ error: "unauthorized" });
  });
});
