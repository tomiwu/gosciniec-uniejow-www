import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { routes } from '../src/lib/routes';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const route of routes) {
  test.describe(route.path, () => {
    test('loads with status 200 and the basic structure', async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByRole('link', { name: 'Rezerwuj' })).toHaveAttribute(
        'href',
        '/rezerwacja/',
      );
    });

    test('has a viewport meta that allows zoom', async ({ page }) => {
      await page.goto(route.path);
      const content = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(content).toBeTruthy();
      expect(content).not.toMatch(/user-scalable\s*=\s*(no|0)/i);
      expect(content).not.toMatch(/maximum-scale\s*=\s*1(\.0)?(\s|,|$)/i);
    });

    test('has no axe violations (WCAG 2.2 AA)', async ({ page }) => {
      await page.goto(route.path);
      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

test('unknown URL shows the 404 page', async ({ page }) => {
  const response = await page.goto('/nie-ma-takiej-strony/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
});
