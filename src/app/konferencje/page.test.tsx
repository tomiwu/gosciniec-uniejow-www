import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  bodyOf,
  hasLink,
  expectVenueRules,
  expectVisibleFaq,
  jsonLdNodes,
} from '@/test/venue-assertions';
import { equipment, layouts, sylwester } from '@/lib/venue';
import { conferenceFaq } from '@/lib/venue-faq';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const body = bodyOf(html);

describe('/konferencje/ page', () => {
  it('has Polish metadata', () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.alternates?.canonical).toBe('/konferencje/');
  });

  it('follows the venue rules (contact, no conflicting figures, badges, no Offer or Event)', () => {
    expectVenueRules(html);
  });

  it('names the layouts and the equipment of the source', () => {
    for (const layout of layouts) expect(body).toContain(layout.name);
    for (const item of equipment) expect(body).toContain(item);
  });

  it('says that catering is on request and gives no menu or price', () => {
    expect(body).toContain('na zapytanie');
    expect(body).not.toMatch(/\d\s*(zł|PLN)/);
  });

  it('links to the parties page, the Sylwester offer and the inquiry form', () => {
    expect(hasLink(body, '/przyjecia/')).toBe(true);
    expect(hasLink(body, '/rezerwacja/?temat=konferencje')).toBe(true);
    expect(hasLink(body, sylwester.path)).toBe(true);
  });

  it('has a visible FAQ with the same answers in the FAQPage JSON-LD', () => {
    expectVisibleFaq(html, conferenceFaq);
    const faqNode = jsonLdNodes(html).find((n) => n['@type'] === 'FAQPage');
    expect(JSON.stringify(faqNode)).toContain(conferenceFaq[0]!.question);
    for (const item of conferenceFaq) expect(body).toContain(item.question);
  });

  it('has MeetingRoom JSON-LD without capacity and without price', () => {
    const room = jsonLdNodes(html).find((n) => n['@type'] === 'MeetingRoom');
    expect(room).toBeDefined();
    expect(Object.keys(room!)).not.toContain('maximumAttendeeCapacity');
  });

  it('uses no MojeKonferencje image', () => {
    expect(html).not.toMatch(/rekomendacja_mojekonferencje|mojekonferencje/i);
  });
});
