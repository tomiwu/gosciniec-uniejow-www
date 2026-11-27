import { describe, expect, it } from 'vitest';
import { buildFaqSchema, faq } from './faq';
import { nap } from './nap';

describe('faq list', () => {
  it('has the 12 stay questions and the 5 offer questions, each with a question mark', () => {
    expect(faq).toHaveLength(17);
    for (const item of faq) expect(item.question).toMatch(/\?$/);
  });

  it('has unique ids and unique questions', () => {
    expect(new Set(faq.map((i) => i.id)).size).toBe(faq.length);
    expect(new Set(faq.map((i) => i.question)).size).toBe(faq.length);
  });

  it('sends the guest to reception when a fact is open', () => {
    const open = faq.filter((i) => i.todo);
    expect(open.length).toBeGreaterThan(0);
    for (const item of open) {
      expect(item.answer).toContain(`Prosimy o kontakt z recepcją: ${nap.phoneDisplay}`);
    }
  });

  it('does not invent hours, prices or payment methods', () => {
    // The only price is the ball price of offers.ts. A date such as 31.12.2026 is not an hour.
    const text = faq
      .map((i) => i.answer)
      .join(' ')
      .replace(/\d{1,2}\.\d{1,2}\.\d{4}/g, '')
      .replace(/\b740 zł za parę/g, '');
    expect(text).not.toMatch(/\d{1,2}[:.]\d{2}/);
    expect(text).not.toMatch(/\bzł\b|PLN/);
  });
});

describe('buildFaqSchema', () => {
  const schema = buildFaqSchema();

  it('is a FAQPage', () => {
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('FAQPage');
  });

  it('has the same questions as the visible list, in the same order', () => {
    const names = (schema.mainEntity as unknown as { name: string }[]).map((q) => q.name);
    expect(names).toEqual(faq.map((i) => i.question));
  });

  it('has the same answers as the visible list', () => {
    const texts = (
      schema.mainEntity as unknown as { acceptedAnswer: { '@type': string; text: string } }[]
    ).map((q) => q.acceptedAnswer.text);
    expect(texts).toEqual(faq.map((i) => i.answer));
  });
});
