import {
  env,
  applyD1Migrations,
  type D1Migration,
} from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";
import { hashApiKey } from "../src/lib/crypto.js";
import type { Env } from "../src/env.js";
import { PLANS } from "../src/models/plan.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

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

/** Shape of a successful signup response body. */
interface SignupBody {
  ok: boolean;
  tenant_id: string;
  api_key: string;
}

/** Insert a legacy tenant with the default empty email (pre-accounts schema). */
async function insertLegacyTenant(id: string, key: string): Promise<void> {
  const hash = await hashApiKey(key);
  await testEnv.DB.prepare(
    "INSERT INTO tenants (id, name, api_key_hash, created_at) VALUES (?, ?, ?, ?)",
  )
    .bind(id, id, hash, Date.now())
    .run();
}

beforeAll(async () => {
  await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);
  await insertLegacyTenant("t_legacy_a", "legacy-key-a");
  await insertLegacyTenant("t_legacy_b", "legacy-key-b");
});

describe("GET /api/plans", () => {
  it("returns the available plans without auth", async () => {
    const res = await call(req("/api/plans", "GET"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ plans: [...PLANS] });
  });
});

describe("POST /api/signup", () => {
  it("creates a tenant and returns a key that authenticates on /whoami", async () => {
    const res = await call(
      req("/api/signup", "POST", undefined, {
        email: "alice@example.com",
        plan: "free",
      }),
    );
    expect(res.status).toBe(200);

    const body = (await res.json()) as SignupBody;
    expect(body.ok).toBe(true);
    expect(body.tenant_id.startsWith("t_")).toBe(true);
    expect(typeof body.api_key).toBe("string");
    expect(body.api_key.length).toBeGreaterThan(0);

    const who = await call(req("/whoami", "GET", body.api_key));
    expect(who.status).toBe(200);
    expect(await who.json()).toEqual({ id: body.tenant_id });
  });

  it("rejects a duplicate email case-insensitively with 409", async () => {
    const first = await call(
      req("/api/signup", "POST", undefined, {
        email: "dup@example.com",
        plan: "pro",
      }),
    );
    expect(first.status).toBe(200);

    const second = await call(
      req("/api/signup", "POST", undefined, {
        email: "DUP@Example.com",
        plan: "free",
      }),
    );
    expect(second.status).toBe(409);
    expect(await second.json()).toEqual({ error: "email_taken" });
  });

  it("rejects an invalid email with 400", async () => {
    const res = await call(
      req("/api/signup", "POST", undefined, {
        email: "not-an-email",
        plan: "free",
      }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_email" });
  });

  it("rejects an unknown plan with 400", async () => {
    const res = await call(
      req("/api/signup", "POST", undefined, {
        email: "bob@example.com",
        plan: "enterprise",
      }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_plan" });
  });

  it("rejects a missing plan with 400", async () => {
    const res = await call(
      req("/api/signup", "POST", undefined, { email: "carol@example.com" }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_body" });
  });
});

describe("legacy empty-email tenants", () => {
  it("still authenticate under the partial unique index", async () => {
    for (const key of ["legacy-key-a", "legacy-key-b"]) {
      const res = await call(req("/whoami", "GET", key));
      expect(res.status).toBe(200);
    }
  });
});
