// Run while npm run preview is serving localhost:8080.
import {readFileSync, existsSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const assets=JSON.parse(readFileSync('content/_data/materials.json'));
for(const asset of assets.filter(a=>!a.hostedLocally && !a.publicUrl)) {
 const file=join('_preview',asset.localPath);
 if(!existsSync(file)||statSync(file).size!==asset.bytes)throw new Error('Missing preview file '+asset.id);
 if(createHash('sha256').update(readFileSync(file)).digest('hex')!==asset.sha256)throw new Error('Bad preview checksum '+asset.id);
 const res=await fetch('http://localhost:8080/'+asset.localPath,{method:'HEAD'});
 if(!res.ok||res.headers.get('content-type')?.includes('text/html'))throw new Error('Bad download response '+asset.id);
 console.log(asset.filename+': checksum verified; HTTP '+res.status+'; '+res.headers.get('content-type'));
}
