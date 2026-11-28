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

  it('lists the published posts with a link, a date and the description', () => {
    const html = renderToStaticMarkup(<BlogIndex posts={[post]} />);
    expect(html).not.toContain('Wkrótce pierwsze wpisy.');
    expect(html).toMatch(/href="\/blog\/przyklad\/?"/);
    expect(html).toContain('Weekend w Uniejowie');
    expect(html).toContain('Opis testowy.');
    expect(html).toContain('<time dateTime="2026-12-01">');
  });
});
