/**
 * Domain types for the automations dispatcher: the destinations a tenant can
 * notify, the event -> destination routes, and the execution log that records
 * every delivery attempt.
 */

/** Events the bridge can dispatch. Unknown ids are rejected with a 400. */
export const KNOWN_EVENTS = [
  "pdf-exported",
  "bom-exported",
  "project-closed",
  "bom-changed",
] as const;

/** One of the known event ids. */
export type EventId = (typeof KNOWN_EVENTS)[number];

/**
 * Type guard: is `value` an event id the dispatcher understands?
 *
 * @param value - Candidate event id.
 * @returns `true` when the id is in {@link KNOWN_EVENTS}.
 */
export function isKnownEventId(value: string): value is EventId {
  return (KNOWN_EVENTS as readonly string[]).includes(value);
}

/** Kind of destination a tenant can deliver to (OT teams don't use Slack). */
export type DestinationKind = "teams" | "webhook";

/** A tenant's notification destination (a Teams or raw webhook endpoint). */
export interface Destination {
  /** Destination id (uuid). */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Delivery kind, selecting the payload shape. */
  kind: DestinationKind;
  /** Incoming webhook URL to POST to. */
  webhookUrl: string;
  /** Human-readable label ('' when unset). */
  label: string;
  /** Whether the destination is active. */
  enabled: boolean;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}

/** A rule routing one event id to one destination for a tenant. */
export interface EventRoute {
  /** Route id (uuid). */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Event id this route fires on. */
  eventId: string;
  /** Destination the event is delivered to. */
  destinationId: string;
  /** Whether the route is active. */
  enabled: boolean;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}

/** An enabled route paired with its (enabled) destination, ready to deliver. */
export interface RouteWithDestination {
  /** Route id (uuid). */
  routeId: string;
  /** Destination to deliver to. */
  destination: Destination;
}

/** Outcome of a delivery attempt (or a skip when no route matched). */
export type ExecutionStatus = "delivered" | "failed" | "skipped";

/** A persisted execution-log row recording one dispatch outcome. */
export interface ExecutionRow {
  /** Execution id (uuid). */
  id: string;
  /** Owning tenant id. */
  tenantId: string;
  /** Event id that was dispatched. */
  eventId: string;
  /** Destination delivered to ('' for a skipped dispatch). */
  destinationId: string;
  /** Delivery outcome. */
  status: ExecutionStatus;
  /** Free-text detail, e.g. a failure reason ('' when none). */
  detail: string;
  /** Creation timestamp in epoch milliseconds. */
  createdAt: number;
}

/** The slice of an execution returned to the caller of a dispatch. */
export interface ExecutionResult {
  /** Execution id (uuid). */
  id: string;
  /** Destination delivered to ('' for a skipped dispatch). */
  destinationId: string;
  /** Delivery outcome. */
  status: ExecutionStatus;
}
