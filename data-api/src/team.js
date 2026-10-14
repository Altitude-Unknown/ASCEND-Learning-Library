import { UUID } from '../../src/data/filters.js';
export function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
export function requireTeam(account) {
  if (account.role !== 'team' || !UUID.test(account.team_id || '')) fail('Use a team account for this workspace.', 403);
  return account.team_id;
}
export function authorizeContext(account, context) {
  if (context.team_id !== requireTeam(account)) fail('This mission is not available to your team.', 403);
  if(context.visibility!=='private' || context.publication_status!=='pending') fail('Team uploads require a private, pending mission. Ask the administrator to withdraw it or create a new mission.',403);
}
export function missionInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Invalid mission details.');
  if (Object.keys(input).some(key => !['name','mission_date','description','principal_investigator','data_license','synthetic','platform_type','platform_name','sensor_name','sensor_model'].includes(key))) fail('Unsupported mission field.');
  const result = {};
  for (const [key, max, required] of [['name',160,true],['description',4000,false],['principal_investigator',160,false],['data_license',160,true],['platform_name',160,true],['sensor_name',160,true],['sensor_model',160,false]]) {
    const value = input[key] ?? '';
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail('Invalid ' + key + '.');
    result[key] = value.trim();
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.mission_date || '') || !Number.isFinite(Date.parse(input.mission_date + 'T00:00:00Z')) || new Date(input.mission_date + 'T00:00:00Z').toISOString().slice(0,10) !== input.mission_date) fail('Use a valid mission date.');
  if (!['fixed_wing_uas','multirotor_uas','hab','radiosonde','ground_station'].includes(input.platform_type)) fail('Select a platform type.');
  if (typeof input.synthetic !== 'boolean') fail('Specify whether this is synthetic test data.');
  return { ...result, mission_date: input.mission_date, platform_type: input.platform_type, synthetic: input.synthetic };
}
export async function createMission(db, account, input) {
  const team = requireTeam(account), data = missionInput(input);
  await db.query('BEGIN');
  try {
    const insert = async (sql, values) => (await db.query(sql, values)).rows[0].id;
    const platform = await insert('INSERT INTO platforms(team_id,type_id,name) VALUES($1,$2,$3) RETURNING id',[team,data.platform_type,data.platform_name]);
    const sensor = await insert('INSERT INTO sensors(team_id,name,model) VALUES($1,$2,$3) RETURNING id',[team,data.sensor_name,data.sensor_model]);
    const configuration = await insert('INSERT INTO sensor_configurations(sensor_id,team_id,platform_id) VALUES($1,$2,$3) RETURNING id',[sensor,team,platform]);
    const mission = await insert("INSERT INTO missions(team_id,name,mission_date,description,principal_investigator,data_license,synthetic,visibility,publication_status) VALUES($1,$2,$3,$4,$5,$6,$7,'private','pending') RETURNING id",[team,data.name,data.mission_date,data.description,data.principal_investigator,data.data_license,data.synthetic]);
    await db.query('INSERT INTO mission_platforms(mission_id,platform_id,team_id) VALUES($1,$2,$3)',[mission,platform,team]);
    await db.query("INSERT INTO portal_audit_events(subject,team_id,action,resource_id) VALUES($1,$2,'create_mission',$3)",[account.subject,team,mission]);
    await db.query('COMMIT');
    return { mission_id: mission, sensor_configuration_id: configuration };
  } catch (error) { await db.query('ROLLBACK'); throw error; }
}
export async function workspace(db, account) {
  const team = requireTeam(account);
  const missions = await db.query('SELECT id,name,mission_date,description,data_license,synthetic,visibility,publication_status FROM missions WHERE team_id=$1 ORDER BY mission_date DESC,id LIMIT 1001',[team]);
  const files = await db.query('SELECT id,mission_id,original_filename,sha256,bytes,uploaded_at,import_status,row_count FROM data_files WHERE team_id=$1 ORDER BY uploaded_at DESC,id LIMIT 1001',[team]);
  return { missions: missions.rows.slice(0,1000), files: files.rows.slice(0,1000), truncated: missions.rows.length > 1000 || files.rows.length > 1000 };
}
export async function contexts(db, account) {
  return (await db.query('SELECT m.id AS mission_id,m.name AS mission,m.team_id,p.name AS platform,sc.id AS sensor_configuration_id,s.name AS sensor FROM missions m JOIN mission_platforms mp ON mp.mission_id=m.id JOIN platforms p ON p.id=mp.platform_id JOIN sensor_configurations sc ON sc.platform_id=p.id AND sc.team_id=m.team_id JOIN sensors s ON s.id=sc.sensor_id WHERE m.team_id=$1 ORDER BY m.mission_date DESC,m.id,sc.id LIMIT 1001',[requireTeam(account)])).rows;
}
