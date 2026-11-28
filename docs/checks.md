# Checks: local loop, GitHub CI and deploy

## GitHub CI (required)

Branch protection requires 9 jobs: `format`, `lint`, `typecheck`, `test`, `build`, `redirects`, `schema`, `e2e-a11y`, `lighthouse` (PRD PS6). `build` runs `npm run build`. This is a non-production build: it may use sample data (`src/content/placeholders.ts`) when each page that shows it has the badge "Dane testowe". `lighthouse` runs Lighthouse CI on that export (`lighthouserc.json`: mobile preset, 3 runs, median LCP ≤ 2500 ms on `/`, `/pokoje/`, `/pakiety/` and `/blog/`).

## Scroll-time layout checks (`e2e/ux-flows.spec.ts`)

The `e2e-a11y` job checks the real boxes of the mobile action bar and the cookie banner while the page moves (issue #83). The `visual-review` job only reports. It does not run these checks.

- Viewports: 390 px (light and dark) and 1280 px. The routes are `/`, `/pokoje/`, `/kontakt/`, `/pakiety/` and `/rezerwacja/`.
- Steps: slow scroll down and up with the banner open, after Akceptuję, after Odrzucam, after Ustawienia, and after a turn to landscape and back. The Zadzwoń and Rezerwuj targets must be tappable.
- Rules at each scroll stop: the bar is at the viewport bottom (±1 px) and fully visible. Its height is `--bar-h` plus `env(safe-area-inset-bottom)` and does not change. The banner ends at the top of the bar (1 px overlap by design). Nothing shows between the two layers. At 1280 px the bar stays hidden.
- WebKit: set `E2E_WEBKIT=1` to add the `webkit-mobile` project (iPhone 13 profile). It runs only this spec. It needs `npx playwright install --with-deps webkit`. Without the variable the project is not part of the run.
- Limit: Playwright on Linux has no iOS Safari tool bar and no non-zero safe area. These checks do not replace a test on a real iPhone.

## Local loop checks (`.sandcastle/checks.json`)

The Sandcastle loop runs these commands in its container before it opens a PR. They are the same commands as the GitHub jobs, so the loop does not fail on a check that CI passes.

- `build` is `npm run build`, as in CI. It is not a production build (see below), so sample data does not stop the loop.
- There is no local Lighthouse check. The local run used the same method as CI (`lighthouserc.json`: 3 runs, median), but the container is slower and noisier. On the same `main` commit it measured 3.0–3.2 s on `/` and about 2.5 s on `/pokoje/`, while CI measured about 0.9 s and 2.3–2.4 s. A second method cannot fix a hardware difference. The required GitHub `lighthouse` job is the gate: when it fails, the loop gets the CI log (`ci_failed`) and its fixer works on it.

The loop reads `checks.json` one time, when the process starts (`CONFIG` in `.sandcastle/main.mts`). Each iteration checks out `origin/main`, but the commands stay the ones of the start. A change takes effect at the next loop start (`scripts/start-loop.sh`).

## Deploy gate (production, webd.pl)

Deploy only an export of `npm run build:production` (`PRODUCTION_BUILD=1`). `scripts/check-placeholders.ts` runs before and after `next build`. In a production build it fails when a source file uses `src/content/placeholders.ts` or when an exported page shows the badge "Dane testowe" or a visible `TODO` marker (issue #57). Only text counts. A `TODO` in a script, a style, a comment or an attribute does not. A preview build (`npm run build`) keeps passing with `TODO` markers. Remove a placeholder only after the owner confirms the real value (issue #14).
