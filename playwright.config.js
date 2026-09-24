import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: './tests', timeout: 45000, fullyParallel: false, workers: 1,
  reporter: 'list',
  use: {baseURL: 'http://127.0.0.1:8081', browserName: 'chromium', screenshot: 'only-on-failure'},
  webServer: {command: 'npx @11ty/eleventy --serve --port=8081', url: 'http://127.0.0.1:8081', reuseExistingServer: !process.env.CI},
});
