-- Pre-launch waitlist: collect interested emails while Covaga Hub is still in
-- development, before self-service signup is opened to the public. One row per
-- email; re-submitting the same address is idempotent (the service treats it as
-- a friendly success, not an error) via ON CONFLICT DO NOTHING at the repo.
-- Idempotent so re-applying the migration is safe.
CREATE TABLE IF NOT EXISTS waitlist (
  email      TEXT PRIMARY KEY,
  locale     TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);
