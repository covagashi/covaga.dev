-- Self-service accounts: give tenants a contact email and a chosen plan so they
-- can sign up without manual provisioning. Tenants already exist (0001_tenants.sql),
-- so the new columns carry defaults ('' / 'free') for the pre-accounts rows.
-- The unique email index is PARTIAL (WHERE email != '') so those legacy rows,
-- which share the empty-string default, do not collide.

ALTER TABLE tenants ADD COLUMN email TEXT NOT NULL DEFAULT '';
ALTER TABLE tenants ADD COLUMN plan  TEXT NOT NULL DEFAULT 'free';
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_email ON tenants (email) WHERE email != '';
