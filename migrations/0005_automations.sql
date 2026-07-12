-- Automations dispatcher ("Zapier for EPLAN"): a tenant's notification
-- destinations, the event -> destination routing table, and an execution log
-- for auditing deliveries. Tenants already exist (see 0001_tenants.sql).
-- All statements are idempotent (IF NOT EXISTS) so this migration re-runs safely.

CREATE TABLE IF NOT EXISTS destinations (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('teams','webhook')),
  webhook_url TEXT NOT NULL,
  label       TEXT NOT NULL DEFAULT '',
  enabled     INTEGER NOT NULL DEFAULT 1,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS event_routes (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  event_id       TEXT NOT NULL,
  destination_id TEXT NOT NULL,
  enabled        INTEGER NOT NULL DEFAULT 1,
  created_at     INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS executions (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  event_id       TEXT NOT NULL,
  destination_id TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL,               -- delivered|failed|skipped
  detail         TEXT NOT NULL DEFAULT '',
  created_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_routes_tenant_event ON event_routes (tenant_id, event_id);
CREATE INDEX IF NOT EXISTS idx_executions_tenant_created ON executions (tenant_id, created_at);
