/**
 * Placeholder data (sample figures). The owner has not confirmed them yet.
 *
 * Rules (issue #11, owner decision 2026-11-27):
 * - This is the ONLY file for sample packages, sample room from-prices and ballroom figures.
 * - Each record has `isPlaceholder: true`.
 * - A page that shows a record also shows the badge `Dane testowe` (`PlaceholderBadge`).
 * - No `Offer` or `Event` JSON-LD for a record from this file.
 * - Do not copy an amount to `src/lib/offers.ts` or `src/lib/rooms.ts` as an owner fact.
 * - `scripts/check-placeholders.ts` fails a production build while a record is listed in
 *   `placeholders`. To ship, verify the figure with the owner, move it to a real source
 *   and delete the record here.
 *
 * Sample values below are NOT the numbers of the old site. The old site contradicts itself
 * ("3 sale" and "4 sale", "do 400" and "do 120 osób"), so no figure of the source is used.
 */

/** Exact badge text. Pages and the check script use this one constant. */
export const PLACEHOLDER_BADGE_TEXT = 'Dane testowe';

export interface PlaceholderRecord {
  id: string;
  isPlaceholder: true;
  /** What the record stands for. English, for developers. */
  note: string;
  /** Site paths of the pages that show the record. The build check reads this list. */
  pages: readonly string[];
}

export interface BallroomPlaceholder extends PlaceholderRecord {
  /** Sample number of guests at a banquet. */
  sampleCapacity: number;
}

export interface ConferenceRoomsPlaceholder extends PlaceholderRecord {
  /** Sample number of conference rooms. */
  sampleRoomCount: number;
  /** Sample number of participants in the largest room. */
  sampleCapacity: number;
}

export const ballroomPlaceholder: BallroomPlaceholder = {
  id: 'sala-balowa',
  isPlaceholder: true,
  note: 'Sample banquet capacity of the ballroom. The owner must confirm the real number.',
  pages: ['/konferencje/', '/przyjecia/'],
  sampleCapacity: 100,
};

export const conferenceRoomsPlaceholder: ConferenceRoomsPlaceholder = {
  id: 'sale-konferencyjne',
  isPlaceholder: true,
  note: 'Sample number of conference rooms and sample capacity. The old site gives 3 or 4 rooms and 400 or 120 people.',
  pages: ['/konferencje/'],
  sampleRoomCount: 2,
  sampleCapacity: 50,
};

/** Every placeholder that is in use. An empty list means that the site is ready for production. */
export const placeholders: readonly PlaceholderRecord[] = [
  ballroomPlaceholder,
  conferenceRoomsPlaceholder,
];
