import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { sylwester } from '@/lib/venue';
import { HomeOffersStrip } from './HomeOffersStrip';

const html = renderToStaticMarkup(<HomeOffersStrip />);

describe('HomeOffersStrip (#43)', () => {
  it('is a crawlable section with a stable layout slot', () => {
    expect(html).toMatch(/<section[^>]*class="[^"]*home-offers[^"]*home-offers--reserved/);
    expect(html).toContain('id="home-offers-title"');
    expect(html).toContain('Aktualne oferty');
  });

  it('lists every offer card in HTML as articles with links', () => {
    const articles = [...html.matchAll(/<article class="home-offer/g)];
    expect(articles).toHaveLength(2);
    const links = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]!);
    const trimSlash = (href: string) => (href.endsWith('/') ? href.slice(0, -1) : href);
    expect(links.map(trimSlash)).toContain(trimSlash(sylwester.path));
    expect(links.map(trimSlash)).toContain(trimSlash(placeholderPackages[0]!.path));
  });

  it('puts Sylwester 2026/2027 first with verified facts and machine-readable date', () => {
    const firstArticle = html.match(/<article class="home-offer[\s\S]*?<\/article>/)?.[0] ?? '';
    expect(firstArticle).toContain('Sylwester 2026/2027');
    expect(firstArticle).toMatch(new RegExp(`dateTime="${sylwester.dateIso}"`));
    expect(firstArticle).toContain(sylwester.dj);
    expect(firstArticle).toContain('A2');
    expect(firstArticle).toContain('Chcesz zostać na noc? Zapraszamy!');
    expect(firstArticle).not.toContain(PLACEHOLDER_BADGE);
  });

  it('shows the DJ portrait with Polish alt text and without high fetch priority', () => {
    expect(html).toContain('dj-letsky');
    expect(html).toMatch(
      new RegExp(`alt="${sylwester.djPhotoAlt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
    );
    expect(html).not.toMatch(/dj-letsky[\s\S]*fetchPriority="high"/);
    expect(html).not.toMatch(/dj-letsky[\s\S]*loading="eager"/);
  });

  it('does not show the Black Friday price or promo-only phone numbers', () => {
    expect(html).not.toContain('599');
    expect(html).not.toMatch(/602\s*260\s*965|28\s*88\s*410/);
    expect(html).not.toMatch(new RegExp(`tel:\\+48[^"]*88410`));
  });
});
