import assert from 'node:assert/strict';
import nunjucks from 'nunjucks';
import {readFileSync} from 'node:fs';
import {assetFiles, availability} from '../lib/materials.js';
const env=new nunjucks.Environment(new nunjucks.FileSystemLoader('content/_includes'),{autoescape:true});
const topics=JSON.parse(readFileSync('content/_data/topics.json'));
env.addFilter('topic',id=>topics.find(t=>t.id===id));
env.addFilter('assetFiles',assetFiles);
env.addFilter('availability',availability);
env.addFilter('related',()=>[]);
assert.equal(env.render('components/provenance.njk',{}).trim(),'');
const credit=env.render('components/provenance.njk',{
 origin:'adapted',contributors:[{name:'Example <Contributor>',institution:'Example institution'}],
 originalSource:[{title:'Original document'}],adaptedFrom:[{title:'Source article',url:'https://example.org/source'}],
 externalSource:[{title:'Maintained reference',url:'https://example.org/reference'}],
 reviewer:'Example reviewer',lastReviewed:'2026-09-24',copyright:'Example copyright',license:'Example license',version:'1.0'
});
for(const value of ['Example &lt;Contributor&gt;','Example institution','Original document','https://example.org/source','Maintained reference','Example reviewer','2026-09-24','Example copyright','Example license','1.0'])assert.ok(credit.includes(value),value);
const web=env.render('layouts/resource.njk',{
 title:'Web resource fixture',description:'Template check only',topic:'air-quality',kind:'Science primer',
 delivery:'web',status:'Available',content:'<h2>Explanation</h2><p>Web content without a file.</p>',
 assetIds:[],related:[],collections:{resources:[]}
});
assert.ok(web.includes('Web content without a file.'));
assert.ok(web.includes('Read this resource on this page.'));
assert.ok(!web.includes('disabled'));
assert.ok(!web.includes('Coming soon'));
assert.equal(availability({delivery:'web',status:'Available',assetIds:[]}),'Available');
console.log('Verified optional provenance, escaped attribution, and web-only resources without false download placeholders.');
