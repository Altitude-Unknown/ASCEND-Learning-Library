import {test, expect} from '@playwright/test';

async function setup(page, {enrollmentStatus = 'active', role = 'member', requests = []} = {}) {
 const calls = [];
 await page.route('**/data/team/', async route => {
  const response = await route.fetch();
  const html = (await response.text()).replace(/data-api="[^"]*"/, 'data-api="https://portal-api.example.test"')
   .replace(/data-clerk-key="[^"]*"/, 'data-clerk-key="pk_test_Zml4dHVyZS5jbGVyay5hY2NvdW50cy5kZXYk"')
   .replace(/data-clerk-domain="[^"]*"/, 'data-clerk-domain="fixture.clerk.accounts.dev"');
  await route.fulfill({response, body: html});
 });
 await page.route('https://fixture.clerk.accounts.dev/**', route => route.fulfill({contentType: 'text/javascript',
  body: 'window.Clerk={load:async()=>{},session:{getToken:async()=>"test-session"},mountUserButton:()=>{}};'}));
 await page.route('https://portal-api.example.test/**', async route => {
  const request = route.request();
  if (request.method() === 'OPTIONS') return route.fulfill({status: 204, headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,POST'}});
  const path = new URL(request.url()).pathname;
  calls.push({method: request.method(), path, body: request.postDataJSON()});
  let body;
  if (path === '/api/team/enrollment') body = {status: request.method() === 'POST' ? 'pending' : enrollmentStatus};
  else if (path === '/api/team/community/membership') { if (request.method() === 'POST') requests = []; body = request.method() === 'POST' ? {saved: true} : {data: requests}; }
  else if (path === '/api/team/me') body = {account: {role, team_id: null}, team: null};
  else body = {};
  await route.fulfill({json: body, headers: {'Access-Control-Allow-Origin': '*'}});
 });
 return calls;
}

test('new accounts request membership in the member workspace', async ({page}) => {
 const calls = await setup(page, {enrollmentStatus: 'unregistered'});
 await page.goto('/data/team/');
 await page.getByLabel('Your name', {exact: true}).fill('New member');
 await page.getByLabel('School or project affiliation').fill('Example College');
 await page.getByRole('button', {name: 'Request membership'}).click();
 await expect(page.locator('#team-status')).toContainText('waiting for approval');
 await expect(page.locator('#enrollment-form')).toBeHidden();
 expect(calls.find(call => call.method === 'POST').body).toEqual({display_name: 'New member', affiliation: 'Example College'});
 expect(calls.some(call => call.path === '/api/team/me')).toBe(false);
});

test('pending accounts see their status without the workspace', async ({page}) => {
 const calls = await setup(page, {enrollmentStatus: 'pending'});
 await page.goto('/data/team/');
 await expect(page.locator('#team-status')).toContainText('waiting for approval');
 await expect(page.locator('#enrollment-form')).toBeHidden();
 expect(calls.some(call => call.path === '/api/team/me')).toBe(false);
});

test('moderators approve membership requests in the member workspace', async ({page}) => {
 const calls = await setup(page, {role: 'moderator', requests: [{subject: 'user_new', display_name: 'New member', affiliation: 'Example College'}]});
 await page.goto('/data/team/');
 await expect(page.getByRole('heading', {name: 'Membership requests'})).toBeVisible();
 await expect(page.locator('#membership-requests')).toContainText('Example College');
 await page.getByRole('button', {name: 'Approve member'}).click();
 await expect(page.locator('#membership-requests')).toHaveText('No pending requests.');
 expect(calls.find(call => call.method === 'POST' && call.path === '/api/team/community/membership').body).toEqual({subject: 'user_new', action: 'approve'});
});

test('ordinary members do not see the membership review', async ({page}) => {
 const calls = await setup(page);
 await page.goto('/data/team/');
 await expect(page.locator('#team-status')).toContainText('Login verified');
 await expect(page.locator('#membership-review')).toBeHidden();
 expect(calls.some(call => call.path === '/api/team/community/membership')).toBe(false);
});
