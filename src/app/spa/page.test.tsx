import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
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

describe('SPA page', () => {
  it('has one h1 with the keyword "SPA"', () => {
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>[^<]*SPA[^<]*<\/h1>/);
  });

  it('names the three parts of the wellness zone', () => {
    expect(text).toMatch(/jacuzzi/i);
    expect(text).toMatch(/saun\w* fińsk/i);
    expect(text).toMatch(/siłowni/i);
  });

  it('says who has access, as in the source (Superior, Deluxe, Family Apartment)', () => {
    expect(text).toMatch(/superior/i);
    expect(text).toMatch(/deluxe/i);
    expect(text).toMatch(/Rodzinn\w+ Apartament/);
  });

  it('shows a visible TODO for the standard room and the massage list', () => {
    expect(html).toMatch(/class="todo"/);
    expect(text).toMatch(/TODO[^<]*standard/i);
    expect(text).toMatch(/TODO[^<]*masaż/i);
  });

  it('says that Termy Uniejów is a separate complex, not a hotel facility', () => {
    expect(text).toMatch(/Termy Uniejów to osobny/);
    expect(text).toMatch(/3 km/);
    expect(text).toMatch(/nie ma basenów/i);
    expect(text).not.toMatch(/hotelow\w+ basen|basen hotelow|woda termaln\w+ w hotelu/i);
  });

  it('shows no price and no opening hour', () => {
    expect(text).not.toMatch(/\d\s*(zł|PLN)/i);
    expect(text).not.toMatch(/\b\d{1,2}[:.]\d{2}\b/);
    expect(text).not.toMatch(/czynne|otwarte od|godziny otwarcia/i);
  });

  it('links to rooms, packages and booking', () => {
    const hrefs = linkHrefs();
    for (const path of ['/pokoje/', '/pakiety/', '/rezerwacja/']) {
      expect(hrefs).toContain(path);
    }
  });

  it('uses the keywords of the issue', () => {
    const lower = text.toLowerCase();
    expect(lower).toMatch(/hotel spa (w )?uniej[oó]w/);
    expect(lower).toMatch(/spa uniejów\W{0,3}nocleg/);
  });

  it('gives every image a Polish alt text and a size', () => {
    const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(imgs.length).toBeGreaterThanOrEqual(4);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]{10,}"/);
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it('uses the route metadata', () => {
    expect(metadata.alternates?.canonical).toBe('/spa/');
  });
});
