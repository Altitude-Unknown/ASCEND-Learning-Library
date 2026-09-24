import {spawnSync, spawn} from 'node:child_process';
const env = {...process.env, ASCEND_LOCAL_MATERIALS: '1'};
for (const args of [['node_modules/@11ty/eleventy/cmd.cjs'], ['node_modules/pagefind/lib/runner/bin.cjs','--site','_preview']]) {
 const result = spawnSync(process.execPath, args, {stdio:'inherit', env});
 if (result.status !== 0) process.exit(result.status || 1);
}
const server = spawn(process.execPath, ['node_modules/@11ty/eleventy/cmd.cjs','--serve',...process.argv.slice(2)], {stdio:'inherit',env});
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>server.kill(signal));
server.on('exit',code=>process.exit(code || 0));
