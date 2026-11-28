import { describe, expect, it } from 'vitest';
import { VISUAL_ROUTES, VISUAL_THEMES, VISUAL_VIEWPORTS, shotName } from '../e2e-visual/routes';
import { getPublishedPosts } from '../src/lib/blog';
import { routePaths } from '../src/lib/routes';

describe('visual review routes', () => {
  it('includes the packages, offer, blog and legal pages', () => {
    for (const path of [
      '/pakiety/',
      '/pakiety/sylwester-2026-2027/',
      '/blog/',
      '/regulamin/',
      '/polityka-prywatnosci/',
    ]) {
      expect(VISUAL_ROUTES).toContain(path);
    }
  });

  it('lists only real routes of the site, without duplicates', () => {
    expect(new Set(VISUAL_ROUTES).size).toBe(VISUAL_ROUTES.length);
    for (const path of VISUAL_ROUTES) {
      expect(routePaths).toContain(path);
    }
  });

  it('includes every published blog article', () => {
    for (const post of getPublishedPosts()) {
      expect(VISUAL_ROUTES).toContain(post.path);
    }
  });

  it('keeps the two screen sizes and the two themes', () => {
    expect(VISUAL_VIEWPORTS.map((v) => v.width)).toEqual([390, 1280]);
    expect([...VISUAL_THEMES]).toEqual(['light', 'dark']);
  });

  it('gives each shot a unique file name', () => {
    const names = new Set<string>();
    for (const route of VISUAL_ROUTES) {
      for (const viewport of VISUAL_VIEWPORTS) {
        for (const theme of VISUAL_THEMES) names.add(shotName(route, viewport.name, theme));
      }
    }
    expect(names.size).toBe(VISUAL_ROUTES.length * VISUAL_VIEWPORTS.length * VISUAL_THEMES.length);
    expect(shotName('/pakiety/sylwester-2026-2027/', 'mobile', 'dark')).toBe(
      'pakiety-sylwester-2026-2027-mobile-dark.png',
    );
  });
});
