import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { nap } from '../src/lib/nap';
import { routes } from '../src/lib/routes';

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const MOBILE = { width: 390, height: 844 };
const NAV_LABELS = [
  'Pokoje',
  'Ceny',
  'Pakiety',
  'SPA',
  'Restauracja',
  'Konferencje',
  'Przyjęcia',
  'Dla dzieci',
  'Atrakcje',
  'FAQ',
  'Kontakt',
];

test('Tab reaches the skip link first and it moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Przejdź do treści' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('header has logo, main navigation, booking button and phone link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/pokoje/');
  const header = page.locator('header');
  await expect(header.getByRole('link', { name: nap.name })).toHaveAttribute('href', '/');
  const nav = header.getByRole('navigation', { name: 'Menu główne' });
  await expect(nav.getByRole('link')).toHaveText(NAV_LABELS);
  await expect(nav.getByRole('link', { name: 'Pokoje' })).toHaveAttribute('aria-current', 'page');
  await expect(header.getByRole('link', { name: 'Rezerwuj' })).toHaveAttribute(
    'href',
    '/rezerwacja/',
  );
  await expect(header.getByRole('link', { name: nap.phoneDisplay })).toHaveAttribute(
    'href',
    `tel:${nap.phoneE164}`,
  );
  await expect(header.getByRole('button', { name: 'Menu' })).toBeHidden();
});

test('footer shows the NAP, legal links and the copyright line', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  const address = footer.locator('address');
  await expect(address).toContainText(nap.name);
  await expect(address).toContainText(nap.street);
  await expect(address).toContainText(`${nap.postalCode} ${nap.city}`);
  await expect(address).toContainText(nap.phoneDisplay);
  await expect(address).toContainText(nap.email);
  await expect(footer.getByRole('link', { name: 'Regulamin' })).toHaveAttribute(
    'href',
    '/regulamin/',
  );
  await expect(footer.getByRole('link', { name: 'Polityka prywatności' })).toHaveAttribute(
    'href',
    '/polityka-prywatnosci/',
  );
  await expect(footer).toContainText(`© ${new Date().getFullYear()} ${nap.name}`);
});

test.describe('mobile menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto('/');
  });

  test('is closed at first and opens with Enter', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Menu' });
    const list = page.locator('#main-menu');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toHaveAttribute('aria-controls', 'main-menu');
    await expect(list).toBeHidden();
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(list.getByRole('link')).toHaveText(NAV_LABELS);
    await expect(list).toBeVisible();
  });

  test('closes with Escape and returns focus to the button', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Menu' });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-menu')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator('#main-menu').getByRole('link', { name: 'Pokoje' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#main-menu')).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('has no axe violations while open', async ({ page }) => {
    await page.getByRole('button', { name: 'Menu' }).click();
    await expect(page.locator('#main-menu')).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('has no horizontal scroll', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('interactive targets are at least 24x24 CSS px', async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  const targets = page.locator('header a, header button, footer a');
  const count = await targets.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    // Some targets exist only on one screen size (action bar, desktop phone link).
    if (!(await targets.nth(i).isVisible())) continue;
    const box = await targets.nth(i).boundingBox();
    expect(box?.width, `target ${i} width`).toBeGreaterThanOrEqual(24);
    expect(box?.height, `target ${i} height`).toBeGreaterThanOrEqual(24);
  }
});

test('every page has a title, description and canonical URL from the route list', async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(/ \| Gościniec Uniejów – hotel w Uniejowie$/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      route.description,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${nap.siteUrl}${route.path}`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  }
});

test('all requests go to the same origin', async ({ page, baseURL }) => {
  const origin = new URL(baseURL ?? '').origin;
  const foreign: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.startsWith('data:') || url.startsWith('blob:')) return;
    if (new URL(url).origin !== origin) foreign.push(url);
  });
  for (const route of routes) {
    await page.goto(route.path, { waitUntil: 'networkidle' });
  }
  expect(foreign).toEqual([]);
});
