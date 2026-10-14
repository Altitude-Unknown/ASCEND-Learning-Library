BEGIN;
ALTER TABLE portal_accounts DROP CONSTRAINT portal_accounts_team_check;
-- Approved community members can join before the spring team roster exists.
-- Upload and mission endpoints still require an assigned team.
ALTER TABLE discussion_groups ADD COLUMN deleted boolean NOT NULL DEFAULT false;
CREATE TABLE membership_requests (
 subject text PRIMARY KEY CHECK(length(subject)<=255),
 display_name text NOT NULL CHECK(length(display_name) BETWEEN 1 AND 80),
 affiliation text NOT NULL DEFAULT '' CHECK(length(affiliation)<=200),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at timestamptz NOT NULL DEFAULT now(),
 reviewed_by text REFERENCES portal_accounts(subject),
 reviewed_at timestamptz
);
GRANT SELECT,INSERT ON membership_requests TO ascend_runtime;
GRANT UPDATE(status,reviewed_by,reviewed_at) ON membership_requests TO ascend_runtime;
GRANT UPDATE(deleted) ON discussion_groups TO ascend_runtime;
INSERT INTO ascend_schema_migrations(version) VALUES(6);
COMMIT;
SELECT version FROM ascend_schema_migrations ORDER BY version;
