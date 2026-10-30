import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Community points to Zulip, thanks the sponsor, and loads no sign-in', async ({page}) => {
 const signIn = [];
 page.on('request', request => { if (/clerk/.test(request.url())) signIn.push(request.url()); });
 for (const width of [1280, 390]) {
  await page.setViewportSize({width, height: 900});
  await page.goto('/community/');
  await expect(page.locator('h1')).toHaveText('Community');
  await expect(page.getByRole('link', {name: 'Open ASCEND on Zulip →'})).toHaveAttribute('href', 'https://ascendflight.zulipchat.com/');
  await expect(page.getByRole('heading', {name: 'Proudly sponsored by Zulip'})).toBeVisible();
  await expect(page.locator('form, #community-board')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  const scan = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations).toEqual([]);
 }
 expect(signIn).toEqual([]);
});
