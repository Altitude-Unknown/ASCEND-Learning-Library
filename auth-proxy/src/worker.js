// Clerk Frontend API proxy. This worker must only receive the /__clerk route.
// https://clerk.com/docs/guides/dashboard/dns-domains/proxy-fapi
const upstreamOrigin = 'https://frontend-api.clerk.dev';
const methods = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

function unavailable(status, message) {
  return Response.json({ error: message }, {
    status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

export async function proxyRequest(request, env, upstreamFetch = fetch) {
  const url = new URL(request.url);
  let proxy;
  try {
    proxy = new URL(env.CLERK_PROXY_URL);
    if (proxy.protocol !== 'https:' || proxy.pathname !== '/__clerk' ||
        proxy.username || proxy.password || proxy.search || proxy.hash) throw Error();
  } catch {
    return unavailable(503, 'Sign-in connection is not configured.');
  }
  if (url.origin !== proxy.origin || !url.pathname.startsWith('/__clerk/')) {
    return unavailable(404, 'Not found.');
  }
  if (!methods.has(request.method)) return unavailable(405, 'Method not allowed.');
  if (!env.CLERK_SECRET_KEY || !request.headers.get('CF-Connecting-IP')) {
    return unavailable(503, 'Sign-in connection is not configured.');
  }
  // A fixed upstream prevents this route from becoming an open proxy.
  const target = new URL(upstreamOrigin + url.pathname.slice('/__clerk'.length) + url.search);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('forwarded');
  headers.delete('x-forwarded-host');
  headers.set('Clerk-Proxy-Url', proxy.href);
  headers.set('Clerk-Secret-Key', env.CLERK_SECRET_KEY);
  // Trust Cloudflare's header, never a client-supplied X-Forwarded-For chain.
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP'));
  headers.set('Cache-Control', 'no-store');
  const init = {
    method: request.method, headers, redirect: 'manual',
    ...(!['GET', 'HEAD'].includes(request.method) ? { body: request.body, duplex: 'half' } : {}),
  };
  let response;
  try {
    response = await upstreamFetch(new Request(target, init), {
      cf: { cacheTtl: 0, cacheEverything: false },
    });
  } catch {
    return unavailable(502, 'Sign-in service could not be reached.');
  }
  const output = new Headers(response.headers);
  output.set('Cache-Control', 'no-store');
  output.delete('CDN-Cache-Control');
  output.delete('Cloudflare-CDN-Cache-Control');
  output.set('X-Content-Type-Options', 'nosniff');
  // Versioned SDK redirects must stay on the website's authentication route.
  const location = output.get('Location');
  if (location) {
    const redirect = new URL(location, target);
    if ([upstreamOrigin, env.CLERK_FRONTEND_ORIGIN].includes(redirect.origin)) {
      output.set('Location', proxy.href + redirect.pathname + redirect.search + redirect.hash);
    }
  }
  return new Response(response.body, {
    status: response.status, statusText: response.statusText, headers: output,
  });
}

export default { fetch: (request, env) => proxyRequest(request, env) };
