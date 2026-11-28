import { defineConfig, devices } from '@playwright/test';

const port = 4173;

// WebKit is optional (issue #83). Set E2E_WEBKIT=1 to add the project.
// The machine needs WebKit and its system libraries.
const withWebkit = process.env['E2E_WEBKIT'] === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    // Scroll-driven reveal animations leave text half transparent while it enters the
    // viewport. That is not a real contrast problem, but axe reports it. Tests check the
    // final state. e2e/motion.spec.ts checks the motion path on its own.
    reducedMotion: 'reduce',
  },
  webServer: {
    command: `npx serve out -l ${port} -c ../serve.json`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium-mobile',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    // WebKit layout differences. Static iPhone 13 profile (390x664): it does not emulate the
    // dynamic Safari tool bar or the safe area. Only the scroll-time geometry spec runs here.
    ...(withWebkit
      ? [
          {
            name: 'webkit-mobile',
            testMatch: /ux-flows\.spec\.ts/,
            use: { ...devices['iPhone 13'] },
          },
        ]
      : []),
  ],
});
