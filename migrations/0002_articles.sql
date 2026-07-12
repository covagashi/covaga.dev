-- Ingests: one row per snapshot upload session started by a tenant.
CREATE TABLE IF NOT EXISTS ingests (
  id             TEXT PRIMARY KEY,
  tenant_id      TEXT NOT NULL,
  source         TEXT,
  machine        TEXT,
  app_user       TEXT,
  total_reported INTEGER,
  received       INTEGER NOT NULL DEFAULT 0,
  started_at     INTEGER NOT NULL,
  finished_at    INTEGER
);

-- Articles: enriched parts, unique per (tenant, part_number, variant).
CREATE TABLE IF NOT EXISTS articles (
  tenant_id    TEXT NOT NULL,
  part_number  TEXT NOT NULL,
  variant      TEXT NOT NULL DEFAULT '',
  manufacturer TEXT,
  description  TEXT,
  data         TEXT NOT NULL,
  snapshot_id  TEXT NOT NULL,
  updated_at   INTEGER NOT NULL,
  PRIMARY KEY (tenant_id, part_number, variant)
);

CREATE INDEX IF NOT EXISTS idx_articles_tenant_snapshot ON articles (tenant_id, snapshot_id);
