import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { bookingOfferOptions } from '@/lib/form/booking-offers';
import { nap } from '@/lib/nap';
import Page from './page';

const html = renderToStaticMarkup(<Page />);

describe('/rezerwacja/', () => {
  it('has one h1 and the official phone only', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(html).toContain(`href="tel:${nap.phoneE164}"`);
    expect(html).not.toMatch(/63\s?28\s?88\s?410/);
    expect(html).not.toMatch(/602\s?260\s?965/);
  });

  it('lists package slugs in the form select for use without JavaScript', () => {
    for (const item of bookingOfferOptions) {
      expect(html).toContain(`value="${item.slug}"`);
      expect(html).toContain(item.name);
    }
  });

  it('does not list the archived package or 719 zł', () => {
    expect(html).not.toMatch(/Kobiecy/i);
    expect(html).not.toContain('719');
  });
});
