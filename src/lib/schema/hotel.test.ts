import { describe, expect, it } from 'vitest';
import { nap } from '../nap';
import { buildHotelSchema } from './hotel';

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

  it('has no rating and no price range', () => {
    const keys = Object.keys(schema);
    expect(keys).not.toContain('aggregateRating');
    expect(keys).not.toContain('review');
    expect(keys).not.toContain('priceRange');
  });
});
