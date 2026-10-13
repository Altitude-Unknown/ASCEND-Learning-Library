-- Run in Neon SQL Editor as neondb_owner on production / neondb.
-- Development identities only; no real-team invitations are sent.
BEGIN;
INSERT INTO organizations (id, name)
VALUES ('92000000-0000-4000-8000-000000000001', 'ASCEND Portal Testing')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teams (id, organization_id, name) VALUES
('92000000-0000-4000-8000-000000000002', '92000000-0000-4000-8000-000000000001', 'ASCEND Test Team A'),
('92000000-0000-4000-8000-000000000003', '92000000-0000-4000-8000-000000000001', 'ASCEND Test Team B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO portal_accounts (subject, role, team_id, active) VALUES
('user_3Kcd5swTp4c7BtxBLO6KnxV4zfL', 'team', '92000000-0000-4000-8000-000000000002', true),
('user_3KcdEjBvP8Y2Ncx69VdcryeSXqd', 'team', '92000000-0000-4000-8000-000000000003', true)
ON CONFLICT (subject) DO NOTHING;
COMMIT;

SELECT a.subject, t.name AS team, a.role, a.active
FROM portal_accounts a JOIN teams t ON t.id = a.team_id
WHERE a.subject IN ('user_3Kcd5swTp4c7BtxBLO6KnxV4zfL', 'user_3KcdEjBvP8Y2Ncx69VdcryeSXqd')
ORDER BY t.name;
