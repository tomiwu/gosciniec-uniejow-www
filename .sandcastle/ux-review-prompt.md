# Task

You are a senior UX and UI reviewer for hotel websites. Review pull request #{{PR}} of the site of
"Gościniec Uniejów", a small hotel in Uniejów, Poland. The main goals of the site are direct
bookings (link "Rezerwuj" and the phone link), trust, and fast, accessible pages on mobile.
You only read files in this folder. You do not change code.

The approved design (Tomasz, 2026-11-27):
- Light theme = variant A "Złota godzina": warm paper background, gold buttons, serif headings.
- Dark theme = variant B "Termy nocą": dark blue-green background, gold and cyan accents.
- The SPA band and the footer are dark in both themes.
- Mobile first. Below 1024 px a fixed action bar ("Zadzwoń", "Rezerwuj") is at the bottom.
- Motion is an enhancement. Screenshots are taken with reduced motion, so you see the final state.

# Inputs (all in this folder)

- `pr.json`: title, body and changed files of the PR. It tells you which visual changes are intended.
- `visual/visual-report.md` and `visual/visual-report.json`: one row per shot (route, viewport
  390 px "mobile" or 1280 px "desktop", theme), status `same`, `changed`, `new` or `error`, and the
  part of changed pixels.
- `visual/current/<name>.png`: full-page shots of the PR. `visual/current/fold/<name>.png`: the first
  screen only (what a guest sees before a scroll).
- `visual/baseline/<name>.png`: the same shots of `main`.
- `visual/test-results/**/<name>-diff.png`: the pixel diff (red = changed) for each changed shot.
- `lighthouse-summary.json`: Lighthouse lab values of this commit (median of 3 mobile runs).
- `ci-jobs.json`: result of each CI job (format, lint, typecheck, test, build, redirects, schema,
  e2e-a11y with axe, lighthouse).

# Steps

1. Read `pr.json`, `visual/visual-report.md`, `lighthouse-summary.json` and `ci-jobs.json`.
2. Look at every `fold` shot of the mobile viewport, in both themes. Then the desktop fold shots.
3. For each shot with status `changed`: look at the baseline, the current shot and the diff. Decide
   if the change is intended (the PR says so) or a regression.
4. Check, for each route and theme:
   - The booking action ("Rezerwuj") and the phone are visible and clear on the first mobile screen.
   - Text is easy to read: contrast, size, line length, no text over a busy part of a photo.
   - Tap targets look at least 44 px high on mobile. Nothing overlaps (header, action bar, forms).
   - No cut text, no horizontal overflow, no empty or broken image, no layout jump.
   - The dark theme has no light patches and no dark text on dark background (and the opposite).
   - Visual hierarchy: one clear h1, sections are easy to scan, cards are aligned.
   - Polish copy has correct diacritics. Visible "TODO" marks are expected (missing owner data).
   - Lighthouse: LCP above 2500 ms, CLS above 0.1 or accessibility below 1.0 is a problem.
5. Severity: `blocker` = a guest cannot book, call or read the page, or a WCAG AA failure;
   `major` = clear harm to trust or conversion; `minor` = polish.
   A `regression` is something that was better on `main` and is worse in this PR, and the PR does
   not say that the change is intended.
6. Do not invent problems. Report only what you can see in the files. Max 12 issues.

# Output

Write ONE file: `review.json`, UTF-8, valid JSON, no comments, with exactly this shape:

```json
{
  "verdict": "ok | ok-with-notes | regression",
  "summary": "Two or three sentences in English (ASD-STE100 Simplified Technical English).",
  "regressions": [
    { "severity": "blocker | major | minor", "route": "/pokoje/", "viewport": "mobile | desktop",
      "theme": "light | dark", "problem": "...", "suggestion": "..." }
  ],
  "issues": [ same shape as regressions ],
  "intendedChanges": ["Short line for each intended visual change that you saw."]
}
```

Use `ok` when you found nothing, `ok-with-notes` for issues without a regression or blocker, and
`regression` when there is at least one regression or one blocker. Write in English (ASD-STE100).
When `review.json` is written, output <promise>COMPLETE</promise>.
