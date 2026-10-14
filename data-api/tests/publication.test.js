import test from 'node:test';
import assert from 'node:assert/strict';
import { saveImport } from '../src/repository.js';
const context={subject:'user_member',team_id:'team',mission_id:'mission',platform_id:'platform',sensor_configuration_id:'sensor'};
function fixture({blocked=false,publicationFails=false}={}){
 const calls=[];const db={query:async(sql,args)=>{calls.push(sql);if(sql.includes('FOR UPDATE'))return {rows:[{team_id:'team',publication_blocked:blocked}]};if(sql.startsWith('INSERT INTO data_files'))return {rows:[{id:'file'}]};if(publicationFails&&sql.startsWith('UPDATE missions'))throw Error('database failure');return {rows:[]};}};
 const run=()=>saveImport(db,{ORIGINALS:{put:async()=>({})}},{name:'test.csv'},new Uint8Array([1]),'a'.repeat(64),{mapping:{},units:{}},context,{parserVersion:'test',rows:[]});return {calls,run};
}
test('successful member import publishes in the same transaction before commit',async()=>{const f=fixture();await f.run();assert.ok(f.calls.some(sql=>sql.includes("visibility='public'")));assert.equal(f.calls.at(-1),'COMMIT');});
test('publication failure rolls back the entire database import',async()=>{const f=fixture({publicationFails:true});await assert.rejects(f.run());assert.equal(f.calls.at(-1),'ROLLBACK');assert.ok(!f.calls.includes('COMMIT'));});
test('administrator withdrawal prevents upload from republishing a mission',async()=>{const f=fixture({blocked:true});await assert.rejects(f.run(),e=>e.status===403);assert.equal(f.calls.at(-1),'ROLLBACK');assert.ok(!f.calls.some(sql=>sql.startsWith('INSERT INTO data_files')));});
