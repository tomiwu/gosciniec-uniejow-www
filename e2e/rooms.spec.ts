import { expect, test } from '@playwright/test';

const NAMES = [
  'Pokój typu standard',
  'Pokój typu superior',
  'Pokój Deluxe w standardzie 3*',
  'Rodzinny Apartament',
];
const SLUGS = ['standard', 'superior', 'deluxe', 'apartament-rodzinny'];

test.describe('/pokoje/ content', () => {
  test('has one h1 and one h2 for each room type', async ({ page }) => {
    await page.goto('/pokoje/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.locator('article').getByRole('heading', { level: 2 })).toHaveText(NAMES);
  });

  test('shows a photo, a feature list and a CTA for each room', async ({ page }) => {
    await page.goto('/pokoje/');
    const rooms = page.locator('article');
    await expect(rooms).toHaveCount(4);
    for (let i = 0; i < 4; i += 1) {
      const room = rooms.nth(i);
      await expect(room.locator('picture img')).toHaveCount(1);
      await expect(room.locator('img')).not.toHaveAttribute('alt', '');
      expect(await room.locator('ul > li').count()).toBeGreaterThan(3);
      await expect(room.getByRole('link', { name: /Zapytaj o termin/ })).toHaveAttribute(
        'href',
        `/rezerwacja/?pokoj=${SLUGS[i]}`,
      );
    }
  });

  test('loads only the first photo with priority (LCP)', async ({ page }) => {
    await page.goto('/pokoje/');
    const images = page.locator('article img');
    await expect(images.nth(0)).toHaveAttribute('loading', 'eager');
    await expect(images.nth(0)).toHaveAttribute('fetchpriority', 'high');
    for (let i = 1; i < 4; i += 1) {
      await expect(images.nth(i)).toHaveAttribute('loading', 'lazy');
    }
  });

  test('shows no invented price and no thermal pool claim', async ({ page }) => {
    await page.goto('/pokoje/');
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/\d\s*(zł|PLN)/i);
    expect(text).not.toMatch(/basen/i);
  });

  test('has HotelRoom items in the Hotel JSON-LD and no Offer', async ({ page }) => {
    await page.goto('/pokoje/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const data = blocks.map((raw) => JSON.parse(raw) as Record<string, unknown>);
    const withRooms = data.find((block) => Array.isArray(block['containsPlace']));
    expect(withRooms?.['@type']).toBe('Hotel');
    const places = withRooms?.['containsPlace'] as { '@type': string; name: string }[];
    expect(places.map((place) => place['@type'])).toEqual(Array(4).fill('HotelRoom'));
    expect(places.map((place) => place.name)).toEqual(NAMES);
    expect(blocks.join('')).not.toContain('"Offer"');
  });
});
