import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../../scripts/check-schema';
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { sylwesterBookingSlug } from '@/lib/form/booking-offers';
import { sylwester } from '@/lib/venue';
import { expectOfferFaqSchema, expectOfferFaqVisible, jsonLdOfType } from '@/test/venue-assertions';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const body = html.replace(/<script[\s\S]*?<\/script>/g, '');

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

  it('gives every card a name, an occasion and booking links with package slug', () => {
    for (const card of cards()) {
      expect(card).toMatch(/<h2[ >]/);
      expect(card).toContain('class="package-card__audience"');
    }
    const [sylwesterCard, sampleCard] = cards();
    expect(sylwesterCard!.match(/class="button[^"]*"/g)).toHaveLength(2);
    expect(sylwesterCard).toMatch(new RegExp(`/rezerwacja/?\\?pakiet=${sylwesterBookingSlug}`));
    expect(sampleCard!.match(/class="button[^"]*"/g)).toHaveLength(1);
    expect(sampleCard).toMatch(new RegExp(`/rezerwacja/?\\?pakiet=${placeholderPackages[0]!.id}`));
  });

  it('shows the Sylwester facts and nothing invented', () => {
    const card = cards()[0]!;
    expect(card).toContain('31.12.2026');
    expect(card).toContain('740 zł');
    expect(card).toMatch(/za parę/);
    expect(card).toMatch(/nocleg i menu[^.]*na zapytanie/i);
    expect(card).toContain('odnowiona sala balowa');
    expect(card).toContain('DJ Letsky');
  });

  it('links the Sylwester card to its own page', () => {
    expect(cards()[0]).toContain(`href="${sylwester.path.slice(0, -1)}"`);
  });

  it('does not show the Black Friday price', () => {
    expect(body).not.toContain('599');
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
    expect(jsonLdOfType(html, 'Event')).toHaveLength(0);
    expect(jsonLdOfType(html, 'OfferCatalog')).toHaveLength(0);
    const ld = extractJsonLd(html).join('');
    for (const record of placeholderPackages) expect(ld).not.toContain(record.name);
  });

  it('leaves the Offer JSON-LD to the offer page', () => {
    expect(jsonLdOfType(html, 'Offer')).toHaveLength(0);
  });

  it('shows no promo phone number', () => {
    expect(html).not.toMatch(/63\s?28\s?88\s?410/);
    expect(html).not.toMatch(/602\s?260\s?965/);
    expect(html).not.toMatch(/789\s?017\s?995/);
  });

  it('links to the related pages', () => {
    for (const href of ['/ceny/', '/rezerwacja/', '/faq/', '/atrakcje/', '/przyjecia/']) {
      expect(html).toContain(`href="${href.slice(0, -1)}"`);
    }
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
