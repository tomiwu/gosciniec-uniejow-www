import { describe, expect, it } from 'vitest';
import { nap } from '../nap';
import { HOTEL_ID } from './hotel';
import { buildBallroomSchema, buildConferenceRoomsSchema } from './venue';

const FORBIDDEN_KEYS = [
  'maximumAttendeeCapacity',
  'numberOfRooms',
  'floorSize',
  'offers',
  'priceRange',
  'event',
  'contactPoint',
  'employee',
];

describe.each([
  ['MeetingRoom', buildConferenceRoomsSchema()],
  ['EventVenue', buildBallroomSchema()],
] as const)('%s schema', (type, schema) => {
  it('has the right type and is part of the hotel entity', () => {
    expect(schema['@type']).toBe(type);
    expect(schema.containedInPlace).toEqual({ '@id': HOTEL_ID });
    expect(String(schema.url).startsWith(nap.siteUrl)).toBe(true);
  });

  it('has no unconfirmed figure, no Offer, no Event and no person', () => {
    for (const key of FORBIDDEN_KEYS) expect(Object.keys(schema)).not.toContain(key);
    const text = JSON.stringify(schema);
    expect(text).not.toMatch(/\d+\s*(osób|osoby|m²|m2|zł)/i);
    expect(text).not.toMatch(/"@type":"(Offer|Event|Person)"/);
  });
});
