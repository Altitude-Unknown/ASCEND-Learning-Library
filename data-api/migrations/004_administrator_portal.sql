BEGIN;
GRANT INSERT ON organizations, teams, portal_accounts TO ascend_runtime;
GRANT UPDATE (active) ON portal_accounts TO ascend_runtime;
GRANT UPDATE (visibility, publication_status, synthetic) ON missions TO ascend_runtime;
INSERT INTO ascend_schema_migrations(version) VALUES (4) ON CONFLICT DO NOTHING;
COMMIT;
SELECT version FROM ascend_schema_migrations ORDER BY version;
