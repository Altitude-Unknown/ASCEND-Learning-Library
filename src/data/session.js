export async function initializeClerk(element) {
  const { clerkKey, clerkDomain, clerkProxyPath } = element.dataset;
  if (!clerkKey || !clerkDomain) throw new Error('Team sign-in is still being configured.');
  if (clerkProxyPath && clerkProxyPath !== '/__clerk') throw new Error('Sign-in connection is not configured correctly.');
  const proxyUrl = clerkProxyPath ? location.origin + clerkProxyPath : undefined;
  const base = proxyUrl || `https://${clerkDomain}`;
  let stage = 'interface download';
  const load = (src, attributes = {}) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
    const timer = setTimeout(() => finish(new Error('timeout')), 20000);
    function finish(error) {
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) { script.remove(); reject(error); } else resolve();
    }
    script.onload = () => finish();
    script.onerror = () => finish(new Error('download'));
    document.head.appendChild(script);
  });
  try {
    await load(`${base}/npm/@clerk/ui@1/dist/ui.browser.js`);
    stage = 'authentication download';
    await load(`${base}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, {
      'data-clerk-publishable-key': clerkKey,
      ...(proxyUrl ? { 'data-clerk-proxy-url': proxyUrl } : {}),
    });
    stage = 'authentication connection';
    let timer;
    try {
      await Promise.race([
        window.Clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor }, ...(proxyUrl ? { proxyUrl } : {}) }),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 20000); }),
      ]);
    } finally { clearTimeout(timer); }
    return window.Clerk;
  } catch (error) {
    // Keep account data, tokens, query strings, and provider error bodies out of diagnostics.
    element.querySelector('[data-sign-in-help]')?.remove();
    const help = document.createElement('div');
    help.dataset.signInHelp = '';
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.className = 'button outline';
    retry.textContent = 'Retry sign-in';
    retry.addEventListener('click', () => location.reload());
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Connection details for support';
    const info = document.createElement('p');
    info.textContent = `Sign-in ${stage} ${error?.message === 'timeout' ? 'timed out' : 'failed'}. Service: ${base}. Page: ${location.pathname}. Time: ${new Date().toISOString()}.`;
    details.append(summary, info);
    help.append(retry, details);
    element.append(help);
    throw new Error('Unable to connect to sign-in. Retry, or share the connection details below with ASCEND support.');
  }
}
