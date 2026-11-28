import { expect, test } from '@playwright/test';
import { dismissConsentBar } from './helpers/consent';

/*
 * Issue #87: the contact items on /kontakt/ share one vertical gap.
 * The items are the sales e-mail line, the address, the phone, the e-mail and the "Zadzwoń"
 * button. The projects run this test at 390 px and at 1280 px.
 */
test('contact items and the call button use one equal vertical gap', async ({ page }) => {
  await page.goto('/kontakt/');
  await dismissConsentBar(page);

  const result = await page.evaluate(() => {
    const items = [...document.querySelectorAll<HTMLElement>('[data-contact-item]')];
    const boxes = items.map((el) => {
      const r = el.getBoundingClientRect();
      return { name: (el.textContent ?? '').trim().slice(0, 24), top: r.top, bottom: r.bottom };
    });
    const token = document.createElement('div');
    token.style.cssText = 'position:absolute;visibility:hidden;height:var(--space-4)';
    document.body.append(token);
    const expectedGap = token.getBoundingClientRect().height;
    token.remove();
    return { boxes, expectedGap };
  });

  // Sales line, address, phone, e-mail and the button.
  expect(result.boxes).toHaveLength(5);
  expect(result.expectedGap).toBeGreaterThan(0);
  for (let i = 1; i < result.boxes.length; i++) {
    const gap = result.boxes[i]!.top - result.boxes[i - 1]!.bottom;
    expect(
      Math.abs(gap - result.expectedGap),
      `gap before "${result.boxes[i]!.name}" is ${gap} px`,
    ).toBeLessThanOrEqual(1);
  }
});

test('phone and e-mail links keep a target of at least 24 px', async ({ page }) => {
  await page.goto('/kontakt/');
  await dismissConsentBar(page);
  const links = page.locator('main address.nap a');
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    const box = (await link.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(24);
  }
});
