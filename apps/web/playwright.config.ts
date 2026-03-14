import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 1,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  ...(baseURL.includes('localhost') ? {
    webServer: {
      command: 'python3 -m http.server 4173 --directory out',
      port: 4173,
      reuseExistingServer: true,
      timeout: 10000,
    },
  } : {}),
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
