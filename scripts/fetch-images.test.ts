import { describe, expect, it } from 'vitest';
import { extractImageUrls, isAllowedUrl, slugFromUrl, widthsFor } from './fetch-images';

const UP = 'https://gosciniecuniejow.pl/wp-content/uploads/';

describe('fetch-images helpers', () => {
  it('reads URLs only from the "Images (full size)" section', () => {
    const md = [
      '## Text',
      `- ${UP}2024/02/not-this.jpg`,
      '## Images (full size)',
      '',
      `- ${UP}2024/02/a.jpg`,
      '- http://medicare.bold-themes.com/clinic/logo.png',
      '## Links',
      `- ${UP}2024/02/not-that.jpg`,
    ].join('\n');
    expect(extractImageUrls(md)).toEqual([
      `${UP}2024/02/a.jpg`,
      'http://medicare.bold-themes.com/clinic/logo.png',
    ]);
  });

  it('allows only old-site uploads and skips badges of other sites', () => {
    expect(isAllowedUrl(`${UP}2024/02/a.jpg`)).toBe(true);
    expect(isAllowedUrl('http://gosciniecuniejow.pl/wp-content/uploads/a.jpg')).toBe(false);
    expect(isAllowedUrl('http://medicare.bold-themes.com/clinic/wp-content/uploads/a.png')).toBe(
      false,
    );
    expect(isAllowedUrl(`${UP}2025/09/rekomendacja_mojekonferencje.png`)).toBe(false);
  });

  it('makes safe slugs', () => {
    expect(slugFromUrl(`${UP}2024/02/IMG_0428-scaled.jpg`)).toBe('img-0428');
    expect(slugFromUrl(`${UP}2024/02/Konferencje_uniejow_gosciniec2.jpg`)).toBe(
      'konferencje-uniejow-gosciniec2',
    );
    expect(slugFromUrl(`${UP}2024/02/2-1.jpg`)).toBe('foto-2-1');
    expect(slugFromUrl(`${UP}2025/09/497847662.jpg`)).toBe('foto-497847662');
  });

  it('never upscales', () => {
    expect(widthsFor(4000)).toEqual([480, 960, 1600]);
    expect(widthsFor(1200)).toEqual([480, 960]);
    expect(widthsFor(268)).toEqual([268]);
  });
});
