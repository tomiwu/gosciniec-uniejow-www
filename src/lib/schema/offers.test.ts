import { describe, expect, it } from 'vitest';
import { nap } from '../nap';
import type { OfferItem } from '../offers';
import { offers } from '../offers';
import { buildOffersSchema } from './offers';

const fake = (fields: Partial<OfferItem>): OfferItem => ({
  id: 'x',
  name: 'Oferta testowa',
  description: 'Opis testowy.',
  price: 100,
  priceCurrency: 'PLN',
  path: '/pakiety/',
  ...fields,
});

describe('buildOffersSchema', () => {
  it('builds one Offer for each offer with a price', () => {
    const list = buildOffersSchema([fake({ id: 'a', price: 100 }), fake({ id: 'b', price: 250 })]);
    expect(list.map((o) => o.price)).toEqual([100, 250]);
    for (const offer of list) {
      expect(offer['@type']).toBe('Offer');
      expect(offer.priceCurrency).toBe('PLN');
    }
  });

  it('skips an offer with a null price', () => {
    const list = buildOffersSchema([fake({ price: null }), fake({ id: 'b', price: 250 })]);
    expect(list).toHaveLength(1);
    expect(list[0]?.price).toBe(250);
  });

  it('returns an empty list when no price is real', () => {
    expect(buildOffersSchema([fake({ price: null })])).toEqual([]);
  });

  it('has name, url and offeredBy the Hotel', () => {
    const [offer] = buildOffersSchema([fake({ name: 'Pakiet', path: '/pakiety/' })]);
    expect(offer?.name).toBe('Pakiet');
    expect(offer?.url).toBe(`${nap.siteUrl}/pakiety/`);
    const by = offer?.offeredBy as { '@type': string; name: string };
    expect(by['@type']).toBe('Hotel');
    expect(by.name).toBe(nap.name);
  });

  it('builds the real list: one Offer with price 719', () => {
    const list = buildOffersSchema(offers);
    expect(list.map((o) => o.price)).toEqual([719]);
  });
});
