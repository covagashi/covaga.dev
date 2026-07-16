// API client for the Covaga Hub worker. Every call authenticates with the
// stored session's API key (header `X-Api-Key`) against the live worker.
// The exported TYPES and page-facing function names match the original
// skeleton so the pages/events views render unchanged; only the data layer
// underneath talks to real endpoints.

export const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://covaga-hub.clopez-5fd.workers.dev";

export const KNOWN_EVENT_IDS = [
  "pdf-exported",
  "bom-exported",
  "dxf-dwg-exported",
  "project-backed-up",
  "wiring-exported",
  "project-closed",
  "masterdata-backed-up",
  "project-restored",
  "masterdata-restored",
  "reports-updated",
  "labeling-exported",
  "project-synchronized",
  "project-translated",
  "plc-busdata-exported",
  "plc-busdata-imported",
  "plc-schematic-generated",
  "plc-addressoverview-exported",
  "productiondata-exported",
  "dc-common-exported",
] as const;

export type EventId = (typeof KNOWN_EVENT_IDS)[number];

export interface Connection {
  id: string;
  kind: "teams" | "slack" | "webhook" | "telegram" | "drive";
  label: string;
  status: "connected" | "pending";
}

export interface EventRoute {
  eventId: EventId;
  enabled: boolean;
  /** Connection ids this event is delivered to. Empty = acked and dropped. */
  destinationIds: string[];
  /** Display string for the last signal received, undefined = never seen. */
  lastSeen: string | undefined;
}

export interface Execution {
  id: string;
  eventId: string;
  destinationLabel: string;
  status: "delivered" | "failed" | "skipped";
  createdAt: string;
}

// ── session ──────────────────────────────────────────────────────────
// The Covaga Hub worker authenticates with an API key (not magic links).
// A session pins the worker base, the raw key, and the tenant id.

export interface Session {
  base: string;
  key: string;
  tenant: string;
}

const SESSION_KEY = "covaga.session";

/** Read the stored session, or `undefined` when none/invalid. */
export function loadSession(): Session | undefined {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw === null) return undefined;
  try {
    const value = JSON.parse(raw) as unknown;
    if (Object(value) !== value) return undefined;
    const record = value as Record<string, unknown>;
    const { base, key, tenant } = record;
    if (
      typeof base === "string" &&
      typeof key === "string" &&
      typeof tenant === "string"
    ) {
      return { base, key, tenant };
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/** Persist the active session. */
export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Clear the active session ("salir"). */
export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ── worker response shapes ───────────────────────────────────────────

interface DestinationView {
  id: string;
  kind: "teams" | "webhook";
  webhook_url: string;
  label: string;
  enabled: boolean;
  created_at: number;
}

interface RouteView {
  id: string;
  event_id: string;
  destination_id: string;
  enabled: boolean;
  created_at: number;
}

interface ExecutionView {
  id: string;
  event_id: string;
  destination_id: string;
  status: string;
  detail: string;
  created_at: number;
}

// ── low-level fetch helpers ──────────────────────────────────────────

/** Build the request against the session base (or the default worker). */
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const session = loadSession();
  const base = session?.base ?? API_BASE;
  const headers = new Headers(init?.headers);
  if (session !== undefined) headers.set("X-Api-Key", session.key);
  if (init?.body !== undefined) headers.set("Content-Type", "application/json");
  return fetch(`${base}${path}`, { ...init, headers });
}

/** Extract the worker's `{ error }` code, or a generic `http_<status>`. */
async function readError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: unknown };
    if (typeof data.error === "string") return data.error;
  } catch {
    // fall through to status-based code
  }
  return `http_${res.status}`;
}

/** GET a JSON endpoint, throwing the worker error code on failure. */
async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(path);
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

/** POST a JSON body, throwing the worker error code on failure. */
async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

/** Format an epoch-millis timestamp as `YYYY-MM-DD HH:MM` (local time). */
function formatTimestamp(ms: number): string {
  const date = new Date(ms);
  const pad = (value: number): string => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** Narrow the worker status string to the Execution status union. */
function toExecutionStatus(value: string): Execution["status"] {
  if (value === "delivered" || value === "failed") return value;
  return "skipped";
}

// ── auth flows (login page) ──────────────────────────────────────────

/** List the plan ids offered at signup (`GET /api/plans`). */
export async function fetchPlans(): Promise<string[]> {
  const data = await apiGet<{ plans: string[] }>("/api/plans");
  return data.plans;
}

/**
 * Create an account and enter: `POST /api/signup` mints a tenant + API key,
 * which is stored as the active session. Returns the new tenant id.
 */
export async function signupAndEnter(
  email: string,
  plan: string,
): Promise<string> {
  const data = await apiPost<{ tenant_id: string; api_key: string }>(
    "/api/signup",
    { email, plan },
  );
  saveSession({ base: API_BASE, key: data.api_key, tenant: data.tenant_id });
  return data.tenant_id;
}

/**
 * Enter with an existing key: validate it via `GET /whoami`, then store the
 * session. Returns the tenant id. Throws on an invalid key.
 */
export async function loginWithKey(key: string): Promise<string> {
  const res = await fetch(`${API_BASE}/whoami`, {
    headers: { "X-Api-Key": key },
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = (await res.json()) as { id: string };
  saveSession({ base: API_BASE, key, tenant: data.id });
  return data.id;
}

/**
 * Rotate the tenant's API key (`POST /api/tenant/rotate-key`), update the
 * stored session with the new key, and return it. Throws when no session.
 */
export async function rotateKey(): Promise<string> {
  const session = loadSession();
  if (session === undefined) throw new Error("no_session");
  const data = await apiPost<{ api_key: string }>(
    "/api/tenant/rotate-key",
    {},
  );
  saveSession({ ...session, key: data.api_key });
  return data.api_key;
}

// ── connections (destinations) ───────────────────────────────────────

/** Map a worker destination to the page-facing Connection type. */
function toConnection(destination: DestinationView): Connection {
  return {
    id: destination.id,
    kind: destination.kind,
    label:
      destination.label.length > 0
        ? destination.label
        : destination.webhook_url,
    status: destination.enabled ? "connected" : "pending",
  };
}

/** List the tenant's destinations (`GET /api/destinations`). */
export async function fetchConnections(tenantId: string): Promise<Connection[]> {
  void tenantId;
  try {
    const data = await apiGet<{ destinations: DestinationView[] }>(
      "/api/destinations",
    );
    return data.destinations.map(toConnection);
  } catch {
    return [];
  }
}

/**
 * Create a destination (`POST /api/destinations`). The worker accepts kinds
 * `teams` and `webhook`; other kinds are rejected with a 400.
 */
export async function createConnection(
  kind: "teams" | "webhook",
  url: string,
  label: string,
): Promise<Connection> {
  const data = await apiPost<{ destination: DestinationView }>(
    "/api/destinations",
    { kind, webhook_url: url, label },
  );
  return toConnection(data.destination);
}

// ── event routes ─────────────────────────────────────────────────────

/**
 * List the tenant's routes (`GET /api/routes`) and aggregate them into one
 * EventRoute per known event: the destination ids wired to it, whether any of
 * those routes is enabled, and (routes carry no signal timestamp) an
 * always-undefined `lastSeen`.
 */
export async function fetchEventRoutes(tenantId: string): Promise<EventRoute[]> {
  void tenantId;
  let routes: RouteView[] = [];
  try {
    const data = await apiGet<{ routes: RouteView[] }>("/api/routes");
    routes = data.routes;
  } catch {
    routes = [];
  }
  return KNOWN_EVENT_IDS.map((eventId) => {
    const forEvent = routes.filter((route) => route.event_id === eventId);
    return {
      eventId,
      enabled: forEvent.some((route) => route.enabled),
      destinationIds: forEvent.map((route) => route.destination_id),
      lastSeen: undefined,
    };
  });
}

/**
 * Wire one event to one destination (`POST /api/routes`). A not-yet-supported
 * event id is rejected by the worker with a 400; the error code is thrown so
 * callers can surface an inline message.
 */
export async function addRoute(
  eventId: string,
  destinationId: string,
): Promise<void> {
  await apiPost<{ route: RouteView }>("/api/routes", {
    event_id: eventId,
    destination_id: destinationId,
  });
}

// ── executions (history) ─────────────────────────────────────────────

/**
 * List recent executions (`GET /api/executions?limit=`) and resolve each
 * destination id to its label via the tenant's destinations.
 */
export async function fetchExecutions(tenantId: string): Promise<Execution[]> {
  void tenantId;
  try {
    const [execData, destData] = await Promise.all([
      apiGet<{ executions: ExecutionView[] }>("/api/executions?limit=50"),
      apiGet<{ destinations: DestinationView[] }>("/api/destinations"),
    ]);
    const labels = new Map<string, string>();
    for (const destination of destData.destinations) {
      labels.set(
        destination.id,
        destination.label.length > 0
          ? destination.label
          : destination.webhook_url,
      );
    }
    return execData.executions.map((execution) => ({
      id: execution.id,
      eventId: execution.event_id,
      destinationLabel:
        labels.get(execution.destination_id) ?? execution.destination_id,
      status: toExecutionStatus(execution.status),
      createdAt: formatTimestamp(execution.created_at),
    }));
  } catch {
    return [];
  }
}
