import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../../scripts/check-schema';
import { offers } from '@/lib/offers';
import { nap } from '@/lib/nap';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const body = html.replace(/<script[\s\S]*?<\/script>/g, '');

function offerNodes(): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (typeof value === 'object' && value !== null) {
      const node = value as Record<string, unknown>;
      if (node['@type'] === 'Offer') found.push(node);
      Object.values(node).forEach(visit);
    }
  };
  for (const block of extractJsonLd(html)) visit(JSON.parse(block));
  return found;
}

describe('/pakiety/ page', () => {
  it('has one h1 and Polish metadata', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(metadata.title).toBeTruthy();
  });

  it('shows the package name, the price and the validity note with a TODO marker', () => {
    expect(body).toContain('Kobiecy Chill &amp; Fun');
    expect(body).toContain('719 zł / osoba');
    expect(body).toContain('Aktualność oferty potwierdź w recepcji');
    expect(body).toContain('TODO');
  });

  it('has the short Christmas section without a price', () => {
    expect(body).toContain('Zapytaj o ofertę świąteczną');
    const section = body.slice(body.indexOf('Zapytaj o ofertę świąteczną'));
    expect(section).not.toMatch(/\d\s*zł/);
  });

  it('has no thermal pool claim for the hotel', () => {
    expect(body).not.toMatch(/basen(y)? hotel/i);
  });

  it('has Offer JSON-LD with price 719 PLN and the Hotel as offeredBy', () => {
    const nodes = offerNodes();
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ price: 719, priceCurrency: 'PLN' });
    expect((nodes[0]!['offeredBy'] as { name: string }).name).toBe(nap.name);
    expect(nodes[0]!['url']).toBe(`${nap.siteUrl}/pakiety/`);
  });

  it('has no Offer with a price that is not in offers.ts', () => {
    const real = new Set(offers.map((o) => o.price).filter((p): p is number => p !== null));
    for (const node of offerNodes()) expect(real.has(node['price'] as number)).toBe(true);
  });

  it('links to the booking page and the phone', () => {
    expect(html).toMatch(/href="\/rezerwacja\/?/);
    expect(html).toContain(`href="tel:${nap.phoneE164}"`);
  });
});
