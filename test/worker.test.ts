import { env, applyD1Migrations, type D1Migration } from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";
import { hashApiKey } from "../src/lib/crypto.js";
import type { Env } from "../src/env.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

const VALID_KEY = "valid-api-key-123";
const TENANT_ID = "t_test1";

beforeAll(async () => {
  await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);
  const hash = await hashApiKey(VALID_KEY);
  await testEnv.DB.prepare(
    "INSERT INTO tenants (id, name, api_key_hash, created_at) VALUES (?, ?, ?, ?)",
  )
    .bind(TENANT_ID, "Test Tenant", hash, Date.now())
    .run();
});

/** Invoke the worker's fetch handler for a request. */
function call(request: Request): Promise<Response> {
  return Promise.resolve(worker.fetch(request, testEnv));
}

describe("GET /health", () => {
  it("returns 200 { ok: true }", async () => {
    const res = await call(new Request("https://x/health"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});

describe("GET /whoami (auth)", () => {
  it("resolves the tenant for a valid X-Api-Key", async () => {
    const res = await call(
      new Request("https://x/whoami", { headers: { "X-Api-Key": VALID_KEY } }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: TENANT_ID });
  });

  it("returns 401 uniform message for an invalid key", async () => {
    const res = await call(
      new Request("https://x/whoami", { headers: { "X-Api-Key": "nope" } }),
    );
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });

  it("returns 401 uniform message when the key is missing", async () => {
    const res = await call(new Request("https://x/whoami"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "unauthorized" });
  });
});

describe("unknown route", () => {
  it("returns a uniform 404", async () => {
    const res = await call(new Request("https://x/nope"));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });
});
