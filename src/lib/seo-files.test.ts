import { describe, expect, it } from 'vitest';
import { routes } from './routes';
import { buildRobotsTxt, buildSitemapXml } from './seo-files';

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
