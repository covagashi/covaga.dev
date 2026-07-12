/**
 * Automation service: tenant-facing management of destinations and event
 * routes, plus a read of the execution log. Validation lives here; the router
 * stays a thin HTTP adapter and the repository stays pure D1 access.
 */
import type { Env } from "../env.js";
import type { Tenant } from "../models/tenant.js";
import type {
  Destination,
  DestinationKind,
  EventRoute,
  ExecutionRow,
} from "../models/automation.js";
import { HttpError } from "../errors.js";
import { isKnownEventId } from "../models/automation.js";
import {
  findDestination,
  insertDestination,
  insertRoute,
  listDestinations,
  listExecutions,
  listRoutes,
} from "../repositories/automation.repository.js";

/** Default and maximum number of executions returned by {@link getExecutions}. */
const DEFAULT_EXECUTIONS_LIMIT = 50;
const MAX_EXECUTIONS_LIMIT = 200;

/** Destination kinds accepted when creating a destination. */
const DESTINATION_KINDS: readonly DestinationKind[] = ["teams", "webhook"];

/** Client-facing view of a destination. */
export interface DestinationView {
  /** Destination id (uuid). */
  id: string;
  /** Delivery kind. */
  kind: DestinationKind;
  /** Incoming webhook URL. */
  webhook_url: string;
  /** Human-readable label ('' when unset). */
  label: string;
  /** Whether the destination is active. */
  enabled: boolean;
  /** Creation timestamp in epoch milliseconds. */
  created_at: number;
}

/** Client-facing view of an event route. */
export interface RouteView {
  /** Route id (uuid). */
  id: string;
  /** Event id this route fires on. */
  event_id: string;
  /** Destination the event is delivered to. */
  destination_id: string;
  /** Whether the route is active. */
  enabled: boolean;
  /** Creation timestamp in epoch milliseconds. */
  created_at: number;
}

/** Client-facing view of an execution-log row. */
export interface ExecutionView {
  /** Execution id (uuid). */
  id: string;
  /** Event id that was dispatched. */
  event_id: string;
  /** Destination delivered to ('' for a skipped dispatch). */
  destination_id: string;
  /** Delivery outcome. */
  status: string;
  /** Free-text detail ('' when none). */
  detail: string;
  /** Creation timestamp in epoch milliseconds. */
  created_at: number;
}

/** Narrow an unknown value to a plain (non-array) object or fail with 400. */
function asRecord(value: unknown): Record<string, unknown> {
  if (Object(value) !== value || Array.isArray(value)) {
    throw new HttpError(400, "invalid_body");
  }
  return value as Record<string, unknown>;
}

/** Map a domain {@link Destination} to its client view. */
function toDestinationView(destination: Destination): DestinationView {
  return {
    id: destination.id,
    kind: destination.kind,
    webhook_url: destination.webhookUrl,
    label: destination.label,
    enabled: destination.enabled,
    created_at: destination.createdAt,
  };
}

/** Map a domain {@link EventRoute} to its client view. */
function toRouteView(route: EventRoute): RouteView {
  return {
    id: route.id,
    event_id: route.eventId,
    destination_id: route.destinationId,
    enabled: route.enabled,
    created_at: route.createdAt,
  };
}

/** Map a domain {@link ExecutionRow} to its client view. */
function toExecutionView(row: ExecutionRow): ExecutionView {
  return {
    id: row.id,
    event_id: row.eventId,
    destination_id: row.destinationId,
    status: row.status,
    detail: row.detail,
    created_at: row.createdAt,
  };
}

/** Validate a destination kind or fail with 400. */
function parseKind(value: unknown): DestinationKind {
  if (
    typeof value === "string" &&
    (DESTINATION_KINDS as readonly string[]).includes(value)
  ) {
    return value as DestinationKind;
  }
  throw new HttpError(400, "invalid_kind");
}

/** Validate a webhook URL (non-empty, http(s)) or fail with 400. */
function parseWebhookUrl(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new HttpError(400, "invalid_webhook_url");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new HttpError(400, "invalid_webhook_url");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new HttpError(400, "invalid_webhook_url");
  }
  return value;
}

/**
 * Create a destination for the tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ kind, webhook_url, label? }`).
 * @returns `{ destination }` view of the created destination.
 * @throws {HttpError} 400 for an invalid kind or webhook URL.
 */
export async function createDestination(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<{ destination: DestinationView }> {
  const record = asRecord(body);
  const kind = parseKind(record["kind"]);
  const webhookUrl = parseWebhookUrl(record["webhook_url"]);
  const labelRaw = record["label"];
  const label = typeof labelRaw === "string" ? labelRaw : "";

  const destination: Destination = {
    id: crypto.randomUUID(),
    tenantId: tenant.id,
    kind,
    webhookUrl,
    label,
    enabled: true,
    createdAt: Date.now(),
  };
  await insertDestination(env, destination);
  return { destination: toDestinationView(destination) };
}

/**
 * List the tenant's destinations, newest first.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ destinations }` for the tenant.
 */
export async function getDestinations(
  env: Env,
  tenant: Tenant,
): Promise<{ destinations: DestinationView[] }> {
  const destinations = await listDestinations(env, tenant.id);
  return { destinations: destinations.map(toDestinationView) };
}

/**
 * Create an event route for the tenant.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param body - Parsed body (`{ event_id, destination_id }`).
 * @returns `{ route }` view of the created route.
 * @throws {HttpError} 400 when the event is unknown or the destination is not
 * owned by the tenant.
 */
export async function createRoute(
  env: Env,
  tenant: Tenant,
  body: unknown,
): Promise<{ route: RouteView }> {
  const record = asRecord(body);

  const eventId = record["event_id"];
  if (typeof eventId !== "string" || !isKnownEventId(eventId)) {
    throw new HttpError(400, "unknown_event");
  }

  const destinationId = record["destination_id"];
  if (typeof destinationId !== "string" || destinationId.length === 0) {
    throw new HttpError(400, "invalid_destination");
  }
  const destination = await findDestination(env, tenant.id, destinationId);
  if (destination === undefined) {
    throw new HttpError(400, "invalid_destination");
  }

  const route: EventRoute = {
    id: crypto.randomUUID(),
    tenantId: tenant.id,
    eventId,
    destinationId,
    enabled: true,
    createdAt: Date.now(),
  };
  await insertRoute(env, route);
  return { route: toRouteView(route) };
}

/**
 * List the tenant's event routes, newest first.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @returns `{ routes }` for the tenant.
 */
export async function getRoutes(
  env: Env,
  tenant: Tenant,
): Promise<{ routes: RouteView[] }> {
  const routes = await listRoutes(env, tenant.id);
  return { routes: routes.map(toRouteView) };
}

/**
 * List the tenant's recent executions, newest first.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenant - Authenticated owning tenant.
 * @param limitParam - Raw `limit` query value (clamped to 1..200).
 * @returns `{ executions }` for the tenant.
 */
export async function getExecutions(
  env: Env,
  tenant: Tenant,
  limitParam?: string,
): Promise<{ executions: ExecutionView[] }> {
  let limit = DEFAULT_EXECUTIONS_LIMIT;
  if (limitParam !== undefined) {
    const parsed = Number.parseInt(limitParam, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      limit = Math.min(parsed, MAX_EXECUTIONS_LIMIT);
    }
  }
  const executions = await listExecutions(env, tenant.id, limit);
  return { executions: executions.map(toExecutionView) };
}
