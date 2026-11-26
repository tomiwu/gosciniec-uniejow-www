import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { routePaths } from '../src/lib/routes';
import { buildHtaccess } from '../src/redirects/htaccess';
import { redirects } from '../src/redirects/map';
import { checkRedirects, parseOldUrls } from './check-redirects';

const routes = ['/', '/a/', '/b/'];

describe('checkRedirects', () => {
  it('accepts a valid map', () => {
    const map = [{ from: '/old/', to: '/a/' }];
    expect(checkRedirects(map, ['/', '/old/'], routes, buildHtaccess(map))).toEqual([]);
  });

  it('fails when an old URL has no route and no source', () => {
    const errors = checkRedirects([], ['/lost/'], routes);
    expect(errors.join('\n')).toContain('/lost/');
  });

  it('fails on duplicate sources', () => {
    const map = [
      { from: '/old/', to: '/a/' },
      { from: '/old/', to: '/b/' },
    ];
    expect(checkRedirects(map, [], routes).join('\n')).toContain('Duplicate source');
  });

  it('fails when a target is not a route', () => {
    const map = [{ from: '/old/', to: '/nowhere/' }];
    expect(checkRedirects(map, [], routes).join('\n')).toContain('Target is not a route');
  });

  it('allows /sitemap.xml as a target', () => {
    const map = [{ from: '/wp.xml', to: '/sitemap.xml' }];
    expect(checkRedirects(map, [], routes)).toEqual([]);
  });

  it('fails on chains', () => {
    const map = [
      { from: '/one/', to: '/two/' },
      { from: '/two/', to: '/a/' },
    ];
    const text = checkRedirects(map, [], [...routes, '/two/']).join('\n');
    expect(text).toContain('Chain');
  });

  it('fails on loops', () => {
    const map = [{ from: '/a/', to: '/a/' }];
    expect(checkRedirects(map, [], routes).join('\n')).toContain('Loop');
  });

  it('fails when .htaccess has a missing or extra rule', () => {
    const map = [{ from: '/old/', to: '/a/' }];
    const other = buildHtaccess([
      { from: '/old/', to: '/a/' },
      { from: '/x/', to: '/b/' },
    ]);
    expect(checkRedirects(map, [], routes, other).join('\n')).toContain('.htaccess has 2');
    expect(checkRedirects(map, [], routes, buildHtaccess([])).join('\n')).toContain('misses');
  });
});

describe('parseOldUrls', () => {
  it('ignores blank lines and comments', () => {
    expect(parseOldUrls('/a/\n\n# note\n /b/ \n')).toEqual(['/a/', '/b/']);
  });
});

describe('real redirect map', () => {
  const oldUrls = parseOldUrls(readFileSync('docs/source/old-urls.txt', 'utf8'));

  it('covers every old URL and passes all checks', () => {
    expect(checkRedirects(redirects, oldUrls, routePaths, buildHtaccess(redirects))).toEqual([]);
  });

  it('uses the decided targets', () => {
    const find = (from: string) => redirects.find((r) => r.from === from)?.to;
    expect(find('/ogrod/')).toBe('/');
    expect(find('/wokol-hotelu/')).toBe('/atrakcje/');
    expect(find('/rezerwuj/')).toBe('/rezerwacja/');
    expect(find('/pakiet-kobiecy-weekend/')).toBe('/pakiety/');
    expect(find('/wpa-stats-type/view/')).toBe('/');
    expect(find('/feed/')).toBe('/');
    expect(find('/wp-sitemap.xml')).toBe('/sitemap.xml');
  });
});
