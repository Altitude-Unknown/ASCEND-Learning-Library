// Read-only production smoke test: renders forms; never submits credentials.
import { chromium, firefox } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const results = [];
await mkdir('artifacts/access-audit', { recursive: true });
for (const [name, engine] of Object.entries({ chromium, firefox })) {
  let browser;
  try {
    browser = await engine.launch({ headless: true });
    for (const [path, rootId, formId] of [
      ['/community/', 'community', 'community-sign-in'],
      ['/data/team/', 'team-portal', 'team-sign-in'],
    ]) {
      const page = await browser.newPage();
      const origins = new Set();
      const failures = [];
      const errors = [];
      const safeUrl = value => {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) ? url.origin + url.pathname : url.protocol;
      };
      page.on('request', request => {
        const url = new URL(request.url());
        if (url.protocol === 'https:') origins.add(url.origin);
      });
      page.on('requestfailed', request => failures.push({ url: safeUrl(request.url()), error: request.failure()?.errorText }));
      page.on('response', response => {
        if (response.status() >= 400) errors.push({ url: safeUrl(response.url()), status: response.status() });
      });
      let loaded = false;
      try {
        await page.goto('https://ascendflight.org' + path, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.locator(`#${formId} input`).first().waitFor({ timeout: 30000 });
        loaded = true;
      } catch {
        process.exitCode = 1;
      }
      const configuration = await page.locator(`#${rootId}`).evaluate(element => ({
        api: element.dataset.api,
        signInHost: element.dataset.clerkDomain,
        proxyPath: element.dataset.clerkProxyPath || null,
      })).catch(() => null);
      // Snapshot before closing the page so teardown aborts are not reported as failures.
      results.push({ browser: name, path, formLoaded: loaded, configuration, origins: [...origins], failures: [...failures], errors: [...errors] });
      await page.close();
    }
  } catch (error) {
    results.push({ browser: name, error: error.message });
    process.exitCode = 1;
  } finally {
    await browser?.close();
  }
}
const report = { checkedAt: new Date().toISOString(), results };
await writeFile('artifacts/access-audit/live-sign-in.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
