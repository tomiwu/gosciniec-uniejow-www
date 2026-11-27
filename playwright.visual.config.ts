import { defineConfig } from '@playwright/test';

/**
 * Visual snapshots for the UX review (issue #26). Not part of `npm run test:e2e`.
 * VISUAL_SITE: static build to serve (default `out`).
 * VISUAL_DIR: folder for baselines, current shots and the JSON result (default `visual`).
 * Run 1 on the main build with `--update-snapshots=all` (baseline). Run 2 on the PR build (compare).
 */
const port = 4174;
const site = process.env['VISUAL_SITE'] ?? 'out';
const dir = process.env['VISUAL_DIR'] ?? 'visual';

export default defineConfig({
  testDir: './e2e-visual',
  outputDir: `${dir}/test-results`,
  snapshotPathTemplate: `${dir}/baseline/{arg}{ext}`,
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: `${dir}/results.json` }]],
  // 0.1 % of the pixels: below that, a diff is render noise (text antialiasing, image decode).
  expect: { toMatchSnapshot: { maxDiffPixelRatio: 0.001, threshold: 0.1 } },
  use: {
    baseURL: `http://localhost:${port}`,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    // Guests use Polish devices: date fields show dd.mm.rrrr, not the US format.
    locale: 'pl-PL',
    timezoneId: 'Europe/Warsaw',
  },
  webServer: {
    command: `npx serve ${site} -l ${port} -c ../serve.json`,
    url: `http://localhost:${port}/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
