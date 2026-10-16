import { test, expect } from '@playwright/test';

async function configure(page, { proxy = false, failure } = {}) {
  const calls = [];
  await page.route('**/community/', async route => {
    const response = await route.fetch();
    const html = (await response.text())
      .replace(/data-clerk-key="[^"]*"/, 'data-clerk-key="pk_test_Zml4dHVyZS5jbGVyay5hY2NvdW50cy5kZXYk"')
      .replace(/data-clerk-domain="[^"]*"/, 'data-clerk-domain="fixture.clerk.accounts.dev"')
      .replace(/data-clerk-proxy-path="[^"]*"/, `data-clerk-proxy-path="${proxy ? '/__clerk' : ''}"`);
    await route.fulfill({ response, body: html });
  });
  await page.route(/\/(?:__clerk\/)?npm\/@clerk\//, async route => {
    const url = route.request().url();
    calls.push(url);
    const ui = url.includes('/ui@');
    if ((failure === 'ui' && ui) || (failure === 'sdk' && !ui)) return route.abort('blockedbyclient');
    if (failure === 'timeout' && ui) return; // Let the loader timeout expire.
    await route.fulfill({ contentType: 'text/javascript', body: ui
      ? 'window.__internal_ClerkUICtor = function(){};'
      : `window.Clerk={session:null,load:async options=>{window.clerkLoadOptions=options;${failure === 'connection' ? 'throw Error("private-provider-detail");' : ''}},mountSignIn:el=>{el.textContent='Sign-in form';}};` });
  });
  return calls;
}

test('direct sign-in remains available when proxy has not been activated', async ({ page }) => {
  const calls = await configure(page);
  await page.goto('/community/');
  await expect(page.getByText('Sign-in form')).toBeVisible();
  expect(calls).toHaveLength(2);
  expect(calls.every(url => new URL(url).host === 'fixture.clerk.accounts.dev')).toBe(true);
  await expect(page.locator('[data-sign-in-help]')).toHaveCount(0);
});

test('proxy mode routes both scripts and SDK configuration through the website', async ({ page }) => {
  const calls = await configure(page, { proxy: true });
  await page.goto('/community/');
  await expect(page.getByText('Sign-in form')).toBeVisible();
  expect(calls).toHaveLength(2);
  expect(calls.every(url => url.startsWith('http://127.0.0.1:8081/__clerk/npm/'))).toBe(true);
  const proxyUrl = 'http://127.0.0.1:8081/__clerk';
  expect(await page.evaluate(() => window.clerkLoadOptions.proxyUrl)).toBe(proxyUrl);
  await expect(page.locator('script[data-clerk-proxy-url]')).toHaveAttribute('data-clerk-proxy-url', proxyUrl);
});

for (const [failure, stage] of [['ui', 'interface download'], ['sdk', 'authentication download'], ['connection', 'authentication connection']]) {
  test(`${stage} failure offers retry and safe support details without exposing discussions`, async ({ page }) => {
    await configure(page, { failure });
    await page.goto('/community/');
    await expect(page.locator('#community-status')).toContainText('Unable to connect to sign-in');
    await expect(page.getByRole('button', { name: 'Retry sign-in' })).toBeVisible();
    await page.getByText('Connection details for support').click();
    await expect(page.locator('[data-sign-in-help]')).toContainText(`Sign-in ${stage} failed`);
    await expect(page.locator('[data-sign-in-help]')).toContainText('https://fixture.clerk.accounts.dev');
    await expect(page.locator('[data-sign-in-help]')).not.toContainText('private-provider-detail');
    await expect(page.locator('#community-board')).toBeHidden();
  });
}

test('stalled sign-in downloads time out instead of leaving the page loading forever', async ({ page }) => {
  await page.clock.install();
  await configure(page, { failure: 'timeout' });
  await page.goto('/community/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('script[src*="/ui@"]')).toHaveCount(1);
  await page.clock.fastForward(21000);
  await expect(page.locator('#community-status')).toContainText('Unable to connect to sign-in');
  await page.getByText('Connection details for support').click();
  await expect(page.locator('[data-sign-in-help]')).toContainText('interface download timed out');
});
