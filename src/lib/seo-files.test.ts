import { describe, expect, it } from 'vitest';
import { cheapestRoomFromPrice } from '@/content/placeholders';
import { nap } from './nap';
import { offers } from './offers';
import { routes } from './routes';
import { buildLlmsTxt, buildRobotsTxt, buildSitemapXml, LLMS_MAIN_PATHS } from './seo-files';

describe('buildRobotsTxt', () => {
  it('allows all and names the sitemap', () => {
    const text = buildRobotsTxt();
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://gosciniecuniejow.pl/sitemap.xml');
  });
});

describe('buildSitemapXml', () => {
  it('has one url for each route', () => {
    const xml = buildSitemapXml();
    expect(xml.match(/<loc>/g)).toHaveLength(routes.length);
    for (const route of routes) {
      expect(xml).toContain(`<loc>https://gosciniecuniejow.pl${route.path}</loc>`);
    }
  });
});

describe('buildRobotsTxt in the preview build', () => {
  it('blocks all crawlers', () => {
    expect(buildRobotsTxt(true)).toBe('User-agent: *\nDisallow: /\n');
  });
});

describe('buildLlmsTxt', () => {
  it('includes the NAP, main routes and a price date', () => {
    const text = buildLlmsTxt();
    expect(text).toContain(nap.name);
    expect(text).toContain(nap.street);
    expect(text).toContain(nap.phoneDisplay);
    expect(text).toContain(nap.email);
    for (const path of LLMS_MAIN_PATHS) {
      expect(text).toContain(`${nap.siteUrl}${path}`);
    }
    expect(text).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('shows the sample room from-price with the badge text from the site', () => {
    const text = buildLlmsTxt();
    expect(text).toContain(`${cheapestRoomFromPrice.amount} zł`);
    expect(text).toContain('Dane testowe');
  });

  it('shows the Sylwester ball price from offers.ts', () => {
    const sylwester = offers.find((o) => o.id === 'sylwester-2026');
    expect(sylwester?.price).toBe(740);
    expect(buildLlmsTxt()).toContain('740 zł');
  });

  it('does not include the archived Kobiecy package or 719 zł', () => {
    const text = buildLlmsTxt();
    expect(text).not.toMatch(/Kobiecy/i);
    expect(text).not.toContain('719');
  });
});
