-- Per-tenant UI settings for the ported byndrrr dashboard (Ajustes screen).
-- One JSON blob per tenant so new setting keys need no schema change. The
-- `require_l0_approval` toggle lives inside `data`; GET fills defaults, POST
-- merges. Idempotent so re-applying the migration is safe.
CREATE TABLE IF NOT EXISTS tenant_settings (
  tenant_id TEXT PRIMARY KEY,
  data      TEXT NOT NULL DEFAULT '{}'
);
