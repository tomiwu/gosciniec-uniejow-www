import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const GTM = 'googletagmanager.com';

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await context.addInitScript(() => {
    try {
      localStorage.clear();
    } catch {
      /* private mode */
    }
  });
});

async function waitForConsentBar(page: import('@playwright/test').Page) {
  const bar = page.locator('#cc-main .cm');
  await expect(bar).toBeVisible({ timeout: 20_000 });
  return bar;
}

test('no request to Google Tag Manager before consent (build without GA ID)', async ({ page }) => {
  const hits: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes(GTM)) hits.push(request.url());
  });
  await page.goto('/');
  await waitForConsentBar(page);
  await page.waitForTimeout(500);
  expect(hits).toEqual([]);
});

test('consent bar has Polish labels and equal-weight actions', async ({ page }) => {
  await page.goto('/');
  const bar = await waitForConsentBar(page);
  await expect(bar.getByRole('heading', { name: 'Szanujemy Twoją prywatność' })).toBeVisible();
  const accept = bar.getByRole('button', { name: 'Akceptuję wszystkie' });
  const reject = bar.getByRole('button', { name: 'Odrzucam' });
  await expect(accept).toBeVisible();
  await expect(reject).toBeVisible();
  const acceptBox = await accept.boundingBox();
  const rejectBox = await reject.boundingBox();
  expect(acceptBox?.height).toBeGreaterThan(0);
  expect(rejectBox?.height).toBeGreaterThan(0);
  expect(Math.abs((acceptBox?.height ?? 0) - (rejectBox?.height ?? 0))).toBeLessThanOrEqual(2);
});

test('consent bar has no axe violations and works with the keyboard', async ({ page }) => {
  await page.goto('/');
  const bar = await waitForConsentBar(page);
  const results = await new AxeBuilder({ page })
    .include('#cc-main .cm')
    .withTags(AXE_TAGS)
    .analyze();
  expect(results.violations).toEqual([]);

  const accept = bar.getByRole('button', { name: 'Akceptuję wszystkie' });
  const settings = bar.getByRole('button', { name: 'Ustawienia' });
  await accept.focus();
  await expect(accept).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(bar.getByRole('button', { name: 'Odrzucam' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(settings).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#cc-main .pm')).toBeVisible();
});

test('footer link opens cookie preferences', async ({ page }) => {
  await page.goto('/');
  await waitForConsentBar(page);
  await page.getByRole('button', { name: 'Odrzucam' }).click();
  await expect(page.locator('#cc-main .cm')).toBeHidden();
  await page.getByRole('button', { name: 'Ustawienia cookies' }).click();
  await expect(page.locator('#cc-main .pm')).toBeVisible();
});
