import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../../../scripts/check-schema';
import { PLACEHOLDER_BADGE } from '@/content/placeholders';
import { nap } from '@/lib/nap';
import { offers } from '@/lib/offers';
import { sylwester } from '@/lib/venue';
import { expectOfferFaqSchema, expectOfferFaqVisible } from '@/test/venue-assertions';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const body = html.replace(/<script[\s\S]*?<\/script>/g, '');

function jsonLdNodes(type: string): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (typeof value === 'object' && value !== null) {
      const node = value as Record<string, unknown>;
      if (node['@type'] === type) found.push(node);
      Object.values(node).forEach(visit);
    }
  };
  for (const block of extractJsonLd(html)) visit(JSON.parse(block));
  return found;
}

describe('/pakiety/sylwester-2026-2027/', () => {
  it('uses the URL that the venue pages link to', () => {
    expect(sylwester.path).toBe('/pakiety/sylwester-2026-2027/');
    expect(metadata.alternates?.canonical).toBe(sylwester.path);
  });

  it('has one h1 and Polish metadata', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(body).toMatch(/<h1[^>]*>[^<]*Sylwester 2026\/2027/);
    expect(String(metadata.description).length).toBeGreaterThan(80);
  });

  it('shows the listed facts: date, place, DJ, overnight invite, A2 and S8', () => {
    expect(body).toContain('31.12.2026');
    expect(body).toContain('czwartek');
    expect(body).toContain('odnowiona sala balowa');
    expect(body).toContain(nap.street);
    expect(body).toContain('DJ Letsky');
    expect(body).toContain('Chcesz zostać na noc? Zapraszamy');
    expect(body).toContain('A2');
    expect(body).toContain('S8');
  });

  it('shows 740 zł per couple for the ball, in the HTML', () => {
    expect(body).toContain('740 zł za parę');
    expect(body).toMatch(/cena dotyczy balu/i);
  });

  it('never shows the Black Friday price, an overnight rate or an invented inclusion', () => {
    expect(body).not.toContain('599');
    expect(body).not.toMatch(/Black Friday/i);
    expect(body).not.toMatch(/w cenie:/i);
    expect(body).toMatch(/nocleg i menu[^.]*na zapytanie/i);
  });

  it('says the Termy visit on 1 January is not in the ball price', () => {
    const termy = body.match(/<p>1 stycznia[\s\S]*?<\/p>/)?.[0] ?? '';
    expect(termy).toMatch(/Term(y|ach) Uniejów/);
    expect(termy).toMatch(/nie jest w cenie/);
  });

  it('has one Offer for the ball with a visible, real price', () => {
    const nodes = jsonLdNodes('Offer');
    expect(nodes).toHaveLength(1);
    const real = offers.find((o) => o.id === 'sylwester-2026');
    expect(nodes[0]).toMatchObject({
      price: 740,
      priceCurrency: 'PLN',
      url: `${nap.siteUrl}${sylwester.path}`,
    });
    expect(real?.path).toBe(sylwester.path);
    expect(body).toContain(`${String(nodes[0]!['price'])} zł`);
    expect(JSON.stringify(nodes[0])).not.toMatch(/Term|nocleg.*wlicz|includes/i);
  });

  it('has no Event, no OfferCatalog and no placeholder', () => {
    expect(jsonLdNodes('Event')).toHaveLength(0);
    expect(jsonLdNodes('OfferCatalog')).toHaveLength(0);
    expect(html).not.toContain(PLACEHOLDER_BADGE);
  });

  it('links back to the hub, the booking page and the parties page', () => {
    for (const href of ['/pakiety', '/rezerwacja', '/przyjecia']) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it('shows the official NAP and the sales mailbox, no promo phone and no person name', () => {
    expect(html).toContain(`href="tel:${nap.phoneE164}"`);
    expect(html).toContain(`mailto:${nap.email}`);
    expect(html).toContain('mailto:sprzedaz@gosciniecuniejow.pl');
    expect(html).not.toMatch(/63\s?28\s?88\s?410/);
    expect(html).not.toMatch(/602\s?260\s?965/);
    expect(html).not.toMatch(/789\s?017\s?995/);
  });

  it('does not show the archived package or 719 zł', () => {
    expect(body).not.toMatch(/Kobiecy/i);
    expect(body).not.toContain('719');
  });

  it('makes no claim of thermal pools in the hotel', () => {
    expect(body).not.toMatch(/basen(y)? hotel/i);
  });

  it('shows the offer questions with the same answers as /faq/ (issue #36)', () => {
    expectOfferFaqVisible(html);
  });

  it('has one FAQPage JSON-LD with the offer questions and no placeholder claim', () => {
    expectOfferFaqSchema(html);
  });
});
