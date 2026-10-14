import test from 'node:test';
import assert from 'node:assert/strict';
import { enrollment,reviewEnrollment } from '../src/enrollment.js';
import { community } from '../src/community.js';
test('signup requests remain pending and never create active accounts',async()=>{
 const calls=[];const db={query:async(sql,args)=>{calls.push({sql,args});return {rows:sql.startsWith('SELECT status')?[{status:'pending'}]:[]};}};
 assert.deepEqual(await enrollment(db,'user_new','POST',{display_name:'New member',affiliation:'College',role:'administrator',active:true}),{status:'pending'});
 assert.ok(!calls.some(c=>c.sql.startsWith('INSERT INTO portal_accounts')));
 assert.equal(calls.find(c=>c.sql.startsWith('INSERT')).args[0],'user_new');
});
test('disabled account cannot resubmit signup to regain access',async()=>{
 let calls=0;const db={query:async()=>{calls++;return {rows:[{active:false}]};}};
 assert.deepEqual(await enrollment(db,'user_disabled','POST',{display_name:'Name'}),{status:'disabled'});assert.equal(calls,1);
});
test('ordinary members cannot review signup requests',async()=>{
 await assert.rejects(reviewEnrollment({query:()=>assert.fail('Unexpected query')},{role:'member'},'POST',{subject:'user_new',action:'approve'}),e=>e.status===403);
});
test('moderator approval creates only ordinary member and commits audit together',async()=>{
 const calls=[];const db={query:async(sql,args)=>{calls.push({sql,args});return {rows:sql.includes('FOR UPDATE')?[{display_name:'New member'}]:sql.includes('RETURNING subject')?[{subject:'user_new'}]:[]};}};
 await reviewEnrollment(db,{role:'moderator',subject:'user_mod',team_id:null},'POST',{subject:'user_new',action:'approve',role:'administrator'});
 assert.ok(calls.find(c=>c.sql.includes("VALUES($1,'member',NULL,true,$2)")));
 assert.ok(calls.find(c=>c.sql.startsWith('INSERT INTO portal_audit')));assert.equal(calls.at(-1).sql,'COMMIT');
});
test('moderator approval cannot reactivate or overwrite existing privileged account',async()=>{
 const calls=[];const db={query:async(sql)=>{calls.push(sql);return {rows:sql.includes('FOR UPDATE')?[{display_name:'Name'}]:[]};}};
 await assert.rejects(reviewEnrollment(db,{role:'moderator',subject:'user_mod'},'POST',{subject:'user_existing',action:'approve'}),e=>e.status===409);
 assert.equal(calls.at(-1),'ROLLBACK');
});
test('moderators cannot delete groups; administrators archive groups and audit',async()=>{
 const path='/api/team/community/moderate',request=new Request('https://api.test'+path,{method:'POST'}),input={action:'delete_group',id:'91000000-0000-4000-8000-000000000006'};
 const calls=[];const db={query:async sql=>{calls.push(sql);return {rows:sql.startsWith('UPDATE')?[{id:input.id}]:[]};}};
 await assert.rejects(community(db,{role:'moderator',subject:'user_mod'},request,path,input),e=>e.status===403);
 assert.ok(!calls.some(s=>s.startsWith('UPDATE')));calls.length=0;
 await community(db,{role:'administrator',subject:'user_admin'},request,path,input);
 assert.ok(calls.includes('UPDATE discussion_groups SET deleted=true WHERE id=$1 AND NOT deleted RETURNING id'));assert.equal(calls.at(-1),'COMMIT');
});
