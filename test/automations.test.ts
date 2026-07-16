import {
  env,
  fetchMock,
  applyD1Migrations,
  type D1Migration,
} from "cloudflare:test";
import { describe, it, expect, beforeAll, afterEach } from "vitest";
import worker from "../src/index.js";
import { hashApiKey } from "../src/lib/crypto.js";
import type { Env } from "../src/env.js";
import type { Destination } from "../src/models/automation.js";
import { isKnownEventId } from "../src/models/automation.js";
import { buildPayload } from "../src/adapters/webhook.adapter.js";

const testEnv = env as Env & { TEST_MIGRATIONS: D1Migration[] };

const KEY_A = "key-automations-a";
const KEY_B = "key-automations-b";
const TENANT_A = "t_auto_a";
const TENANT_B = "t_auto_b";

const DEST_ORIGIN = "https://dest.example.com";
const DEST_PATH = "/hook";
const DEST_URL = `${DEST_ORIGIN}${DEST_PATH}`;

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
  fetchMock.activate();
  fetchMock.disableNetConnect();
});

afterEach(() => {
  fetchMock.assertNoPendingInterceptors();
});

describe("isKnownEventId", () => {
  it("accepts the verified event set and rejects others", () => {
    for (const id of [
      "pdf-exported",
      "bom-exported",
      "project-closed",
      "bom-changed",
    ]) {
      expect(isKnownEventId(id)).toBe(true);
    }
    expect(isKnownEventId("dxf-dwg-exported")).toBe(false);
    expect(isKnownEventId("nope")).toBe(false);
    expect(isKnownEventId("")).toBe(false);
  });
});

describe("buildPayload", () => {
  const base: Destination = {
    id: "d1",
    tenantId: TENANT_A,
    kind: "webhook",
    webhookUrl: DEST_URL,
    label: "",
    enabled: true,
    createdAt: 0,
  };

  it("renders a Teams MessageCard", () => {
    const payload = buildPayload(
      { ...base, kind: "teams" },
      {
        eventId: "pdf-exported",
        tenantId: TENANT_A,
        metadata: { project: "P1" },
      },
    ) as Record<string, unknown>;
    expect(payload["@type"]).toBe("MessageCard");
    expect(payload["@context"]).toBe("http://schema.org/extensions");
    expect(payload["title"]).toBe("Covaga: pdf-exported");
    expect(payload["text"]).toBe('Covaga event "pdf-exported" -- project: P1');
  });

  it("passes the raw metadata through for a webhook", () => {
    const metadata = { project: "P1", count: 3 };
    const payload = buildPayload(base, {
      eventId: "pdf-exported",
      tenantId: TENANT_A,
      metadata,
    });
    expect(payload).toEqual(metadata);
  });
});

describe("automations dispatcher (integration)", () => {
  it("rejects an unknown event id with 400", async () => {
    const res = await call(req("/hook/t_auto_a/not-an-event", "POST", KEY_A, {}));
    expect(res.status).toBe(400);
    expect((await res.json()) as unknown).toEqual({ error: "unknown_event" });
  });

  it("rejects an oversized body with 413", async () => {
    const headers = new Headers({
      "X-Api-Key": KEY_A,
      "Content-Type": "application/json",
    });
    const big = "x".repeat(64 * 1024 + 1);
    const request = new Request("https://x/hook/t_auto_a/pdf-exported", {
      method: "POST",
      headers,
      body: JSON.stringify({ blob: big }),
    });
    const res = await call(request);
    expect(res.status).toBe(413);
    expect((await res.json()) as unknown).toEqual({ error: "payload_too_large" });
  });

  it("returns 401 when the path tenant does not match the key", async () => {
    const res = await call(req("/hook/t_auto_b/pdf-exported", "POST", KEY_A, {}));
    expect(res.status).toBe(401);
    expect((await res.json()) as unknown).toEqual({ error: "unauthorized" });
  });

  it("records a single skipped execution when no route matches", async () => {
    const res = await call(
      req("/hook/t_auto_a/bom-exported", "POST", KEY_A, { any: "thing" }),
    );
    expect(res.status).toBe(202);
    const body = (await res.json()) as {
      ok: boolean;
      executions: { id: string; destination_id: string; status: string }[];
    };
    expect(body.ok).toBe(true);
    expect(body.executions).toHaveLength(1);
    expect(body.executions[0]?.status).toBe("skipped");
    expect(body.executions[0]?.destination_id).toBe("");
  });

  it("creates a destination + route and delivers the event", async () => {
    // Create a webhook destination.
    const destRes = await call(
      req("/api/destinations", "POST", KEY_A, {
        kind: "webhook",
        webhook_url: DEST_URL,
        label: "ops",
      }),
    );
    expect(destRes.status).toBe(200);
    const { destination } = (await destRes.json()) as {
      destination: { id: string; kind: string; webhook_url: string };
    };
    expect(destination.kind).toBe("webhook");

    // Route pdf-exported to it.
    const routeRes = await call(
      req("/api/routes", "POST", KEY_A, {
        event_id: "pdf-exported",
        destination_id: destination.id,
      }),
    );
    expect(routeRes.status).toBe(200);

    // Intercept the outbound delivery and capture its body.
    const metadata = { project: "P1", count: 3 };
    let capturedBody: string | undefined;
    fetchMock
      .get(DEST_ORIGIN)
      .intercept({
        path: DEST_PATH,
        method: "POST",
        body(value: string) {
          capturedBody = value;
          return true;
        },
      })
      .reply(200, "ok");

    const hookRes = await call(
      req("/hook/t_auto_a/pdf-exported", "POST", KEY_A, metadata),
    );
    expect(hookRes.status).toBe(202);
    const outcome = (await hookRes.json()) as {
      executions: { destination_id: string; status: string }[];
    };
    expect(outcome.executions).toHaveLength(1);
    expect(outcome.executions[0]?.status).toBe("delivered");
    expect(outcome.executions[0]?.destination_id).toBe(destination.id);

    // The raw webhook receives the metadata verbatim.
    expect(capturedBody).toBeDefined();
    expect(JSON.parse(capturedBody as string) as unknown).toEqual(metadata);
  });

  it("lists recent executions (delivered + skipped)", async () => {
    // A skipped dispatch (no route for bom-exported).
    await call(req("/hook/t_auto_a/bom-exported", "POST", KEY_A, {}));

    // A delivered dispatch: destination + route + intercepted delivery.
    const { destination } = (await (
      await call(
        req("/api/destinations", "POST", KEY_A, {
          kind: "webhook",
          webhook_url: DEST_URL,
        }),
      )
    ).json()) as { destination: { id: string } };
    await call(
      req("/api/routes", "POST", KEY_A, {
        event_id: "pdf-exported",
        destination_id: destination.id,
      }),
    );
    fetchMock
      .get(DEST_ORIGIN)
      .intercept({ path: DEST_PATH, method: "POST" })
      .reply(200, "ok");
    await call(req("/hook/t_auto_a/pdf-exported", "POST", KEY_A, { a: 1 }));

    const res = await call(req("/api/executions?limit=10", "GET", KEY_A));
    expect(res.status).toBe(200);
    const { executions } = (await res.json()) as {
      executions: { event_id: string; status: string }[];
    };
    expect(executions.length).toBeGreaterThanOrEqual(2);
    expect(executions.some((e) => e.status === "delivered")).toBe(true);
    expect(executions.some((e) => e.status === "skipped")).toBe(true);
  });

  it("isolates tenants: B cannot see A's destinations or routes", async () => {
    const destRes = await call(req("/api/destinations", "GET", KEY_B));
    const { destinations } = (await destRes.json()) as {
      destinations: unknown[];
    };
    expect(destinations).toHaveLength(0);

    const routeRes = await call(req("/api/routes", "GET", KEY_B));
    const { routes } = (await routeRes.json()) as { routes: unknown[] };
    expect(routes).toHaveLength(0);
  });

  it("rejects a route to a destination the tenant does not own", async () => {
    // A creates a destination; B must not be able to route to it.
    const { destination } = (await (
      await call(
        req("/api/destinations", "POST", KEY_A, {
          kind: "webhook",
          webhook_url: DEST_URL,
        }),
      )
    ).json()) as { destination: { id: string } };

    const res = await call(
      req("/api/routes", "POST", KEY_B, {
        event_id: "pdf-exported",
        destination_id: destination.id,
      }),
    );
    expect(res.status).toBe(400);
    expect((await res.json()) as unknown).toEqual({ error: "invalid_destination" });
  });
});
