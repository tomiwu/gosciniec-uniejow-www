import type { Restaurant, WithContext } from 'schema-dts';
import { nap } from '../nap';
import { HOTEL_ID } from './hotel';

/**
 * JSON-LD for the restaurant. Built from `nap.ts` only.
 * The old site gives no rating, price range, opening hours or cuisine list.
 * So the block has none of them.
 */
export type RestaurantSchema = Exclude<WithContext<Restaurant>, string>;

export function buildRestaurantSchema(): RestaurantSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${nap.siteUrl}/restauracja/#restaurant`,
    name: nap.restaurantName,
    url: `${nap.siteUrl}/restauracja/`,
    telephone: nap.phoneE164,
    email: nap.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: nap.street,
      postalCode: nap.postalCode,
      addressLocality: nap.city,
      addressCountry: nap.country,
    },
    // The restaurant is part of the hotel. The hotel block of the root layout has this `@id`.
    containedInPlace: { '@id': HOTEL_ID },
  };
}
