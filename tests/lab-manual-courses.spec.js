import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFileSync, existsSync} from 'node:fs';

// Courses built from lab manual chapters by scripts/import-lab-manual.py.
// Add each new chapter's course here.
const COURSES = [
  {data: 'electricalBasicsCourse.json', url: '/electrical-basics/', title: 'Electrical Basics', images: 3},
  {data: 'uasHardwareCourse.json', url: '/uas-hardware/', title: 'UAS Hardware and Electronics', images: 88},
  {data: 'buildMultirotorCourse.json', url: '/build-multirotor/', title: 'Building a Multirotor UAS', images: 71},
  {data: 'flightControllersCourse.json', url: '/flight-controllers/', title: 'Flight Controllers', images: 6},
  {data: 'cameraVideoCourse.json', url: '/camera-video-systems/', title: 'Camera and Video Systems', images: 9},
  {data: 'advancedSensorsCourse.json', url: '/advanced-sensors/', title: 'Advanced Sensors', images: 6},
  {data: 'pidControllersCourse.json', url: '/pid-controllers/', title: 'PID Controllers', images: 0, equations: 6}
];
const axe = page => new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();

for (const spec of COURSES) {
  const course = JSON.parse(readFileSync(new URL(`../content/_data/${spec.data}`, import.meta.url), 'utf8'));
  const unitCount = course.units.length;

  test.describe(spec.title, () => {
    test('overview lists every unit and starts Unit 1', async ({page}) => {
      await page.goto(spec.url);
      await expect(page.locator('h1')).toHaveText(spec.title);
      await expect(page.locator('.course-unit')).toHaveCount(unitCount);
      for (const unit of course.units) await expect(page.locator(`#unit-${unit.number} a[href="${unit.url}#check"]`)).toHaveCount(1);
      await page.getByRole('link', {name: `Start Unit 1: ${course.units[0].title} →`}).click();
      await expect(page.locator('h1')).toHaveText(course.units[0].title);
      const scan = await axe(page);
      expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
    });

    test('every unit runs Watch, Read, Apply, Check', async ({page}) => {
      for (const width of [1280, 390]) {
        await page.setViewportSize({width, height: 900});
        for (const unit of course.units) {
          await page.goto(unit.url);
          await expect(page.locator('.module-content > .eyebrow')).toContainText(`UNIT ${unit.number} OF ${unitCount}`);
          expect(await page.locator('#lesson, #reading, #activity, #check').evaluateAll(n => n.map(x => x.id))).toEqual(['lesson', 'reading', 'activity', 'check']);
          for (const section of unit.readings) await expect(page.locator(`#reading a[href="${course.chapterUrl}#${section.id}"]`)).toHaveCount(1);
          for (const id of unit.activities) await expect(page.locator(`#activity a[href="/resources/${id}/"]`)).toHaveCount(1);
          // Every unit has something to do in Step 3.
          expect(unit.activities.length + (unit.practice ? 1 : 0)).toBeGreaterThan(0);
          await expect(page.locator('.unit-signoff li')).toHaveCount((unit.signoff || []).length);
          await expect(page.locator('.review-questions > li')).toHaveCount(unit.reviewQuestions.length);
          if (unit.skills) await expect(page.locator('#check .skills-checklist li')).toHaveCount(unit.skills.length);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
          if (width === 1280) {
            const scan = await axe(page);
            expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
          }
        }
      }
    });

    test('every review question is assigned to exactly one unit', () => {
      const assigned = course.units.flatMap(u => u.reviewQuestions).sort((a, b) => a - b);
      expect(assigned).toEqual(Object.keys(course.reviewQuestions).map(Number).sort((a, b) => a - b));
      for (const item of Object.values(course.reviewQuestions)) expect(item.answer.length).toBeGreaterThan(0);
    });

    test('the web chapter has every linked section, described images, and text equations', async ({page}) => {
      await page.goto(course.chapterUrl);
      const ids = course.units.flatMap(u => [...u.readings, ...(u.practice?.sections || [])].map(s => s.id));
      for (const id of ids) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
      const images = await page.locator('.textbook-content img').evaluateAll(imgs => imgs.map(i => ({src: i.getAttribute('src'), alt: i.alt})));
      expect(images.length).toBe(spec.images);
      for (const img of images) {
        expect(img.alt.length).toBeGreaterThan(20);
        expect(existsSync(new URL(`../public${img.src}`, import.meta.url))).toBeTruthy();
      }
      if (spec.equations) await expect(page.locator('.textbook-equation')).toHaveCount(spec.equations);
      await expect(page.locator('.textbook-content p:empty')).toHaveCount(0);
      for (const width of [1280, 390]) {
        await page.setViewportSize({width, height: 900});
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
      }
      const scan = await axe(page);
      expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
    });

    test('lab pages are readable web activities', async ({page}) => {
      for (const id of course.units.flatMap(u => u.activities)) {
        await page.goto(`/resources/${id}/`);
        await expect(page.getByText('Read this resource on this page.')).toBeVisible();
        const scan = await axe(page);
        expect(scan.violations, JSON.stringify(scan.violations)).toEqual([]);
      }
    });
  });
}
