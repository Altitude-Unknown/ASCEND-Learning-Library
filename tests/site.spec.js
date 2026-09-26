import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [1440,768,390,320]) {
 test(`Responsive pages and accessibility at ${width}px`, async ({page}) => {
  await page.setViewportSize({width, height:1000});
  for (const path of ['/','/part107/','/part107/airspace/','/resources/airspace-video/','/library/','/teachers/','/downloads/','/videos/','/uas/trainer-airplane/','/uas/fixed-wing-research/','/resources/remote-aircraft-textbook/','/resources/trainer-tpu-parts/','/resources/flight-lab-rc/','/resources/transmitter-configurator/','/resources/regulations-video/','/resources/weather-activity/','/resources/yellowstone-guide/','/about/','/science/','/project/']) {
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
 await expect(page.locator('[data-resource]:visible')).toHaveCount(10);
 await expect(page.locator('[data-resource]:visible').filter({hasText:'Sensor Mount'})).toHaveCount(1);
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-resource]:visible')).toHaveCount(43);
 await page.getByLabel('Search this collection').fill('PurpleAir');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
 await page.getByLabel('Audience',{exact:true}).selectOption('Pod Leads');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
 await page.getByLabel('Type',{exact:true}).selectOption('Book');
 await expect(page.locator('[data-empty]')).toBeVisible();
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-resource]:visible')).toHaveCount(43);
});
test('Site search resolves the requested example terms',async({page})=>{
 for(const term of ['airspace','PurpleAir','STL','Part 107','balloon tracking','PM2.5','wildfire smoke','radiosondes','pod leads']) {
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
 await page.goto('http://127.0.0.1:8081/library/');await expect(page.locator('[data-resource]')).toHaveCount(43);
 await page.getByRole('link',{name:'Airspace Student Worksheet',exact:true}).click();
 await expect(page.locator('h1')).toHaveText('Airspace Student Worksheet');await context.close();
});

test('Imported books, slides, and project parts link to actual files',async({page,request})=>{
 for(const route of ['/resources/airspace-book/','/resources/weather-presentation/','/resources/operations-presentation/','/resources/trainer-build-instructions/']) {
  await page.goto(route);
  const pdf=page.getByRole('link',{name:/^View PDF/});
  await expect(pdf).toBeVisible();
  const response=await request.get(await pdf.getAttribute('href'),{headers:{Range:'bytes=0-4'}});
  expect(response.ok()).toBeTruthy();
  expect((await response.body()).subarray(0,5).toString()).toBe('%PDF-');
 }
 await page.goto('/resources/trainer-tpu-parts/');
 await expect(page.getByRole('link',{name:/^Download STL/})).toHaveCount(10);
 await page.goto('/uas/trainer-airplane/');
 await page.getByRole('link',{name:'ASCEND Trainer Airplane Build Instructions',exact:true}).click();
 await expect(page.locator('#files')).toBeVisible();
});

test('Web resources are discoverable by subject, platform, and activity without duplicating pages',async({page})=>{
 await page.goto('/library/?subject=Atmospheric+Science&platform=Satellite+Data&activity=Data+Analysis');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(1);
 await page.locator('[data-resource]:visible').getByRole('link',{name:'Science & Research Questions',exact:true}).click();
 await expect(page).toHaveURL(/\/science\/$/);
 await expect(page.locator('h1')).toHaveText('Science & Research Questions');
 await expect(page.getByRole('heading',{name:'Attribution & review'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Open resource'})).toHaveCount(0);
 await page.goto('/library/?platform=Fixed-Wing+UAS&activity=Building+%26+Integration');
 await expect(page.locator('[data-resource]:visible')).toHaveCount(10);
 await page.getByRole('button',{name:'Clear filters'}).click();
 await expect(page.locator('[data-resource]:visible')).toHaveCount(43);
});

test('New Part 107 activities and YELLOWSTONE documents have readable PDFs and native files', async({page,request})=>{
 for (const id of ['regulations-activity','airspace-worksheet','dfw-airspace-chart','weather-activity','loading-performance-activity','operations-activity','uas-field-applications','dronezone-activity','yellowstone-guide','yellowstone-io-map']) {
  await page.goto('/resources/'+id+'/');
  const pdf=page.getByRole('link',{name:/^View PDF/});
  await expect(pdf).toBeVisible();
  const response=await request.get(await pdf.getAttribute('href'));
  expect(response.ok()).toBeTruthy();
  expect((await response.body()).subarray(0,5).toString()).toBe('%PDF-');
 }
 await page.goto('/resources/yellowstone-design-files/');
 for(const format of ['F3Z','SCH','BRD'])await expect(page.getByRole('link',{name:new RegExp('^Download '+format)})).toBeVisible();
 await page.goto('/resources/yellowstone-buildsheet/');
 await expect(page.getByRole('link',{name:/^Download XLSX/})).toBeVisible();
 await page.goto('/part107/weather/');
 await expect(page.getByRole('link',{name:'Weather Interpretation Activity',exact:true})).toBeVisible();
 await page.goto('/ballooning/');
 await expect(page.getByRole('link',{name:'YELLOWSTONE PCB Guide',exact:true}).first()).toBeVisible();
});


test('Published lessons load YouTube only on request and retain a direct link', async({page})=>{
 await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<title>Video test frame</title>'}));
 for(const [name,id] of [['regulations','6_vm2nQtgQM'],['operations','Z9VZ-8zJkJ4'],['loading-performance','Y0MSfvZialw']]){
  await page.goto('/resources/'+name+'-video/');
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.getByRole('link',{name:/Watch on YouTube/})).toHaveAttribute('href','https://www.youtube.com/watch?v='+id);
  await page.getByRole('button',{name:/Load video:/}).click();
  await expect(page.locator('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/'+id);
 }
});
