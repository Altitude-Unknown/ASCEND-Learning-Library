import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT } from 'jose';
import { verifySession, requireAccount } from '../src/auth.js';
const env = { CLERK_ISSUER: 'https://clerk.example.test', ALLOWED_ORIGIN: 'https://site.example.test' };
const { privateKey, publicKey } = await generateKeyPair('RS256');
async function token(claims = {}) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ sub: 'user_teamA', iss: env.CLERK_ISSUER, azp: env.ALLOWED_ORIGIN, iat: now, nbf: now, exp: now + 60, ...claims }).setProtectedHeader({ alg: 'RS256' }).sign(privateKey);
}
test('verified session requires expected issuer, origin, time and signature', async () => {
  assert.equal(await verifySession(await token(), env, publicKey), 'user_teamA');
  for (const claims of [{ iss: 'https://other.test' }, { azp: 'https://other.test' }, { exp: 1 }, { sub: '' }])
    await assert.rejects(verifySession(await token(claims), env, publicKey), error => error.status === 401);
  const { publicKey: wrongKey } = await generateKeyPair('RS256');
  await assert.rejects(verifySession(await token(), env, wrongKey), error => error.status === 401);
});
test('no membership is granted merely by logging in', async () => {
  let args;
  await assert.rejects(requireAccount({ query: async (sql, values) => { assert.match(sql, /active=true/); args = values; return { rows: [] }; } }, 'user_teamA'), error => error.status === 403);
  assert.deepEqual(args, ['user_teamA']);
});
