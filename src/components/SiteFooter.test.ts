import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { nap } from '@/lib/nap';
import { SiteFooter } from './SiteFooter';

const html = renderToStaticMarkup(createElement(SiteFooter));
const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('SiteFooter', () => {
  it('is a footer element with the NAP in an address element', () => {
    expect(html).toMatch(/^<footer\b/);
    expect(html).toMatch(/<address\b[\s\S]*<\/address>/);
  });

  it('shows the NAP from nap.ts', () => {
    const address = /<address\b[\s\S]*<\/address>/.exec(html)?.[0] ?? '';
    const addressText = address.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    expect(addressText).toContain(nap.name);
    expect(addressText).toContain(nap.street);
    expect(addressText).toContain(`${nap.postalCode} ${nap.city}`);
    expect(addressText).toContain(nap.phoneDisplay);
    expect(addressText).toContain(nap.email);
    expect(address).toContain(`href="tel:${nap.phoneE164}"`);
    expect(address).toContain(`href="mailto:${nap.email}"`);
  });

  it('links to the legal pages', () => {
    // Next.js adds the trailing slash at build time. The e2e test checks the final HTML.
    expect(html).toMatch(/href="\/regulamin\/?"/);
    expect(html).toMatch(/href="\/polityka-prywatnosci\/?"/);
  });

  it('shows the copyright line with the current year', () => {
    expect(text).toContain(`© ${new Date().getFullYear()} ${nap.name}`);
  });
});
