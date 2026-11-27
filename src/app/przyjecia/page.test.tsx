import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { bodyOf, expectVenueRules, expectVisibleFaq, jsonLdNodes } from '@/test/venue-assertions';
import { partyTypes, sylwester } from '@/lib/venue';
import { partiesFaq } from '@/lib/venue-faq';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const body = bodyOf(html);

describe('/przyjecia/ page', () => {
  it('has Polish metadata', () => {
    expect(metadata.title).toBeTruthy();
    expect(metadata.alternates?.canonical).toBe('/przyjecia/');
  });

  it('follows the venue rules (contact, no conflicting figures, badges, no Offer or Event)', () => {
    expectVenueRules(html);
  });

  it('names the event types of the source', () => {
    for (const type of partyTypes) expect(body).toContain(type);
    expect(body).toContain('Sylwester');
  });

  it('links to the Sylwester offer and shows only the facts of the issue', () => {
    expect(body).toContain(sylwester.title);
    expect(body).toContain('31 grudnia 2026');
    expect(body).toContain('DJ Letsky');
    expect(body).toContain('Chcesz zostać na noc');
    expect(body).toMatch(/nie jest częścią ceny balu/);
    expect(body).toContain('S8');
  });

  it('does not show a DJ photo or any other image outside images.ts', () => {
    expect(html).not.toMatch(/letsky.*\.(jpg|png|webp|avif)/i);
    for (const src of html.matchAll(/src="([^"]+)"/g))
      expect(src[1]).toMatch(/^\/img\/[a-z0-9-]+\.jpg$/);
  });

  it('has a visible FAQ with the same answers in the FAQPage JSON-LD', () => {
    expectVisibleFaq(html, partiesFaq);
    for (const item of partiesFaq) expect(body).toContain(item.question);
  });

  it('has EventVenue JSON-LD without capacity', () => {
    const venue = jsonLdNodes(html).find((n) => n['@type'] === 'EventVenue');
    expect(venue).toBeDefined();
    expect(Object.keys(venue!)).not.toContain('maximumAttendeeCapacity');
  });
});
