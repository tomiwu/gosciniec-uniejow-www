'use client';

import { openCookiePreferences } from '@/lib/consent/open-preferences';

export function CookieSettingsLink() {
  return (
    <button type="button" className="footer-links__cookie-settings" onClick={openCookiePreferences}>
      Ustawienia cookies
    </button>
  );
}
