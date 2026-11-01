import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';

const software = JSON.parse(readFileSync(new URL('../content/_data/software.json', import.meta.url), 'utf8'));

test('Software page lists every app with current download links', async ({page}) => {
 for (const width of [1280, 390, 320]) {
  await page.setViewportSize({width, height: 900});
  await page.goto('/software/');
  await expect(page.locator('h1')).toHaveText('Software');
  for (const app of software.apps) {
   const card = page.locator('.software-card', {has: page.getByRole('heading', {name: app.name, exact: true})});
   await expect(card).toHaveCount(1);
   const download = card.getByRole('link', {name: /^Download latest/});
   if (app.download) {
    expect(app.download).toMatch(/^https:\/\/github\.com\/Altitude-Unknown\/[^/]+\/releases\/latest$/);
    await expect(download).toHaveAttribute('href', app.download);
   } else {
    await expect(download).toHaveCount(0);
   }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  const scan = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations).toEqual([]);
 }
});

test('Software is in the header, mobile menu, and footer', async ({page}) => {
 await page.setViewportSize({width: 1280, height: 900});
 await page.goto('/');
 await page.getByRole('navigation', {name: 'Primary navigation'}).getByRole('link', {name: 'Software'}).click();
 await expect(page).toHaveURL(/\/software\/$/);
 await expect(page.getByRole('navigation', {name: 'Primary navigation'}).getByRole('link', {name: 'Software'})).toHaveAttribute('aria-current', 'page');
 await expect(page.locator('.site-footer').getByRole('link', {name: 'Software'})).toHaveAttribute('href', '/software/');
 await page.setViewportSize({width: 390, height: 900});
 await page.locator('.topic-menu summary').click();
 await expect(page.getByRole('navigation', {name: 'Site menu'}).getByRole('link', {name: 'Software downloads'})).toHaveAttribute('href', '/software/');
});
