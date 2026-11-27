# Design system

Status: approved by Tomasz on 2026-11-27 (issue #25).

- Light theme: demo variant A "Złota godzina" (https://tomiwu.github.io/gosciniec-design-demo/).
- Dark theme: demo variant B "Termy nocą" (https://tomiwu.github.io/gosciniec-design-demo/b/).
- The theme follows `prefers-color-scheme`. The toggle in the header (`ThemeToggle`) keeps the
  choice in `localStorage` (key `gu-theme`). The inline script `themeInitScript`
  (`src/lib/theme.ts`) sets `data-theme` on `<html>` before the first paint.

## Rules for new pages

1. Use the tokens in `src/app/globals.css` (`--paper`, `--surface`, `--card`, `--ink`, `--muted`,
   `--gold`, `--gold-text`, `--link`, `--line`, `--control`). Do not write hex colours in
   components. Both themes must pass axe (see `e2e/theme.spec.ts`).
2. Gold (`--gold`) is a fill colour for buttons and lines. Do not use it for text on a light
   background. Use `--gold-text` for gold text.
3. Building blocks: `.wrap`, `.section`, `.alt`, `.night` (dark band in both themes),
   `.eyebrow`, `.lead`, `.button` (`--ghost`, `--light`, `--large`, `--arrow`), `.text-link`,
   `.card` (`__media`, `__body`, `__link`), `.tags`, `.feature`, `.facts`, `.page`, `.page--wide`.
4. Motion: add `.reveal` to blocks below the fold. CSS scroll-driven animations run it; the
   IntersectionObserver in `SiteEffects` is the fallback. Never put `.reveal` or any load
   animation on the LCP element (hero image, first room image, h1).
   Animate only `transform` and `opacity`. `prefers-reduced-motion: reduce` stops all motion.
5. Fonts: Fraunces (h1, h2, logo; weight 500 only, about 12 kB), self-hosted in `public/fonts/`
   (SIL Open Font License), `font-display: optional`. The text uses the system sans-serif font.
   Do not add a second web font: the font bytes compete with the LCP image. See `src/lib/fonts.ts`.
6. Mobile first: the action bar ("Zadzwoń", "Rezerwuj") is fixed at the bottom below 1024 px.
   Do not put other fixed elements at the bottom.

## Visual review

Each PR gets screenshots of the key routes at 390 px and 1280 px in both themes, a pixel diff
against `main` and a UX review comment. The workflow is added by issue #26.
