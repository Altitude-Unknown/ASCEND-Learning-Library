// Public, read-only checks. Never requires or prints a secret key.
const base = 'https://ascendflight.org/__clerk';
const results = [];
for (const path of [
  '/npm/@clerk/ui@1/dist/ui.browser.js',
  '/npm/@clerk/clerk-js@6/dist/clerk.browser.js',
  '/v1/environment',
]) {
  let url = base + path;
  const chain = [];
  let passed = false;
  for (let hop = 0; hop < 5; hop++) {
    const response = await fetch(url, {
      redirect: 'manual', headers: { Origin: 'https://ascendflight.org' },
      signal: AbortSignal.timeout(20000),
    });
    const type = response.headers.get('content-type') || '';
    chain.push({ url, status: response.status, contentType: type, cacheControl: response.headers.get('cache-control') });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const next = new URL(response.headers.get('location'), url);
      if (next.origin !== 'https://ascendflight.org' || !next.pathname.startsWith('/__clerk/')) break;
      url = next.href;
      continue;
    }
    passed = response.ok && response.headers.get('cache-control') === 'no-store' &&
      (path.endsWith('.js') ? /javascript/.test(type) : /application\/json/.test(type));
    if (!response.ok && /application\/json/.test(type)) {
      const body = await response.json();
      chain.at(-1).errorCodes = (body.errors || []).map(error => error.code);
    }
    break;
  }
  results.push({ path, passed, chain });
}
console.log(JSON.stringify(results, null, 2));
if (results.some(result => !result.passed)) process.exitCode = 1;
