import { expect, test } from '@playwright/test';
import { nap } from '../src/lib/nap';

test('home page shows the h1, the hero CTA and the phone link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Gościniec Uniejów – hotel w Uniejowie',
  );
  const main = page.locator('main');
  await expect(main.getByRole('link', { name: 'Rezerwuj' })).toHaveAttribute(
    'href',
    '/rezerwacja/',
  );
  await expect(main.getByRole('link', { name: nap.phoneDisplay })).toHaveAttribute(
    'href',
    `tel:${nap.phoneE164}`,
  );
});

test('home page links to the teaser targets', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('main');
  for (const href of [
    '/pakiety/',
    '/ceny/',
    '/pakiety/sylwester-2026-2027/',
    '/pokoje/',
    '/spa/',
    '/restauracja/',
    '/atrakcje/',
    '/faq/',
  ]) {
    await expect(main.locator(`a[href="${href}"]`)).toHaveCount(1);
  }
});

test('every image has alt text and the hero image is the only eager one', async ({ page }) => {
  await page.goto('/');
  const images = page.locator('main img');
  const count = await images.count();
  expect(count).toBeGreaterThan(1);
  for (let i = 0; i < count; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    expect(alt?.trim().length ?? 0).toBeGreaterThan(5);
  }
  await expect(page.locator('main img[loading="eager"]')).toHaveCount(1);
  await expect(page.locator('main img[fetchpriority="high"]')).toHaveCount(1);
});

test('home page has no horizontal scroll', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test('a gallery photo opens in a dialog and Escape closes it', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('a[data-lightbox]').first();
  await link.scrollIntoViewIfNeeded();
  const alt = await link.locator('img').getAttribute('alt');
  await link.click();
  const dialog = page.getByRole('dialog', { name: 'Powiększone zdjęcie' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('alt', alt ?? '');
  await expect(page).toHaveURL(/\/$/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
