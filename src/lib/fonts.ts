import { withBase } from './preview';

/**
 * Self-hosted fonts (SIL Open Font License): Fraunces for headings, Mona Sans for text.
 * Each family has two files: Latin (`-pl`) and the Polish letters (`-plx`, unicode-range).
 * The variable axes are cut to the used range (Fraunces opsz 144, wght 400-600;
 * Mona Sans wght 400-700) to keep the bytes small.
 * The CSS is inline in <head> so that the URLs get the base path of the preview build.
 */
const LATIN = 'U+0020-007E, U+00A0-00FF, U+2013-2014, U+2018-201E, U+2022, U+2026, U+2192, U+20AC';
const POLISH = 'U+0104-0107, U+0118-0119, U+0141-0144, U+015A-015B, U+0179-017C';

const faces = [
  { family: 'Fraunces', file: 'fraunces-pl', weight: '400 600', range: LATIN },
  { family: 'Fraunces', file: 'fraunces-plx', weight: '400 600', range: POLISH },
  { family: 'Mona Sans', file: 'monasans-pl', weight: '400 700', range: LATIN },
  { family: 'Mona Sans', file: 'monasans-plx', weight: '400 700', range: POLISH },
] as const;

export function fontUrl(file: string, base?: string): string {
  return withBase(`/fonts/${file}.woff2`, base);
}

/**
 * Preload all four files. Polish text needs the `-plx` files on every page. Without a preload
 * `font-display: optional` can use the fallback font for ą, ę, ś... and the main font for the
 * other letters in the same word. The `-plx` files are small (about 4 kB each).
 */
export const preloadFonts = faces.map((face) => face.file);

export function fontFaceCss(base?: string): string {
  return faces
    .map(
      (face) =>
        `@font-face{font-family:"${face.family}";src:url(${fontUrl(face.file, base)}) format("woff2");font-weight:${face.weight};font-display:optional;unicode-range:${face.range}}`,
    )
    .join('');
}
