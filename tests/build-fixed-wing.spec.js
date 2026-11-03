import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync, existsSync} from 'node:fs';

const course = JSON.parse(readFileSync(new URL('../content/_data/buildFixedWingCourse.json', import.meta.url), 'utf8'));
const axe = page => new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();

test('Course overview lists six units with links to their questions', async ({page}) => {
  await page.goto('/build-fixed-wing/');
  await expect(page.locator('h1')).toHaveText('Building a Fixed-Wing UAS');
  await expect(page.locator('.course-unit')).toHaveCount(6);
  for (const unit of course.units) await expect(page.locator(`#unit-${unit.number} a[href="${unit.url}#check"]`)).toHaveCount(1);
  await page.getByRole('link', {name: 'Start Unit 1: Getting Ready →'}).click();
  await expect(page.locator('h1')).toHaveText('Getting Ready');
});

test('Every unit runs Watch, Read, Build, Check with sign-off skills', async ({page}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({width, height: 900});
    for (const unit of course.units) {
      await page.goto(unit.url);
      await expect(page.locator('.module-content > .eyebrow')).toContainText(`UNIT ${unit.number} OF 6`);
      expect(await page.locator('#lesson, #reading, #activity, #check').evaluateAll(n => n.map(x => x.id))).toEqual(['lesson', 'reading', 'activity', 'check']);
      for (const section of unit.readings) await expect(page.locator(`#reading a[href="${course.chapterUrl}#${section.id}"]`)).toHaveCount(1);
      await expect(page.locator('.unit-build-card')).toHaveCount(1);
      for (const id of unit.activities) await expect(page.locator(`#activity a[href="/resources/${id}/"]`)).toHaveCount(1);
      await expect(page.locator('.unit-signoff li')).toHaveCount(unit.signoff.length);
      await expect(page.locator('.review-questions > li')).toHaveCount(unit.reviewQuestions.length);
      if (unit.skills) await expect(page.locator('#check .skills-checklist li')).toHaveCount(unit.skills.length);
      expect(await page.evaluate(() => document.querySelectorAll('[id]').length === new Set([...document.querySelectorAll('[id]')].map(e => e.id)).size)).toBeTruthy();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
      const scan = await axe(page);
      expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
    }
  }
});

test('Every review question is assigned to exactly one unit', () => {
  const assigned = course.units.flatMap(u => u.reviewQuestions).sort((a, b) => a - b);
  expect(assigned).toEqual(Object.keys(course.reviewQuestions).map(Number).sort((a, b) => a - b));
});

test('The web chapter has every linked section and a description for every image', async ({page}) => {
  await page.goto(course.chapterUrl);
  const ids = course.units.flatMap(u => [...u.readings, ...u.build.sections].map(s => s.id));
  for (const id of ids) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
  const images = await page.locator('.textbook-content img').evaluateAll(imgs => imgs.map(i => ({src: i.getAttribute('src'), alt: i.alt})));
  expect(images.length).toBeGreaterThan(140);
  for (const img of images) {
    expect(img.alt.length).toBeGreaterThan(20);
    expect(existsSync(new URL(`../public${img.src}`, import.meta.url))).toBeTruthy();
  }
  await expect(page.locator('.parts-grid li')).toHaveCount(15);
  await expect(page.getByRole('table', {name: /Control direction check/})).toBeVisible();
  await expect(page.locator('#terminology + .key-terms dt')).toHaveCount(18);
  await expect(page.locator('.textbook-content')).not.toContainText('2.8');
  const scan = await axe(page);
  expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
});

test('The control surface lab is a web page with a 100-point score sheet', async ({page}) => {
  await page.goto('/resources/fw-control-surface-lab/');
  await expect(page.getByText('Read this resource on this page.')).toBeVisible();
  await expect(page.getByRole('table', {name: /Score sheet/}).locator('tbody tr')).toHaveCount(13);
  for (const img of await page.locator('.prose img').all()) expect((await img.getAttribute('alt')).length).toBeGreaterThan(20);
  const scan = await axe(page);
  expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
});
