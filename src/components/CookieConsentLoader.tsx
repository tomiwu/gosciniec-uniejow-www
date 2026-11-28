'use client';

import { useEffect, useRef } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { buildCookieConsentConfig, CONSENT_COOKIE_NAME } from '@/lib/consent/config';

/**
 * Loads the CMP after the page is interactive so the banner is not the LCP element.
 */
export function CookieConsentLoader() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = () => {
      const needsFirstVisitPrompt = !document.cookie.split(';').some((part) => {
        return part.trim().startsWith(`${CONSENT_COOKIE_NAME}=`);
      });
      void CookieConsent.run({ ...buildCookieConsentConfig(), autoShow: false }).then(() => {
        if (needsFirstVisitPrompt || !CookieConsent.validConsent()) CookieConsent.show(true);
      });
    };

    const schedule = () => {
      if (typeof requestIdleCallback === 'function') {
        return requestIdleCallback(run, { timeout: 2000 });
      }
      return window.setTimeout(run, 0);
    };

    const id = schedule();
    return () => {
      if (typeof requestIdleCallback === 'function' && typeof id === 'number') {
        cancelIdleCallback(id);
      } else {
        clearTimeout(id);
      }
    };
  }, []);

  return null;
}
