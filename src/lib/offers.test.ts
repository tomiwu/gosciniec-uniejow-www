import { describe, expect, it } from 'vitest';
import { offers } from './offers';

describe('offers list', () => {
  it('has unique ids', () => {
    const ids = offers.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has the Sylwester 2026/2027 ball at 740 PLN, the amount from the promo text', () => {
    const sylwester = offers.find((o) => o.id === 'sylwester-2026');
    expect(sylwester?.price).toBe(740);
    expect(sylwester?.priceCurrency).toBe('PLN');
  });

  it('does not list the archived package "Kobiecy Chill & Fun" or its 719 PLN price', () => {
    expect(offers.some((o) => /Kobiecy/i.test(o.name))).toBe(false);
    expect(offers.some((o) => o.price === 719)).toBe(false);
  });

  it('does not list the Black Friday price', () => {
    expect(offers.some((o) => o.price === 599)).toBe(false);
  });

  it('has only null or positive prices', () => {
    for (const offer of offers) {
      if (offer.price !== null) expect(offer.price).toBeGreaterThan(0);
    }
  });
});
