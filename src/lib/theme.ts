/**
 * Colour theme of the site (issue #25).
 * Light = design variant A "Złota godzina". Dark = design variant B "Termy nocą".
 * Without a saved choice the theme follows `prefers-color-scheme`.
 */
export type Theme = 'light' | 'dark';

/** Key in `localStorage`. It holds only "light" or "dark". */
export const THEME_STORAGE_KEY = 'gu-theme';

export const THEME_COLORS: Record<Theme, string> = { light: '#FBF7EF', dark: '#0E1A22' };

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** A saved choice wins. Else the system setting decides. */
export function resolveTheme(saved: unknown, systemPrefersDark: boolean): Theme {
  if (isTheme(saved)) return saved;
  return systemPrefersDark ? 'dark' : 'light';
}

/**
 * Inline script for `<head>`. It runs before the first paint, so the page never shows the
 * wrong theme. It must stay small and must not throw (private mode can block localStorage).
 */
export const themeInitScript = `(function(){var d=document.documentElement,s=null;try{s=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}var m=false;try{m=matchMedia('(prefers-color-scheme: dark)').matches}catch(e){}d.dataset.theme=s==='light'||s==='dark'?s:(m?'dark':'light');d.classList.add('js')})()`;

/** Read the theme that the inline script (or the toggle) put on `<html>`. */
export function currentTheme(root: { dataset: DOMStringMap }): Theme {
  return isTheme(root.dataset['theme']) ? root.dataset['theme'] : 'light';
}
