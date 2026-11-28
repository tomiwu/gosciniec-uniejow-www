import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

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

async function waitForConsentBar(page: Page) {
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

/* ---------- Mobile layout (issue #71) ---------- */

type RGB = [number, number, number];

function parseRgb(value: string): RGB {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) throw new Error(`Not an rgb colour: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function luminance([r, g, b]: RGB): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`390 px viewport, ${scheme} theme`, () => {
    test.use({ colorScheme: scheme, viewport: { width: 390, height: 844 } });

    test('banner sits above the action bar and the form start stays visible', async ({ page }) => {
      await page.goto('/rezerwacja/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
      const bar = await waitForConsentBar(page);
      const actionBar = page.locator('.action-bar');
      await expect(actionBar).toBeInViewport({ ratio: 1 });

      const barBox = await bar.boundingBox();
      const actionBox = await actionBar.boundingBox();
      expect(barBox).not.toBeNull();
      expect(actionBox).not.toBeNull();
      // The banner ends where the action bar starts (1 px for rounding).
      expect(barBox!.y + barBox!.height).toBeLessThanOrEqual(actionBox!.y + 1);
      // The banner stays low: less than a fifth of the first screen (issue #74).
      expect(barBox!.height).toBeLessThanOrEqual(160);

      // The action bar buttons are on top: nothing from the banner covers them.
      for (const name of ['Zadzwoń', 'Rezerwuj']) {
        const button = actionBar.getByRole('link', { name });
        await expect(button).toBeVisible();
        const box = (await button.boundingBox())!;
        const topmostInsideBar = await page.evaluate(
          ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.action-bar'),
          { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        );
        expect(topmostInsideBar).toBe(true);
      }

      // The start of the form (heading and form top) is above the banner.
      const heading = page.getByRole('heading', { name: 'Wyślij zapytanie' });
      await expect(heading).toBeInViewport({ ratio: 1 });
      const headingBox = (await heading.boundingBox())!;
      expect(headingBox.y + headingBox.height).toBeLessThanOrEqual(barBox!.y);
      const formBox = (await page.locator('form').first().boundingBox())!;
      expect(formBox.y).toBeLessThan(barBox!.y);

      // A focused field scrolls clear of the banner and of the action bar.
      const firstField = page
        .locator('form input:not([type="hidden"]):not([tabindex="-1"])')
        .first();
      await firstField.focus();
      await expect(firstField).toBeInViewport({ ratio: 1 });
      const fieldBox = (await firstField.boundingBox())!;
      expect(fieldBox.y + fieldBox.height).toBeLessThanOrEqual(barBox!.y);
    });

    test('accept and reject have the same style and it is not the Rezerwuj gold', async ({
      page,
    }) => {
      await page.goto('/');
      const bar = await waitForConsentBar(page);
      const style = (locator: Locator) =>
        locator.evaluate((el) => {
          const s = getComputedStyle(el);
          return {
            bg: s.backgroundColor,
            color: s.color,
            border: s.borderTopColor,
            width: s.borderTopWidth,
            height: el.getBoundingClientRect().height,
            fontWeight: s.fontWeight,
            fontSize: s.fontSize,
          };
        });
      const accept = await style(bar.getByRole('button', { name: 'Akceptuję wszystkie' }));
      const reject = await style(bar.getByRole('button', { name: 'Odrzucam' }));
      const rezerwuj = await style(
        page.locator('.action-bar').getByRole('link', { name: 'Rezerwuj' }),
      );
      expect(reject).toEqual(accept);
      expect(accept.bg).not.toBe(rezerwuj.bg);
      expect(accept.bg).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('three buttons fit in one row', async ({ page }) => {
      await page.goto('/');
      const bar = await waitForConsentBar(page);
      const tops: number[] = [];
      for (const name of ['Akceptuję wszystkie', 'Odrzucam', 'Ustawienia']) {
        const box = await bar.getByRole('button', { name }).boundingBox();
        tops.push(Math.round(box!.y));
        expect(box!.height).toBeGreaterThanOrEqual(24);
        expect(box!.width).toBeGreaterThanOrEqual(24);
      }
      expect(new Set(tops).size).toBe(1);
    });

    test('Ustawienia has a border with at least 3:1 contrast against the panel', async ({
      page,
    }) => {
      await page.goto('/');
      const bar = await waitForConsentBar(page);
      const colours = await bar.getByRole('button', { name: 'Ustawienia' }).evaluate((el) => {
        const s = getComputedStyle(el);
        const panel = getComputedStyle(el.closest('.cm') as Element);
        return {
          border: s.borderTopColor,
          borderWidth: parseFloat(s.borderTopWidth),
          bg: s.backgroundColor,
          panel: panel.backgroundColor,
        };
      });
      expect(colours.borderWidth).toBeGreaterThanOrEqual(1);
      expect(contrast(parseRgb(colours.border), parseRgb(colours.panel))).toBeGreaterThanOrEqual(3);
    });

    test('banner text is short, readable and in the main text colour', async ({ page }) => {
      await page.goto('/');
      const bar = await waitForConsentBar(page);
      const info = await bar.locator('.cm__desc').evaluate((el) => {
        const s = getComputedStyle(el);
        const panel = getComputedStyle(el.closest('.cm') as Element);
        return {
          length: (el.textContent ?? '').trim().length,
          size: parseFloat(s.fontSize),
          color: s.color,
          panel: panel.backgroundColor,
        };
      });
      expect(info.length).toBeLessThanOrEqual(120);
      expect(info.size).toBeGreaterThanOrEqual(14);
      expect(contrast(parseRgb(info.color), parseRgb(info.panel))).toBeGreaterThanOrEqual(7);
    });

    test('banner and action bar look like two separate layers', async ({ page }) => {
      await page.goto('/rezerwacja/');
      const bar = await waitForConsentBar(page);
      const actionBox = (await page.locator('.action-bar').boundingBox())!;
      const barBox = (await bar.boundingBox())!;
      const style = await bar.evaluate((el) => {
        const s = getComputedStyle(el);
        return { shadow: s.boxShadow, border: parseFloat(s.borderBottomWidth) };
      });
      // A top shadow and a visible line tell the layers apart.
      expect(style.shadow).not.toBe('none');
      expect(style.border).toBeGreaterThanOrEqual(1);
      // Nothing from the page shows between the banner and the action bar.
      expect(actionBox.y - (barBox.y + barBox.height)).toBeLessThanOrEqual(1);
      const probe = await page.evaluate((y) => {
        const el = document.elementFromPoint(20, y);
        return !!el?.closest('#cc-main') || !!el?.closest('.action-bar');
      }, actionBox.y - 1);
      expect(probe).toBe(true);
    });

    test('banner does not hide the hero booking button', async ({ page }) => {
      await page.goto('/');
      const bar = await waitForConsentBar(page);
      const barBox = (await bar.boundingBox())!;
      const hero = page.locator('main').getByRole('link', { name: 'Rezerwuj' }).first();
      const box = (await hero.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(barBox.y + 1);
    });

    test('action bar is fully opaque and nothing shows between it and the banner', async ({
      page,
    }) => {
      for (const route of ['/kontakt/', '/pokoje/', '/pakiety/', '/rezerwacja/']) {
        await page.goto(route);
        const bar = await waitForConsentBar(page);
        const style = await page.locator('.action-bar').evaluate((el) => {
          const s = getComputedStyle(el);
          return { bg: s.backgroundColor, filter: s.backdropFilter };
        });
        // "rgb(...)" has no alpha. "rgba(..., 1)" is opaque too.
        expect(style.bg, route).toMatch(/^rgb\(|^rgba\(\d+, \d+, \d+, 1\)$/);
        expect(style.filter, route).toBe('none');

        const barBox = (await bar.boundingBox())!;
        const actionBox = (await page.locator('.action-bar').boundingBox())!;
        // The banner overlaps the bar or touches it. No gap.
        expect(barBox.y + barBox.height, route).toBeGreaterThanOrEqual(actionBox.y - 0.01);
        // Every point from the banner to the bottom of the screen is the banner or the bar.
        const stray = await page.evaluate(
          ({ from, to }) => {
            const hits: string[] = [];
            for (let y = Math.floor(from); y < to; y += 1) {
              for (const x of [100, 195, 290]) {
                const el = document.elementFromPoint(x, y);
                if (!el?.closest('#cc-main') && !el?.closest('.action-bar')) {
                  hits.push(`${x},${y}:${el?.tagName}`);
                }
              }
            }
            return hits;
          },
          { from: barBox.y + barBox.height - 4, to: 844 },
        );
        expect(stray, route).toEqual([]);
      }
    });

    test('hero buttons stay clear of the banner and are fully visible after it closes', async ({
      page,
    }) => {
      await page.goto('/');
      const bar = await waitForConsentBar(page);
      const buttons = page.locator('.hero__actions a');
      await expect(buttons).toHaveCount(2);
      const barTop = (await bar.boundingBox())!.y;
      for (const i of [0, 1]) {
        const box = (await buttons.nth(i).boundingBox())!;
        expect(box.y + box.height, `button ${i} above the banner`).toBeLessThanOrEqual(barTop);
      }
      await bar.getByRole('button', { name: 'Odrzucam' }).click();
      await expect(page.locator('#cc-main .cm')).toBeHidden();
      const actionTop = (await page.locator('.action-bar').boundingBox())!.y;
      for (const i of [0, 1]) {
        await expect(buttons.nth(i)).toBeInViewport({ ratio: 1 });
        const box = (await buttons.nth(i).boundingBox())!;
        expect(box.y + box.height, `button ${i} above the action bar`).toBeLessThanOrEqual(
          actionTop,
        );
        const onTop = await page.evaluate(
          ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.hero__actions'),
          { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        );
        expect(onTop).toBe(true);
      }
    });

    test('banner has no axe violations', async ({ page }) => {
      await page.goto('/rezerwacja/');
      await waitForConsentBar(page);
      const results = await new AxeBuilder({ page })
        .include('#cc-main .cm')
        .withTags(AXE_TAGS)
        .analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
