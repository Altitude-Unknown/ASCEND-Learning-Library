import {test, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test-only institutions exercise the map without publishing example teams.
const institutions = [
  {id: 'test-east', name: 'Example East College', city: 'Test East, Test State', lat: 41, lng: -74, kind: 'team'},
  {id: 'test-west', name: 'Example West & <Science> College', city: 'Test West, Test State', lat: 45, lng: -112, kind: 'pod'},
];
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
async function withInstitutions(page, records = institutions) {
  await page.route('**/teams/', async route => {
    const response = await route.fetch();
    const items = records.map(team => `<li id="team-${team.id}" data-team-id="${team.id}" data-kind="${team.kind}" data-latitude="${team.lat}" data-longitude="${team.lng}"><h3 class="team-institution">${escape(team.name)}</h3><p class="team-location">${team.city}</p><button type="button" class="team-map-link" hidden>Show on map: ${escape(team.name)}</button></li>`).join('');
    const html = (await response.text()).replace(/(<ul id="teams-directory"[^>]*>)[\s\S]*?<\/ul>/, `$1${items}</ul>`);
    await route.fulfill({response, body: html});
  });
}

test('Pod leads and SMEs have distinct markers, names, and accessible responsive layouts', async ({page}) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({width, height: 1000});
    await page.goto('/teams/');
    await expect(page.locator('h1')).toHaveText('Who Are the Teams?');
    await expect(page.locator('#teams-map')).toHaveAttribute('data-map-ready', 'true');
    await expect(page.locator('#teams-map canvas')).toBeVisible();
    await expect(page.locator('.team-map-pod')).toHaveCount(6);
    await expect(page.locator('.team-map-sme')).toHaveCount(2);
    await expect(page.locator('.team-map-leadership')).toHaveCount(2);
    await expect(page.locator('.team-map-team')).toHaveCount(0);
    await expect(page.locator('.team-map-pod .team-symbol').first()).toHaveText('★');
    await expect(page.locator('.team-map-sme .team-symbol').first()).toHaveText('◆');
    await expect(page.locator('#team-university-of-bridgeport')).toContainText('Jani Macari Pallis');
    await expect(page.locator('#team-nasa-langley')).toContainText('Margaret Pippin');
    await expect(page.locator('#team-plymouth-state')).toContainText('Eric Kelsey');
    await expect(page.locator('#team-johns-hopkins-apl')).toContainText('Co-investigator');
    await expect(page.locator('#team-johns-hopkins-apl')).toContainText('Ginny Smith');
    await expect(page.locator('#teams-directory')).not.toContainText('@');
    await page.getByRole('button', {name: 'Zoom in', exact: true}).click();
    await page.getByRole('button', {name: 'Show all locations', exact: true}).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    expect(scan.violations).toEqual([]);
    if (width === 1440 || width === 320) await page.locator('#teams-map').screenshot({path: `artifacts/teams-map-${width}.png`});
  }
  await page.screenshot({path: 'artifacts/teams-map-mobile.png', fullPage: true});
  expect(errors).toEqual([]);
  await page.goto('/');
  await page.locator('.program-introduction').getByRole('link', {name: 'Who Are the Teams?', exact: true}).click();
  await expect(page).toHaveURL(/\/teams\/$/);
});

test('Empty roster still loads a usable map', async ({page}) => {
  await withInstitutions(page, []);
  await page.goto('/teams/');
  await expect(page.locator('#teams-map')).toHaveAttribute('data-map-ready', 'true');
  await expect(page.locator('.team-map-dot')).toHaveCount(0);
});

test('SME and pod popups show the right institution, role, and person', async ({page}) => {
  await page.goto('/teams/');
  await expect(page.locator('#teams-map')).toHaveAttribute('data-map-ready', 'true');
  await page.locator('#team-nasa-goddard .team-map-link').click();
  await expect(page.locator('.maplibregl-popup')).toContainText('Jie Gong');
  await expect(page.locator('.maplibregl-popup')).toContainText('Subject matter expert');
  await expect(page.locator('.maplibregl-popup a')).toHaveAttribute('href', '/leadership/#jie-gong');
  await page.keyboard.press('Escape');
  await page.locator('#team-university-of-bridgeport .team-map-link').click();
  await expect(page.locator('.maplibregl-popup')).toContainText('Jani Macari Pallis');
  await expect(page.locator('.maplibregl-popup')).toContainText('Pod lead');
  await expect(page.locator('.maplibregl-popup')).not.toContainText('@');
});

test('Nearby research centers remain available through a grouped marker', async ({page}) => {
  await page.goto('/teams/');
  await expect(page.locator('#teams-map')).toHaveAttribute('data-map-ready', 'true');
  await page.getByRole('button', {name: /Show \d+ nearby network locations:.*NASA Goddard/}).click();
  await expect(page.locator('.maplibregl-popup')).toContainText('NASA Goddard Space Flight Center');
  await expect(page.locator('.maplibregl-popup')).toContainText('Johns Hopkins University Applied Physics Laboratory');
  await expect(page.locator('.maplibregl-popup')).toContainText('Ginny Smith');
  await page.keyboard.press('Escape');
  await expect(page.locator('.maplibregl-popup')).toHaveCount(0);
});

test('Institution dots and directory buttons open safe, keyboard accessible popups', async ({page}) => {
  await withInstitutions(page);
  await page.goto('/teams/');
  await expect(page.locator('#teams-map')).toHaveAttribute('data-map-ready', 'true');
  await expect(page.locator('.team-map-dot')).toHaveCount(2);
  const dot = page.getByRole('button', {name: 'Show student team: Example East College', exact: true});
  await dot.click();
  await expect(page.locator('.maplibregl-popup h3')).toHaveText('Example East College');
  await page.keyboard.press('Escape');
  await expect(page.locator('.maplibregl-popup')).toHaveCount(0);
  await expect(dot).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.maplibregl-popup h3')).toHaveText('Example East College');
  await page.getByRole('button', {name: 'Close popup', exact: true}).click();
  const listButton = page.locator('#team-test-west .team-map-link');
  await listButton.click();
  await expect(page.locator('.maplibregl-popup h3')).toHaveText('Example West & <Science> College');
  await expect(page.locator('.maplibregl-popup h3 science')).toHaveCount(0);
  const scan = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(scan.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(listButton).toBeFocused();
  await page.setViewportSize({width: 320, height: 844});
  await listButton.click();
  await expect(page.locator('.maplibregl-popup h3')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
});

test('Basemap failure preserves the directory and explains the fallback', async ({page}) => {
  await withInstitutions(page);
  await page.route('**/us-states.geojson', route => route.abort());
  await page.goto('/teams/');
  await expect(page.locator('#teams-map-status')).toContainText('map is unavailable');
  await expect(page.locator('#teams-map')).toBeHidden();
  await expect(page.locator('#teams-directory li')).toHaveCount(2);
  await expect(page.locator('#teams-directory .team-map-link:visible')).toHaveCount(0);
});

test('Institution directory remains readable without JavaScript', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled: false});
  const page = await context.newPage();
  await withInstitutions(page);
  await page.goto('http://127.0.0.1:8081/teams/');
  await expect(page.locator('#teams-map')).toBeHidden();
  await expect(page.locator('#teams-directory li')).toHaveCount(2);
  await expect(page.getByRole('heading', {name: 'Example East College', exact: true})).toBeVisible();
  await expect(page.locator('#teams-directory .team-map-link:visible')).toHaveCount(0);
  await context.close();
});
