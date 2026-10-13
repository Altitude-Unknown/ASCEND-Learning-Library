-- Run in Neon SQL Editor as neondb_owner, on production / neondb.
-- Creates metadata only. Upload the synthetic CSV through the website afterward.
BEGIN;
INSERT INTO organizations (id, name)
VALUES ('91000000-0000-4000-8000-000000000001', 'ASCEND SYNTHETIC TEST')
ON CONFLICT (id) DO NOTHING;
INSERT INTO teams (id, organization_id, name)
VALUES ('91000000-0000-4000-8000-000000000002', '91000000-0000-4000-8000-000000000001', 'SYNTHETIC TEST Team')
ON CONFLICT (id) DO NOTHING;
INSERT INTO platforms (id, team_id, type_id, name)
VALUES ('91000000-0000-4000-8000-000000000003', '91000000-0000-4000-8000-000000000002', 'hab', 'SYNTHETIC TEST Balloon')
ON CONFLICT (id) DO NOTHING;
INSERT INTO sensors (id, team_id, name, model)
VALUES ('91000000-0000-4000-8000-000000000004', '91000000-0000-4000-8000-000000000002', 'SYNTHETIC TEST Atmospheric Sensor', 'Generated test data; no physical instrument')
ON CONFLICT (id) DO NOTHING;
INSERT INTO sensor_configurations (id, sensor_id, team_id, platform_id, configuration)
VALUES ('91000000-0000-4000-8000-000000000005', '91000000-0000-4000-8000-000000000004', '91000000-0000-4000-8000-000000000002', '91000000-0000-4000-8000-000000000003', '{"synthetic":true,"purpose":"Private upload smoke test"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO missions (id, team_id, name, mission_date, description, data_license, visibility, publication_status, synthetic)
VALUES ('91000000-0000-4000-8000-000000000006', '91000000-0000-4000-8000-000000000002', 'SYNTHETIC TEST — Private Upload Check', '2026-10-12', 'Generated five-row upload test. No real flight or scientific observations.', 'CC0-1.0', 'private', 'pending', true)
ON CONFLICT (id) DO NOTHING;
INSERT INTO mission_platforms (mission_id, platform_id, team_id)
VALUES ('91000000-0000-4000-8000-000000000006', '91000000-0000-4000-8000-000000000003', '91000000-0000-4000-8000-000000000002')
ON CONFLICT DO NOTHING;
COMMIT;
SELECT id, name, visibility, publication_status, synthetic
FROM missions WHERE id = '91000000-0000-4000-8000-000000000006';
