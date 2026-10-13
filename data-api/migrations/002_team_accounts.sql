-- Run as neondb_owner. Login identities and team assignment are administrator-controlled.
BEGIN;
CREATE TABLE IF NOT EXISTS portal_accounts (
  subject text PRIMARY KEY CHECK (length(subject) BETWEEN 1 AND 255),
  role text NOT NULL CHECK (role IN ('team','administrator')),
  team_id uuid REFERENCES teams(id),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((role = 'team' AND team_id IS NOT NULL) OR
         (role = 'administrator' AND team_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS portal_one_account_per_team
ON portal_accounts(team_id) WHERE role = 'team';
ALTER TABLE data_files ADD COLUMN IF NOT EXISTS uploaded_by text REFERENCES portal_accounts(subject);
CREATE TABLE IF NOT EXISTS portal_audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject text NOT NULL REFERENCES portal_accounts(subject),
  team_id uuid REFERENCES teams(id),
  action text NOT NULL,
  resource_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON portal_accounts TO ascend_runtime;
GRANT INSERT ON portal_audit_events TO ascend_runtime;
GRANT USAGE, SELECT ON SEQUENCE portal_audit_events_id_seq TO ascend_runtime;
INSERT INTO ascend_schema_migrations(version) VALUES (2) ON CONFLICT DO NOTHING;
COMMIT;
SELECT version FROM ascend_schema_migrations ORDER BY version;
