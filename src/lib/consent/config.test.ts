import { describe, expect, it, vi, afterEach } from 'vitest';

describe('buildCookieConsentConfig', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('exposes only necessary cookies without GA4 ID', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', '');
    const { buildCookieConsentConfig } = await import('@/lib/consent/config');
    const config = buildCookieConsentConfig();
    expect(Object.keys(config.categories)).toEqual(['necessary']);
    const pl = config.language.translations['pl'];
    expect(pl && typeof pl === 'object' && 'consentModal' in pl && pl.consentModal?.title).toBe(
      'Szanujemy Twoją prywatność',
    );
  });

  it('adds analytics category when GA4 ID is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_GA4_ID', 'G-TESTCFG1');
    const { buildCookieConsentConfig } = await import('@/lib/consent/config');
    const config = buildCookieConsentConfig();
    expect(Object.keys(config.categories).sort()).toEqual(['analytics', 'necessary']);
  });
});
