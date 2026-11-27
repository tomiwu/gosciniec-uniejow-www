import { describe, expect, it } from 'vitest';
import { placeholderPackages } from '../src/content/placeholders';
import { rooms } from '../src/lib/rooms';
import { buildHotelRoomsSchema, buildHotelSchema } from '../src/lib/schema/hotel';
import { buildRestaurantSchema } from '../src/lib/schema/restaurant';
import { checkHtml, extractJsonLd, requiredTypesFor } from './check-schema';

const page = (...blocks: unknown[]): string =>
  `<html><head>${blocks
    .map(
      (b) =>
        `<script type="application/ld+json">${typeof b === 'string' ? b : JSON.stringify(b)}</script>`,
    )
    .join('')}</head><body></body></html>`;

const hotel = buildHotelSchema();
const faq = (mainEntity: unknown) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity,
});
const offer = (fields: Record<string, unknown>) => ({
  '@context': 'https://schema.org',
  '@type': 'Offer',
  ...fields,
});

describe('extractJsonLd', () => {
  it('finds every block', () => {
    expect(extractJsonLd(page({ a: 1 }, { b: 2 }))).toEqual(['{"a":1}', '{"b":2}']);
  });
  it('ignores other script types', () => {
    expect(extractJsonLd('<script type="text/javascript">x</script>')).toEqual([]);
  });
});

describe('checkHtml', () => {
  it('accepts a page with the Hotel block', () => {
    expect(checkHtml(page(hotel), 'a.html')).toEqual([]);
  });

  it('fails on invalid JSON', () => {
    expect(checkHtml(page(hotel, '{not json'), 'a.html').join('\n')).toContain('invalid JSON');
  });

  it('fails on a missing @context', () => {
    const rest: Record<string, unknown> = { ...hotel };
    delete rest['@context'];
    expect(checkHtml(page(rest), 'a.html').join('\n')).toContain('missing @context');
  });

  it('fails on a missing @type', () => {
    const errors = checkHtml(page(hotel, { '@context': 'https://schema.org' }), 'a.html');
    expect(errors.join('\n')).toContain('missing @type');
  });

  it('fails when the page has no Hotel', () => {
    const errors = checkHtml(
      page(faq([{ '@type': 'Question', acceptedAnswer: { text: 'x' } }])),
      'a.html',
    );
    expect(errors.join('\n')).toContain('no Hotel');
    expect(checkHtml('<html></html>', 'a.html').join('\n')).toContain('no Hotel');
  });

  it('fails when Hotel name, address or telephone differ from nap.ts', () => {
    const badName = checkHtml(page({ ...hotel, name: 'Inny' }), 'a.html').join('\n');
    expect(badName).toContain('Hotel name');
    const badPhone = checkHtml(page({ ...hotel, telephone: '+48000000000' }), 'a.html').join('\n');
    expect(badPhone).toContain('Hotel telephone');
    const badAddress = checkHtml(
      page({ ...hotel, address: { ...(hotel.address as object), streetAddress: 'ul. Inna 1' } }),
      'a.html',
    ).join('\n');
    expect(badAddress).toContain('address.streetAddress');
    const noAddress = checkHtml(page({ ...hotel, address: undefined }), 'a.html').join('\n');
    expect(noAddress).toContain('address is missing');
  });

  it('finds a Hotel inside @graph', () => {
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [{ ...hotel, '@context': undefined }],
    };
    expect(checkHtml(page(graph), 'a.html')).toEqual([]);
  });

  describe('FAQPage', () => {
    it('accepts one Question with an answer text', () => {
      const q = [
        { '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A' } },
      ];
      expect(checkHtml(page(hotel, faq(q)), 'a.html')).toEqual([]);
    });
    it('fails with no Question', () => {
      expect(checkHtml(page(hotel, faq([])), 'a.html').join('\n')).toContain('FAQPage');
    });
    it('fails when the answer has no text', () => {
      const q = [{ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer' } }];
      expect(checkHtml(page(hotel, faq(q)), 'a.html').join('\n')).toContain('FAQPage');
    });
  });

  describe('Offer', () => {
    it('accepts a positive price in PLN', () => {
      expect(checkHtml(page(hotel, offer({ price: 740, priceCurrency: 'PLN' })), 'a.html')).toEqual(
        [],
      );
    });
    it('fails without a price', () => {
      expect(
        checkHtml(page(hotel, offer({ priceCurrency: 'PLN' })), 'a.html').join('\n'),
      ).toContain('needs a price');
    });
    it('fails on a price of 0 or below', () => {
      for (const price of [0, -5, 'abc']) {
        const errors = checkHtml(page(hotel, offer({ price, priceCurrency: 'PLN' })), 'a.html');
        expect(errors.join('\n')).toContain('greater than 0');
      }
    });
    it('fails on another currency', () => {
      const errors = checkHtml(page(hotel, offer({ price: 10, priceCurrency: 'EUR' })), 'a.html');
      expect(errors.join('\n')).toContain('PLN');
    });
    it('fails on a price that is not in offers.ts', () => {
      const errors = checkHtml(page(hotel, offer({ price: 123, priceCurrency: 'PLN' })), 'a.html');
      expect(errors.join('\n')).toContain('not in offers.ts');
    });
    it('fails on an Offer or Event of a placeholder record', () => {
      const name = placeholderPackages[0]!.name;
      for (const type of ['Offer', 'Event']) {
        const node = {
          '@context': 'https://schema.org',
          '@type': type,
          name,
          price: 740,
          priceCurrency: 'PLN',
        };
        expect(checkHtml(page(hotel, node), 'a.html').join('\n')).toContain('placeholder');
      }
    });
    it('checks an Offer nested in another node', () => {
      const nested = { ...hotel, makesOffer: offer({ price: 0, priceCurrency: 'PLN' }) };
      expect(checkHtml(page(nested), 'a.html').join('\n')).toContain('greater than 0');
    });
  });
});

describe('required types per page', () => {
  const q = [{ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A' } }];

  it('requires FAQPage on /faq/', () => {
    expect(requiredTypesFor('faq/index.html')).toEqual(['FAQPage']);
    expect(requiredTypesFor('pokoje/index.html')).toEqual([]);
    expect(requiredTypesFor('pakiety/index.html')).toEqual(['FAQPage']);
    expect(requiredTypesFor('pakiety/sylwester-2026-2027/index.html')).toEqual([
      'Offer',
      'FAQPage',
    ]);
  });

  it('fails on /faq/ without a FAQPage block', () => {
    const errors = checkHtml(page(hotel), 'faq/index.html');
    expect(errors.join('\n')).toContain('no FAQPage JSON-LD found');
  });

  it('passes on /faq/ with a FAQPage block', () => {
    expect(checkHtml(page(hotel, faq(q)), 'faq/index.html')).toEqual([]);
  });

  it('does not require FAQPage on other pages', () => {
    expect(checkHtml(page(hotel), 'index.html')).toEqual([]);
  });
});

describe('checkHtml with HotelRoom items', () => {
  it('accepts the Hotel block with containsPlace', () => {
    expect(checkHtml(page(buildHotelRoomsSchema(rooms)), 'pokoje.html')).toEqual([]);
  });

  it('fails on a HotelRoom without a description', () => {
    const broken = { ...hotel, containsPlace: [{ '@type': 'HotelRoom', name: 'Pokój testowy' }] };
    expect(checkHtml(page(broken), 'a.html').join('\n')).toContain('HotelRoom needs a description');
  });

  it('fails on a HotelRoom without a name', () => {
    const broken = { ...hotel, containsPlace: [{ '@type': 'HotelRoom', description: 'Opis.' }] };
    expect(checkHtml(page(broken), 'a.html').join('\n')).toContain('HotelRoom needs a name');
  });
});

describe('venue schema', () => {
  const q = [{ '@type': 'Question', name: 'Q?', acceptedAnswer: { '@type': 'Answer', text: 'A' } }];
  const room = (fields: Record<string, unknown> = {}) => ({
    '@context': 'https://schema.org',
    '@type': 'MeetingRoom',
    name: 'Sale testowe',
    ...fields,
  });
  const venue = (fields: Record<string, unknown> = {}) => ({
    '@context': 'https://schema.org',
    '@type': 'EventVenue',
    name: 'Sala testowa',
    ...fields,
  });

  it('requires FAQPage and the venue type on the two pages', () => {
    expect(requiredTypesFor('konferencje/index.html')).toEqual(['FAQPage', 'MeetingRoom']);
    expect(requiredTypesFor('przyjecia/index.html')).toEqual(['FAQPage', 'EventVenue']);
  });

  it('passes a MeetingRoom and an EventVenue without figures', () => {
    expect(checkHtml(page(hotel, room(), faq(q)), 'konferencje/index.html')).toEqual([]);
    expect(checkHtml(page(hotel, venue(), faq(q)), 'przyjecia/index.html')).toEqual([]);
  });

  it('fails on a capacity, a room count or an Offer in a venue', () => {
    for (const fields of [
      { maximumAttendeeCapacity: 100 },
      { numberOfRooms: 2 },
      { offers: { '@type': 'Offer' } },
    ]) {
      const errors = checkHtml(page(hotel, venue(fields), faq(q)), 'przyjecia/index.html');
      expect(errors.join('\n')).toContain('is not confirmed');
    }
  });

  it('fails when JSON-LD carries the placeholder badge text', () => {
    const errors = checkHtml(
      page(hotel, faq([{ ...q[0], name: 'Dane testowe?' }])),
      'faq/index.html',
    );
    expect(errors.join('\n')).toContain('placeholder text');
  });
});

describe('Restaurant', () => {
  const restaurant = buildRestaurantSchema();

  it('accepts the Restaurant block built from nap.ts', () => {
    expect(checkHtml(page(hotel, restaurant), 'restauracja/index.html')).toEqual([]);
  });

  it('requires a Restaurant block on /restauracja/', () => {
    expect(requiredTypesFor('restauracja/index.html')).toEqual(['Restaurant']);
    const errors = checkHtml(page(hotel), 'restauracja/index.html');
    expect(errors.join('\n')).toContain('no Restaurant JSON-LD found');
  });

  it('fails when name, telephone or address differ from nap.ts', () => {
    const bad = (fields: Record<string, unknown>) =>
      checkHtml(page(hotel, { ...restaurant, ...fields }), 'a.html').join('\n');
    expect(bad({ name: 'Inna restauracja' })).toContain('Restaurant name');
    expect(bad({ telephone: '+48000000000' })).toContain('Restaurant telephone');
    expect(bad({ address: undefined })).toContain('Restaurant address is missing');
    expect(bad({ address: { ...(restaurant.address as object), postalCode: '00-000' } })).toContain(
      'Restaurant address.postalCode',
    );
  });

  it('fails on data that the old site does not give', () => {
    for (const field of ['aggregateRating', 'review', 'priceRange', 'openingHours']) {
      const errors = checkHtml(page(hotel, { ...restaurant, [field]: 'x' }), 'a.html');
      expect(errors.join('\n'), field).toContain(`Restaurant must not have ${field}`);
    }
  });
});
