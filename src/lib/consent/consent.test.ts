// @vitest-environment happy-dom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CONSENT_DEFAULTS } from '@/lib/consent/defaults';
import { applyAnalyticsConsent, googletagmanagerSrc } from '@/lib/consent/analytics';
import { isValidGa4Id } from '@/lib/consent/ga4';

describe('isValidGa4Id', () => {
  it('accepts a GA4 measurement ID', () => {
    expect(isValidGa4Id('G-ABCDEF12')).toBe(true);
  });

  it('rejects empty and non-GA4 values', () => {
    expect(isValidGa4Id('')).toBe(false);
    expect(isValidGa4Id('UA-123')).toBe(false);
    expect(isValidGa4Id('G-lowercase')).toBe(false);
  });
});

describe('buildConsentDefaultScript', () => {
  const envKey = 'NEXT_PUBLIC_GA4_ID';

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns null without NEXT_PUBLIC_GA4_ID', async () => {
    vi.stubEnv(envKey, '');
    vi.resetModules();
    const { buildConsentDefaultScript: build } =
      await import('@/lib/consent/consent-default-script');
    expect(build()).toBeNull();
  });

  it('sets consent defaults before any Google request when GA4 ID is set', async () => {
    vi.stubEnv(envKey, 'G-TESTUNIT1');
    vi.resetModules();
    const { buildConsentDefaultScript: build } =
      await import('@/lib/consent/consent-default-script');
    const script = build();
    expect(script).toContain('gtag');
    expect(script).toContain(JSON.stringify(CONSENT_DEFAULTS));
    expect(script).toContain('"analytics_storage":"denied"');
  });
});

describe('applyAnalyticsConsent', () => {
  const injected: HTMLScriptElement[] = [];

  beforeEach(() => {
    injected.length = 0;
    document.head.replaceChildren();
    document.body.replaceChildren();
    vi.spyOn(document.head, 'appendChild').mockImplementation((node) => {
      if (node instanceof HTMLScriptElement) injected.push(node);
      return node;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag = (...args: unknown[]) => {
      (window as unknown as { dataLayer: unknown[] }).dataLayer.push(args);
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not add gtag.js before grant', () => {
    applyAnalyticsConsent(false, 'G-E2ETEST0');
    expect(injected).toHaveLength(0);
  });

  it('loads googletagmanager once after grant', () => {
    applyAnalyticsConsent(true, 'G-E2ETEST0');
    expect(injected).toHaveLength(1);
    expect(injected[0]?.src).toBe(googletagmanagerSrc('G-E2ETEST0'));
    applyAnalyticsConsent(true, 'G-E2ETEST0');
    expect(injected).toHaveLength(1);
  });

  it('sends denied consent update on revoke', () => {
    applyAnalyticsConsent(true, 'G-E2ETEST0');
    applyAnalyticsConsent(false, 'G-E2ETEST0');
    const dataLayer = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    expect(dataLayer).toContainEqual(['consent', 'update', { analytics_storage: 'denied' }]);
  });

  it('pushes consent update to dataLayer', () => {
    applyAnalyticsConsent(true, 'G-E2ETEST0');
    const dataLayer = (window as unknown as { dataLayer: unknown[] }).dataLayer;
    const updates = dataLayer.filter(
      (entry) => Array.isArray(entry) && entry[0] === 'consent' && entry[1] === 'update',
    );
    expect(updates.length).toBeGreaterThan(0);
    expect(updates[0]).toEqual(['consent', 'update', { analytics_storage: 'granted' }]);
  });
});
