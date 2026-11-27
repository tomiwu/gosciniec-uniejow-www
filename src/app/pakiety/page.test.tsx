import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../../scripts/check-schema';
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { nap } from '@/lib/nap';
import { offers } from '@/lib/offers';
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

function cards(): string[] {
  return [...body.matchAll(/<article[\s\S]*?<\/article>/g)].map((match) => match[0]);
}

describe('/pakiety/ hub', () => {
  it('has one h1 and Polish metadata', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(metadata.title).toBeTruthy();
  });

  it('has crawlable HTML cards: the Sylwester card first, then the sample package', () => {
    const list = cards();
    expect(list).toHaveLength(2);
    expect(list[0]).toContain('Sylwester 2026/2027');
    expect(list[1]).toContain(placeholderPackages[0]!.name);
  });

  it('gives every card a name, an occasion and one primary link', () => {
    for (const card of cards()) {
      expect(card).toMatch(/<h2[ >]/);
      expect(card).toContain('class="package-card__audience"');
      expect(card.match(/class="button[^"]*"/g)).toHaveLength(1);
    }
  });

  it('shows the Sylwester facts and nothing invented', () => {
    const card = cards()[0]!;
    expect(card).toContain('31.12.2026');
    expect(card).toContain('740 zł');
    expect(card).toMatch(/za parę/);
    expect(card).toMatch(/nocleg i menu[^.]*na zapytanie/i);
    expect(body).toContain('odnowiona sala balowa');
    expect(body).toContain('DJ Letsky');
    expect(body).toContain('A2');
    expect(body).toContain('S8');
  });

  it('does not show the Black Friday price or the 1 January Termy visit as included', () => {
    expect(body).not.toContain('599');
    const termy = body.match(/<p>1 stycznia[\s\S]*?<\/p>/)?.[0] ?? '';
    expect(termy).toMatch(/Term(y|ach) Uniejów/);
    expect(termy).toMatch(/nie jest w cenie/);
  });

  it('does not show the archived package "Kobiecy Chill & Fun" or 719 zł', () => {
    expect(body).not.toMatch(/Kobiecy/i);
    expect(body).not.toContain('719');
  });

  it('shows the badge "Dane testowe" on the sample package card only', () => {
    const [sylwester, sample] = cards();
    expect(sample).toContain(PLACEHOLDER_BADGE);
    expect(sylwester).not.toContain(PLACEHOLDER_BADGE);
  });

  it('has no Event JSON-LD and no placeholder in any JSON-LD', () => {
    expect(jsonLdNodes('Event')).toHaveLength(0);
    expect(jsonLdNodes('OfferCatalog')).toHaveLength(0);
    const ld = extractJsonLd(html).join('');
    for (const record of placeholderPackages) expect(ld).not.toContain(record.name);
  });

  it('has one Offer: Sylwester, 740 PLN, with the Hotel as offeredBy', () => {
    const nodes = jsonLdNodes('Offer');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ price: 740, priceCurrency: 'PLN' });
    expect((nodes[0]!['offeredBy'] as { name: string }).name).toBe(nap.name);
    expect(nodes[0]!['name']).toContain('Sylwester');
  });

  it('only emits an Offer price that is in offers.ts', () => {
    const real = new Set(offers.map((o) => o.price).filter((p): p is number => p !== null));
    for (const node of jsonLdNodes('Offer')) expect(real.has(node['price'] as number)).toBe(true);
  });

  it('shows the official NAP and no promo phone number or person name', () => {
    expect(html).toContain(`href="tel:${nap.phoneE164}"`);
    expect(html).toContain(`mailto:${nap.email}`);
    expect(html).not.toMatch(/63\s?28\s?88\s?410/);
    expect(html).not.toMatch(/602\s?260\s?965/);
    expect(html).not.toMatch(/789\s?017\s?995/);
  });

  it('does not use the DJ photo', () => {
    expect(html).not.toMatch(/letsky[^"'\s]*\.(jpg|png|webp|avif)/i);
    expect(html).not.toContain('<img');
  });

  it('links to the related pages', () => {
    for (const href of ['/ceny/', '/rezerwacja/', '/faq/', '/atrakcje/', '/przyjecia/']) {
      expect(html).toContain(`href="${href.slice(0, -1)}"`);
    }
  });

  it('makes no claim of thermal pools in the hotel', () => {
    expect(body).not.toMatch(/basen(y)? hotel/i);
  });
});
