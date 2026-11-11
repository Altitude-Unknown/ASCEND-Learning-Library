import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync} from 'node:fs';

const course = JSON.parse(readFileSync(new URL('../content/_data/learnToFlyCourse.json', import.meta.url), 'utf8'));

test('Course overview lists all six units in order and starts Unit 1', async ({page}) => {
  await page.goto('/learn-to-fly/');
  await expect(page.locator('h1')).toHaveText('Learning to Fly a UAS');
  await expect(page.locator('.course-unit')).toHaveCount(6);
  for (const unit of course.units) {
    const link = page.locator(`#unit-${unit.number} a[href="${unit.url}#check"]`);
    await expect(link).toHaveCount(1);
  }
  await page.locator('#unit-1 a[href$="#check"]').click();
  await expect(page.locator('#check')).toBeInViewport();
  await page.goto('/learn-to-fly/');
  await page.getByRole('link', {name: 'Start Unit 1: Flying Fixed Wings →'}).click();
  await expect(page.locator('h1')).toHaveText('Flying Fixed Wings');
});

test('Every unit follows Watch, Read, Apply, Check and links to the next unit', async ({page}) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({width, height: 900});
    for (const unit of course.units) {
      await page.goto(unit.url);
      await expect(page.locator('.module-content > .eyebrow')).toContainText(`UNIT ${unit.number} OF 6`);
      const order = await page.locator('#lesson, #reading, #activity, #check').evaluateAll(nodes => nodes.map(n => n.id));
      expect(order).toEqual(['lesson', 'reading', 'activity', 'check']);
      await expect(page.locator('#lesson')).not.toContainText('Coming soon');
      for (const section of unit.readings) {
        await expect(page.locator(`#reading a[href="${course.chapterUrl}#${section.id}"]`)).toHaveCount(1);
      }
      for (const id of unit.activities) {
        await expect(page.locator(`#activity a[href="/resources/${id}/"]`)).toHaveCount(1);
      }
      await expect(page.locator('.review-questions > li')).toHaveCount(unit.reviewQuestions.length);
      if (unit.skills) await expect(page.locator('.skills-checklist li')).toHaveCount(unit.skills.length);
      const next = page.getByRole('navigation', {name: 'Course sequence'}).getByRole('link', {name: /^Next:/});
      await expect(next).toHaveAttribute('href', unit.number < 6 ? course.units[unit.number].url : '/learn-to-fly/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
      const scan = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
    }
  }
});

test('Review answers stay hidden until opened', async ({page}) => {
  await page.goto('/learn-to-fly/flying-fixed-wings/');
  const first = page.locator('.review-questions details').first();
  await expect(first.locator('p')).toBeHidden();
  await first.locator('summary').click();
  await expect(first.locator('p')).toContainText('into the wind');
});

test('Every review question is assigned to exactly one unit', async () => {
  const assigned = course.units.flatMap(unit => unit.reviewQuestions).sort((a, b) => a - b);
  expect(assigned).toEqual(Object.keys(course.reviewQuestions).map(Number).sort((a, b) => a - b));
});

test('The web chapter has every section the units link to, with described figures', async ({page}) => {
  await page.goto(course.chapterUrl);
  for (const id of course.units.flatMap(unit => unit.readings.map(r => r.id))) await expect(page.locator(`#${id}`)).toHaveCount(1);
  for (const img of await page.locator('.textbook-content img').all()) expect((await img.getAttribute('alt')).length).toBeGreaterThan(20);
  const scan = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
});

test('Activities read as web pages, and the weight and balance key is corrected', async ({page}) => {
  for (const id of course.units.flatMap(unit => unit.activities)) {
    await page.goto(`/resources/${id}/`);
    await expect(page.getByText('Read this resource on this page.')).toBeVisible();
    for (const img of await page.locator('.prose img').all()) expect((await img.getAttribute('alt')).length).toBeGreaterThan(20);
    const scan = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
  }
  await page.goto('/resources/fly-weight-and-balance-lab/');
  await expect(page.locator('.answer-key')).toHaveCount(5);
  await page.getByText('Show the answer to problem 1').click();
  await expect(page.locator('.answer-key').first()).toContainText('43.04');
  await page.goto('/resources/fly-checkride-rubrics/');
  await expect(page.locator('h2[id^="flight-"]')).toHaveCount(5);
});

test('The old Unit 1 address redirects to Flying Fixed Wings', () => {
  const rules = readFileSync(new URL('../public/_redirects', import.meta.url), 'utf8');
  expect(rules).toContain('/learn-to-fly/getting-started/ /learn-to-fly/flying-fixed-wings/ 301');
});

test('Units show their own short videos, or point to the reading when there are none', async ({page}) => {
  await page.goto('/learn-to-fly/flying-fixed-wings/');
  for (const id of ['control-surfaces-video', 'buddy-box-video', 'first-takeoff-video', 'hand-launch-video', 'landing-video']) {
    await expect(page.locator(`#lesson .unit-videos a[href="/resources/${id}/"]`)).toHaveCount(1);
  }
  await expect(page.locator('#activity a[href$="-video/"]')).toHaveCount(0);
  await page.goto('/learn-to-fly/flying-multirotors/');
  await expect(page.locator('#lesson .resource-card')).toHaveCount(0);
  await expect(page.locator('#lesson')).toContainText('This unit has no videos yet');
  await page.goto('/learn-to-fly/');
  await expect(page.locator('#unit-1 a[href="/resources/landing-video/"]')).toHaveCount(1);
  await expect(page.locator('#learning-path')).not.toContainText('coming soon');
});
