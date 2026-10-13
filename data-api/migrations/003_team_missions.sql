-- API enforces team ownership; identity mappings remain administrator-controlled.
BEGIN;
GRANT INSERT ON missions, platforms, sensors, sensor_configurations, mission_platforms TO ascend_runtime;
GRANT UPDATE (uploaded_by) ON data_files TO ascend_runtime;
INSERT INTO ascend_schema_migrations(version) VALUES (3) ON CONFLICT DO NOTHING;
COMMIT;
SELECT version FROM ascend_schema_migrations ORDER BY version;
