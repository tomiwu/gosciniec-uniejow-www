import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { VISUAL_ROUTES, VISUAL_THEMES, VISUAL_VIEWPORTS, shotName } from './routes';

const currentDir = join(process.env['VISUAL_DIR'] ?? 'visual', 'current');

/** Load lazy images and the fonts, so that two runs give the same pixels. */
async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  // font-display: optional uses a font only when it is in the cache at first paint.
  await page.reload({ waitUntil: 'networkidle' });
  // A full-page shot does not scroll: Chrome would skip the paint of `content-visibility: auto`
  // blocks below the screen (for example room cards 3 and 4 on /pokoje/). Render them all.
  await page.addStyleTag({ content: '* { content-visibility: visible !important; }' });
  // Load lazy images now. A full-page shot does not scroll, so they would stay empty.
  await page.evaluate(() => {
    for (const img of document.querySelectorAll('img[loading="lazy"]')) {
      (img as HTMLImageElement).loading = 'eager';
    }
  });
  await page
    .waitForFunction(() => [...document.images].every((img) => img.complete), null, {
      timeout: 15_000,
    })
    .catch(() => undefined);
  await page.evaluate(() =>
    Promise.all([...document.images].map((img) => img.decode().catch(() => undefined))),
  );
  await page.evaluate(() => document.fonts.ready);
  // Let hydration and the last paint finish (form prefill, header state).
  await page.waitForTimeout(500);
}

for (const theme of VISUAL_THEMES) {
  for (const viewport of VISUAL_VIEWPORTS) {
    test.describe(`${viewport.name} ${theme}`, () => {
      test.use({
        colorScheme: theme,
        viewport: { width: viewport.width, height: viewport.height },
      });

      for (const route of VISUAL_ROUTES) {
        test(route, async ({ page }) => {
          await page.goto(route, { waitUntil: 'networkidle' });
          await settle(page);
          const name = shotName(route, viewport.name, theme);
          const shot = await page.screenshot({
            fullPage: true,
            animations: 'disabled',
            caret: 'hide',
          });
          mkdirSync(join(currentDir, 'fold'), { recursive: true });
          writeFileSync(join(currentDir, name), shot);
          // First screen only: what a guest sees before any scroll. Input for the UX reviewer.
          const fold = await page.screenshot({ animations: 'disabled', caret: 'hide' });
          writeFileSync(join(currentDir, 'fold', name), fold);
          expect(shot).toMatchSnapshot(name);
        });
      }
    });
  }
}
