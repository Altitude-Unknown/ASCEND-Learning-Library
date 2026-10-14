import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeContext, missionInput, workspace, contexts, createMission } from '../src/team.js';
const account = { subject:'user_testA', role:'team', team_id:'92000000-0000-4000-8000-000000000002' };
const input = { name:'Test', mission_date:'2026-10-12', description:'', principal_investigator:'', data_license:'CC0-1.0', synthetic:true, platform_type:'hab', platform_name:'Balloon', sensor_name:'Logger', sensor_model:'' };
test('team ownership rejects another team and administrator impersonation', () => {
  authorizeContext(account, { team_id:account.team_id, visibility:'private', publication_status:'pending' });
  assert.throws(() => authorizeContext(account, {team_id:account.team_id,publication_blocked:true}), error=>error.status===403);
  assert.throws(() => authorizeContext(account, {team_id:'92000000-0000-4000-8000-000000000003'}), error => error.status === 403);
  authorizeContext({...account,role:'administrator'}, {team_id:account.team_id});
});
test('mission creation rejects ownership/publication injection and invalid dates', () => {
  assert.equal(missionInput(input).synthetic, true);
  for (const override of [{team_id:account.team_id},{visibility:'public'},{publication_status:'approved'},{mission_date:'2026-02-30'},{synthetic:'true'}])
    assert.throws(() => missionInput({...input,...override}));
});
test('workspace and destinations query only the assigned team', async () => {
  const db = { query:async (sql,args) => { assert.match(sql,/WHERE (?:m\.)?team_id=\$1/); assert.deepEqual(args,[account.team_id]); return {rows:[]}; } };
  assert.deepEqual(await contexts(db,account),[]);
  assert.equal((await workspace(db,account)).truncated,false);
});
test('failed mission setup rolls back all metadata', async () => {
  const statements = [];
  const db = { query: async (sql) => { statements.push(sql); if(sql.startsWith('INSERT INTO sensors')) throw Error('failure'); return {rows:[{id:'test-id'}]}; } };
  await assert.rejects(createMission(db,account,input));
  assert.equal(statements.at(-1),'ROLLBACK');
  assert.ok(!statements.includes('COMMIT'));
});
