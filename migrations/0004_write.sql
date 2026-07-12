-- Write queue: approved gym proposals become jobs the EPLAN bridge drains by
-- polling. The cloud never writes EPLAN itself.
CREATE TABLE IF NOT EXISTS write_jobs (
  id          TEXT PRIMARY KEY,
  tenant_id   TEXT NOT NULL,
  status      TEXT NOT NULL,               -- 'pending' | 'taken' | 'done'
  source      TEXT NOT NULL DEFAULT 'gym',
  changes     TEXT NOT NULL,               -- JSON array of {part_number,variant,field,lang,value}
  created_at  INTEGER NOT NULL,
  taken_at    INTEGER,
  done_at     INTEGER,
  dry_run     INTEGER NOT NULL DEFAULT 0,
  summary     TEXT NOT NULL DEFAULT '',
  results     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_write_jobs_tenant_status ON write_jobs (tenant_id, status, created_at);
ALTER TABLE gym_proposals ADD COLUMN job_id TEXT NOT NULL DEFAULT '';
