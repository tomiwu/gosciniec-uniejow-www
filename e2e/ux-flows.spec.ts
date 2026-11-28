import { expect, test, type Page } from '@playwright/test';

/*
 * Issue #83: geometry of the mobile action bar and the cookie banner while the page moves.
 * The tests sample the real boxes at several scroll positions, after each consent step and
 * after a resize. They run in the required `e2e-a11y` job. The `visual-review` job is only a
 * report and does not run them.
 *
 * Playwright on Linux does not emulate the iOS Safari tool bar or a non-zero
 * `safe-area-inset-bottom`. The checks include the inset in the expected values, so they are
 * ready for a device that has one. They do not replace a test on a real iPhone.
 */

const ROUTES = ['/', '/pokoje/', '/kontakt/', '/pakiety/', '/rezerwacja/'];
const TOLERANCE = 1; // px
const BANNER_OVERLAP = 1; // px, by design (src/app/globals.css)

interface Metrics {
  innerWidth: number;
  innerHeight: number;
  scrollY: number;
  maxScroll: number;
  inset: number;
  barVar: number;
  barDisplay: string;
  bar: { top: number; bottom: number; left: number; right: number; height: number };
  buttons: { name: string; coveredBy: string | null }[];
  bannerOpen: boolean;
  banner: { top: number; bottom: number; height: number } | null;
  strays: string[];
}

/** Measure the real boxes in the page. One round trip, so the numbers share one frame. */
async function measure(page: Page): Promise<Metrics> {
  return page.evaluate(async () => {
    // Wait for the next frame: scroll and layout are settled.
    await new Promise<void>((done) =>
      requestAnimationFrame(() => requestAnimationFrame(() => done())),
    );

    const probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;visibility:hidden;padding-bottom:env(safe-area-inset-bottom)';
    document.body.append(probe);
    const inset = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
    probe.remove();

    const root = document.documentElement;
    const barVar = parseFloat(getComputedStyle(root).getPropertyValue('--bar-h'));
    const barEl = document.querySelector('.action-bar') as HTMLElement;
    const r = barEl.getBoundingClientRect();

    const buttons = [...barEl.querySelectorAll('a')].map((a) => {
      const b = a.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      return {
        name: (a.textContent ?? '').trim(),
        coveredBy: hit?.closest('a') === a ? null : (hit?.tagName ?? 'nothing'),
      };
    });

    const cm = document.querySelector('#cc-main .cm') as HTMLElement | null;
    const bannerOpen =
      root.classList.contains('show--consent') &&
      !!cm &&
      getComputedStyle(cm).visibility !== 'hidden' &&
      cm.getBoundingClientRect().height > 0;
    const cr = cm?.getBoundingClientRect();
    const banner = bannerOpen && cr ? { top: cr.top, bottom: cr.bottom, height: cr.height } : null;

    // Every point from the banner to the bottom of the screen must be the banner or the bar.
    const strays: string[] = [];
    if (banner) {
      const w = window.innerWidth;
      for (let y = Math.max(0, Math.floor(banner.bottom) - 4); y < window.innerHeight; y += 3) {
        for (const x of [Math.round(w * 0.1), Math.round(w * 0.5), Math.round(w * 0.9)]) {
          const el = document.elementFromPoint(x, y);
          if (!el?.closest('#cc-main') && !el?.closest('.action-bar')) {
            strays.push(`${x},${y}:${el?.tagName}`);
          }
        }
      }
    }

    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollY: window.scrollY,
      maxScroll: Math.max(0, root.scrollHeight - window.innerHeight),
      inset,
      barVar,
      barDisplay: getComputedStyle(barEl).display,
      bar: { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height },
      buttons,
      bannerOpen,
      banner,
      strays,
    };
  });
}

interface Expectation {
  /** The banner must be open (true) or closed (false). */
  banner: boolean;
}

/** Assert the layout rules for one sample. Returns the bar height for the stability check. */
function assertLayers(m: Metrics, want: Expectation, label: string): number {
  // The bar is fixed to the bottom of the viewport and fully visible.
  expect(m.barDisplay, `${label}: bar is shown`).not.toBe('none');
  expect(Math.abs(m.innerHeight - m.bar.bottom), `${label}: bottom gap`).toBeLessThanOrEqual(
    TOLERANCE,
  );
  expect(m.bar.top, `${label}: bar top inside the viewport`).toBeGreaterThanOrEqual(0);
  expect(m.bar.left, `${label}: bar left`).toBeLessThanOrEqual(TOLERANCE);
  expect(m.bar.right, `${label}: bar right`).toBeGreaterThanOrEqual(m.innerWidth - TOLERANCE);
  // Height is --bar-h plus the safe-area inset (the bar pads its bottom with the inset).
  expect(
    Math.abs(m.bar.height - (m.barVar + m.inset)),
    `${label}: bar height ${m.bar.height} vs --bar-h ${m.barVar} + inset ${m.inset}`,
  ).toBeLessThanOrEqual(TOLERANCE);

  // Both buttons are the top element at their centre: nothing covers them.
  expect(
    m.buttons.map((b) => b.name),
    `${label}: buttons`,
  ).toEqual(['Zadzwoń', 'Rezerwuj']);
  for (const b of m.buttons) {
    expect(b.coveredBy, `${label}: ${b.name} is covered`).toBeNull();
  }

  expect(m.bannerOpen, `${label}: banner state`).toBe(want.banner);
  if (m.banner) {
    // The banner ends where the bar starts. It may overlap by the designed 1 px, not more.
    expect(m.banner.bottom, `${label}: banner not above the bar (gap)`).toBeGreaterThanOrEqual(
      m.bar.top - 0.5,
    );
    expect(
      m.banner.bottom,
      `${label}: banner overlaps the bar by more than ${BANNER_OVERLAP} px`,
    ).toBeLessThanOrEqual(m.bar.top + BANNER_OVERLAP + 0.5);
    expect(m.banner.top, `${label}: banner top inside the viewport`).toBeGreaterThanOrEqual(0);
    expect(m.strays, `${label}: page content between the banner and the bar`).toEqual([]);
  }
  return m.bar.height;
}

async function scrollTo(page: Page, y: number) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
}

/** Scroll slowly down and up and check the layers at each stop. */
async function sampleWhileScrolling(page: Page, want: Expectation, label: string) {
  const start = await measure(page);
  const heights = [assertLayers(start, want, `${label} @top`)];
  const maxScroll = start.maxScroll;
  // Two steps per screen height, down to the end and back up.
  const stops = new Set<number>();
  for (let y = 0; y < maxScroll; y += start.innerHeight / 2) stops.add(Math.round(y));
  stops.add(Math.round(maxScroll));
  const down = [...stops].sort((a, b) => a - b);
  const path = [...down, ...[...down].reverse().slice(1)];

  let barTop = start.bar.top;
  let moved = false;
  for (const y of path) {
    await scrollTo(page, y);
    const m = await measure(page);
    if (m.scrollY > 0) moved = true;
    heights.push(assertLayers(m, want, `${label} @scroll ${Math.round(m.scrollY)}`));
    // A fixed bar does not move while the page scrolls.
    expect(Math.abs(m.bar.top - barTop), `${label}: bar moved at scroll ${y}`).toBeLessThanOrEqual(
      TOLERANCE,
    );
    barTop = m.bar.top;
  }
  if (maxScroll > 0) expect(moved, `${label}: the page did scroll`).toBe(true);
  // The height is stable during the whole run.
  expect(
    Math.max(...heights) - Math.min(...heights),
    `${label}: bar height changes`,
  ).toBeLessThanOrEqual(TOLERANCE);
}

async function waitForBanner(page: Page) {
  const banner = page.locator('#cc-main .cm');
  await expect(banner).toBeVisible({ timeout: 20_000 });
  return banner;
}

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

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`mobile ${scheme} theme`, () => {
    test.use({ colorScheme: scheme });
    test.beforeEach(async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'chromium-desktop', 'mobile projects only');
      expect(page.viewportSize()!.width).toBeLessThan(1024);
    });

    for (const route of ROUTES) {
      test(`${route}: open banner, scroll down and up`, async ({ page }) => {
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
        await waitForBanner(page);
        await sampleWhileScrolling(page, { banner: true }, `${route} banner open`);
      });

      test(`${route}: accept closes the banner and the bar stays in place`, async ({ page }) => {
        await page.goto(route);
        const banner = await waitForBanner(page);
        await scrollTo(page, 200);
        await banner.getByRole('button', { name: 'Akceptuję wszystkie' }).click();
        await expect(banner).toBeHidden();
        await sampleWhileScrolling(page, { banner: false }, `${route} after accept`);
      });

      test(`${route}: reject closes the banner and the bar stays in place`, async ({ page }) => {
        await page.goto(route);
        const banner = await waitForBanner(page);
        await banner.getByRole('button', { name: 'Odrzucam' }).click();
        await expect(banner).toBeHidden();
        await sampleWhileScrolling(page, { banner: false }, `${route} after reject`);
      });

      test(`${route}: Ustawienia opens and closes without breaking the layers`, async ({
        page,
      }) => {
        await page.goto(route);
        const banner = await waitForBanner(page);
        await scrollTo(page, 300);
        await banner.getByRole('button', { name: 'Ustawienia' }).click();
        const modal = page.locator('#cc-main .pm');
        await expect(modal).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(modal).toBeHidden();
        // No choice was made: the banner is back and the layers are in place.
        await expect(banner).toBeVisible();
        await sampleWhileScrolling(page, { banner: true }, `${route} after Ustawienia`);
      });
    }

    test('Zadzwoń and Rezerwuj are tappable with the banner open and closed', async ({ page }) => {
      await page.goto('/pokoje/');
      const banner = await waitForBanner(page);
      const bar = page.locator('.action-bar');
      for (const y of [0, 600]) {
        await scrollTo(page, y);
        for (const name of ['Zadzwoń', 'Rezerwuj']) {
          // A trial click runs the hit-target check without the click.
          await bar.getByRole('link', { name }).click({ trial: true });
        }
      }
      await banner.getByRole('button', { name: 'Odrzucam' }).click();
      await expect(banner).toBeHidden();
      for (const name of ['Zadzwoń', 'Rezerwuj']) {
        await bar.getByRole('link', { name }).click({ trial: true });
      }
      await expect(bar.getByRole('link', { name: 'Zadzwoń' })).toHaveAttribute(
        'href',
        'tel:+48632888628',
      );
      await bar.getByRole('link', { name: 'Rezerwuj' }).click();
      await expect(page).toHaveURL(/\/rezerwacja\/$/);
    });

    test('the layers stay in place after a turn to landscape and back', async ({ page }) => {
      await page.goto('/');
      await waitForBanner(page);
      const portrait = page.viewportSize()!;
      await scrollTo(page, 400);
      await page.setViewportSize({ width: portrait.height, height: portrait.width });
      await expect(page.locator('html')).toHaveClass(/show--consent/);
      await sampleWhileScrolling(page, { banner: true }, 'landscape');
      await page.setViewportSize(portrait);
      await sampleWhileScrolling(page, { banner: true }, 'portrait again');
    });
  });
}

test.describe('desktop 1280 px', () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test.beforeEach(async ({ browserName }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name !== 'chromium-desktop',
      'one desktop run is enough',
    );
  });

  for (const route of ROUTES) {
    test(`${route}: the action bar stays hidden while scrolling`, async ({ page }) => {
      await page.goto(route);
      const banner = await waitForBanner(page);
      for (const phase of ['open', 'closed']) {
        for (const frac of [0, 0.5, 1, 0.5, 0]) {
          const max = await page.evaluate(
            () => document.documentElement.scrollHeight - window.innerHeight,
          );
          await scrollTo(page, Math.round(max * frac));
          const m = await measure(page);
          expect(m.barDisplay, `${route} ${phase} @${frac}`).toBe('none');
          await expect(page.locator('.action-bar')).toBeHidden();
          expect(m.bannerOpen, `${route} ${phase} @${frac}: banner state`).toBe(phase === 'open');
        }
        if (phase === 'open') {
          await banner.getByRole('button', { name: 'Odrzucam' }).click();
          await expect(banner).toBeHidden();
        }
      }
    });
  }
});
