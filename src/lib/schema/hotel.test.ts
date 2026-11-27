import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { nap } from '../nap';
import { rooms } from '../rooms';
import { buildHotelRoomsSchema, buildHotelSchema } from './hotel';

describe('buildHotelSchema', () => {
  const schema = buildHotelSchema();

  it('is a Hotel with the schema.org context', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Hotel');
  });

  it('copies the NAP values', () => {
    expect(schema.name).toBe(nap.name);
    expect(schema.telephone).toBe(nap.phoneE164);
    expect(schema.email).toBe(nap.email);
    expect(schema.url).toBe(nap.siteUrl);
    expect(schema.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: nap.street,
      postalCode: nap.postalCode,
      addressLocality: nap.city,
      addressCountry: nap.country,
    });
  });

  it('has the logo as a file of the site', () => {
    expect(schema.logo).toBe(`${nap.siteUrl}/logo.png`);
    expect(existsSync('public/logo.png')).toBe(true);
  });

  it('has no rating and no price range', () => {
    const keys = Object.keys(schema);
    expect(keys).not.toContain('aggregateRating');
    expect(keys).not.toContain('review');
    expect(keys).not.toContain('priceRange');
  });
});

describe('buildHotelRoomsSchema', () => {
  const schema = buildHotelRoomsSchema(rooms);

  it('is the same Hotel entity as the site block', () => {
    expect(schema['@type']).toBe('Hotel');
    expect(schema['@id']).toBe(buildHotelSchema()['@id']);
    expect(schema.name).toBe(nap.name);
  });

  it('lists one HotelRoom with name and description for each room', () => {
    const places = schema.containsPlace as { '@type': string; name: string; description: string }[];
    expect(places).toHaveLength(rooms.length);
    places.forEach((place, index) => {
      expect(place['@type']).toBe('HotelRoom');
      expect(place.name).toBe(rooms[index]?.name);
      expect(place.description).toBe(rooms[index]?.shortDescription);
    });
  });

  it('has no Offer and no price', () => {
    const json = JSON.stringify(schema);
    expect(json).not.toContain('Offer');
    expect(json).not.toContain('price');
  });
});
