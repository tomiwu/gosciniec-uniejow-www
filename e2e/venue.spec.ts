import { expect, test } from '@playwright/test';

for (const path of ['/konferencje/', '/przyjecia/']) {
  test.describe(`${path} content`, () => {
    test('shows the badge "Dane testowe" next to each sample figure', async ({ page }) => {
      await page.goto(path);
      const facts = page.locator('main dl dd');
      expect(await facts.count()).toBeGreaterThan(0);
      for (const fact of await facts.all()) {
        await expect(fact.getByText('Dane testowe', { exact: true })).toBeVisible();
      }
    });

    test('shows the sales mailbox and the official phone, and no person name', async ({ page }) => {
      await page.goto(path);
      const main = page.locator('main');
      await expect(
        main.locator('a[href="mailto:sprzedaz@gosciniecuniejow.pl"]').first(),
      ).toBeVisible();
      await expect(main.locator('a[href="tel:+48632888628"]').first()).toBeVisible();
      const text = await main.innerText();
      expect(text).not.toMatch(/Białeck|Justyn|789\s*017\s*995|602\s*260\s*965|63\s*28\s*88\s*410/);
      expect(text).not.toMatch(/MojeKonferencje|Kobiecy Chill/i);
    });

    test('links to the Sylwester offer', async ({ page }) => {
      await page.goto(path);
      await expect(
        page.locator('main a[href="/pakiety/sylwester-2026-2027/"]').first(),
      ).toBeVisible();
    });

    test('has a visible FAQ that opens', async ({ page }) => {
      await page.goto(path);
      const items = page.locator('main details.faq__item');
      expect(await items.count()).toBeGreaterThan(3);
      const first = items.first();
      await first.locator('summary').click();
      await expect(first.locator('.faq__answer')).toBeVisible();
    });

    test('gives every photo an alt text', async ({ page }) => {
      await page.goto(path);
      for (const img of await page.locator('main img').all()) {
        expect(((await img.getAttribute('alt')) ?? '').length).toBeGreaterThan(10);
      }
    });
  });
}
