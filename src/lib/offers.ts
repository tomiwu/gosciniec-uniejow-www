/**
 * Offers of the hotel. One source of truth for the pages and for the `Offer` JSON-LD.
 * Rule (PRD D3): a price is a real number only when a source shows it. Else it is `null`.
 * The schema builder skips each offer with a `null` price.
 * Sample (placeholder) packages are NOT here. They live in `src/content/placeholders.ts`.
 */
export interface OfferItem {
  id: string;
  /** Polish name. */
  name: string;
  /** Polish description for the JSON-LD. Plain text. */
  description: string;
  /** Price in PLN. `null` when the price is not known. */
  price: number | null;
  priceCurrency: 'PLN';
  /** Site path of the page that shows the offer. */
  path: string;
}

export const offers: readonly OfferItem[] = [
  {
    id: 'sylwester-2026',
    name: 'Bal Sylwestrowy – Sylwester 2026/2027',
    description:
      'Bal Sylwestrowy 31.12.2026 w odnowionej sali balowej hotelu Gościniec Uniejów. Cena dotyczy balu, za parę. Nocleg i menu na zapytanie.',
    // Owner promo text (2026-11-27): "bal za 599 zł od pary zamiast 740 zł".
    // The 599 zł Black Friday price ends on 2026-11-29 23:59 (Europe/Warsaw). The site never shows it.
    price: 740,
    priceCurrency: 'PLN',
    path: '/pakiety/',
  },
];
