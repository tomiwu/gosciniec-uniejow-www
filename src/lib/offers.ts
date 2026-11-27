/**
 * Offers of the hotel. One source of truth for the pages and for the `Offer` JSON-LD.
 * Source: `docs/source/pakiet-kobiecy-weekend.md`, `docs/source/portfolio_swieta-w-goscincu.md`.
 * Rule (PRD D3): a price is a real number only when the old site shows it. Else it is `null`.
 * The schema builder skips each offer with a `null` price.
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
    id: 'kobiecy-chill-fun',
    name: 'Kobiecy Chill & Fun',
    description:
      'Weekend dla dwóch osób w Uniejowie: dwie noce w pokoju Deluxe, śniadania w formie bufetu, kolacja, masaż relaksacyjny, strefa wellness i karnety do Term Uniejów.',
    // Old site, 2025-09-22: "Cena pakietu: 719 zł / osoba". Still to confirm (docs/content-todo.md).
    price: 719,
    priceCurrency: 'PLN',
    path: '/pakiety/',
  },
  {
    id: 'swieta',
    name: 'Święta w Gościńcu',
    description: 'Oferta świąteczna hotelu Gościniec Uniejów. Szczegóły i cenę podaje recepcja.',
    // The old site has no price and no details. Only a Lorem ipsum text.
    price: null,
    priceCurrency: 'PLN',
    path: '/pakiety/',
  },
];
