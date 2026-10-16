import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proxyRequest } from '../src/worker.js';

const env = {
  CLERK_PROXY_URL: 'https://ascendflight.org/__clerk',
  CLERK_FRONTEND_ORIGIN: 'https://clerk.ascendflight.org',
  CLERK_SECRET_KEY: 'test-only-secret',
};
const req = (path, init = {}) => new Request('https://ascendflight.org' + path, {
  ...init, headers: { 'CF-Connecting-IP': '192.0.2.10', ...init.headers },
});

test('forwards authentication bodies and cookies with trusted proxy headers; never caches sessions', async () => {
  let calls = 0;
  const response = await proxyRequest(req('/__clerk/v1/client/sign_ins?test=1', {
    method: 'POST', body: 'identifier=test%40example.test', headers: {
      'Content-Type': 'application/x-www-form-urlencoded', Cookie: '__client=fixture',
      Origin: 'https://ascendflight.org', 'X-Forwarded-For': 'spoofed',
      'Clerk-Secret-Key': 'spoofed', 'Clerk-Proxy-Url': 'https://evil.example',
    },
  }), env, async (request, options) => {
    calls++;
    assert.equal(request.url, 'https://frontend-api.clerk.dev/v1/client/sign_ins?test=1');
    assert.equal(request.method, 'POST');
    assert.equal(await request.text(), 'identifier=test%40example.test');
    assert.equal(request.headers.get('cookie'), '__client=fixture');
    assert.equal(request.headers.get('origin'), 'https://ascendflight.org');
    assert.equal(request.headers.get('x-forwarded-for'), '192.0.2.10');
    assert.equal(request.headers.get('clerk-secret-key'), env.CLERK_SECRET_KEY);
    assert.equal(request.headers.get('clerk-proxy-url'), env.CLERK_PROXY_URL);
    assert.equal(request.redirect, 'manual');
    assert.equal(options.cf.cacheTtl, 0);
    const headers = new Headers({ 'Cache-Control': 'public, max-age=3600', 'CDN-Cache-Control': 'public' });
    headers.append('Set-Cookie', '__client=one; Secure; HttpOnly; Path=/');
    headers.append('Set-Cookie', '__session=two; Secure; Path=/');
    return new Response('fixture', { status: 201, headers });
  });
  assert.equal(calls, 1);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('cdn-cache-control'), null);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.equal(await response.text(), 'fixture');
});

test('rewrites Clerk SDK redirects onto the same origin, preserving external OAuth redirects', async () => {
  for (const [location, expected] of [
    ['https://clerk.ascendflight.org/npm/version.js', 'https://ascendflight.org/__clerk/npm/version.js'],
    ['https://frontend-api.clerk.dev/npm/version.js', 'https://ascendflight.org/__clerk/npm/version.js'],
    ['/npm/version.js?q=1', 'https://ascendflight.org/__clerk/npm/version.js?q=1'],
    ['https://accounts.google.com/authorize', 'https://accounts.google.com/authorize'],
  ]) {
    const response = await proxyRequest(req('/__clerk/npm/current.js'), env,
      async () => new Response(null, { status: 307, headers: { Location: location } }));
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), expected);
  }
});

test('rejects wrong hosts, paths and missing configuration without sending the secret', async () => {
  const never = async () => { assert.fail('upstream must not be called'); };
  for (const path of ['/community/', '/__clerk-other/v1/client', '/__clerk/../v1/client']) {
    assert.equal((await proxyRequest(req(path), env, never)).status, 404);
  }
  assert.equal((await proxyRequest(new Request('https://evil.example/__clerk/v1/client'), env, never)).status, 404);
  assert.equal((await proxyRequest(req('/__clerk/v1/client'), { ...env, CLERK_SECRET_KEY: '' }, never)).status, 503);
  assert.equal((await proxyRequest(req('/__clerk/v1/client'), { ...env, CLERK_PROXY_URL: 'http://ascendflight.org/__clerk' }, never)).status, 503);
  assert.equal((await proxyRequest(new Request('https://ascendflight.org/__clerk/v1/client'), env, never)).status, 503);
});

test('user-controlled paths cannot change the fixed upstream host', async () => {
  for (const path of ['/__clerk//evil.example/x', '/__clerk/https://evil.example/x', '/__clerk/v1/client?url=https://evil.example']) {
    await proxyRequest(req(path), env, async request => {
      assert.equal(new URL(request.url).origin, 'https://frontend-api.clerk.dev');
      return new Response('ok');
    });
  }
});

test('upstream failures expose no credentials or provider internals', async () => {
  const response = await proxyRequest(req('/__clerk/v1/client'), env,
    async () => { throw Error(env.CLERK_SECRET_KEY); });
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes(env.CLERK_SECRET_KEY), false);
});
