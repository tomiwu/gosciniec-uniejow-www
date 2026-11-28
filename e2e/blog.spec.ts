import { expect, test } from '@playwright/test';

// The empty blog page shows three equal links. Each one is a tap target of 44 px or more.
test('empty /blog/ shows Pakiety, Pokoje and Rezerwacja as equal cards with big tap targets', async ({
  page,
}) => {
  await page.goto('/blog/');
  const cards = page.locator('.blog-links a');
  await expect(cards).toHaveCount(3);
  await expect(cards.nth(0)).toHaveAttribute('href', '/pakiety/');
  await expect(cards.nth(1)).toHaveAttribute('href', '/pokoje/');
  await expect(cards.nth(2)).toHaveAttribute('href', '/rezerwacja/');

  const boxes = [];
  for (let i = 0; i < 3; i += 1) {
    await expect(cards.nth(i)).toBeVisible();
    boxes.push((await cards.nth(i).boundingBox())!);
  }
  for (const box of boxes) {
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
  // Equal size: same height and same width (1 px for rounding).
  for (const box of boxes) {
    expect(Math.abs(box.height - boxes[0]!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(box.width - boxes[0]!.width)).toBeLessThanOrEqual(1);
  }
});

test('empty /blog/ cards use the width of the page on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'desktop only');
  await page.goto('/blog/');
  const cards = page.locator('.blog-links a');
  const first = (await cards.first().boundingBox())!;
  const last = (await cards.last().boundingBox())!;
  // One row: the three cards sit side by side.
  expect(Math.abs(first.y - last.y)).toBeLessThanOrEqual(1);
  expect(last.x).toBeGreaterThan(first.x + first.width - 1);
});
