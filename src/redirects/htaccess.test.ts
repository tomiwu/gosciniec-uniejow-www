import { describe, expect, it } from 'vitest';
import { buildHtaccess, sourcePattern } from './htaccess';
import type { Redirect } from './map';
import { redirects } from './map';

const sample: Redirect[] = [
  { from: '/stary/adres/', to: '/' },
  { from: '/mapa.xml', to: '/sitemap.xml' },
];

describe('sourcePattern', () => {
  it('matches with and without the trailing slash', () => {
    const re = new RegExp(sourcePattern('/stary/adres/'));
    expect(re.test('stary/adres/')).toBe(true);
    expect(re.test('stary/adres')).toBe(true);
    expect(re.test('stary/adres/x')).toBe(false);
  });

  it('escapes dots in file-like sources', () => {
    const re = new RegExp(sourcePattern('/mapa.xml'));
    expect(re.test('mapa.xml')).toBe(true);
    expect(re.test('mapaXxml')).toBe(false);
  });
});

describe('buildHtaccess', () => {
  const output = buildHtaccess(sample);

  it('enables the rewrite engine', () => {
    expect(output).toContain('RewriteEngine On');
  });

  it('redirects HTTP to HTTPS and www to the bare domain with 301', () => {
    expect(output).toContain('RewriteCond %{HTTPS} !=on');
    expect(output).toContain('RewriteCond %{HTTP_HOST} ^www\\.gosciniecuniejow\\.pl$ [NC]');
    expect(output).toContain('RewriteRule ^ https://gosciniecuniejow.pl%{REQUEST_URI} [R=301,L]');
  });

  it('writes one rule per map entry', () => {
    expect(output).toContain('RewriteRule ^stary/adres/?$ / [R=301,L]');
    expect(output).toContain('RewriteRule ^mapa\\.xml$ /sitemap.xml [R=301,L]');
    const rules = output.split('\n').filter((line) => /^RewriteRule \^\S/.test(line));
    expect(rules).toHaveLength(sample.length);
  });

  it('sets the 404 page and the headers', () => {
    expect(output).toContain('ErrorDocument 404 /404.html');
    expect(output).toContain('X-Content-Type-Options "nosniff"');
    expect(output).toContain('Referrer-Policy "strict-origin-when-cross-origin"');
    expect(output).toContain('Cache-Control "public, max-age=31536000, immutable"');
    expect(output).toContain('_next/static');
  });

  it('builds a rule for every real map entry', () => {
    const real = buildHtaccess(redirects);
    for (const entry of redirects) {
      expect(real).toContain(`RewriteRule ${sourcePattern(entry.from)} ${entry.to} [R=301,L]`);
    }
  });
});
