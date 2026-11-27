import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { nap } from '@/lib/nap';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const text = html.replace(/<[^>]+>/g, ' ');

function linkHrefs(): string[] {
  // `next/link` adds the trailing slash only in the build (`trailingSlash: true`).
  return [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => {
    const href = m[1]!;
    return href.startsWith('/') && !href.endsWith('/') ? `${href}/` : href;
  });
}

function jsonLd(): Record<string, unknown>[] {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]!.replace(/\\u003c/g, '<')) as Record<string, unknown>,
  );
}

describe('restaurant page', () => {
  it('has one h1', () => {
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>[^<]*[Rr]estauracja[^<]*<\/h1>/);
  });

  it('describes the restaurant with facts of the source', () => {
    expect(text).toMatch(/żurek/i);
    expect(text).toMatch(/dziczyzn/i);
    expect(text).toMatch(/szarlotk/i);
    expect(text).toMatch(/szefow\w+ kuchni/i);
    expect(text).toMatch(/altan\w+ grillow/i);
    expect(text).toMatch(/ogrod/i);
  });

  it('has a "Menu" section with the visible note, because the source has no menu', () => {
    const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1]);
    expect(h2s).toContain('Menu');
    expect(text).toContain('Aktualne menu wkrótce');
    expect(html).toMatch(/class="todo"/);
    expect(text).toMatch(/TODO/);
  });

  it('shows no price, no opening hour and no dish list', () => {
    // A visible TODO marker may name the missing fact. Check the rest of the page.
    const copy = html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<span class="todo">.*?<\/span>/g, '')
      .replace(/<[^>]+>/g, ' ');
    expect(copy).not.toMatch(/\d\s*(zł|PLN)/i);
    expect(copy).not.toMatch(/\b\d{1,2}[:.]\d{2}\b/);
    expect(copy).not.toMatch(/czynne|otwarte od|godziny otwarcia/i);
    // The menu section has no h3 (no dish names) as long as the source has no menu.
    expect(html).not.toMatch(/<h3[ >]/);
  });

  it('has a Restaurant JSON-LD with the NAP of nap.ts', () => {
    const restaurant = jsonLd().find((node) => node['@type'] === 'Restaurant');
    expect(restaurant).toBeDefined();
    expect(restaurant!['name']).toBe('Restauracja Gościniec Uniejów');
    expect(restaurant!['telephone']).toBe(nap.phoneE164);
    expect(restaurant!['address']).toMatchObject({
      streetAddress: nap.street,
      postalCode: nap.postalCode,
      addressLocality: nap.city,
    });
  });

  it('links to booking, parties and the phone', () => {
    const hrefs = linkHrefs();
    expect(hrefs).toContain('/rezerwacja/');
    expect(hrefs).toContain('/przyjecia/');
    expect(hrefs).toContain(`tel:${nap.phoneE164}`);
  });

  it('uses the keywords of the issue', () => {
    const lower = text.toLowerCase();
    expect(lower).toMatch(/restauracj\w* (w )?uniej[oó]w/);
    expect(lower).toMatch(/obiad\w* (w )?uniej[oó]w/);
  });

  it('gives every image a Polish alt text and a size', () => {
    const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(imgs.length).toBeGreaterThanOrEqual(3);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]{10,}"/);
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it('uses the route metadata', () => {
    expect(metadata.alternates?.canonical).toBe('/restauracja/');
  });
});
