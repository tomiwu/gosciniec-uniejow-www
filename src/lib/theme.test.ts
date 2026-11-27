import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY, currentTheme, resolveTheme, themeInitScript } from './theme';

function runInitScript(saved: string | null, prefersDark: boolean, storageThrows = false) {
  const root = { dataset: {} as Record<string, string>, classes: [] as string[] };
  const fakeDocument = {
    documentElement: {
      dataset: root.dataset,
      classList: { add: (name: string) => root.classes.push(name) },
    },
  };
  const fakeStorage = {
    getItem: (key: string) => {
      if (storageThrows) throw new Error('blocked');
      return key === THEME_STORAGE_KEY ? saved : null;
    },
  };
  const fakeMatchMedia = () => ({ matches: prefersDark });
  new Function('document', 'localStorage', 'matchMedia', themeInitScript)(
    fakeDocument,
    fakeStorage,
    fakeMatchMedia,
  );
  return root;
}

describe('resolveTheme', () => {
  it('uses the saved choice first', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('follows the system setting without a valid saved choice', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme('blue', false)).toBe('light');
  });
});

describe('themeInitScript', () => {
  it('sets data-theme from the system setting and marks JS', () => {
    const root = runInitScript(null, true);
    expect(root.dataset['theme']).toBe('dark');
    expect(root.classes).toContain('js');
  });

  it('prefers the saved choice', () => {
    expect(runInitScript('light', true).dataset['theme']).toBe('light');
  });

  it('does not throw when storage is blocked', () => {
    expect(runInitScript(null, false, true).dataset['theme']).toBe('light');
  });
});

describe('currentTheme', () => {
  it('falls back to light for an unknown value', () => {
    expect(currentTheme({ dataset: { theme: 'dark' } })).toBe('dark');
    expect(currentTheme({ dataset: {} })).toBe('light');
  });
});
