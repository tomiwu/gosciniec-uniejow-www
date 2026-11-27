import { describe, expect, it } from 'vitest';
import {
  allPlaceholders,
  cheapestRoomFromPrice,
  PLACEHOLDER_BADGE,
  placeholderPackages,
} from './placeholders';
import { offers } from '@/lib/offers';
import { rooms } from '@/lib/rooms';

describe('placeholder records', () => {
  it('uses the exact badge text "Dane testowe"', () => {
    expect(PLACEHOLDER_BADGE).toBe('Dane testowe');
  });

  it('has at least one sample package', () => {
    expect(placeholderPackages.length).toBeGreaterThan(0);
  });

  it('marks every record with isPlaceholder: true', () => {
    expect(allPlaceholders.length).toBeGreaterThan(0);
    for (const record of allPlaceholders) expect(record.isPlaceholder).toBe(true);
  });

  it('has unique ids', () => {
    const ids = allPlaceholders.map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not copy the archived 719 zł amount or its name into a sample', () => {
    const text = JSON.stringify(allPlaceholders);
    expect(text).not.toContain('719');
    expect(text).not.toMatch(/Kobiecy/i);
  });

  describe('sample from-price of the cheapest room (issue #35)', () => {
    it('is a placeholder record in PLN and is listed in allPlaceholders', () => {
      expect(cheapestRoomFromPrice.isPlaceholder).toBe(true);
      expect(cheapestRoomFromPrice.currency).toBe('PLN');
      expect(cheapestRoomFromPrice.amount).toBeGreaterThan(0);
      expect(allPlaceholders).toContain(cheapestRoomFromPrice);
    });

    it('names a real room type', () => {
      expect(rooms.map((room) => room.slug)).toContain(cheapestRoomFromPrice.roomSlug);
    });

    it('does not leak into real owner data', () => {
      for (const room of rooms) expect(room.priceFrom).toBeNull();
      expect(offers.map((offer) => offer.price)).not.toContain(cheapestRoomFromPrice.amount);
    });
  });
});
