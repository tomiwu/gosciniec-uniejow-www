import type { Hotel, WithContext } from 'schema-dts';
import { nap } from '../nap';

/**
 * JSON-LD for the hotel. Built from `nap.ts` only.
 * No rating, no price range and no invented data.
 */
export type HotelSchema = Exclude<WithContext<Hotel>, string>;

export function buildHotelSchema(): HotelSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: nap.name,
    url: nap.siteUrl,
    telephone: nap.phoneE164,
    email: nap.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: nap.street,
      postalCode: nap.postalCode,
      addressLocality: nap.city,
      addressCountry: nap.country,
    },
  };
}
