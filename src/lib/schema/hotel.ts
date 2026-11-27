import type { Hotel, WithContext } from 'schema-dts';
import { nap } from '../nap';
import type { Room } from '../rooms';

/**
 * JSON-LD for the hotel. Built from `nap.ts` only.
 * No rating, no price range and no invented data.
 */
export type HotelSchema = Exclude<WithContext<Hotel>, string>;

/** Same `@id` on every page. Search engines merge the blocks of one page into one entity. */
const HOTEL_ID = `${nap.siteUrl}/#hotel`;

export function buildHotelSchema(): HotelSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    '@id': HOTEL_ID,
    name: nap.name,
    url: nap.siteUrl,
    // Logo of the old site (issue #44), as PNG on a white background.
    logo: `${nap.siteUrl}/logo.png`,
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

/**
 * The Hotel block with one `HotelRoom` for each room type (page `/pokoje/`).
 * There is no `Offer`: the site has no real room price (PRD D3).
 */
export function buildHotelRoomsSchema(rooms: readonly Room[]): HotelSchema {
  return {
    ...buildHotelSchema(),
    containsPlace: rooms.map((room) => ({
      '@type': 'HotelRoom' as const,
      name: room.name,
      description: room.shortDescription,
    })),
  };
}
