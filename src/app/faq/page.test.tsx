import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../../scripts/check-schema';
import { faq } from '@/lib/faq';
import { nap } from '@/lib/nap';
import { expectOfferFaqVisible } from '@/test/venue-assertions';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);

const decode = (s: string): string =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');

function visibleQuestions(): string[] {
  return [...html.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>/g)].map((m) => decode(m[1]!));
}

describe('FAQ page', () => {
  it('has one h1', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(html).toContain('Najczęstsze pytania');
  });

  it('shows every question of the list in a details/summary pair', () => {
    expect(visibleQuestions()).toEqual(faq.map((i) => i.question));
  });

  it('puts a FAQPage JSON-LD block on the page; its questions equal the visible questions', () => {
    const blocks = extractJsonLd(html).map((b) => JSON.parse(b) as Record<string, unknown>);
    const page = blocks.find((b) => b['@type'] === 'FAQPage');
    expect(page).toBeDefined();
    const names = (page!['mainEntity'] as { name: string }[]).map((q) => q.name);
    expect(names).toEqual(visibleQuestions());
  });

  it('shows a visible TODO marker only for open facts, and not in the JSON-LD', () => {
    const open = faq.filter((i) => i.todo).length;
    const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
    expect([...body.matchAll(/TODO/g)]).toHaveLength(open);
    for (const block of extractJsonLd(html)) expect(block).not.toContain('TODO');
  });

  it('links to the booking page and to the phone', () => {
    expect(html).toMatch(/href="\/rezerwacja\/?"/);
    expect(html).toContain(`href="tel:${nap.phoneE164}"`);
  });

  it('has Polish metadata', () => {
    expect(metadata.title).toBeTruthy();
  });

  it('shows the offer questions with the same answers as /pakiety/ (issue #36)', () => {
    expectOfferFaqVisible(html);
  });

  it('keeps the placeholder badge and the Black Friday price out of the JSON-LD', () => {
    for (const block of extractJsonLd(html)) {
      expect(block).not.toContain('Dane testowe');
      expect(block).not.toContain('599');
    }
  });
});
