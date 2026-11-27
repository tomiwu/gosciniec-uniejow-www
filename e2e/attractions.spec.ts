import { expect, test } from '@playwright/test';

test.describe('/atrakcje/ content', () => {
  test('has one h1 and an h2 for every attraction', async ({ page }) => {
    await page.goto('/atrakcje/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const h2s = await page.getByRole('heading', { level: 2 }).allTextContents();
    for (const name of [
      'Termy Uniejów',
      'Zamek Arcybiskupów Gnieźnieńskich',
      'Tężnie solankowe',
      'Bulwary nad Wartą',
      'Zagroda Młynarska',
      'Spływ kajakowy Wartą',
      'Ścieżka rowerowa „Zieleń”',
      'Spacer z zielarką po Dolinie Warty',
    ]) {
      expect(h2s).toContain(name);
    }
  });

  test('links to rooms, packages and booking', async ({ page }) => {
    await page.goto('/atrakcje/');
    const main = page.locator('main');
    for (const href of ['/pokoje/', '/pakiety/', '/rezerwacja/']) {
      await expect(main.locator(`a[href="${href}"]`).first()).toBeVisible();
    }
  });

  test('says that the thermal pools are not part of the hotel', async ({ page }) => {
    await page.goto('/atrakcje/');
    const text = await page.locator('main').innerText();
    expect(text).toMatch(/nie należy do hotelu/i);
    expect(text).not.toMatch(/\d\s*(zł|PLN)/i);
  });

  test('gives every photo a Polish alt text', async ({ page }) => {
    await page.goto('/atrakcje/');
    const images = page.locator('main img');
    expect(await images.count()).toBeGreaterThan(0);
    for (const img of await images.all()) {
      expect(((await img.getAttribute('alt')) ?? '').length).toBeGreaterThan(10);
    }
  });
});
