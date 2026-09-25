import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {selectQuestions,gradeAnswers} from '../public/assets/practice/engine.js';
const data=JSON.parse(readFileSync('public/assets/practice/questions.json'));
const audit=JSON.parse(readFileSync('editorial/practice/review.json'));
const ids=new Set();
for(const q of data.questions){
 assert(!ids.has(q.id),`Duplicate id ${q.id}`);ids.add(q.id);
 assert(q.prompt.trim()&&data.banks.includes(q.bank),`Invalid prompt or bank ${q.id}`);
 assert(q.choices.length>=2&&q.choices.every(c=>typeof c==='string'&&c.trim()),`Invalid choices ${q.id}`);
 assert.equal(new Set(q.choices.map(c=>c.toLowerCase().trim())).size,q.choices.length,`Duplicate choices ${q.id}`);
 assert(Number.isInteger(q.answerIndex)&&q.answerIndex>=0&&q.answerIndex<q.choices.length,`Invalid answer ${q.id}`);
 assert.deepEqual(q.figures,[...new Set([...q.prompt.matchAll(/figure\s+(\d+)/gi)].map(m=>m[1]))],`Incomplete figures ${q.id}`);
 for(const id of q.figures)assert(data.figures[id],`Missing figure metadata ${q.id}: ${id}`);
}
for(const [id,f] of Object.entries(data.figures)){
 assert.equal(f.url,`/assets/practice/figures/${id}.jpg`);
 assert.equal(createHash('sha256').update(readFileSync('public'+f.url)).digest('hex'),f.sha256,`Figure changed ${id}`);
 assert(existsSync('_site'+f.url),`Figure missing from build ${id}`);
}
for(const bank of data.banks){
 const picked=selectQuestions(data,bank,'10');assert.equal(picked.length,10);assert(picked.every(q=>q.bank===bank));
 assert.equal(selectQuestions(data,bank,'all').length,data.questions.filter(q=>q.bank===bank).length);
}
for(let run=0;run<25;run++){
 const mixed=selectQuestions(data,'mixed','10');assert.equal(mixed.length,50);assert.equal(new Set(mixed.map(q=>q.id)).size,50);
 for(const bank of data.banks)assert.equal(mixed.filter(q=>q.bank===bank).length,10);
}
const answers=Object.fromEntries(data.questions.map(q=>[q.id,q.answerIndex]));
assert(gradeAnswers(data.questions,answers).every(r=>r.correct));
assert(gradeAnswers(data.questions,{}).every(r=>!r.correct));
const first=data.questions[0];answers[first.id]=(first.answerIndex+1)%first.choices.length;
assert.equal(gradeAnswers(data.questions,answers).filter(r=>!r.correct).length,1);
assert.equal(data.questions.find(q=>q.id==='airspace_0014').answerIndex,2,'NOTAM scoring regression');
assert.deepEqual(data.questions.find(q=>q.id==='airspace_0044').figures,['71']);
assert.deepEqual(data.questions.find(q=>q.id==='operations_0016').figures,['22','31']);
for(const change of audit.changes)if(change.disposition!=='included')assert(!ids.has(change.id),`Excluded question scored: ${change.id}`);
assert.equal(data.questions.length+audit.heldCount+audit.duplicateCount,audit.originalCount);
for(const f of audit.sourceFiles){
 const path='Hosted-Website-Files/'+f.path;
 if(existsSync(path))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),f.sha256,`Intake original changed ${path}`);
}
console.log(`Verified ${data.questions.length} practice questions, ${Object.keys(data.figures).length} figure files, scoring, mixed sampling, and exclusion audit.`);
