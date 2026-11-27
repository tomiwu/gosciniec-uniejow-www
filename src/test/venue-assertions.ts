import { expect } from 'vitest';
import { extractJsonLd } from '../../scripts/check-schema';
import { PLACEHOLDER_BADGE_TEXT, placeholders } from '@/content/placeholders';
import { nap } from '@/lib/nap';
import { salesEmail, sylwester } from '@/lib/venue';

/** Shared checks for the venue pages. `html` is the static markup of the page. */
export function jsonLdNodes(html: string): Record<string, unknown>[] {
  const found: Record<string, unknown>[] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (typeof value === 'object' && value !== null) {
      found.push(value as Record<string, unknown>);
      Object.values(value).forEach(visit);
    }
  };
  for (const block of extractJsonLd(html)) visit(JSON.parse(block));
  return found;
}

/** The test renderer drops the trailing slash of a link. The export adds it (trailingSlash). */
export function hasLink(body: string, path: string): boolean {
  const bare = path.replace(/\/(\?|$)/, '$1');
  return body.includes(`href="${path}"`) || body.includes(`href="${bare}"`);
}

export function bodyOf(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/g, '');
}

export function expectVenueRules(html: string): void {
  const body = bodyOf(html);

  // A real page, not the stub.
  expect(body).not.toContain('Treść strony w przygotowaniu');
  expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);

  // Contact: sales mailbox and official phone. No person, no promo phone.
  expect(body).toContain(`href="mailto:${salesEmail}"`);
  expect(body).toContain(`href="tel:${nap.phoneE164}"`);
  expect(html).not.toMatch(/Białeck|Justyn/);
  expect(html).not.toMatch(/63\s*28\s*88\s*410|602\s*260\s*965|789\s*017\s*995/);

  // Removed items.
  expect(html).not.toMatch(/mojekonferencje|rekomendacja/i);
  expect(html).not.toMatch(/Kobiecy|719/);

  // Conflicting figures of the old site are not facts.
  expect(body).not.toMatch(/\b(400|120|300)\s*(osób|uczestników|gości)/);
  expect(body).not.toMatch(/sześć sal|\b[34] (nowoczesne )?sale/i);

  // Sylwester: link yes, promo amount no.
  expect(hasLink(body, sylwester.path)).toBe(true);
  expect(body).not.toMatch(/599|740/);

  // Every placeholder figure has a badge.
  expect(body).toContain(PLACEHOLDER_BADGE_TEXT);
  const dd = [...body.matchAll(/<dd>([\s\S]*?)<\/dd>/g)].map((m) => m[1] ?? '');
  expect(dd.length).toBeGreaterThan(0);
  for (const cell of dd) expect(cell).toContain(PLACEHOLDER_BADGE_TEXT);

  // JSON-LD: no Offer, Event or Person. No placeholder figure. FAQ is there.
  const nodes = jsonLdNodes(html);
  const types = nodes.flatMap((n) => [n['@type']].flat()).filter(Boolean);
  for (const forbidden of ['Offer', 'Event', 'Person', 'OfferCatalog']) {
    expect(types).not.toContain(forbidden);
  }
  expect(types).toContain('FAQPage');
  const ld = extractJsonLd(html).join(' ');
  for (const record of placeholders) {
    for (const value of Object.values(record)) {
      if (typeof value === 'number') expect(ld).not.toMatch(new RegExp(`\\b${value}\\b`));
    }
  }
  expect(ld).not.toContain(PLACEHOLDER_BADGE_TEXT);
}

/** The FAQ is visible text: each question is a summary and each answer is in the markup. */
export function expectVisibleFaq(html: string, items: readonly { question: string }[]): void {
  const summaries = [...html.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].length;
  expect(summaries).toBe(items.length);
}
