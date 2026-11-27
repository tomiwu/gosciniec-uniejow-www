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
 */

/** Visible text of the badge. Polish copy. The exact words are fixed by the owner decision. */
export const PLACEHOLDER_BADGE = 'Dane testowe';

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

/** Every placeholder record of the site. Add new lists here. */
export const allPlaceholders: readonly PlaceholderRecord[] = [...placeholderPackages];
