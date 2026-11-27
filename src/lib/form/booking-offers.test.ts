import { describe, expect, it } from 'vitest';
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { offers } from '@/lib/offers';
import {
  bookingOfferBySlug,
  bookingOfferOptions,
  isKnownBookingOfferSlug,
  packageFromParam,
} from './booking-offers';

const sylwester = offers.find((item) => item.id === 'sylwester-2026')!;
const sample = placeholderPackages[0]!;

describe('bookingOfferOptions', () => {
  it('lists Sylwester and the sample package only', () => {
    expect(bookingOfferOptions.map((item) => item.slug)).toEqual([
      'sylwester-2026-2027',
      sample.id,
    ]);
    expect(bookingOfferOptions[0]?.name).toBe(sylwester.name);
    expect(bookingOfferOptions[1]?.isPlaceholder).toBe(true);
  });

  it('does not list the archived 719 zł package', () => {
    const names = bookingOfferOptions.map((item) => item.name).join('\n');
    expect(names).not.toMatch(/Kobiecy/i);
    expect(names).not.toContain('719');
  });
});

describe('packageFromParam', () => {
  it('accepts the Sylwester slug and the sample package slug', () => {
    expect(packageFromParam('sylwester-2026-2027')).toBe('sylwester-2026-2027');
    expect(packageFromParam(sample.id)).toBe(sample.id);
  });

  it('rejects unknown, unsafe or missing slugs', () => {
    expect(packageFromParam(null)).toBe('');
    expect(packageFromParam('pakiet-kobiecy-weekend')).toBe('');
    expect(packageFromParam('<script>')).toBe('');
    expect(packageFromParam('a'.repeat(61))).toBe('');
  });

  it('marks the sample package as placeholder', () => {
    const item = bookingOfferBySlug(sample.id);
    expect(item?.isPlaceholder).toBe(true);
    expect(PLACEHOLDER_BADGE).toBe('Dane testowe');
  });
});

describe('isKnownBookingOfferSlug', () => {
  it('allows an empty value and known slugs only', () => {
    expect(isKnownBookingOfferSlug('')).toBe(true);
    expect(isKnownBookingOfferSlug('sylwester-2026-2027')).toBe(true);
    expect(isKnownBookingOfferSlug('x')).toBe(false);
  });
});
