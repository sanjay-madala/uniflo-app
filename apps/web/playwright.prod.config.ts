/**
 * Playwright config for production E2E tests.
 *
 * Runs only prod-*.spec.ts test files against the live production site.
 * No local webServer is started — the tests hit the deployed Netlify URL.
 *
 * Usage:
 *   pnpm --filter @uniflo/web test:prod
 *   PROD_URL=https://custom-deploy.netlify.app pnpm --filter @uniflo/web test:prod
 */

import { defineConfig } from "@playwright/test";

const baseURL =
  process.env.PROD_URL || "https://uniflo-prod.netlify.app";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "prod-*.spec.ts",
  timeout: 30000,
  retries: 1,
  fullyParallel: false, // sequential to avoid Firebase rate limits
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
