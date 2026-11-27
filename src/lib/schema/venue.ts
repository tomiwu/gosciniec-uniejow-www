import type { EventVenue, MeetingRoom, WithContext } from 'schema-dts';
import { nap } from '../nap';
import { equipment } from '../venue';
import { HOTEL_ID } from './hotel';

/**
 * JSON-LD for the rooms of the hotel. Only confirmed facts.
 * No capacity, no room count, no area, no price: the sources conflict or are silent
 * (sample figures live in `src/content/placeholders.ts`).
 * No `Event` and no `Offer` here. No name of a person.
 */
export type MeetingRoomSchema = Exclude<WithContext<MeetingRoom>, string>;
export type EventVenueSchema = Exclude<WithContext<EventVenue>, string>;

const containedInHotel = { '@id': HOTEL_ID } as const;

export function buildConferenceRoomsSchema(): MeetingRoomSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'MeetingRoom',
    name: `Sale konferencyjne – ${nap.name}`,
    description:
      'Sale konferencyjne i szkoleniowe w hotelu Gościniec Uniejów. Układ sali: teatralny, szkoleniowy, w podkowę lub warsztatowy.',
    url: `${nap.siteUrl}/konferencje/`,
    containedInPlace: containedInHotel,
    amenityFeature: equipment.map((name) => ({
      '@type': 'LocationFeatureSpecification' as const,
      name,
      value: true,
    })),
  };
}

export function buildBallroomSchema(): EventVenueSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: `Sala balowa – ${nap.name}`,
    description:
      'Odnowiona sala balowa w hotelu Gościniec Uniejów na wesela, chrzciny, jubileusze, spotkania firmowe i bal sylwestrowy.',
    url: `${nap.siteUrl}/przyjecia/`,
    containedInPlace: containedInHotel,
    address: {
      '@type': 'PostalAddress',
      streetAddress: nap.street,
      postalCode: nap.postalCode,
      addressLocality: nap.city,
      addressCountry: nap.country,
    },
  };
}
