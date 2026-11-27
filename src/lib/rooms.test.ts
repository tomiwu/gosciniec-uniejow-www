import { describe, expect, it } from 'vitest';
import { images } from './images';
import { roomFromParam } from './form/prefill';
import { rooms } from './rooms';

describe('rooms', () => {
  it('has the four room types in the page order', () => {
    expect(rooms.map((room) => room.name)).toEqual([
      'Pokój typu standard',
      'Pokój typu superior',
      'Pokój Deluxe w standardzie 3*',
      'Rodzinny Apartament',
    ]);
  });

  it('has unique slugs that are safe in a URL', () => {
    const slugs = rooms.map((room) => room.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('has no price (PRD D3)', () => {
    for (const room of rooms) expect(room.priceFrom).toBeNull();
  });

  it('has a description, features and a known image for each room', () => {
    for (const room of rooms) {
      expect(room.shortDescription.length).toBeGreaterThan(20);
      expect(room.features.length).toBeGreaterThan(3);
      expect(room.imageAlt.trim()).not.toBe('');
      for (const slug of room.imageSlugs) {
        expect(images.some((image) => image.slug === slug)).toBe(true);
      }
    }
  });

  it('does not claim thermal pools', () => {
    const text = JSON.stringify(rooms).toLowerCase();
    expect(text).not.toContain('basen');
    expect(text).not.toContain('term');
  });

  it('gives the booking form a readable value for every slug', () => {
    for (const room of rooms) expect(roomFromParam(room.slug)).not.toBe('');
  });
});
