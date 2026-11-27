import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { faq } from '@/lib/faq';
import { homeFaqIds } from '@/lib/home';
import {
  cheapestRoomFromPrice,
  PLACEHOLDER_BADGE,
  placeholderPackages,
} from '@/content/placeholders';
import { nap } from '@/lib/nap';
import { sylwester } from '@/lib/venue';
import Page, { metadata } from './page';

const html = renderToStaticMarkup(<Page />);

function linkHrefs(): string[] {
  // `next/link` adds the trailing slash only in the build (`trailingSlash: true`).
  return [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => {
    const href = m[1]!;
    return href.startsWith('/') && !href.endsWith('/') ? `${href}/` : href;
  });
}

describe('home page', () => {
  it('has one h1 with the hotel name and the city', () => {
    const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/g)];
    expect(h1s).toHaveLength(1);
    expect(h1s[0]![1]).toBe('Gościniec Uniejów – hotel w Uniejowie');
  });

  it('has the sections of the PRD', () => {
    const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((m) => m[1]);
    expect(h2s).toEqual([
      'Aktualne oferty',
      'Pokoje w Uniejowie',
      'Od porannej kawy do wieczoru w altanie',
      'SPA i wellness w hotelu',
      'Wesela, przyjęcia i konferencje w Uniejowie',
      'Restauracja',
      'Ogród',
      'Zajrzyj do środka',
      'Lokalizacja',
      'Najczęstsze pytania',
    ]);
  });

  it('has the time-of-day story as HTML text, one step for each time', () => {
    const steps = [...html.matchAll(/data-time="([^"]+)"/g)].map((m) => m[1]);
    expect(steps).toEqual(['Poranek', 'Południe', 'Popołudnie', 'Wieczór']);
    // Without JS the first photo shows (the others wait for the scroll script).
    expect(html.match(/story__photo is-on/g)).toHaveLength(1);
  });

  it('links the ballroom and conference section to the event pages', () => {
    const hrefs = linkHrefs();
    expect(hrefs).toContain('/przyjecia/');
    expect(hrefs).toContain('/konferencje/');
    expect(html).toContain('sala balowa');
    // Capacities only from the old site (docs/source/przyjecia.md, konferencje.md).
    expect(html).toContain('300');
    expect(html).toContain('400');
  });

  it('has a gallery: each photo links to its large file and has a caption', () => {
    const items = [...html.matchAll(/<figure class="gallery__item">([\s\S]*?)<\/figure>/g)];
    expect(items.length).toBeGreaterThanOrEqual(6);
    for (const [, item] of items) {
      expect(item).toMatch(
        /<a href="\/img\/[a-z0-9-]+-1600\.jpg" aria-label="Powiększ zdjęcie: [^"]{10,}" data-lightbox/,
      );
      expect(item).toMatch(/<figcaption>[^<]+<\/figcaption>/);
    }
  });

  it('has an FAQ teaser with confirmed answers only, and a link to all questions', () => {
    const teaser = html.slice(html.indexOf('id="faq-title"'));
    expect(teaser.match(/<details/g)?.length).toBeGreaterThanOrEqual(3);
    for (const id of homeFaqIds) {
      expect(faq.find((item) => item.id === id)?.todo, id).toBeUndefined();
    }
    expect(teaser).toMatch(/href="\/faq\/?"/);
  });

  it('links to booking, phone, rooms, SPA, restaurant, attractions and FAQ', () => {
    const hrefs = linkHrefs();
    expect(hrefs).toContain('/rezerwacja/');
    expect(hrefs).toContain(`tel:${nap.phoneE164}`);
    for (const path of ['/pokoje/', '/spa/', '/restauracja/', '/atrakcje/', '/faq/']) {
      expect(hrefs).toContain(path);
    }
    expect(html).toMatch(/<a [^>]*href="\/rezerwacja\/?"[^>]*>Rezerwuj<\/a>/);
  });

  it('loads only the hero image with high priority', () => {
    const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    expect(imgs.length).toBeGreaterThan(1);
    const eager = imgs.filter((img) => img.includes('loading="eager"'));
    expect(eager).toHaveLength(1);
    expect(eager[0]).toContain('fetchPriority="high"');
    expect(imgs[0]).toBe(eager[0]);
  });

  it('gives every image a non-empty Polish alt text and a size', () => {
    const imgs = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0]);
    for (const img of imgs) {
      expect(img).toMatch(/alt="[^"]{10,}"/);
      expect(img).toMatch(/width="\d+"/);
      expect(img).toMatch(/height="\d+"/);
    }
  });

  it('states the former name in one sentence', () => {
    expect(html).toContain('Dawniej Gościniec Nad Wartą.');
    expect(html.match(/Nad Wartą/g)).toHaveLength(1);
  });

  it('gives the distances of the old site and no other numbers of distance', () => {
    expect(html).toContain('50 km od Łodzi');
    expect(html).toContain('150 km od Warszawy');
    expect(html).toContain('12 km od autostrady A2');
    expect(html).toMatch(/3 km od centrum/);
    const km = [...new Set([...html.matchAll(/(\d+)\s*km/g)].map((m) => m[1]))].sort();
    expect(km).toEqual(['12', '150', '3', '50']);
  });

  it('does not say that the hotel has thermal pools', () => {
    expect(html).toMatch(/Termy Uniejów to osobny kompleks/);
    expect(html).not.toMatch(/basen[^.]*w hotelu/i);
  });

  it('shows no TODO marker (no open fact on this page)', () => {
    expect(html).not.toMatch(/TODO/);
  });

  it('uses the route metadata', () => {
    expect(metadata.alternates?.canonical).toBe('/');
  });

  it('shows the offers strip: Sylwester first at 740 zł, then the sample package with a badge', () => {
    const strip = html.slice(
      html.indexOf('id="home-offers-title"'),
      html.indexOf('class="marquee"'),
    );
    const cards = [...strip.matchAll(/<article class="home-offer[\s\S]*?<\/article>/g)].map(
      (m) => m[0],
    );
    expect(cards).toHaveLength(2);
    expect(cards[0]).toContain('Sylwester 2026/2027');
    expect(cards[0]).toContain('740 zł za parę');
    expect(cards[0]).toContain(`href="${sylwester.path.slice(0, -1)}"`);
    expect(cards[0]).not.toContain(PLACEHOLDER_BADGE);
    expect(cards[1]).toContain(placeholderPackages[0]!.name);
    expect(cards[1]).toContain(PLACEHOLDER_BADGE);
    expect(strip).not.toContain('599');
    expect(strip).not.toMatch(/Kobiecy|719/i);
  });

  it('shows the sample from-price once, with the badge "Dane testowe", and no Offer JSON-LD', () => {
    const blocks = [...html.matchAll(/<p class="from-price[^"]*"[\s\S]*?<\/p>/g)].map((m) => m[0]);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain(`${cheapestRoomFromPrice.amount} zł`);
    expect(blocks[0]).toContain(PLACEHOLDER_BADGE);
    const ld = [...html.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/g)].map(
      (m) => m[1],
    );
    expect(ld.join('')).not.toContain(`${cheapestRoomFromPrice.amount}`);
    expect(ld.join('')).not.toContain('"Offer"');
  });
});
