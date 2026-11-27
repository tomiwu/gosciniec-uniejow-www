import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);
const text = html.replace(/<[^>]+>/g, ' ');

function h2s(): string[] {
  return [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1]!);
}

function linkHrefs(): string[] {
  // `next/link` adds the trailing slash only in the build (`trailingSlash: true`).
  return [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => {
    const href = m[1]!;
    return href.startsWith('/') && !href.endsWith('/') ? `${href}/` : href;
  });
}

describe('attractions page', () => {
  it('has one h1', () => {
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Atrakcje w Uniejowie i okolicy<\/h1>/);
  });

  it('has an h2 for every attraction of the source files', () => {
    const headings = h2s();
    for (const name of [
      'Termy Uniejów',
      'Zamek Arcybiskupów Gnieźnieńskich',
      'Park Zamkowy',
      'Tężnie solankowe',
      'Bulwary nad Wartą',
      'Zagroda Młynarska',
      'Spływ kajakowy Wartą',
      'Ścieżka rowerowa „Zieleń”',
      'Spacer z zielarką po Dolinie Warty',
      'Kolegiata Wniebowzięcia NMP',
      'Rynek i dzwonnica',
      'Dworek z 1845 roku',
      'Cerkiewka z 1885 roku',
      'Spycimierz i kwiatowe dywany',
      'Zoo Safari Borysew',
    ]) {
      expect(headings).toContain(name);
    }
  });

  it('says that Termy Uniejów are a public complex and not part of the hotel', () => {
    expect(text).toMatch(/Termy Uniejów to publiczny kompleks termalny/);
    expect(text).toMatch(/nie należy do hotelu/i);
    expect(text).toMatch(/Hotel ma własną strefę Wellness/);
  });

  it('gives only the distance of the old site (3 km to Termy)', () => {
    const km = [...text.matchAll(/(\d[\d\s]*)\s*(km|m)\b/g)].map((m) => m[0].trim());
    expect(km).toEqual(['3 km']);
  });

  it('shows no price and no opening hour', () => {
    expect(text).not.toMatch(/\d\s*(zł|PLN)/i);
    expect(text).not.toMatch(/\b\d{1,2}[:.]\d{2}\b/);
    expect(text).not.toMatch(/czynne|otwarte od|godziny otwarcia/i);
  });

  it('has no link to an official site (the source has no URL)', () => {
    const external = linkHrefs().filter((href) => /^https?:/.test(href));
    expect(external).toEqual([]);
  });

  it('links to rooms, packages and booking', () => {
    const hrefs = linkHrefs();
    for (const path of ['/pokoje/', '/pakiety/', '/rezerwacja/']) {
      expect(hrefs).toContain(path);
    }
  });

  it('uses the keywords of the issue', () => {
    const lower = text.toLowerCase();
    for (const keyword of [
      'atrakcje uniejów',
      'co zwiedzać w uniejowie',
      'zamek uniejów',
      'termy uniejów',
      'uniejów z dziećmi',
    ]) {
      expect(lower, keyword).toContain(keyword);
    }
  });

  it('gives every image a Polish alt text and a size', () => {
    const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]{10,}"/);
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it('marks every open fact with a visible TODO', () => {
    expect(html).toMatch(/class="todo"/);
    expect(html).toMatch(/TODO/);
  });

  it('uses the route metadata', () => {
    expect(metadata.alternates?.canonical).toBe('/atrakcje/');
  });
});
