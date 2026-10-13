import { initializeClerk } from "./session.js";
const root = document.getElementById('team-portal');
const status = document.getElementById('team-status');
async function start() {
  const { clerkKey, clerkDomain, api } = root.dataset;
  if (!clerkKey || !api) throw new Error('Team sign-in is still being configured.');
  const clerk = await initializeClerk(root);
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
  status.textContent = 'Login verified.';
  if (body.account.role === 'team') await workspace(clerk);
  else status.textContent = 'Administrator login verified. Review tools are being prepared.';
}
async function workspace(clerk) {
  const section = document.getElementById('team-workspace');
  const missionStatus = document.getElementById('mission-status');
  async function request(path, options = {}) {
    if (!clerk.session) throw new Error('Sign in again to continue.');
    const token = await clerk.session.getToken();
    const response = await fetch(root.dataset.api + path, { ...options, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed.');
    return body;
  }
  async function refresh() {
    const data = await request('/api/team/workspace');
    const missions = document.getElementById('my-missions'), uploads = document.getElementById('my-uploads');
    const list = (element, rows, label) => {
      element.replaceChildren();
      if (!rows.length) { element.textContent = 'None yet.'; return; }
      const ul = document.createElement('ul');
      rows.forEach(row => { const li = document.createElement('li'); li.textContent = label(row); ul.append(li); });
      element.append(ul);
    };
    list(missions, data.missions, row => `${row.name} · ${row.mission_date.slice(0,10)} · ${row.visibility} / ${row.publication_status}${row.synthetic ? ' · SYNTHETIC' : ''}`);
    list(uploads, data.files, row => `${row.original_filename} · ${row.row_count} rows · ${row.import_status}`);
    if (data.truncated) missionStatus.textContent = 'Showing the most recent 1,000 records.';
  }
  await refresh();
  section.hidden = false;
  const form = document.getElementById('mission-form');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button'); button.disabled = true;
    missionStatus.textContent = 'Creating private mission…';
    try {
      const input = Object.fromEntries(new FormData(form)); input.synthetic = form.elements.synthetic.checked;
      await request('/api/team/missions', { method: 'POST', body: JSON.stringify(input) });
      form.reset(); await refresh();
      missionStatus.textContent = 'Private mission created. You can now upload its CSV.';
    } catch (error) { missionStatus.textContent = error.message; }
    finally { button.disabled = false; }
  });
}
start().catch(error => { status.textContent = error.message; });
