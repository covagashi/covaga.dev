import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchConnections, type Connection } from "../lib/api";

export function ConnectionsPage() {
  const { tenantId } = useParams();
  const [connections, setConnections] = useState<Connection[]>([]);

  useEffect(() => {
    if (tenantId) void fetchConnections(tenantId).then(setConnections);
  }, [tenantId]);

  return (
    <>
      <p className="eyebrow">destinations</p>
      <h1>Connections</h1>
      <p className="page-sub">
        Where Covaga routes your ECAD events. Webhook destinations paste a URL;
        Google Drive connects with OAuth (credentials stay server-side, never on
        your workstation).
      </p>

      {connections.map((connection) => (
        <div className="card" key={connection.id}>
          <h2>{connection.label}</h2>
          <p>
            <span className="mono">{connection.kind}</span> ·{" "}
            {connection.status === "connected" ? "connected" : "pending setup"}
          </p>
          <button className="button secondary" type="button">
            {connection.status === "connected" ? "configure" : "connect"}
          </button>
        </div>
      ))}

      <div className="card">
        <h2>Add destination</h2>
        <p>Telegram, Teams or raw webhook: paste the incoming-webhook URL.</p>
        <div className="form-row">
          <input type="text" placeholder="https://…/webhook" aria-label="Webhook URL" />
          <button className="button" type="button">
            add
          </button>
        </div>
      </div>

      <p className="notice">
        Skeleton: rendered from local fixtures. Worker CRUD endpoints land with
        Sprint 3.4; Drive OAuth with Sprint 2.
      </p>
    </>
  );
}
