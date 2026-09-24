import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {resolve, join, dirname} from 'node:path';
const root = resolve('_site');
const files = [];
function walk(dir) { for (const name of readdirSync(dir)) { const p=join(dir,name); if(statSync(p).isDirectory()) walk(p); else if(p.endsWith('.html')) files.push(p); } }
walk(root);
const errors=[];
for (const file of files) {
 const html=readFileSync(file,'utf8');
 if ((html.match(/<h1(?:\s|>)/g)||[]).length!==1) errors.push(`${file}: expected one h1`);
 if(!html.includes('lang="en"')||!html.includes('id="main"')) errors.push(`${file}: missing language/main`);
 if(/(?:undefined|\[object Object\])/.test(html)) errors.push(`${file}: unresolved template value`);
 for(const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
  const href=match[1].replaceAll('&amp;','&');
  if(/^(https?:|mailto:|data:)/.test(href))continue;
  if(href==='#') {errors.push(`${file}: dead placeholder link`);continue;}
  const url = new URL(href,'https://local.test'+file.slice(root.length).replace(/index\.html$/,''));
  let target=join(root,decodeURIComponent(url.pathname));
  if(existsSync(target)&&statSync(target).isDirectory())target=join(target,'index.html');
  if(!existsSync(target)){errors.push(`${file}: missing ${href}`);continue;}
  if(url.hash&&target.endsWith('.html')) {
   const id=decodeURIComponent(url.hash.slice(1));
   if(!readFileSync(target,'utf8').includes(`id="${id}"`))errors.push(`${file}: missing anchor ${href}`);
  }
 }
}
for(const route of ['part107/airspace','uas','air-quality','ballooning','fabrication','teachers','videos','downloads','library','search']) {
 if(!existsSync(join(root,route,'index.html')))errors.push(`Missing route ${route}`);
}
if(!existsSync(join(root,'pagefind/pagefind.js')))errors.push('Missing Pagefind index');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Verified ${files.length} HTML pages: internal links, anchors, primary headings, and search files.`);
