import { describe, expect, it } from 'vitest';
import { buildHotelSchema } from '../src/lib/schema/hotel';
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
      expect(checkHtml(page(hotel, offer({ price: 719, priceCurrency: 'PLN' })), 'a.html')).toEqual(
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
