'use client';

import { useEffect, useRef } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import { buildCookieConsentConfig, CONSENT_COOKIE_NAME } from '@/lib/consent/config';

const WATCH_MS = 4000;
const INPUT_WINDOW_MS = 50;

function watchFocusTheft() {
  let lastInput = -Infinity;
  let lastFocus: HTMLElement | null = null;
  const onKey = () => {
    lastInput = performance.now();
  };
  // A pointer press counts as input for the banner only when it lands on the banner.
  const onPointer = (event: Event) => {
    if (event.target instanceof Element && event.target.closest('.cm')) {
      lastInput = performance.now();
    }
  };
  const onFocusIn = (event: FocusEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.closest('.cm')) {
      lastFocus = target;
      return;
    }
    const byUser = performance.now() - lastInput < INPUT_WINDOW_MS;
    if (!byUser && lastFocus?.isConnected) lastFocus.focus({ preventScroll: true });
  };
  if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
    lastFocus = document.activeElement;
  }
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('pointerdown', onPointer, true);
  document.addEventListener('focusin', onFocusIn, true);
  window.setTimeout(() => {
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('pointerdown', onPointer, true);
    document.removeEventListener('focusin', onFocusIn, true);
  }, WATCH_MS);
}

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
        if (!needsFirstVisitPrompt && CookieConsent.validConsent()) return;
        // The library moves focus to the banner when it opens, a short time later.
        // Give focus back when no key or pointer caused it. A guest in a form field keeps focus.
        watchFocusTheft();
        CookieConsent.show(true);
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
