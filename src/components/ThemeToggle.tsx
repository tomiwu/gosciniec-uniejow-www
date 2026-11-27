'use client';

import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY, currentTheme, resolveTheme, type Theme } from '@/lib/theme';

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  // Without a saved choice, follow a change of the system setting while the page is open.
  const media = matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      saved = null;
    }
    applyTheme(resolveTheme(saved, media.matches));
  };
  media.addEventListener('change', onSystemChange);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', onSystemChange);
  };
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (root.dataset['theme'] === theme) return;
  const swap = () => {
    root.dataset['theme'] = theme;
  };
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && typeof document.startViewTransition === 'function') {
    document.startViewTransition(swap);
  } else {
    swap();
  }
}

/** Switch between the light (A) and the dark (B) theme. The choice stays in localStorage. */
export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribe,
    () => currentTheme(document.documentElement),
    () => null,
  );

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode can block storage. The theme still changes for this page.
    }
    applyTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={theme === null ? undefined : theme === 'dark'}
      onClick={toggle}
    >
      <svg className="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </svg>
      <svg className="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
      <span className="visually-hidden">Tryb ciemny</span>
    </button>
  );
}
