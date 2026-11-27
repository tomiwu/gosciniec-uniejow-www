import { describe, expect, it } from 'vitest';
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { buildFaqSchema, faq } from './faq';
import { nap } from './nap';
import { offers } from './offers';
import { offerFaq } from './offer-faq';
import { salesEmail } from './venue';

const text = offerFaq.map((item) => `${item.question} ${item.answer}`).join('\n');
const byId = (id: string) => offerFaq.find((item) => item.id === id)!;

describe('offer FAQ list', () => {
  it('has the five questions of issue #36, each with a question mark', () => {
    expect(offerFaq.map((item) => item.id)).toEqual([
      'oferta-rezerwacja',
      'bal-termin',
      'bal-cena',
      'bal-nocleg',
      'bal-termy',
    ]);
    for (const item of offerFaq) expect(item.question).toMatch(/\?$/);
  });

  it('is part of the /faq/ list, with the same text', () => {
    for (const item of offerFaq) expect(faq).toContainEqual(item);
  });

  it('tells how to book: form page, official phone, e-mail and the sales mailbox', () => {
    const answer = byId('oferta-rezerwacja').answer;
    expect(answer).toContain(nap.phoneDisplay);
    expect(answer).toContain(nap.email);
    expect(answer).toContain(salesEmail);
    expect(byId('oferta-rezerwacja').link?.href).toBe('/rezerwacja/');
  });

  it('gives the date and the place of the ball', () => {
    const answer = byId('bal-termin').answer;
    expect(answer).toContain('31.12.2026');
    expect(answer).toContain('czwartek');
    expect(answer).toContain('odnowion');
    expect(answer).toContain(nap.street);
  });

  it('gives the price from offers.ts, for the ball, per couple', () => {
    const price = offers.find((offer) => offer.id === 'sylwester-2026')!.price!;
    const answer = byId('bal-cena').answer;
    expect(answer).toContain(`${price} zł za parę`);
    expect(answer).toMatch(/dotyczy balu/);
    expect(answer).toMatch(/menu i nocleg[^.]*na zapytanie/i);
  });

  it('does not state an overnight rate and does not say the room is in the ball price', () => {
    const answer = byId('bal-nocleg').answer;
    expect(answer).toContain('Zapraszamy');
    expect(answer).toContain(nap.phoneDisplay);
    expect(answer).not.toMatch(/\d\s?zł/);
    expect(answer).not.toMatch(/nocleg jest w cenie|w cenie balu jest nocleg/i);
  });

  it('says that Termy Uniejów are not in the ball price', () => {
    const answer = byId('bal-termy').answer;
    expect(answer).toMatch(/1 stycznia/);
    expect(answer).toMatch(/Term(y|ach) Uniejów/);
    expect(answer).toMatch(/nie jest w cenie/);
  });

  it('never shows the Black Friday price, a promo phone, a person name or an invented inclusion', () => {
    expect(text).not.toContain('599');
    expect(text).not.toMatch(/Black Friday/i);
    expect(text).not.toMatch(/63\s?28\s?88\s?410/);
    expect(text).not.toMatch(/602\s?260\s?965/);
    expect(text).not.toMatch(/789\s?017\s?995/);
    expect(text).not.toMatch(/w cenie:/i);
    expect(text).not.toMatch(/Kobiecy|719/i);
  });

  it('has no placeholder record and no badge text', () => {
    expect(text).not.toContain(PLACEHOLDER_BADGE);
    for (const record of placeholderPackages) expect(text).not.toContain(record.name);
  });
});

describe('FAQPage JSON-LD and placeholder claims', () => {
  it('has the offer questions in the schema, same text as the page', () => {
    const entities = buildFaqSchema(offerFaq).mainEntity as unknown as {
      name: string;
      acceptedAnswer: { text: string };
    }[];
    expect(entities.map((q) => q.name)).toEqual(offerFaq.map((i) => i.question));
    expect(entities.map((q) => q.acceptedAnswer.text)).toEqual(offerFaq.map((i) => i.answer));
  });

  it('leaves out an item that is marked as a placeholder claim', () => {
    const sample = {
      id: 'probka',
      question: 'Czy jest pakiet testowy?',
      answer: `${PLACEHOLDER_BADGE}: przykładowy opis pakietu.`,
      isPlaceholder: true as const,
    };
    const entities = buildFaqSchema([...offerFaq, sample]).mainEntity as unknown as {
      name: string;
    }[];
    expect(entities.map((q) => q.name)).not.toContain(sample.question);
    expect(entities).toHaveLength(offerFaq.length);
  });
});
