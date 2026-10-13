import { createRemoteJWKSet, jwtVerify } from 'jose';

const keys = new Map();
function denied(message, status = 401) {
  throw Object.assign(new Error(message), { status });
}
export async function verifySession(token, env, verificationKey) {
  const issuer = env.CLERK_ISSUER;
  if (!issuer || !env.ALLOWED_ORIGIN) denied('Team login is not configured.', 503);
  const url = new URL(issuer);
  if (url.protocol !== 'https:' || url.origin !== issuer)
    denied('Team login is not configured.', 503);
  if (!token || token.length > 16384) denied('Sign in to continue.');
  let key = verificationKey;
  if (!key) {
    if (!keys.has(issuer)) keys.set(issuer, createRemoteJWKSet(new URL('/.well-known/jwks.json', issuer)));
    key = keys.get(issuer);
  }
  let payload;
  try {
    ({ payload } = await jwtVerify(token, key, {
      issuer, algorithms: ['RS256'], requiredClaims: ['sub', 'exp', 'iat', 'nbf', 'azp'],
      maxTokenAge: '10 minutes', clockTolerance: 5,
    }));
  } catch {
    denied('Your login has expired or is invalid. Sign in again.');
  }
  if (typeof payload.sub !== 'string' || !payload.sub.startsWith('user_') || payload.sub.length > 255 || payload.azp !== env.ALLOWED_ORIGIN)
    denied('Your login is not authorized for this website.');
  return payload.sub;
}
export async function requireAccount(db, subject) {
  const { rows } = await db.query(
    'SELECT subject,role,team_id FROM portal_accounts WHERE subject=$1 AND active=true', [subject],
  );
  if (rows.length !== 1) denied('Your account has not been assigned access. Contact the ASCEND administrator.', 403);
  return rows[0];
}
