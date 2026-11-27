import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const KEY_ROUTES = ['/', '/pokoje/', '/kontakt/', '/rezerwacja/', '/faq/', '/atrakcje/'];

test.describe('theme follows the system setting', () => {
  test.use({ colorScheme: 'dark' });

  test('dark system setting gives the dark theme before the first paint', async ({ page }) => {
    await page.goto('/');
    // The inline script runs in <head>, so the value exists before the body is parsed.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe('rgb(14, 26, 34)');
  });

  for (const path of KEY_ROUTES) {
    test(`${path} has no axe violations in the dark theme`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test('the toggle switches the theme and the choice stays after a reload', async ({ page }) => {
  await page.goto('/pokoje/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  const toggle = page.getByRole('button', { name: 'Tryb ciemny' });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Tryb ciemny' }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test.describe('motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the LCP image and the h1 are visible at once (no load animation)', async ({ page }) => {
    await page.goto('/');
    const state = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const img = document.querySelector('.hero img');
      if (!h1 || !img) return null;
      return {
        h1Opacity: getComputedStyle(h1).opacity,
        imgOpacity: getComputedStyle(img).opacity,
        h1Animation: getComputedStyle(h1).animationName,
      };
    });
    expect(state).toEqual({ h1Opacity: '1', imgOpacity: '1', h1Animation: 'none' });
  });

  test('content below the fold is fully visible after scroll', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('#location-title');
    await heading.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 200));
    await expect
      .poll(async () =>
        page.locator('#location-title').evaluate((el) => {
          const box = el.closest('.reveal');
          return box ? getComputedStyle(box).opacity : '1';
        }),
      )
      .toBe('1');
  });
});
