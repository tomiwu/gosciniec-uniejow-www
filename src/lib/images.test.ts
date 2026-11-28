import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { images } from './images';

const IMG_DIR = join(process.cwd(), 'public', 'img');
const FORMATS = ['avif', 'webp', 'jpg'] as const;
const MAX_BYTES = 40 * 1024 * 1024;

describe('image manifest', () => {
  it('has entries with unique slugs', () => {
    expect(images.length).toBeGreaterThan(0);
    const slugs = images.map((image) => image.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('lists widths in ascending order and never above the intrinsic width', () => {
    for (const image of images) {
      expect(image.widths.length).toBeGreaterThan(0);
      expect([...image.widths].sort((a, b) => a - b)).toEqual([...image.widths]);
      // No upscale: the largest listed width is the intrinsic width of the entry.
      expect(image.widths.at(-1)).toBe(image.width);
    }
  });

  it('has one file per slug, width and format', () => {
    for (const image of images) {
      for (const width of image.widths) {
        for (const format of FORMATS) {
          expect(existsSync(join(IMG_DIR, `${image.slug}-${width}.${format}`))).toBe(true);
        }
      }
    }
  });

  it('has no file on disk that the manifest does not list', () => {
    const expected = new Set<string>();
    for (const image of images) {
      for (const width of image.widths) {
        for (const format of FORMATS) expected.add(`${image.slug}-${width}.${format}`);
      }
    }
    const onDisk = readdirSync(IMG_DIR).filter((name) => !name.startsWith('.'));
    expect(onDisk.filter((name) => !expected.has(name))).toEqual([]);
  });

  it('matches the pixel size of the files', async () => {
    for (const image of images) {
      for (const format of FORMATS) {
        const widest = await sharp(
          join(IMG_DIR, `${image.slug}-${image.width}.${format}`),
        ).metadata();
        expect(widest.width).toBe(image.width);
        expect(widest.height).toBe(image.height);
      }
      for (const width of image.widths) {
        const meta = await sharp(join(IMG_DIR, `${image.slug}-${width}.jpg`)).metadata();
        expect(meta.width).toBe(width);
      }
    }
  });

  it('has no EXIF, XMP, IPTC or GPS data in any file', async () => {
    for (const name of readdirSync(IMG_DIR)) {
      const meta = await sharp(join(IMG_DIR, name)).metadata();
      expect(meta.exif, name).toBeUndefined();
      expect(meta.xmp, name).toBeUndefined();
      expect(meta.iptc, name).toBeUndefined();
    }
  });

  it('keeps public/img below 40 MB', () => {
    const total = readdirSync(IMG_DIR).reduce(
      (sum, name) => sum + statSync(join(IMG_DIR, name)).size,
      0,
    );
    expect(total).toBeLessThan(MAX_BYTES);
  });

  // Issue #87: the first room photo is the LCP element of /pokoje/ on a phone. In the Lighthouse
  // slow-4G model, a file that fits in the first TCP window (about 14 KB with the headers) saves
  // one round trip. The 720 px AVIF is the file that a 412 px wide phone picks.
  it('keeps the phone AVIF of the first room photo at 12 KB or less', () => {
    expect(statSync(join(IMG_DIR, 'img-3729-720.avif')).size).toBeLessThanOrEqual(12 * 1024);
  });
});
