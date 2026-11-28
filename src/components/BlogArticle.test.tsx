import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { extractJsonLd } from '../../scripts/check-schema';
import type { BlogPost } from '@/lib/blog';
import { nap } from '@/lib/nap';
import { BlogArticle } from './BlogArticle';

const post: BlogPost = {
  slug: 'przykład',
  path: '/blog/przyklad/',
  title: 'Weekend w Uniejowie',
  description: 'Opis testowy.',
  date: '2026-12-01',
  draft: false,
  readingMinutes: 4,
  html: '<h2>Śródtytuł</h2><p>Treść.</p>',
};

const html = renderToStaticMarkup(<BlogArticle post={post} />);

describe('BlogArticle', () => {
  it('has one h1 with the title, the date and the reading time', () => {
    expect([...html.matchAll(/<h1[ >]/g)]).toHaveLength(1);
    expect(html).toContain('Weekend w Uniejowie');
    expect(html).toContain('<time dateTime="2026-12-01">');
    expect(html).toContain('4 min czytania');
  });

  it('renders the article body', () => {
    expect(html).toContain('<h2>Śródtytuł</h2>');
  });

  it('has the booking CTA with the booking link and the phone', () => {
    expect(html).toContain('Zarezerwuj pobyt');
    expect(html).toMatch(/href="\/rezerwacja\/?"/);
    expect(html).toContain(`href="tel:${nap.phoneE164}"`);
    expect(html).toContain(nap.phoneDisplay);
  });

  it('has BlogPosting JSON-LD with the Organization author', () => {
    const [raw] = extractJsonLd(html);
    const data = JSON.parse(raw ?? '{}') as Record<string, unknown>;
    expect(data['@type']).toBe('BlogPosting');
    expect(data['headline']).toBe(post.title);
    expect(data['datePublished']).toBe('2026-12-01');
    expect(data['author']).toMatchObject({ '@type': 'Organization', name: nap.name });
  });
});
