import { withBase } from './preview';

/**
 * One self-hosted font (SIL Open Font License): Fraunces for the h1, h2 and the logo.
 * The text uses the system sans-serif font. A second web font made the mobile LCP
 * of /pokoje/ go over 2.5 s in the Lighthouse check (the font bytes compete with the LCP image).
 *
 * The file is a static instance (opsz 144, wght 500) with only the Latin and Polish glyphs
 * (about 12 kB). Use font-weight 500 for Fraunces text. Other weights are not in the file.
 * The CSS is inline in <head> so that the URL gets the base path of the preview build.
 */
const RANGE =
  'U+0020-007E, U+00A0, U+00AB, U+00B0, U+00B7, U+00BB, U+00D3, U+00D7, U+00E9, U+00F3, ' +
  'U+0104-0107, U+0118-0119, U+0141-0144, U+015A-015B, U+0179-017C, ' +
  'U+2013-2014, U+2018-201E, U+2022, U+2026, U+2192, U+20AC';

const faces = [{ family: 'Fraunces', file: 'fraunces-500', weight: '500', range: RANGE }] as const;

export function fontUrl(file: string, base?: string): string {
  return withBase(`/fonts/${file}.woff2`, base);
}

/** Preload the file, so that `font-display: optional` can use it on the first visit. */
export const preloadFonts = faces.map((face) => face.file);

export function fontFaceCss(base?: string): string {
  return faces
    .map(
      (face) =>
        `@font-face{font-family:"${face.family}";src:url(${fontUrl(face.file, base)}) format("woff2");font-weight:${face.weight};font-display:optional;unicode-range:${face.range}}`,
    )
    .join('');
}
