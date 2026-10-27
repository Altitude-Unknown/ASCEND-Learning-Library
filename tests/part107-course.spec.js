import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Course follows the five-unit sequence and opens the matching quiz', async ({page}) => {
  await page.goto('/part107/');
  await page.getByRole('link', {name:'Start Unit 1: Regulations →'}).click();
  for (const title of ['Regulations', 'Airspace', 'Weather', 'Loading and Performance', 'UAS Operations']) {
    await expect(page.locator('h1')).toHaveText(title);
    await page.getByRole('navigation', {name:'Course sequence'}).getByRole('link', {name:/^Next:/}).click();
  }
  await expect(page.locator('#practice-bank')).toHaveValue('mixed');
  await page.getByRole('button', {name:'Start practice', exact:true}).click();
  await expect(page.locator('.practice-question')).toHaveCount(50);
  await page.goto('/part107/');
  await page.getByRole('link', {name:'Practice the full Loading & Performance bank →', exact:true}).click();
  await expect(page.locator('#practice-bank')).toHaveValue('Loading and Performance');
  await expect(page.locator('#practice-count')).toHaveValue('all');
  await page.getByRole('button', {name:'Start practice', exact:true}).click();
  expect(await page.locator('.practice-question').count()).toBeGreaterThan(10);
  await expect(page.locator('.practice-question-meta').first()).toContainText('Loading and Performance');
});

test('Course remains readable and accessible across screen sizes', async ({page}) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({width, height:1000});
    await page.goto('/part107/');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
    if(width===1440 || width===390) await page.screenshot({path:`artifacts/part107-course-${width}.png`, fullPage:true});
  }
});

test('Course resources and sequence work without JavaScript', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:8081/part107/');
  await page.getByRole('link', {name:'Study Unit 4: Loading & Performance →'}).click();
  await expect(page.locator('h1')).toHaveText('Loading and Performance');
  await page.getByRole('navigation', {name:'Course sequence'}).getByRole('link', {name:/^Next:/}).click();
  await expect(page.locator('h1')).toHaveText('UAS Operations');
  await context.close();
});
