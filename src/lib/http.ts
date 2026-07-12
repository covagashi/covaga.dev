import type { Env } from "../env.js";
import { HttpError } from "../errors.js";

/**
 * Parse a request body as JSON, returning `unknown` for the caller to narrow.
 *
 * @param request - Incoming request whose body is JSON.
 * @returns The parsed value.
 * @throws {HttpError} 400 when the body is not valid JSON.
 */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return (await request.json()) as unknown;
  } catch {
    throw new HttpError(400, "invalid_json");
  }
}

/**
 * Build a JSON `Response` with the given body and status.
 *
 * @param body - Value serialised to JSON.
 * @param status - HTTP status code (defaults to 200).
 * @param extraHeaders - Additional headers to merge in.
 */
export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
): Response {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { status, headers });
}

/**
 * Compute CORS headers for a request. Echoes the request `Origin` when it is
 * present in `env.ALLOWED_ORIGINS` (comma-separated); otherwise omits the
 * allow-origin header.
 *
 * @param request - Incoming request.
 * @param env - Worker environment holding the allow-list.
 */
export function corsHeaders(request: Request, env: Env): Headers {
  const headers = new Headers();
  const origin = request.headers.get("Origin") ?? undefined;
  const allowed = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (origin !== undefined && allowed.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, X-Api-Key");
  return headers;
}
