import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const hash=value=>createHash('sha256').update(value).digest('hex');
const audit=JSON.parse(readFileSync('editorial/part107-textbook-import.json','utf8'));
assert.equal(hash(readFileSync(audit.source)),audit.sourceSha256,'Textbook source changed: regenerate chapters');
assert.equal(audit.chapters.length,5);
for(const chapter of audit.chapters){
  const source=readFileSync(`content/part107/textbook/${chapter.slug}.njk`,'utf8');
  const body=source.split('\n---\n').slice(1).join('\n---\n').replace(/\n$/,'');
  assert.equal(hash(body),chapter.htmlSha256,`${chapter.slug}: conversion audit is stale`);
  for(const image of chapter.images) assert.equal(hash(readFileSync(`public/assets/part107/textbook/${image.file}`)),image.sha256);
}
assert.equal(audit.chapters.reduce((n,c)=>n+c.tables,0),16);
assert.equal(audit.chapters.reduce((n,c)=>n+c.images.length,0),18);
console.log('Textbook source, five chapters, and 18 original figures match the verified conversion.');
