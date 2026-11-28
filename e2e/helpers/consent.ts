import type { Page } from '@playwright/test';

/** Close the first-party CMP so axe scans the page content. */
export async function dismissConsentBar(page: Page): Promise<void> {
  const reject = page.locator('#cc-main').getByRole('button', { name: 'Odrzucam' });
  try {
    await reject.click({ timeout: 20_000 });
  } catch {
    /* Banner not shown (bot hide, or choice already saved). */
  }
}
