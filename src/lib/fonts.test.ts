import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fontFaceCss, fontUrl, preloadFonts } from './fonts';

describe('fonts', () => {
  it('has a file in public/fonts for each face', () => {
    for (const match of fontFaceCss().matchAll(/url\(([^)]+)\)/g)) {
      expect(existsSync(`public${match[1]}`), match[1]).toBe(true);
    }
  });

  it('uses the base path of the preview build', () => {
    expect(fontUrl('fraunces-pl', '/repo')).toBe('/repo/fonts/fraunces-pl.woff2');
    expect(fontFaceCss('/repo')).toContain('url(/repo/fonts/monasans-plx.woff2)');
  });

  it('never blocks the text and preloads the Latin and the Polish files', () => {
    expect(fontFaceCss().match(/font-display:optional/g)).toHaveLength(4);
    expect(preloadFonts).toEqual(['fraunces-pl', 'fraunces-plx', 'monasans-pl', 'monasans-plx']);
  });
});
