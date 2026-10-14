-- Owner-only verification of the exact synthetic Team B smoke-test upload.
SELECT f.id, f.mission_id, t.name AS team, f.import_status, f.row_count,
  (SELECT count(*) FROM observations o WHERE o.source_file_id=f.id) AS stored_observations,
  (SELECT count(*) FROM observation_values v JOIN observations o ON o.id=v.observation_id WHERE o.source_file_id=f.id) AS measurement_values,
  (SELECT count(*) FROM observation_qc q JOIN observations o ON o.id=q.observation_id WHERE o.source_file_id=f.id) AS qc_entries,
  f.uploaded_by,
  EXISTS(SELECT 1 FROM portal_audit_events a WHERE a.resource_id=f.id AND a.action='import_file' AND a.subject=f.uploaded_by) AS audited,
  m.visibility, m.publication_status, m.synthetic
FROM data_files f JOIN teams t ON t.id=f.team_id JOIN missions m ON m.id=f.mission_id
WHERE f.id='b1b114f3-4e97-4315-bc9c-3d0c455fe523';

-- Correct the test marker without changing its publication state.
UPDATE missions m SET synthetic=true
FROM data_files f
WHERE f.mission_id=m.id AND f.id='b1b114f3-4e97-4315-bc9c-3d0c455fe523'
  AND m.team_id='92000000-0000-4000-8000-000000000003'
  AND m.name='SYNTHETIC Team B upload test'
  AND m.visibility='private' AND m.publication_status='pending'
RETURNING m.id,m.name,m.synthetic,m.visibility,m.publication_status;
