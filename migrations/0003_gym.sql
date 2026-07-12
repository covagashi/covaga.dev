-- Gym: episodes and validated text proposals (overlay only, never mutates articles).
CREATE TABLE IF NOT EXISTS gym_episodes (
  id         TEXT PRIMARY KEY,
  tenant_id  TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  submitted  INTEGER NOT NULL DEFAULT 0,
  validated  INTEGER NOT NULL DEFAULT 0,
  rejected   INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS gym_proposals (
  id               TEXT PRIMARY KEY,
  tenant_id        TEXT NOT NULL,
  part_number      TEXT NOT NULL,
  variant          TEXT NOT NULL DEFAULT '',
  task_type        TEXT NOT NULL,          -- 'translate' | 'describe'
  field            TEXT NOT NULL,          -- 'description'
  lang             TEXT NOT NULL DEFAULT '',-- required lang for translate; '' for describe
  old_value        TEXT NOT NULL DEFAULT '',
  new_value        TEXT NOT NULL,
  status           TEXT NOT NULL,          -- 'validated'
  confidence       REAL,
  episode_id       TEXT NOT NULL DEFAULT '',
  validator_report TEXT NOT NULL DEFAULT '',
  created_at       INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gym_prop_task
  ON gym_proposals (tenant_id, part_number, variant, task_type, field, lang);
CREATE INDEX IF NOT EXISTS idx_gym_prop_tenant ON gym_proposals (tenant_id, status);
