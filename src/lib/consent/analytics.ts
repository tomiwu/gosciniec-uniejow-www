import type { ConsentState } from '@/lib/consent/defaults';

export const GA4_SCRIPT_ATTR = 'data-gu-ga4';

export function googletagmanagerSrc(measurementId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
}

function gtag(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer ?? [];
  w.gtag = w.gtag ?? ((...a: unknown[]) => w.dataLayer?.push(a));
  w.gtag(...args);
}

let ga4ScriptMounted = false;

function removeGa4Script(): void {
  ga4ScriptMounted = false;
  document.querySelectorAll(`script[${GA4_SCRIPT_ATTR}]`).forEach((node) => node.remove());
}

function injectGa4Script(measurementId: string): void {
  if (ga4ScriptMounted || document.querySelector(`script[${GA4_SCRIPT_ATTR}]`)) return;
  ga4ScriptMounted = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = googletagmanagerSrc(measurementId);
  script.setAttribute(GA4_SCRIPT_ATTR, '1');
  document.head.appendChild(script);
  gtag('js', new Date());
  gtag('config', measurementId);
}

/** Sync Consent Mode and the GA4 script tag with the visitor choice. */
export function applyAnalyticsConsent(granted: boolean, measurementId: string): void {
  if (typeof document === 'undefined') return;
  const state: ConsentState = granted ? 'granted' : 'denied';
  gtag('consent', 'update', { analytics_storage: state });
  if (granted && measurementId) {
    injectGa4Script(measurementId);
    return;
  }
  removeGa4Script();
}
