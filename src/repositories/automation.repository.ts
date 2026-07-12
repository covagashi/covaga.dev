/**
 * D1 access for the automations dispatcher: destinations, event routes, and the
 * executions log. No business logic here -- see the dispatch and automation
 * services for that.
 */
import type { Env } from "../env.js";
import type {
  Destination,
  DestinationKind,
  EventRoute,
  ExecutionRow,
  ExecutionStatus,
  RouteWithDestination,
} from "../models/automation.js";

/** Shape of a row in the `destinations` table. */
interface DestinationRow {
  id: string;
  tenant_id: string;
  kind: DestinationKind;
  webhook_url: string;
  label: string;
  enabled: number;
  created_at: number;
}

/** Map a raw D1 row to the domain {@link Destination} model. */
function toDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    kind: row.kind,
    webhookUrl: row.webhook_url,
    label: row.label,
    enabled: row.enabled !== 0,
    createdAt: row.created_at,
  };
}

/** Shape of a row in the `event_routes` table. */
interface EventRouteRow {
  id: string;
  tenant_id: string;
  event_id: string;
  destination_id: string;
  enabled: number;
  created_at: number;
}

/** Map a raw D1 row to the domain {@link EventRoute} model. */
function toEventRoute(row: EventRouteRow): EventRoute {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    eventId: row.event_id,
    destinationId: row.destination_id,
    enabled: row.enabled !== 0,
    createdAt: row.created_at,
  };
}

/** Shape of a row in the `executions` table. */
interface ExecutionRowRaw {
  id: string;
  tenant_id: string;
  event_id: string;
  destination_id: string;
  status: ExecutionStatus;
  detail: string;
  created_at: number;
}

/** Map a raw D1 row to the domain {@link ExecutionRow} model. */
function toExecutionRow(row: ExecutionRowRaw): ExecutionRow {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    eventId: row.event_id,
    destinationId: row.destination_id,
    status: row.status,
    detail: row.detail,
    createdAt: row.created_at,
  };
}

const DEST_COLUMNS =
  "id, tenant_id, kind, webhook_url, label, enabled, created_at";
const ROUTE_COLUMNS =
  "id, tenant_id, event_id, destination_id, enabled, created_at";
const EXEC_COLUMNS =
  "id, tenant_id, event_id, destination_id, status, detail, created_at";

/**
 * Insert a destination.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param destination - Fully-formed destination to persist.
 */
export async function insertDestination(
  env: Env,
  destination: Destination,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO destinations (${DEST_COLUMNS})
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      destination.id,
      destination.tenantId,
      destination.kind,
      destination.webhookUrl,
      destination.label,
      destination.enabled ? 1 : 0,
      destination.createdAt,
    )
    .run();
}

/**
 * List a tenant's destinations, newest first.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The tenant's destinations.
 */
export async function listDestinations(
  env: Env,
  tenantId: string,
): Promise<Destination[]> {
  const result = await env.DB.prepare(
    `SELECT ${DEST_COLUMNS} FROM destinations
      WHERE tenant_id = ? ORDER BY created_at DESC`,
  )
    .bind(tenantId)
    .all<DestinationRow>();
  return result.results.map(toDestination);
}

/**
 * Look up one of the tenant's destinations by id.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param destinationId - Destination id.
 * @returns The destination, or `undefined` when none matches for this tenant.
 */
export async function findDestination(
  env: Env,
  tenantId: string,
  destinationId: string,
): Promise<Destination | undefined> {
  const row = await env.DB.prepare(
    `SELECT ${DEST_COLUMNS} FROM destinations WHERE id = ? AND tenant_id = ?`,
  )
    .bind(destinationId, tenantId)
    .first<DestinationRow>();
  return row ? toDestination(row) : undefined;
}

/**
 * Insert an event route.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param route - Fully-formed route to persist.
 */
export async function insertRoute(env: Env, route: EventRoute): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO event_routes (${ROUTE_COLUMNS})
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      route.id,
      route.tenantId,
      route.eventId,
      route.destinationId,
      route.enabled ? 1 : 0,
      route.createdAt,
    )
    .run();
}

/**
 * List a tenant's event routes, newest first.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @returns The tenant's routes.
 */
export async function listRoutes(
  env: Env,
  tenantId: string,
): Promise<EventRoute[]> {
  const result = await env.DB.prepare(
    `SELECT ${ROUTE_COLUMNS} FROM event_routes
      WHERE tenant_id = ? ORDER BY created_at DESC`,
  )
    .bind(tenantId)
    .all<EventRouteRow>();
  return result.results.map(toEventRoute);
}

/**
 * Resolve the enabled routes for a (tenant, event) pair, each joined to its
 * enabled destination, ready to deliver.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param eventId - Event id to route.
 * @returns Enabled routes paired with their enabled destinations.
 */
export async function findEnabledRoutes(
  env: Env,
  tenantId: string,
  eventId: string,
): Promise<RouteWithDestination[]> {
  const result = await env.DB.prepare(
    `SELECT
       er.id AS route_id,
       d.id AS id,
       d.tenant_id AS tenant_id,
       d.kind AS kind,
       d.webhook_url AS webhook_url,
       d.label AS label,
       d.enabled AS enabled,
       d.created_at AS created_at
     FROM event_routes er
     JOIN destinations d ON d.id = er.destination_id
     WHERE er.tenant_id = ?
       AND er.event_id = ?
       AND er.enabled = 1
       AND d.enabled = 1`,
  )
    .bind(tenantId, eventId)
    .all<DestinationRow & { route_id: string }>();

  return result.results.map((row) => ({
    routeId: row.route_id,
    destination: toDestination(row),
  }));
}

/**
 * Record the outcome of a delivery attempt (or a skip) for auditing.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param row - Fully-formed execution row to persist.
 */
export async function insertExecution(
  env: Env,
  row: ExecutionRow,
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO executions (${EXEC_COLUMNS})
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      row.id,
      row.tenantId,
      row.eventId,
      row.destinationId,
      row.status,
      row.detail,
      row.createdAt,
    )
    .run();
}

/**
 * List a tenant's recent executions, newest first.
 *
 * @param env - Worker environment holding the D1 binding.
 * @param tenantId - Owning tenant id.
 * @param limit - Maximum number of rows to return.
 * @returns The tenant's executions, most recent first.
 */
export async function listExecutions(
  env: Env,
  tenantId: string,
  limit: number,
): Promise<ExecutionRow[]> {
  const result = await env.DB.prepare(
    `SELECT ${EXEC_COLUMNS} FROM executions
      WHERE tenant_id = ? ORDER BY created_at DESC, id DESC LIMIT ?`,
  )
    .bind(tenantId, limit)
    .all<ExecutionRowRaw>();
  return result.results.map(toExecutionRow);
}
