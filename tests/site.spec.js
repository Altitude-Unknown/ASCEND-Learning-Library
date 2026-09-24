import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [1440,768,390,320]) {
 test(`Responsive pages and accessibility at ${width}px`, async ({page}) => {
  await page.setViewportSize({width, height:1000});
  for (const path of ['/','/part107/','/part107/airspace/','/resources/airspace-video/','/library/','/teachers/','/downloads/','/videos/']) {
   await page.goto(path);
   await expect(page.locator('h1')).toHaveCount(1);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1)).toBeTruthy();
   const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
   expect(scan.violations, JSON.stringify(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({html:n.html,summary:n.failureSummary}))})),null,2)).toEqual([]);
  }
 });
}
test('Filter combinations, empty state, clear, and shareable query', async({page})=>{
 await page.goto('/library/?topic=fabrication');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
 await expect(page.locator('[data-resource]:visible')).toContainText('Sensor Mount');
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-resource]:visible')).toHaveCount(9);
 await page.getByLabel('Search this collection').fill('PurpleAir');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
 await page.getByLabel('Audience',{exact:true}).selectOption('Mentors');
 await expect(page.locator('[data-empty]')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-resource]:visible')).toHaveCount(9);
});
test('Site search resolves the requested example terms',async({page})=>{
 for(const term of ['airspace','PurpleAir','STL','Part 107','balloon tracking','PM2.5']) {
  await page.goto('/search/?q='+encodeURIComponent(term));
  await expect(page.locator('.pagefind-ui__result-link').first()).toBeVisible({timeout:15000});
  expect(await page.locator('.pagefind-ui__result-link').count()).toBeGreaterThan(0);
 }
 const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(scan.violations).toEqual([]);
});
test('Keyboard navigation and mobile menu',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to main content'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page.locator('#main')).toBeFocused();
 const summary=page.locator('.topic-menu summary');await summary.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('navigation',{name:'Explore all topics'})).toBeVisible();
 await page.keyboard.press('Escape');await expect(summary).toBeFocused();
 await expect(page.getByRole('navigation',{name:'Explore all topics'})).not.toBeVisible();
});
test('No fabricated files or unsolicited YouTube embeds', async({page})=>{
 await page.goto('/resources/airspace-video/');
 await expect(page.locator('iframe')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Watch video'})).toBeDisabled();
 await page.goto('/resources/sensor-mount/');
 await expect(page.getByRole('button',{name:'Download STL'})).toBeDisabled();
});
test('Pages and resource links remain usable without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();
 await page.goto('http://127.0.0.1:8080/library/');await expect(page.locator('[data-resource]')).toHaveCount(9);
 await page.getByRole('link',{name:'Airspace Student Worksheet',exact:true}).click();
 await expect(page.locator('h1')).toHaveText('Airspace Student Worksheet');await context.close();
});
