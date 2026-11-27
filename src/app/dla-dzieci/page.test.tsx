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

describe('family page', () => {
  it('has one h1', () => {
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>[^<]*dzie(ci|ćmi)[^<]*<\/h1>/i);
  });

  it('lists the offer of the source', () => {
    expect(text).toMatch(/plac\w* zabaw/i);
    expect(text).toMatch(/rolek|rolkach/i);
    expect(text).toMatch(/warsztat/i);
    expect(text).toMatch(/siatkówk/i);
    expect(text).toMatch(/ścieżk\w* rowerow/i);
    expect(text).toMatch(/piknik/i);
    expect(text).toMatch(/balii/i);
    expect(text).toMatch(/posiłk\w*,? .*najmłodszych/i);
  });

  it('says that the warm-water tub is a summer attraction', () => {
    expect(text).toMatch(/Latem/);
  });

  it('does not claim a children pool or a thermal pool in the hotel', () => {
    expect(text).not.toMatch(/basen\w* (dla dzieci|dziecięc)/i);
    expect(text).toMatch(/Termy Uniejów to osobny/);
  });

  it('shows no price, no age limit and no opening hour', () => {
    expect(text).not.toMatch(/\d\s*(zł|PLN)/i);
    expect(text).not.toMatch(/\b\d{1,2}[:.]\d{2}\b/);
    expect(text).not.toMatch(/\d+\s*(lat|roku|miesięcy)/i);
  });

  it('links to the family apartment, rooms, attractions and booking', () => {
    const hrefs = linkHrefs();
    for (const path of ['/pokoje/', '/atrakcje/', '/rezerwacja/']) {
      expect(hrefs).toContain(path);
    }
    expect(html).toMatch(/Rodzinn\w+ Apartament/);
  });

  it('uses the keywords of the issue', () => {
    const lower = text.toLowerCase();
    expect(lower).toContain('uniejów z dziećmi');
    expect(lower).toMatch(/hotel przyjazny dzieciom,? (w )?uniej[oó]w/);
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
    expect(metadata.alternates?.canonical).toBe('/dla-dzieci/');
  });
});
