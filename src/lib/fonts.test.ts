import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fontFaceCss, fontUrl, preloadFonts } from './fonts';

describe('fonts', () => {
  it('has a small file in public/fonts for each face', () => {
    for (const match of fontFaceCss().matchAll(/url\(([^)]+)\)/g)) {
      const path = `public${match[1]}`;
      expect(existsSync(path), match[1]).toBe(true);
      // The font bytes compete with the LCP image on a slow mobile network.
      expect(statSync(path).size, match[1]).toBeLessThan(20_000);
    }
  });

  it('uses the base path of the preview build', () => {
    expect(fontUrl('fraunces-500', '/repo')).toBe('/repo/fonts/fraunces-500.woff2');
    expect(fontFaceCss('/repo')).toContain('url(/repo/fonts/fraunces-500.woff2)');
  });

  it('never blocks the text and preloads the font', () => {
    expect(fontFaceCss().match(/font-display:optional/g)).toHaveLength(1);
    expect(preloadFonts).toEqual(['fraunces-500']);
  });

  it('covers the Polish letters', () => {
    for (const range of ['U+0104-0107', 'U+0118-0119', 'U+0141-0144', 'U+015A-015B', 'U+0179-017C', 'U+00D3', 'U+00F3']) {
      expect(fontFaceCss()).toContain(range);
    }
  });
});
