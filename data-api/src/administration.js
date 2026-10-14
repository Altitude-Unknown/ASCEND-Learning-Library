import { UUID } from '../../src/data/filters.js';
import { fail } from './team.js';
export function requireAdministrator(account) {
  if (account.role !== 'administrator') fail('Administrator access required.',403);
}
function text(value,label,max=160) {
  if (typeof value !== 'string' || !value.trim() || value.length>max) fail('Invalid '+label+'.');
  return value.trim();
}
function fields(input,allowed) {
  if (!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(key=>!allowed.includes(key))) fail('Invalid administrator request.');
}
async function transaction(db,operation) {
  await db.query('BEGIN');
  try { const result=await operation(); await db.query('COMMIT'); return result; }
  catch(error) { await db.query('ROLLBACK'); if(error.code==='23505') fail('This team or login is already assigned.',409); throw error; }
}
async function audit(db,account,team,action,id) {
  await db.query('INSERT INTO portal_audit_events(subject,team_id,action,resource_id) VALUES($1,$2,$3,$4)',[account.subject,team,action,id]);
}
export async function dashboard(db,account) {
  requireAdministrator(account);
  const teams=(await db.query("SELECT t.id,t.name,org.name AS institution,(SELECT count(*) FROM portal_accounts a WHERE a.team_id=t.id AND a.active) AS member_count,(SELECT count(*) FROM missions m WHERE m.team_id=t.id) AS mission_count FROM teams t JOIN organizations org ON org.id=t.organization_id ORDER BY org.name,t.name,t.id LIMIT 1001")).rows;
  const missions=(await db.query('SELECT m.id,m.name,m.mission_date,m.description,m.principal_investigator,m.data_license,m.synthetic,m.visibility,m.publication_status,t.name AS team,(SELECT count(*) FROM data_files f WHERE f.mission_id=m.id AND f.import_status=\'committed\') AS file_count,(SELECT count(*) FROM observations o WHERE o.mission_id=m.id) AS observation_count,(SELECT count(*) FROM observation_qc q JOIN observations o ON o.id=q.observation_id WHERE o.mission_id=m.id) AS qc_count FROM missions m JOIN teams t ON t.id=m.team_id ORDER BY m.mission_date DESC,m.id LIMIT 1001')).rows;
  const files=(await db.query('SELECT f.id,f.mission_id,f.original_filename,f.sha256,f.import_status,f.row_count,f.uploaded_by,m.name AS mission,t.name AS team,(SELECT count(*) FROM observations o WHERE o.source_file_id=f.id) AS stored_observations,EXISTS(SELECT 1 FROM portal_audit_events a WHERE a.resource_id=f.id AND a.action=\'import_file\' AND a.subject=f.uploaded_by) AS audited FROM data_files f JOIN missions m ON m.id=f.mission_id JOIN teams t ON t.id=f.team_id ORDER BY f.uploaded_at DESC,f.id LIMIT 1001')).rows;
  const members=(await db.query('SELECT a.subject,a.role,a.team_id,a.display_name,a.active,a.owner,t.name AS team FROM portal_accounts a LEFT JOIN teams t ON t.id=a.team_id ORDER BY a.owner DESC,a.display_name,a.subject LIMIT 1001')).rows;
  return {teams:teams.slice(0,1000),missions:missions.slice(0,1000),files:files.slice(0,1000),members:members.slice(0,1000),owner:!!account.owner,truncated:[teams,missions,files,members].some(rows=>rows.length>1000)};
}
export async function saveMember(db,account,input){
 requireAdministrator(account);fields(input,['subject','role','team_id','display_name','active']);
 const subject=text(input.subject,'Clerk user ID',255),name=text(input.display_name,'display name',80);
 if(!/^user_[A-Za-z0-9]+$/.test(subject)||!['member','moderator','administrator'].includes(input.role)||typeof input.active!=='boolean')fail('Invalid member details.');
 const team=input.team_id||null;
 if((team&&!UUID.test(team))||(input.role==='member'&&!team))fail('Assign members to a team.');
 return transaction(db,async()=>{
   await db.query('SELECT pg_advisory_xact_lock(81462027)');
   const existing=(await db.query('SELECT role,owner FROM portal_accounts WHERE subject=$1 FOR UPDATE',[subject])).rows[0];
   if(existing?.owner)fail('The project owner account cannot be changed here.',403);
   if((input.role==='administrator'||existing?.role==='administrator')&&!account.owner)fail('Only the project owner can assign or change administrators.',403);
   if(input.role==='administrator'&&input.active){const result=await db.query("SELECT count(*)::integer AS count FROM portal_accounts WHERE role='administrator' AND active AND NOT owner AND subject<>$1",[subject]);if(result.rows[0].count>=12)fail('Up to 12 active helper administrators are supported.');}
   if(team&&!(await db.query('SELECT id FROM teams WHERE id=$1',[team])).rows.length)fail('Team not found.',404);
   await db.query('INSERT INTO portal_accounts(subject,role,team_id,display_name,active) VALUES($1,$2,$3,$4,$5) ON CONFLICT(subject) DO UPDATE SET role=EXCLUDED.role,team_id=EXCLUDED.team_id,display_name=EXCLUDED.display_name,active=EXCLUDED.active WHERE NOT portal_accounts.owner',[subject,input.role,team,name,input.active]);
   await audit(db,account,team,'save_member',team);return {saved:true};
 });
}
export async function createTeam(db,account,input) {
  requireAdministrator(account); fields(input,['institution','name','subject']);
  const institution=text(input.institution,'institution'),name=text(input.name,'team name'),subject=text(input.subject,'Clerk user ID',255);
  if (!/^user_[A-Za-z0-9]+$/.test(subject)) fail('Use the Clerk user ID starting with user_.');
  return transaction(db,async()=>{
    // One organization is reused by name only when there is an unambiguous match.
    const organizations=(await db.query('SELECT id FROM organizations WHERE name=$1',[institution])).rows;
    if(organizations.length>1) fail('Institution name is ambiguous. Use a distinct name.');
    const org=organizations[0]?.id || (await db.query('INSERT INTO organizations(name) VALUES($1) RETURNING id',[institution])).rows[0].id;
    if((await db.query('SELECT id FROM teams WHERE organization_id=$1 AND name=$2',[org,name])).rows.length) fail('Team already exists; use its account controls.',409);
    const team=(await db.query('INSERT INTO teams(organization_id,name) VALUES($1,$2) RETURNING id',[org,name])).rows[0].id;
    await db.query("INSERT INTO portal_accounts(subject,role,team_id,active,display_name) VALUES($1,'member',$2,true,$3)",[subject,team,name]);
    await audit(db,account,team,'create_team',team);
    return {team_id:team};
  });
}
export async function setTeamAccess(db,account,input) {
  requireAdministrator(account); fields(input,['subject','active']);
  const subject=text(input.subject,'Clerk user ID',255);
  if(typeof input.active!=='boolean') fail('Specify active access.');
  return transaction(db,async()=>{
    const result=await db.query("UPDATE portal_accounts SET active=$2 WHERE subject=$1 AND role IN ('member','moderator') AND NOT owner RETURNING team_id",[subject,input.active]);
    if(result.rows.length!==1) fail('Team account not found.',404);
    await audit(db,account,result.rows[0].team_id,input.active?'activate_team':'deactivate_team',result.rows[0].team_id);
    return {active:input.active};
  });
}
export async function reviewMission(db,account,input) {
  requireAdministrator(account); fields(input,['mission_id','action','reviewed']);
  if(!UUID.test(input.mission_id||'') || !['publish','withdraw','mark_synthetic'].includes(input.action)) fail('Invalid mission review.');
  if(input.action==='publish' && input.reviewed!==true) fail('Review provenance, QC, license and privacy before publication.');
  return transaction(db,async()=>{
    const mission=(await db.query('SELECT id,team_id,data_license FROM missions WHERE id=$1 FOR UPDATE',[input.mission_id])).rows[0];
    if(!mission) fail('Mission not found.',404);
    if(input.action==='publish') {
      if(!mission.data_license.trim()) fail('A data license is required.');
      if(!(await db.query("SELECT id FROM data_files WHERE mission_id=$1 AND import_status='committed' LIMIT 1",[mission.id])).rows.length) fail('Import data before publishing a mission.');
      await db.query("UPDATE missions SET visibility='public',publication_status='approved',publication_blocked=false WHERE id=$1",[mission.id]);
    } else if(input.action==='withdraw') {
      await db.query("UPDATE missions SET visibility='private',publication_status='pending',publication_blocked=true WHERE id=$1",[mission.id]);
    } else await db.query('UPDATE missions SET synthetic=true WHERE id=$1',[mission.id]);
    await audit(db,account,mission.team_id,input.action,mission.id);
    return {mission_id:mission.id,action:input.action};
  });
}
