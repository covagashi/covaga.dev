import type { Env } from "./env.js";
import { HttpError } from "./errors.js";
import { corsHeaders, jsonResponse } from "./lib/http.js";
import { authenticateTenant } from "./services/auth.service.js";

/**
 * Route a single request. Kept small: CORS preflight, health, an
 * auth-protected probe, and a uniform 404 for everything else.
 */
async function route(request: Request, env: Env): Promise<Response> {
  const cors = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(undefined, { status: 204, headers: cors });
  }

  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET" && path === "/health") {
    return jsonResponse({ ok: true }, 200, cors);
  }

  if (request.method === "GET" && path === "/whoami") {
    const tenant = await authenticateTenant(env, request);
    return jsonResponse({ id: tenant.id }, 200, cors);
  }

  return jsonResponse({ error: "not_found" }, 404, cors);
}

/**
 * Worker entry point. Translates `HttpError` into its status; rethrows
 * anything unexpected so the platform surfaces a 500.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await route(request, env);
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
