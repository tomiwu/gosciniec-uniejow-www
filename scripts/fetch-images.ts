/**
 * One-time import of the photos of the old site (PRD decision D8).
 *
 * Usage: npx tsx scripts/fetch-images.ts
 *
 * This script uses the network. It is NOT part of CI or of the tests.
 * Run it one time and commit `public/img/` and `src/lib/images.ts`.
 *
 * Steps:
 * 1. Read the "Images (full size)" sections of `docs/source/*.md`.
 * 2. Keep only URLs that start with the old-site uploads prefix.
 * 3. Download each photo and write AVIF, WebP and JPEG files in 480, 960 and 1600 px.
 *    No upscale. No metadata (EXIF, XMP, IPTC, GPS).
 * 4. Write the typed manifest `src/lib/images.ts`.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

export const UPLOADS_PREFIX = 'https://gosciniecuniejow.pl/wp-content/uploads/';
export const TARGET_WIDTHS = [480, 960, 1600] as const;
export const QUALITY = { avif: 50, webp: 70, jpg: 75 } as const;
/**
 * Lower AVIF and WebP quality for LCP photos under a dark text overlay (the home hero). The
 * overlay hides the small loss, and the file is about half the size (LCP on a slow phone).
 */
export const OVERLAY_QUALITY = { avif: 35, webp: 55, jpg: 75 } as const;
export const OVERLAY_SLUGS: ReadonlySet<string> = new Set(['foto-7']);

export function qualityFor(slug: string): typeof QUALITY | typeof OVERLAY_QUALITY {
  return OVERLAY_SLUGS.has(slug) ? OVERLAY_QUALITY : QUALITY;
}
/** Files of other sites or badges. They are not photos of the hotel. */
export const SKIP_NAME = /^rekomendacja_/i;

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SOURCE_DIR = join(ROOT, 'docs', 'source');
const OUT_DIR = join(ROOT, 'public', 'img');
const MANIFEST_PATH = join(ROOT, 'src', 'lib', 'images.ts');

export interface ImageEntry {
  slug: string;
  widths: number[];
  width: number;
  height: number;
}

/** Return the URLs in the "Images (full size)" section of one Markdown text. */
export function extractImageUrls(markdown: string): string[] {
  const urls: string[] = [];
  let inSection = false;
  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      inSection = line.trim() === '## Images (full size)';
      continue;
    }
    if (!inSection) continue;
    const match = /(https?:\/\/[^\s)]+)/.exec(line);
    if (match?.[1]) urls.push(match[1]);
  }
  return urls;
}

export function isAllowedUrl(url: string): boolean {
  return url.startsWith(UPLOADS_PREFIX) && !SKIP_NAME.test(basename(url));
}

/** Make a file-name safe slug. "IMG_0428-scaled.jpg" gives "img-0428". */
export function slugFromUrl(url: string): string {
  const name = basename(new URL(url).pathname, extname(url));
  const slug = name
    .toLowerCase()
    .replace(/-scaled$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return /^\d+(-\d+)*$/.test(slug) ? `foto-${slug}` : slug;
}

/** Widths to write for a photo. No upscale: a small photo keeps its own width. */
export function widthsFor(sourceWidth: number): number[] {
  const widths = TARGET_WIDTHS.filter((w) => w <= sourceWidth);
  return widths.length > 0 ? [...widths] : [sourceWidth];
}

export async function collectUrls(): Promise<string[]> {
  const files = (await readdir(SOURCE_DIR)).filter((f) => f.endsWith('.md')).sort();
  const all = new Set<string>();
  for (const file of files) {
    const text = await readFile(join(SOURCE_DIR, file), 'utf8');
    for (const url of extractImageUrls(text)) all.add(url);
  }
  return [...all].sort();
}

export async function download(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

export async function processPhoto(slug: string, input: Buffer): Promise<ImageEntry> {
  const quality = qualityFor(slug);
  // Decode one time. rotate() applies the EXIF orientation.
  // Sharp drops all metadata (EXIF, XMP, IPTC, GPS) on output by default.
  const decoded = await sharp(input).rotate().raw().toBuffer({ resolveWithObject: true });
  const { width: sourceWidth, height: sourceHeight, channels } = decoded.info;
  const widths = widthsFor(sourceWidth);
  const raw = { width: sourceWidth, height: sourceHeight, channels };
  let width = 0;
  let height = 0;
  for (const target of widths) {
    const resized = () =>
      sharp(decoded.data, { raw }).resize({ width: target, withoutEnlargement: true });
    const [jpg, webp, avif] = await Promise.all([
      resized()
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: quality.jpg, mozjpeg: true })
        .toBuffer({ resolveWithObject: true }),
      resized().webp({ quality: quality.webp }).toBuffer(),
      resized().avif({ quality: quality.avif }).toBuffer(),
    ]);
    await Promise.all([
      writeFile(join(OUT_DIR, `${slug}-${target}.jpg`), jpg.data),
      writeFile(join(OUT_DIR, `${slug}-${target}.webp`), webp),
      writeFile(join(OUT_DIR, `${slug}-${target}.avif`), avif),
    ]);
    width = jpg.info.width;
    height = jpg.info.height;
  }
  return { slug, widths, width, height };
}

function renderManifest(entries: ImageEntry[]): string {
  const rows = entries
    .map(
      (e) =>
        `  { slug: '${e.slug}', widths: [${e.widths.join(', ')}], width: ${e.width}, height: ${e.height} },`,
    )
    .join('\n');
  return `// Written by scripts/fetch-images.ts. Do not edit by hand.
export interface ImageEntry {
  slug: string;
  /** Widths (px) that exist on disk as AVIF, WebP and JPEG. The last one is the largest. */
  widths: readonly number[];
  /** Intrinsic width (px) of the largest file. */
  width: number;
  /** Intrinsic height (px) of the largest file. */
  height: number;
}

export const images = [
${rows}
] as const satisfies readonly ImageEntry[];

export type ImageSlug = (typeof images)[number]['slug'];
`;
}

async function main(): Promise<void> {
  const urls = (await collectUrls()).filter((url) => {
    const allowed = isAllowedUrl(url);
    if (!allowed) console.log(`skip (not a hotel photo): ${url}`);
    return allowed;
  });

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const entries: ImageEntry[] = [];
  const seen = new Map<string, string>();
  for (const url of urls) {
    const slug = slugFromUrl(url);
    const clash = seen.get(slug);
    if (clash) throw new Error(`Slug clash "${slug}": ${clash} and ${url}`);
    seen.set(slug, url);
    try {
      entries.push(await processPhoto(slug, await download(url)));
      console.log(`ok: ${slug}`);
    } catch (error) {
      // Example: HEIC files. The prebuilt libheif of sharp has no HEVC decoder.
      const reason = error instanceof Error ? error.message.split('\n').pop() : String(error);
      console.warn(`FAILED (skipped): ${url} - ${reason}`);
    }
  }

  entries.sort((a, b) => a.slug.localeCompare(b.slug));
  await writeFile(MANIFEST_PATH, renderManifest(entries));
  console.log(`Wrote ${entries.length} photos and ${MANIFEST_PATH}. Run "npm run format" next.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main();
}
