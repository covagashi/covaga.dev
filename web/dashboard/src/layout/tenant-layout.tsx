import { NavLink, Outlet, useNavigate, useParams, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { clearSession, loadSession } from "../lib/api";

const NAV_ITEMS: { to: string; label: string; icon: ReactNode }[] = [
  {
    to: "connections",
    label: "Connections",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="2" y="2" width="5" height="5" rx="1" />
        <rect x="9" y="9" width="5" height="5" rx="1" />
        <path d="M7 4.5h4.5V9" />
      </svg>
    ),
  },
  {
    to: "events",
    label: "Events",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 1.5 3.5 9H8l-1 5.5L12.5 7H8l1-5.5z" />
      </svg>
    ),
  },
  {
    to: "history",
    label: "History",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4.5V8l2.5 1.5" />
      </svg>
    ),
  },
  {
    to: "api-key",
    label: "API key",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="5.5" cy="8" r="3" />
        <path d="M8.5 8H14M12 8v2.5" />
      </svg>
    ),
  },
];

export function TenantLayout() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const session = loadSession();

  if (session === undefined) {
    return <Navigate to="/login" replace />;
  }

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-side">
        <a className="wordmark" href="https://byndr.dev">
          byndr<span className="accent">.</span>
        </a>
        <nav className="side-nav" aria-label="Tenant sections">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="tenant-foot">
          <b>t/{tenantId}</b>
          <span>starter · eu-west</span>
          <button
            type="button"
            className="button secondary"
            style={{ marginTop: 10 }}
            onClick={logout}
          >
            salir
          </button>
        </div>
      </aside>
      <div className="app-body">
        <header className="app-top">
          <span className="tenant-chip">t/{tenantId}</span>
          <span className="top-spacer" />
          <span className="tenant-chip">skeleton preview</span>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
