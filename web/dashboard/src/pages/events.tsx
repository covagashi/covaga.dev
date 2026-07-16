import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchConnections,
  fetchEventRoutes,
  type Connection,
  type EventId,
  type EventRoute,
} from "../lib/api";
import { EVENT_CATALOG, EVENT_GROUPS } from "../lib/events.constants";

const DEST_ICONS: Record<Connection["kind"], string> = {
  telegram: "✈",
  drive: "▲",
  teams: "◫",
  slack: "◩",
  webhook: "⇄",
};

export function EventsPage() {
  const { tenantId } = useParams();
  const [routes, setRoutes] = useState<EventRoute[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedId, setSelectedId] = useState<EventId>("pdf-exported");
  const [query, setQuery] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    void fetchEventRoutes(tenantId).then(setRoutes);
    void fetchConnections(tenantId).then(setConnections);
  }, [tenantId]);

  const selected = routes.find((route) => route.eventId === selectedId);
  const selectedMeta = EVENT_CATALOG[selectedId];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter((route) => {
      const meta = EVENT_CATALOG[route.eventId];
      return (
        route.eventId.includes(q) ||
        meta.label.toLowerCase().includes(q) ||
        meta.script.toLowerCase().includes(q)
      );
    });
  }, [routes, query]);

  function updateRoute(eventId: EventId, patch: Partial<EventRoute>) {
    setRoutes((prev) =>
      prev.map((route) =>
        route.eventId === eventId ? { ...route, ...patch } : route
      )
    );
  }

  function addDestination(connectionId: string) {
    if (!selected) return;
    updateRoute(selectedId, {
      destinationIds: [...selected.destinationIds, connectionId],
      enabled: true,
    });
    setPickerOpen(false);
  }

  function removeDestination(connectionId: string) {
    if (!selected) return;
    const destinationIds = selected.destinationIds.filter(
      (id) => id !== connectionId
    );
    updateRoute(selectedId, {
      destinationIds,
      enabled: destinationIds.length > 0 && selected.enabled,
    });
  }

  const routedDestinations = (selected?.destinationIds ?? [])
    .map((id) => connections.find((connection) => connection.id === id))
    .filter((connection): connection is Connection => connection !== undefined);

  const availableDestinations = connections.filter(
    (connection) => !selected?.destinationIds.includes(connection.id)
  );

  return (
    <>
      <p className="eyebrow">routing</p>
      <h1>Events</h1>
      <p className="page-sub">
        Every route reads the same way: your script in EPLAN emits, Covaga
        receives and routes, your services get the delivery. Pick an event to
        wire it up.
      </p>

      <div className="events-split">
        {/* ── master: the 19 events, grouped ── */}
        <nav className="master" aria-label="Events">
          <div className="search">
            <input
              type="search"
              placeholder="Search event or script…"
              aria-label="Search event or script"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          {EVENT_GROUPS.map((group) => {
            const groupRoutes = filtered.filter(
              (route) => EVENT_CATALOG[route.eventId].group === group.id
            );
            if (groupRoutes.length === 0) return null;
            return (
              <div key={group.id}>
                <p className="m-group">
                  {group.label} · {groupRoutes.length}
                </p>
                {groupRoutes.map((route) => {
                  const meta = EVENT_CATALOG[route.eventId];
                  const routeCount = route.destinationIds.length;
                  return (
                    <button
                      key={route.eventId}
                      type="button"
                      className={[
                        "m-item",
                        route.eventId === selectedId ? "selected" : "",
                        route.lastSeen ? "live" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => {
                        setSelectedId(route.eventId);
                        setPickerOpen(false);
                      }}
                      aria-current={route.eventId === selectedId}
                    >
                      <span className="m-dot" aria-hidden="true" />
                      <span className="m-text">
                        <span className="m-label">{meta.label}</span>
                        <span className="m-script">{meta.script}</span>
                      </span>
                      <span className={`m-count${routeCount > 0 ? " on" : ""}`}>
                        {routeCount > 0
                          ? `${routeCount} route${routeCount > 1 ? "s" : ""}`
                          : "no route"}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* ── detail: the selected event as a 3-step route ── */}
        {selected && (
          <section className="detail" aria-label={`Route for ${selectedMeta.label}`}>
            <div className="d-head">
              <h2>{selectedMeta.label}</h2>
              <span className="d-script mono">{selectedMeta.script}</span>
              <span className="d-spacer" />
              <label className="d-toggle-label" htmlFor="route-enabled">
                route active
              </label>
              <input
                id="route-enabled"
                type="checkbox"
                className="toggle"
                checked={selected.enabled}
                onChange={() =>
                  updateRoute(selectedId, { enabled: !selected.enabled })
                }
              />
            </div>

            <div className="step">
              <div className="step-h">
                <span className="num">1</span>
                <span className="kind">ORIGIN</span>
                <b>Your script in EPLAN</b>
              </div>
              <div className="step-b">
                <span className="step-icon" aria-hidden="true">◧</span>
                <div className="step-text">
                  <b>EPLAN P8 workstation</b>
                  <span className="sub">
                    {selectedMeta.script} · via CovagaEventBridge.cs
                  </span>
                  <p>
                    The event starts here: when your script finishes, it emits
                    the signal. Covaga never executes anything inside your EPLAN.
                  </p>
                </div>
                <span className="step-status">
                  {selected.lastSeen ? (
                    <span className="ok">● emitted {selected.lastSeen}</span>
                  ) : (
                    <span className="off">○ never received</span>
                  )}
                </span>
              </div>
            </div>

            <div className="step-link" aria-hidden="true" />

            <div className="step hl">
              <div className="step-h">
                <span className="num">2</span>
                <span className="kind">NEXUS</span>
                <b>Covaga receives and routes</b>
              </div>
              <div className="step-b">
                <span className="step-icon" aria-hidden="true">⇄</span>
                <div className="step-text">
                  <b>Covaga · event router</b>
                  <span className="sub">
                    eu-west · credentials stay server-side
                  </span>
                  <p>
                    Validates your API key, records the signal and delivers it
                    to every connected destination. With no destinations it
                    acknowledges and drops.
                  </p>
                </div>
                <span className="step-status">
                  <span className="ok">● online</span>
                </span>
              </div>
            </div>

            <div className="step-link" aria-hidden="true" />

            <div className="step">
              <div className="step-h">
                <span className="num">3</span>
                <span className="kind">DESTINATIONS</span>
                <b>Where it gets delivered</b>
              </div>
              <div className="d-list">
                {routedDestinations.length === 0 && (
                  <p className="d-empty">
                    No destination yet: Covaga acknowledges this event and drops
                    it. Add one below to start routing.
                  </p>
                )}
                {routedDestinations.map((connection) => (
                  <div className="d-row" key={connection.id}>
                    <span className="step-icon" aria-hidden="true">
                      {DEST_ICONS[connection.kind]}
                    </span>
                    <div>
                      <span className="d-label">{connection.label}</span>
                      <span className="d-kind">{connection.kind}</span>
                    </div>
                    <span className="d-status">
                      {connection.status === "connected" ? (
                        <span style={{ color: "var(--color-ok)" }}>connected</span>
                      ) : (
                        <span style={{ color: "var(--color-warn)" }}>
                          pending setup
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      className="d-remove"
                      onClick={() => removeDestination(connection.id)}
                      aria-label={`Remove ${connection.label} from this route`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {pickerOpen && availableDestinations.length > 0 && (
                <div className="d-picker">
                  {availableDestinations.map((connection) => (
                    <button
                      key={connection.id}
                      type="button"
                      className="d-pick"
                      onClick={() => addDestination(connection.id)}
                    >
                      <span aria-hidden="true">{DEST_ICONS[connection.kind]}</span>
                      {connection.label}
                      <span className="d-kind">{connection.kind}</span>
                    </button>
                  ))}
                </div>
              )}
              {availableDestinations.length > 0 ? (
                <button
                  type="button"
                  className="d-add"
                  onClick={() => setPickerOpen((open) => !open)}
                >
                  {pickerOpen ? "Cancel" : "＋ Add destination to this route"}
                </button>
              ) : (
                <p className="d-empty">
                  All connections are already on this route. Add more under
                  Connections.
                </p>
              )}
            </div>

            <p className="foot-note">
              Your scripts are in charge; Covaga is only the nexus between your
              EPLAN and your services.
            </p>
          </section>
        )}
      </div>

      <p className="notice">
        Skeleton: routes are local state only. Persisting to event_routes lands
        with Sprint 3.5.
      </p>
    </>
  );
}
