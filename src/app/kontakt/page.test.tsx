import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../../scripts/check-schema';
import { nap } from '@/lib/nap';
import { salesEmail } from '@/lib/venue';
import { bodyOf, hasLink } from '@/test/venue-assertions';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const body = bodyOf(html);

describe('/kontakt/ page', () => {
  it('has one h1 and Polish metadata', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(metadata.alternates?.canonical).toBe('/kontakt/');
  });

  it('shows the official NAP', () => {
    expect(body).toContain(nap.street);
    expect(body).toContain(`${nap.postalCode} ${nap.city}`);
    expect(body).toContain(`href="tel:${nap.phoneE164}"`);
    expect(body).toContain(`href="mailto:${nap.email}"`);
  });

  it('shows the sales mailbox as an extra address', () => {
    expect(body).toContain(`href="mailto:${salesEmail}"`);
  });

  it('links to the booking, package, conference and party pages', () => {
    for (const path of ['/rezerwacja/', '/pakiety/', '/konferencje/', '/przyjecia/'])
      expect(hasLink(body, path)).toBe(true);
  });

  it('shows no person, promo phone or MojeKonferencje badge', () => {
    expect(html).not.toMatch(/Białeck|Justyn/);
    expect(html).not.toMatch(/63\s*28\s*88\s*410|602\s*260\s*965|789\s*017\s*995/);
    expect(html).not.toMatch(/mojekonferencje/i);
  });

  it('does not invent parking or reception hours', () => {
    // Open facts carry a visible TODO marker. No hour, no number of spaces, no fee.
    expect(body).toMatch(/TODO[^<]*parking/i);
    expect(body).toMatch(/TODO[^<]*(recepcj|zameldowan)/i);
    expect(body).not.toMatch(/\b\d{1,2}[:.]\d{2}\b/);
    expect(body).not.toMatch(/\d+\s*miejsc/i);
    expect(body).not.toMatch(/bezpłatny parking|parking jest (bezpłatny|płatny)/i);
  });

  it('shows no placeholder badge', () => {
    expect(body).not.toContain('Dane testowe');
  });

  it('emits no Offer, Event or Person JSON-LD', () => {
    const ld = extractJsonLd(html).join('');
    expect(ld).not.toMatch(/"@type":"(Offer|Event|Person)"/);
  });
});
