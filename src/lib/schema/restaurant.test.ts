import { describe, expect, it } from 'vitest';
import { nap } from '../nap';
import { buildHotelSchema } from './hotel';
import { buildRestaurantSchema } from './restaurant';

describe('buildRestaurantSchema', () => {
  const schema = buildRestaurantSchema();

  it('is a Restaurant with the restaurant name', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Restaurant');
    expect(schema.name).toBe('Restauracja Gościniec Uniejów');
    expect(schema.name).toBe(nap.restaurantName);
  });

  it('copies the address and the phone from nap.ts', () => {
    expect(schema.telephone).toBe(nap.phoneE164);
    expect(schema.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: nap.street,
      postalCode: nap.postalCode,
      addressLocality: nap.city,
      addressCountry: nap.country,
    });
    expect(schema.address).toEqual(buildHotelSchema().address);
  });

  it('points to the page of the restaurant', () => {
    expect(schema.url).toBe(`${nap.siteUrl}/restauracja/`);
  });

  it('has no rating, price range, opening hours or menu', () => {
    const keys = Object.keys(schema);
    for (const key of [
      'aggregateRating',
      'review',
      'priceRange',
      'openingHours',
      'openingHoursSpecification',
      'hasMenu',
      'servesCuisine',
    ]) {
      expect(keys).not.toContain(key);
    }
  });
});
