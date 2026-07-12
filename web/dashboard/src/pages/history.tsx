import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchExecutions, type Execution } from "../lib/api";

export function HistoryPage() {
  const { tenantId } = useParams();
  const [executions, setExecutions] = useState<Execution[]>([]);

  useEffect(() => {
    if (tenantId) void fetchExecutions(tenantId).then(setExecutions);
  }, [tenantId]);

  return (
    <>
      <p className="eyebrow">audit</p>
      <h1>History</h1>
      <p className="page-sub">Last executions recorded by the dispatcher.</p>

      <table className="data-table">
        <thead>
          <tr>
            <th>when</th>
            <th>event</th>
            <th>destination</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((execution) => (
            <tr key={execution.id}>
              <td className="mono">{execution.createdAt}</td>
              <td className="mono">{execution.eventId}</td>
              <td>{execution.destinationLabel}</td>
              <td>
                <span className={`status-pill ${execution.status}`}>
                  {execution.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="notice">
        Skeleton: fixture rows. Live D1 executions feed (last 50, with filters)
        lands with Sprint 3.6.
      </p>
    </>
  );
}
