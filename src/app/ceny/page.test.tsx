import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../../scripts/check-schema';
import { nap } from '@/lib/nap';
import { rooms } from '@/lib/rooms';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const body = html.replace(/<script[\s\S]*?<\/script>/g, '');

describe('/ceny/ page', () => {
  it('has one h1 and Polish metadata', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(metadata.title).toBeTruthy();
  });

  it('has a table with the column "Cena od" and one row for each room type', () => {
    expect(body).toContain('<table');
    expect(body).toMatch(/<th[^>]*>Cena od<\/th>/);
    for (const room of rooms) expect(body).toContain(room.name.replace(/&/g, '&amp;'));
    expect([...body.matchAll(/<tbody>[\s\S]*?<\/tbody>/g)][0]![0].match(/<tr/g)).toHaveLength(
      rooms.length,
    );
  });

  it('shows "Zapytaj recepcję" with a TODO marker while the room price is null', () => {
    expect(body).toContain('Zapytaj recepcję');
    expect(body).toContain('TODO');
  });

  it('shows the note with the phone number', () => {
    expect(body).toContain('Ceny zależą od terminu.');
    expect(body).toContain(nap.phoneDisplay);
    expect(html).toContain(`href="tel:${nap.phoneE164}"`);
  });

  it('has no Offer in the JSON-LD (no real room price)', () => {
    expect(extractJsonLd(html).join('')).not.toContain('Offer');
  });
});
