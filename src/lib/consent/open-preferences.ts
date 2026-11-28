'use client';

import * as CookieConsent from 'vanilla-cookieconsent';

/** Footer control: open the CMP preferences modal. */
export function openCookiePreferences(): void {
  CookieConsent.showPreferences();
}
