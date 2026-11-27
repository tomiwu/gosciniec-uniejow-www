import { describe, expect, it } from 'vitest';
import { routePaths, routes } from './routes';

describe('routes', () => {
  it('lists the 16 phase 1 routes', () => {
    expect(routes).toHaveLength(16);
  });

  it('uses unique paths with leading and trailing slash', () => {
    expect(new Set(routePaths).size).toBe(routePaths.length);
    for (const path of routePaths) {
      expect(path).toMatch(/^\/([a-z0-9-]+\/)*$/);
    }
  });

  it('has a title and a description for each route', () => {
    for (const route of routes) {
      expect(route.title.length).toBeGreaterThan(0);
      expect(route.description.length).toBeGreaterThan(0);
    }
  });

  it('includes the booking and contact pages', () => {
    expect(routePaths).toContain('/rezerwacja/');
    expect(routePaths).toContain('/kontakt/');
  });
});

describe('routes: package hub metadata', () => {
  it('does not promise a weekend SPA package or the archived package', () => {
    const text = routes.map((r) => `${r.metaTitle ?? ''} ${r.description}`).join(' ');
    expect(text).not.toMatch(/weekend SPA|Kobiecy|719/i);
  });
});
