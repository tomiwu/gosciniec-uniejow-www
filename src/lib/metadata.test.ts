import { describe, expect, it } from 'vitest';
import { noindexMetadata, routeMetadata } from './metadata';
import { nap } from './nap';
import { routes } from './routes';

const SUFFIX = `${nap.name} – hotel w Uniejowie`;

type OpenGraph = { title?: string; description?: string; url?: string; locale?: string };

function titleOf(path: string): string {
  const title = routeMetadata(path).title;
  if (typeof title !== 'object' || title === null || !('absolute' in title)) {
    throw new Error(`Expected an absolute title for ${path}`);
  }
  return title.absolute;
}

describe('routeMetadata', () => {
  it('gives every route a unique title', () => {
    const titles = routes.map((route) => titleOf(route.path));
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('uses the pattern "<Page> | Gościniec Uniejów – hotel w Uniejowie"', () => {
    for (const route of routes) {
      const title = titleOf(route.path);
      expect(title.endsWith(` | ${SUFFIX}`), title).toBe(true);
      expect(title.length, title).toBeGreaterThan(SUFFIX.length + 3);
    }
  });

  it('gives every route a description of 140 to 160 characters', () => {
    for (const route of routes) {
      const description = routeMetadata(route.path).description ?? '';
      expect(description.length, route.path).toBeGreaterThanOrEqual(140);
      expect(description.length, route.path).toBeLessThanOrEqual(160);
    }
  });

  it('gives every route a unique description', () => {
    const descriptions = routes.map((route) => routeMetadata(route.path).description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it('has no leftover placeholder text in descriptions', () => {
    for (const route of routes) {
      expect(route.description).not.toMatch(/w przygotowaniu/i);
    }
  });

  it('sets a canonical URL with a trailing slash', () => {
    for (const route of routes) {
      expect(routeMetadata(route.path).alternates?.canonical).toBe(route.path);
      expect(route.path.endsWith('/')).toBe(true);
    }
  });

  it('sets basic Open Graph tags that match the page', () => {
    for (const route of routes) {
      const meta = routeMetadata(route.path);
      const og = meta.openGraph as OpenGraph | null | undefined;
      expect(og?.title, route.path).toBe(titleOf(route.path));
      expect(og?.description, route.path).toBe(meta.description);
      expect(og?.url, route.path).toBe(route.path);
      expect(og?.locale, route.path).toBe('pl_PL');
    }
  });

  it('throws for an unknown route', () => {
    expect(() => routeMetadata('/nie-ma/')).toThrow();
  });
});

describe('noindexMetadata', () => {
  it('sets robots to noindex and keeps the site suffix in the title', () => {
    const metadata = noindexMetadata('Dziękujemy', 'Opis strony.');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.title).toEqual({ absolute: `Dziękujemy | ${SUFFIX}` });
  });
});
