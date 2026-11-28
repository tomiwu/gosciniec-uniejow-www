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
      // The banner and the action bar together use at most 220 px of the first screen.
      // Issue #81 set 180 px. Issue #85 raised that to 190 px for 44 px tap targets.
      // Issue #86 puts "Akceptuję wszystkie" on its own row so the label is not cut.
      // The second button row adds about 50 px, so the limit is 220 px.
      expect(barBox!.height + actionBox!.height).toBeLessThanOrEqual(220);

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

    if (scheme === 'dark') {
      test('dark theme: accept and reject are quieter than the gold Rezerwuj button', async ({
        page,
      }) => {
        await page.goto('/');
        const bar = await waitForConsentBar(page);
        const read = (locator: Locator) =>
          locator.evaluate((el) => {
            const s = getComputedStyle(el);
            const panel = getComputedStyle((el.closest('.cm') ?? el) as Element);
            return {
              bg: s.backgroundColor,
              color: s.color,
              border: s.borderTopColor,
              panel: panel.backgroundColor,
            };
          });
        const accept = await read(bar.getByRole('button', { name: 'Akceptuję wszystkie' }));
        const reject = await read(bar.getByRole('button', { name: 'Odrzucam' }));
        const rezerwuj = await read(
          page.locator('.action-bar').getByRole('link', { name: 'Rezerwuj' }),
        );
        for (const button of [accept, reject]) {
          // Dark fill: much darker than the gold button and not a light cream block.
          expect(luminance(parseRgb(button.bg))).toBeLessThan(0.1);
          expect(luminance(parseRgb(button.bg))).toBeLessThan(luminance(parseRgb(rezerwuj.bg)));
          expect(contrast(parseRgb(button.color), parseRgb(button.bg))).toBeGreaterThanOrEqual(4.5);
          // The edge of the button is visible on the panel (3:1, WCAG 1.4.11).
          expect(contrast(parseRgb(button.border), parseRgb(button.panel))).toBeGreaterThanOrEqual(
            3,
          );
        }
        expect(reject).toEqual(accept);
      });
    }

    test('accept sits on its own row and reject stays as large as settings', async ({ page }) => {
      await page.goto('/');
      const bar = await waitForConsentBar(page);
      const boxes: Record<string, { x: number; y: number; width: number; height: number }> = {};
      for (const name of ['Akceptuję wszystkie', 'Odrzucam', 'Ustawienia']) {
        const box = await bar.getByRole('button', { name }).boundingBox();
        expect(box, name).not.toBeNull();
        boxes[name] = box!;
        // 44 px tap target (issue #85).
        expect(box!.height, name).toBeGreaterThanOrEqual(44);
        expect(box!.width, name).toBeGreaterThanOrEqual(44);
      }
      const accept = boxes['Akceptuję wszystkie']!;
      const reject = boxes['Odrzucam']!;
      const settings = boxes['Ustawienia']!;
      // Accept is on the first row and uses the full button row width.
      expect(accept.y + accept.height).toBeLessThanOrEqual(reject.y + 1);
      expect(Math.abs(reject.y - settings.y)).toBeLessThanOrEqual(1);
      // Reject stays at least as wide as settings (equal prominence).
      expect(reject.width).toBeGreaterThanOrEqual(settings.width - 1);
      expect(accept.width).toBeGreaterThan(reject.width);
    });

    // Phone fonts are wider than the test font, so 320 px stands in for "390 px on a real phone".
    for (const width of [390, 320]) {
      test(`hero pill does not leave one word alone on a line at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/');
        const lines = await page.locator('.hero .eyebrow').evaluate((el) => {
          const range = document.createRange();
          const rows = new Map<number, string>();
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node.textContent ?? '';
            for (let i = 0; i < text.length; i++) {
              if (/\s/.test(text[i]!)) continue;
              range.setStart(node, i);
              range.setEnd(node, i + 1);
              const top = Math.round(range.getBoundingClientRect().top);
              rows.set(top, (rows.get(top) ?? '') + text[i]);
            }
          }
          return [...rows.values()];
        });
        // One line is best. Two lines are fine when each line holds at least two words.
        // The words are the parts between the "·" separators.
        expect(lines.length).toBeLessThanOrEqual(2);
        if (lines.length > 1) {
          for (const line of lines) {
            const words = line.split('·').filter((w) => w.length > 0);
            expect(words.length, `line "${line}" has one word`).toBeGreaterThanOrEqual(2);
          }
        }
      });
    }

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
      expect(info.length).toBeLessThanOrEqual(80);
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

/* ---------- Hero contrast and desktop banner position (issue #81) ---------- */

/** Worst-case (lightest) background luminance behind an element, text hidden. */
async function lightestBackdrop(page: Page, target: Locator): Promise<number> {
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const restore = await target.evaluate((el) => {
    const html = el as HTMLElement;
    const old = html.style.color;
    html.style.color = 'transparent';
    return old;
  });
  // The banner and the action bar are not part of the hero photo. Hide them for the sample.
  await page.addStyleTag({
    content: '#cc-main, .action-bar { visibility: hidden !important; }',
  });
  const png = await page.screenshot({ clip: box, animations: 'disabled' });
  await target.evaluate((el, old) => ((el as HTMLElement).style.color = old), restore);
  return page.evaluate(async (b64) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height).data;
    const channel = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    let max = 0;
    for (let i = 0; i < data.length; i += 4) {
      const l =
        0.2126 * channel(data[i]!) +
        0.7152 * channel(data[i + 1]!) +
        0.0722 * channel(data[i + 2]!);
      if (l > max) max = l;
    }
    return max;
  }, png.toString('base64'));
}

for (const scheme of ['light', 'dark'] as const) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    test.describe(`hero at ${viewport.width} px, ${scheme} theme`, () => {
      test.use({ colorScheme: scheme, viewport });

      test('hero paragraph keeps 4.5:1 contrast on the photo', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        await waitForConsentBar(page);
        const lead = page.locator('.hero__lead');
        const text = parseRgb(await lead.evaluate((el) => getComputedStyle(el).color));
        const textLum = luminance(text);
        const bgLum = await lightestBackdrop(page, lead);
        expect((textLum + 0.05) / (bgLum + 0.05)).toBeGreaterThanOrEqual(4.5);
      });

      test('banner does not cover the hero text', async ({ page }) => {
        test.skip(viewport.width < 1024, 'desktop only');
        await page.goto('/');
        const bar = await waitForConsentBar(page);
        const barBox = (await bar.boundingBox())!;
        for (const selector of ['.hero .eyebrow', '.hero h1', '.hero__lead', '.hero__former']) {
          const el = page.locator(selector);
          if ((await el.count()) === 0) continue;
          const box = (await el.first().boundingBox())!;
          const overlaps =
            box.x < barBox.x + barBox.width &&
            box.x + box.width > barBox.x &&
            box.y < barBox.y + barBox.height &&
            box.y + box.height > barBox.y;
          expect(overlaps, `${selector} is covered by the banner`).toBe(false);
        }
        // A floating card in a corner, not a bar over the full width.
        expect(barBox.width).toBeLessThanOrEqual(480);
      });
    });
  }
}

/* ---------- Button labels are not cut (issue #86) ---------- */

for (const scheme of ['light', 'dark'] as const) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    test.describe(`banner labels at ${viewport.width} px, ${scheme} theme`, () => {
      test.use({ colorScheme: scheme, viewport });

      test('every banner button keeps its full label inside the button', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        const bar = await waitForConsentBar(page);
        for (const name of ['Akceptuję wszystkie', 'Odrzucam', 'Ustawienia']) {
          const btn = bar.getByRole('button', { name });
          await expect(btn).toBeVisible();
          const sizes = await btn.evaluate((el) => ({
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
          }));
          expect(
            sizes.scrollWidth,
            `"${name}" is cut (${sizes.scrollWidth} > ${sizes.clientWidth})`,
          ).toBeLessThanOrEqual(sizes.clientWidth);
        }
      });
    });
  }
}

/* ---------- Desktop card (issue #85) ---------- */

test.describe('1280 px viewport: the banner card stays off links and buttons', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  async function waitForSlideIn(page: Page, bar: Locator) {
    await expect
      .poll(async () => {
        const box = (await bar.boundingBox())!;
        return box.y + box.height;
      })
      .toBeLessThanOrEqual(800);
  }

  // Names of the page links and buttons that the card covers at the current scroll position.
  async function coveredControls(page: Page): Promise<string[]> {
    return page.evaluate(() => {
      const card = document.querySelector('#cc-main .cm')!.getBoundingClientRect();
      const controls = document.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, textarea, summary',
      );
      const hits: string[] = [];
      for (const el of controls) {
        if (el.closest('#cc-main')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > innerHeight) continue;
        const overlaps =
          r.left < card.right && r.right > card.left && r.top < card.bottom && r.bottom > card.top;
        if (overlaps) hits.push((el.textContent ?? '').trim().slice(0, 30) || el.tagName);
      }
      return hits;
    });
  }

  for (const route of ['/pokoje/', '/pakiety/', '/kontakt/', '/rezerwacja/']) {
    test(`${route}: card is small and covers no control at the top or the bottom`, async ({
      page,
    }) => {
      await page.goto(route);
      const bar = await waitForConsentBar(page);
      await waitForSlideIn(page, bar);
      const box = (await bar.boundingBox())!;
      expect(box.width, 'card width').toBeLessThanOrEqual(340);
      expect(box.height, 'card height').toBeLessThanOrEqual(220);
      expect(await coveredControls(page), 'at the top').toEqual([]);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(200);
      expect(await coveredControls(page), 'at the bottom').toEqual([]);
    });

    test(`${route}: keyboard focus is never hidden behind the card`, async ({ page }) => {
      await page.goto(route);
      const bar = await waitForConsentBar(page);
      await waitForSlideIn(page, bar);
      await page.locator('body').click({ position: { x: 5, y: 5 } });
      for (let i = 0; i < 120; i++) {
        await page.keyboard.press('Tab');
        const state = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return { inCard: false, covered: false, name: '' };
          if (el.closest('#cc-main')) return { inCard: true, covered: false, name: '' };
          const card = document.querySelector('#cc-main .cm')!.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          // A wide field may touch the card edge. Its centre must stay visible and clickable.
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const covered = cx > card.left && cx < card.right && cy > card.top && cy < card.bottom;
          return {
            inCard: false,
            covered,
            name: ((el.textContent ?? '').trim() || el.outerHTML).slice(0, 80),
          };
        });
        if (state.inCard) break;
        expect(state.covered, `focused "${state.name}" is behind the card`).toBe(false);
      }
    });
  }
});
