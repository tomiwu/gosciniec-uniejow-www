import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BlogIndex } from '@/components/BlogIndex';
import type { BlogPost } from '@/lib/blog';
import Page from './page';

const post: BlogPost = {
  slug: 'przyklad',
  path: '/blog/przyklad/',
  title: 'Weekend w Uniejowie',
  description: 'Opis testowy.',
  date: '2026-12-01',
  draft: false,
  readingMinutes: 2,
  html: '<p>x</p>',
};

describe('/blog/ page', () => {
  it('has one h1 and says that the first posts come soon (no published post yet)', () => {
    const html = renderToStaticMarkup(<Page />);
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(html).toContain('Wkrótce pierwsze wpisy.');
  });
});

describe('BlogIndex', () => {
  it('shows the empty message without posts', () => {
    expect(renderToStaticMarkup(<BlogIndex posts={[]} />)).toContain('Wkrótce pierwsze wpisy.');
  });

  it('links to the offer, the rooms and the booking page without posts', () => {
    const html = renderToStaticMarkup(<BlogIndex posts={[]} />);
    expect(html).toMatch(/<a [^>]*href="\/pakiety\/?"/);
    expect(html).toMatch(/<a [^>]*href="\/pokoje\/?"/);
    expect(html).toMatch(/<a [^>]*href="\/rezerwacja\/?"/);
  });

  it('shows the three links as equal cards in one named list', () => {
    const html = renderToStaticMarkup(<BlogIndex posts={[]} />);
    expect(html).toMatch(/<ul class="blog-links"[^>]*aria-label="[^"]+"/);
    const cards = [...html.matchAll(/<a class="blog-links__card"[^>]*href="([^"]+)"/g)];
    expect(cards.map((m) => m[1]?.replace(/\/$/, ''))).toEqual([
      '/pakiety',
      '/pokoje',
      '/rezerwacja',
    ]);
  });

  it('lists the published posts with a link, a date and the description', () => {
    const html = renderToStaticMarkup(<BlogIndex posts={[post]} />);
    expect(html).not.toContain('Wkrótce pierwsze wpisy.');
    expect(html).not.toMatch(/href="\/pakiety/);
    expect(html).toMatch(/href="\/blog\/przyklad\/?"/);
    expect(html).toContain('Weekend w Uniejowie');
    expect(html).toContain('Opis testowy.');
    expect(html).toContain('<time dateTime="2026-12-01">');
  });
});
