import { fail } from './team.js';
export async function enrollment(db,subject,method,input={}) {
 const account=(await db.query('SELECT active FROM portal_accounts WHERE subject=$1',[subject])).rows[0];
 if(account) return {status:account.active?'active':'disabled'};
 if(method==='POST') {
  if(!input || typeof input.display_name!=='string' || !input.display_name.trim() || input.display_name.length>80 || (input.affiliation!==undefined && (typeof input.affiliation!=='string'||input.affiliation.length>200))) fail('Enter your name and a valid affiliation.');
  await db.query('INSERT INTO membership_requests(subject,display_name,affiliation) VALUES($1,$2,$3) ON CONFLICT(subject) DO NOTHING',[subject,input.display_name.trim(),(input.affiliation||'').trim()]);
 }
 const row=(await db.query('SELECT status FROM membership_requests WHERE subject=$1',[subject])).rows[0];
 return {status:row?.status||'unregistered'};
}
export async function reviewEnrollment(db,a,method,input) {
 if(!['moderator','administrator'].includes(a.role)) fail('Moderator access required.',403);
 if(method==='GET')return {data:(await db.query("SELECT subject,display_name,affiliation,created_at FROM membership_requests WHERE status='pending' ORDER BY created_at LIMIT 1000")).rows};
 if(!input || typeof input.subject!=='string' || !input.subject.startsWith('user_') || !['approve','reject'].includes(input.action))fail('Invalid membership decision.');
 await db.query('BEGIN');
 try {
  const row=(await db.query("SELECT display_name FROM membership_requests WHERE subject=$1 AND status='pending' FOR UPDATE",[input.subject])).rows[0];
  if(!row)fail('Pending request not found.',404);
  if(input.action==='approve') {
   const result=await db.query("INSERT INTO portal_accounts(subject,role,team_id,active,display_name) VALUES($1,'member',NULL,true,$2) ON CONFLICT(subject) DO NOTHING RETURNING subject",[input.subject,row.display_name]);
   if(!result.rows.length)fail('This account already exists. An administrator must manage its access.',409);
  }
  await db.query('UPDATE membership_requests SET status=$2,reviewed_by=$3,reviewed_at=now() WHERE subject=$1',[input.subject,input.action==='approve'?'approved':'rejected',a.subject]);
  await db.query('INSERT INTO portal_audit_events(subject,team_id,action) VALUES($1,$2,$3)',[a.subject,a.team_id,'membership_'+input.action]);
  await db.query('COMMIT');return {saved:true};
 }catch(error){await db.query('ROLLBACK');throw error;}
}
