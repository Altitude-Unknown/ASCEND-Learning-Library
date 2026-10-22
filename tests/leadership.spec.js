import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Leadership profiles preserve PI priority, surname order, and accessible layouts', async ({page}) => {
 for (const width of [1440, 768, 390, 320]) {
  await page.setViewportSize({width, height: 1000});
  await page.goto('/leadership/');
  await expect(page.locator('h1')).toHaveText('ASCEND Leadership');
  await expect(page.locator('.leadership-profile h2')).toHaveText([
   'Mike Walach, Ph.D.', 'Katelyn Barber, Ph.D.', 'Matthew Bernards',
   'Beth A. Covitt', 'Jie Gong', 'Marissa Saad', 'Jill Schmidt, Ph.D.'
  ]);
  await expect(page.locator('.leadership-profile').first()).toContainText('Principal Investigator');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  for (const portrait of await page.locator('.leadership-portrait').all()) {
   await portrait.scrollIntoViewIfNeeded();
   await expect.poll(() => portrait.evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  }
  const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(scan.violations).toEqual([]);
 }
 await page.goto('/');
 await page.locator('.program-introduction').getByRole('link', {name: 'ASCEND Leadership', exact: true}).click();
 await expect(page).toHaveURL(/\/leadership\/$/);
});
