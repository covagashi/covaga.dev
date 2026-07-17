import {
  env,
  applyD1Migrations,
  type D1Migration,
} from "cloudflare:test";
import { describe, it, expect, beforeAll } from "vitest";
import worker from "../src/index.js";
import type { Env } from "../src/env.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

/** Build a POST request with a JSON body (waitlist takes no auth). */
function post(path: string, body: unknown): Request {
  const headers = new Headers({ "Content-Type": "application/json" });
  return new Request(`https://x${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

/** Invoke the worker's fetch handler. */
function call(request: Request): Promise<Response> {
  return Promise.resolve(worker.fetch(request, testEnv));
}

beforeAll(async () => {
  await applyD1Migrations(testEnv.DB, testEnv.TEST_MIGRATIONS);
});

describe("POST /api/waitlist", () => {
  it("accepts a valid email and stores it lowercased", async () => {
    const res = await call(
      post("/api/waitlist", { email: "Early@Example.com", locale: "es" }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const row = await testEnv.DB.prepare(
      "SELECT email, locale FROM waitlist WHERE email = ?",
    )
      .bind("early@example.com")
      .first<{ email: string; locale: string }>();
    expect(row?.email).toBe("early@example.com");
    expect(row?.locale).toBe("es");
  });

  it("is idempotent: re-submitting the same email still returns ok", async () => {
    const first = await call(post("/api/waitlist", { email: "dup@example.com" }));
    expect(first.status).toBe(200);
    const second = await call(
      post("/api/waitlist", { email: "DUP@example.com", locale: "de" }),
    );
    expect(second.status).toBe(200);
    expect(await second.json()).toEqual({ ok: true });

    const count = await testEnv.DB.prepare(
      "SELECT COUNT(*) AS n FROM waitlist WHERE email = ?",
    )
      .bind("dup@example.com")
      .first<{ n: number }>();
    expect(count?.n).toBe(1);
  });

  it("rejects a malformed email with 400", async () => {
    const res = await call(post("/api/waitlist", { email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_email" });
  });

  it("rejects a body without an email with 400", async () => {
    const res = await call(post("/api/waitlist", { locale: "en" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_body" });
  });
});
