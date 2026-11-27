import { describe, expect, it } from 'vitest';
import { offers } from './offers';

describe('offers list', () => {
  it('has unique ids', () => {
    const ids = offers.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has the one real price of the old site: 719 PLN for the package', () => {
    const pkg = offers.find((o) => o.id === 'kobiecy-chill-fun');
    expect(pkg?.price).toBe(719);
    expect(pkg?.priceCurrency).toBe('PLN');
  });

  it('has a null price for the Christmas offer', () => {
    expect(offers.find((o) => o.id === 'swieta')?.price).toBeNull();
  });

  it('has only null or positive prices', () => {
    for (const offer of offers) {
      if (offer.price !== null) expect(offer.price).toBeGreaterThan(0);
    }
  });
});
