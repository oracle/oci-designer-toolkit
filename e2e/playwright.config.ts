/*
 * Playwright configuration for the OCD Landing Zone wizard smoke tests.
 *
 * The test suite serves the pre-built static web-dist from
 * ocd/packages/desktop/web-dist using the local Node static server
 * in e2e/scripts/serve-static.mjs (port 4173 by default).
 *
 * To rebuild web-dist before running:
 *   cd ocd && OCD_PAGES_BASE=/ npm run build:pages
 *
 * Then run the tests:
 *   cd e2e && npx playwright test
 *   # OR from the repo root:
 *   npm run test:e2e
 */

import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const WEB_DIST = path.resolve(__dirname, '../ocd/packages/desktop/web-dist')
const PORT = 4173

export default defineConfig({
  testDir: './specs',
  /* Smoke tests are not part of the vitest unit-test gate — keep separate. */
  fullyParallel: false,
  /* Retry once on CI; fast feedback locally. */
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],

  use: {
    /* Base URL picks up the port the static server binds to. */
    baseURL: `http://127.0.0.1:${PORT}`,
    /* Capture traces on first retry so failures are diagnosable. */
    trace: 'on-first-retry',
    /* Give lazy-loaded WASM assets extra time. */
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Run headless — no DISPLAY required in CI. */
        headless: true,
      },
    },
  ],

  /*
   * webServer: serve the static build at the expected port before tests start.
   * The local helper keeps E2E offline-friendly and enables SPA fallback
   * (rewrites unknown paths to index.html).
   */
  webServer: {
    command: `node ./scripts/serve-static.mjs "${WEB_DIST}" ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
})
