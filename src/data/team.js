const root = document.getElementById('team-portal');
const status = document.getElementById('team-status');
async function loadScript(src, attributes = {}) {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load sign-in. Please refresh or try again later.'));
    document.head.appendChild(script);
  });
}
async function start() {
  const { clerkKey, clerkDomain, api } = root.dataset;
  if (!clerkKey || !api) throw new Error('Team sign-in is still being configured.');
  await loadScript(`https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`);
  await loadScript(`https://${clerkDomain}/npm/@clerk/clerk-js@6/dist/clerk.browser.js`, { 'data-clerk-publishable-key': clerkKey });
  const clerk = window.Clerk;
  await clerk.load({ ui: { ClerkUI: window.__internal_ClerkUICtor } });
  if (!clerk.session) {
    status.textContent = 'Sign in with your team email and password.';
    clerk.mountSignIn(document.getElementById('team-sign-in'), { forceRedirectUrl: location.origin + '/data/team/' });
    return;
  }
  document.getElementById('team-account').hidden = false;
  clerk.mountUserButton(document.getElementById('team-user-button'));
  const token = await clerk.session.getToken();
  const response = await fetch(api + '/api/team/me', { headers: { Authorization: 'Bearer ' + token } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'Could not load your account.');
  document.getElementById('team-name').textContent = body.team?.name || 'ASCEND administration';
  document.getElementById('team-role').textContent = body.account.role === 'administrator' ? 'Program administrator' : 'Team account';
  status.textContent = 'Login verified. Mission creation and team uploads are being prepared.';
}
start().catch(error => { status.textContent = error.message; });
