import type { Env } from "./env.js";
import { HttpError } from "./errors.js";
import { corsHeaders, jsonResponse, readJsonBody } from "./lib/http.js";
import { authenticateTenant } from "./services/auth.service.js";
import {
  finishIngest,
  ingestBatch,
  startIngest,
} from "./services/ingest.service.js";
import {
  approveProposals,
  listProposals,
  rejectProposals,
} from "./services/review.service.js";
import {
  jobToTxt,
  listJobs,
  POLL_NONE,
  pollJob,
  requeueJob,
  submitResult,
  toJobView,
} from "./services/write-queue.service.js";

/** Execution context carrying MCP props read by the Agents SDK `serve`. */
type McpContext = ExecutionContext & { props?: Record<string, unknown> };

/**
 * Dynamically load the requested MCP mount handler. The Agents SDK / MCP SDK
 * module graph is heavy (and unloadable in the test pool), so it is imported
 * lazily only when an MCP route is actually hit — keeping it out of the eager
 * module graph that the rest of the worker (and its tests) depend on.
 */
async function mcpHandler(
  path: string,
): Promise<import("./mcp/gym.js").MountHandler> {
  const mcp = await import("./mcp/gym.js");
  return path === "/mcp" ? mcp.gymStreamableHandler : mcp.gymSseHandler;
}

/**
 * Route a single request. Kept small: CORS preflight, health, an
 * auth-protected probe, the MCP mounts, and a uniform 404 otherwise.
 */
async function route(
  request: Request,
  env: Env,
  ctx?: McpContext,
): Promise<Response> {
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(undefined, { status: 204, headers: cors });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/mcp" || path === "/sse" || path === "/sse/message") {
    if (ctx === undefined) {
      throw new HttpError(500, "no_execution_context");
    }
    const tenant = await authenticateTenant(env, request);
    ctx.props = { tenantId: tenant.id };
    const handler = await mcpHandler(path === "/mcp" ? "/mcp" : "/sse");
    return handler.fetch(request, env, ctx);
  }

  if (request.method === "GET" && path === "/") {
    return jsonResponse(
      {
        name: "byndr-dev",
        status: "ok",
        docs: "https://github.com/covagashi/byndr-dev",
      },
      200,
      cors,
    );
  }

  if (request.method === "GET" && path === "/health") {
    return jsonResponse({ ok: true }, 200, cors);
  }

  if (request.method === "GET" && path === "/whoami") {
    const tenant = await authenticateTenant(env, request);
    return jsonResponse({ id: tenant.id }, 200, cors);
  }

  if (request.method === "POST" && path === "/api/ingest/start") {
    const tenant = await authenticateTenant(env, request);
    const body = await readJsonBody(request);
    return jsonResponse(await startIngest(env, tenant, body), 200, cors);
  }

  if (request.method === "POST" && path === "/api/ingest/batch") {
    const tenant = await authenticateTenant(env, request);
    const body = await readJsonBody(request);
    return jsonResponse(await ingestBatch(env, tenant, body), 200, cors);
  }

  if (request.method === "POST" && path === "/api/ingest/finish") {
    const tenant = await authenticateTenant(env, request);
    const body = await readJsonBody(request);
    return jsonResponse(await finishIngest(env, tenant, body), 200, cors);
  }

  if (request.method === "GET" && path === "/api/gym/proposals") {
    const tenant = await authenticateTenant(env, request);
    const status = url.searchParams.get("status") ?? "validated";
    return jsonResponse(await listProposals(env, tenant, status), 200, cors);
  }

  if (request.method === "POST" && path === "/api/gym/proposals/approve") {
    const tenant = await authenticateTenant(env, request);
    const body = await readJsonBody(request);
    return jsonResponse(await approveProposals(env, tenant, body), 200, cors);
  }

  if (request.method === "POST" && path === "/api/gym/proposals/reject") {
    const tenant = await authenticateTenant(env, request);
    const body = await readJsonBody(request);
    return jsonResponse(await rejectProposals(env, tenant, body), 200, cors);
  }

  if (request.method === "GET" && path === "/api/write/poll") {
    const tenant = await authenticateTenant(env, request);
    const job = await pollJob(env, tenant);
    if (url.searchParams.get("format") === "txt") {
      const headers = new Headers(cors);
      headers.set("Content-Type", "text/plain; charset=utf-8");
      const body = job === undefined ? POLL_NONE : jobToTxt(job);
      return new Response(body, { status: 200, headers });
    }
    return jsonResponse(
      { job: job === undefined ? undefined : toJobView(job) },
      200,
      cors,
    );
  }

  if (request.method === "POST" && path === "/api/write/result") {
    const tenant = await authenticateTenant(env, request);
    const body = await readJsonBody(request);
    return jsonResponse(await submitResult(env, tenant, body), 200, cors);
  }

  if (request.method === "POST" && path === "/api/write/requeue") {
    const tenant = await authenticateTenant(env, request);
    const body = await readJsonBody(request);
    return jsonResponse(await requeueJob(env, tenant, body), 200, cors);
  }

  if (request.method === "GET" && path === "/api/write/jobs") {
    const tenant = await authenticateTenant(env, request);
    return jsonResponse(await listJobs(env, tenant), 200, cors);
  }

  return jsonResponse({ error: "not_found" }, 404, cors);
}

/**
 * Worker entry point. Translates `HttpError` into its status; rethrows
 * anything unexpected so the platform surfaces a 500.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx?: ExecutionContext,
  ): Promise<Response> {
    try {
      return await route(request, env, ctx as McpContext | undefined);
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return jsonResponse(
          { error: error.message },
          error.status,
          corsHeaders(request, env),
        );
      }
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
