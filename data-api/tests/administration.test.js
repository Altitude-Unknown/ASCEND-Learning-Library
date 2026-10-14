import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboard,createTeam,setTeamAccess,reviewMission } from '../src/administration.js';
const admin={subject:'user_admin',role:'administrator',team_id:null};
const team={subject:'user_team',role:'team',team_id:'92000000-0000-4000-8000-000000000003'};
const mission='91000000-0000-4000-8000-000000000006';
test('team accounts cannot invoke any administrator operation',async()=>{
  let queries=0;const db={query:async()=>{queries++;throw Error('unauthorized database access');}};
  for(const operation of [dashboard,createTeam,setTeamAccess,reviewMission]) await assert.rejects(operation(db,team,{}),error=>error.status===403);
  assert.equal(queries,0);
});
test('publication requires review acknowledgment before database mutation',async()=>{
  await assert.rejects(reviewMission({query:()=>{throw Error('must not query');}},admin,{mission_id:mission,action:'publish'}),error=>error.status===400);
});
test('publication locks mission and rolls back if no committed upload exists',async()=>{
  const queries=[];const db={query:async(sql)=>{queries.push(sql);return {rows:sql.includes('FOR UPDATE')?[{id:mission,team_id:team.team_id,data_license:'CC0-1.0'}]:[]};}};
  await assert.rejects(reviewMission(db,admin,{mission_id:mission,action:'publish',reviewed:true}),error=>error.status===400);
  assert.equal(queries.at(-1),'ROLLBACK');assert.ok(!queries.some(sql=>sql.startsWith('UPDATE missions')));
});
test('publication and audit commit together after review',async()=>{
  const queries=[];const db={query:async(sql,args)=>{queries.push({sql,args});return {rows:sql.includes('FOR UPDATE')?[{id:mission,team_id:team.team_id,data_license:'CC0-1.0'}]:sql.startsWith('SELECT id FROM data_files')?[{id:'file'}]:[]};}};
  await reviewMission(db,admin,{mission_id:mission,action:'publish',reviewed:true});
  assert.ok(queries.some(q=>q.sql.includes("visibility='public',publication_status='approved'")));
  assert.deepEqual(queries.find(q=>q.sql.startsWith('INSERT INTO portal_audit_events')).args,[admin.subject,team.team_id,'publish',mission]);assert.equal(queries.at(-1).sql,'COMMIT');
});
test('team-login disable cannot target administrator accounts',async()=>{
  let update;const db={query:async(sql)=>{if(sql.startsWith('UPDATE')){update=sql;return {rows:[]};}return {rows:[]};}};
  await assert.rejects(setTeamAccess(db,admin,{subject:admin.subject,active:false}),error=>error.status===404);assert.match(update,/role='team'/);
});
test('team creation rejects attempts to assign administrator role',async()=>{
  await assert.rejects(createTeam({},admin,{institution:'ASCEND',name:'Test',subject:'user_test',role:'administrator'}),error=>error.status===400);
});
