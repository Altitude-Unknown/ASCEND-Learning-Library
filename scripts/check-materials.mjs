import {readFileSync, existsSync, statSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {materials, materialSource} from '../lib/materials.js';
const errors=[];
const ids=new Set();
for (const asset of materials) {
 if(ids.has(asset.id))errors.push(`Duplicate asset ID: ${asset.id}`);
 ids.add(asset.id);
 const distribution = asset.hostedLocally ? join('public',asset.localPath) : null;
 if(distribution && !existsSync(distribution)) {errors.push(`Missing distribution file: ${distribution}`);continue;}
 for(const file of [distribution, materialSource(asset)].filter(file=>file&&existsSync(file))) {
  if(statSync(file).size!==asset.bytes)errors.push(`Size mismatch: ${file}`);
  if(createHash('sha256').update(readFileSync(file)).digest('hex')!==asset.sha256)errors.push(`Checksum mismatch: ${file}`);
 }
 if(distribution && asset.bytes>25*1024*1024)errors.push(`Exceeds Pages asset limit: ${distribution}`);
 if(asset.publicUrl && !asset.publicUrl.startsWith('https://'))errors.push(`Expected HTTPS public URL: ${asset.id}`);
}
const resourceText=readdirSync('content/resources').filter(n=>n.endsWith('.md')).map(n=>readFileSync(join('content/resources',n),'utf8')).join('\n');
for(const id of ids)if(!resourceText.includes(`- ${id}\n`))errors.push(`Material missing a resource page: ${id}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Verified ${materials.length} material records, distribution checksums, original checksums where present, and resource coverage.`);
