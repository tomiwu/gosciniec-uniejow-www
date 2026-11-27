import type { Offer } from 'schema-dts';
import { nap } from '../nap';
import type { OfferItem } from '../offers';
import { buildHotelSchema } from './hotel';

/** One `Offer` node. It has `@context` so it is also valid alone in a block. */
export type OfferSchema = Exclude<Offer, string> & { '@context': 'https://schema.org' };

/**
 * Build `Offer` nodes for offers with a real price. An offer with a `null` price gives no node.
 * `offeredBy` is the Hotel entity, built from `nap.ts` (same `@id` as the site block).
 */
export function buildOffersSchema(items: readonly OfferItem[]): OfferSchema[] {
  const hotel = buildHotelSchema();
  // The nested Hotel needs no `@context`: the Offer node has it.
  delete (hotel as { '@context'?: unknown })['@context'];
  return items.flatMap((item) =>
    item.price === null
      ? []
      : [
          {
            '@context': 'https://schema.org' as const,
            '@type': 'Offer' as const,
            name: item.name,
            description: item.description,
            url: `${nap.siteUrl}${item.path}`,
            price: item.price,
            priceCurrency: item.priceCurrency,
            offeredBy: hotel,
          },
        ],
  );
}
