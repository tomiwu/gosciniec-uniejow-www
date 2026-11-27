/**
 * Placeholder data. This is the ONLY file for sample packages, sample room from-prices
 * and ballroom placeholders. Nothing here is a fact from the owner.
 *
 * Rules (issue #33):
 * - Every record has `isPlaceholder: true`.
 * - A page that shows a record shows the badge `PLACEHOLDER_BADGE`.
 * - No `Offer` or `Event` JSON-LD for a record. No OfferCatalog entry.
 * - A production build (`PRODUCTION_BUILD=1`) fails while a page uses this file.
 *   See `scripts/check-placeholders.ts`.
 * - Do not copy a placeholder amount into `offers.ts` or `rooms.ts` as if it were an owner fact.
 * - Ballroom and conference figures (issue #11): the old site contradicts itself ("3 sale" and
 *   "4 sale", "do 400" and "do 120 osób"), so the sample values below are not its numbers.
 */

/** Visible text of the badge. Polish copy. The exact words are fixed by the owner decision. */
export const PLACEHOLDER_BADGE = 'Dane testowe';
/** Same text. Name used by the venue pages (issue #11). */
export const PLACEHOLDER_BADGE_TEXT = PLACEHOLDER_BADGE;

export interface PlaceholderRecord {
  id: string;
  isPlaceholder: true;
}

export interface PlaceholderPackage extends PlaceholderRecord {
  /** Polish name. */
  name: string;
  /** Polish, generic. Who the package is for. */
  audience: string;
  /** Polish list of sample inclusions. */
  inclusions: readonly string[];
  /** Polish text for the price. A sample has no number. */
  priceText: string;
  /** Site path of the primary link. */
  path: '/rezerwacja/';
  /** Polish label of the primary link. */
  linkLabel: string;
}

export const placeholderPackages: readonly PlaceholderPackage[] = [
  {
    id: 'pakiet-testowy',
    isPlaceholder: true,
    name: 'Pakiet testowy: krótki pobyt w Uniejowie',
    audience: 'Przykładowy opis pakietu dla gości, którzy planują krótki wypoczynek.',
    inclusions: [
      'przykładowy nocleg',
      'przykładowe śniadanie',
      'przykładowy dostęp do strefy wellness',
    ],
    priceText: 'Cena: zapytaj recepcję.',
    path: '/rezerwacja/',
    linkLabel: 'Zapytaj o pobyt',
  },
];

/**
 * Sample from-price ("cena od") of the cheapest room (issue #35). The owner gave no amount yet.
 * The amount is invented. It is NOT a fact. Real room records keep `priceFrom: null`.
 * Pages show it only with the badge. No `Offer` or Hotel price schema uses it.
 * When the owner gives the real amount: set `priceFrom` in `rooms.ts`, delete this record,
 * drop the badge, then emit schema that matches the HTML.
 */
export interface RoomFromPricePlaceholder extends PlaceholderRecord {
  /** Slug of the room type that the sample price stands for. */
  roomSlug: string;
  /** Sample price per night. */
  amount: number;
  currency: 'PLN';
  /** Site paths of the pages that show the record. */
  pages: readonly string[];
}

export const cheapestRoomFromPrice: RoomFromPricePlaceholder = {
  id: 'cena-od-najtanszy-pokoj',
  isPlaceholder: true,
  roomSlug: 'standard',
  amount: 199,
  currency: 'PLN',
  pages: ['/ceny/', '/'],
};

/** A sample figure of the venue pages (issue #11). */
export interface VenuePlaceholderRecord extends PlaceholderRecord {
  /** What the record stands for. English, for developers. */
  note: string;
  /** Site paths of the pages that show the record. */
  pages: readonly string[];
}

export interface BallroomPlaceholder extends VenuePlaceholderRecord {
  /** Sample number of guests at a banquet. */
  sampleCapacity: number;
}

export interface ConferenceRoomsPlaceholder extends VenuePlaceholderRecord {
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

/** Every placeholder record of the site. Add new lists here. */
export const allPlaceholders: readonly PlaceholderRecord[] = [
  ...placeholderPackages,
  cheapestRoomFromPrice,
  ballroomPlaceholder,
  conferenceRoomsPlaceholder,
];
