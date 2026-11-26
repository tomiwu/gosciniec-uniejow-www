# Rules for agents in this repository

## Language
- Code, comments, docs, issues, PRs and commit messages: English, ASD-STE100 Simplified Technical English. Short sentences.
- Site copy (page text, meta titles, descriptions, FAQ, alt text): Polish, with correct diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż).

## Product facts (do not change without a PRD decision)
- Name: "Gościniec Uniejów". Address: ul. Sienkiewicza 137, 99-210 Uniejów. Phone: +48 63 28 88 628. E-mail: kontakt@gosciniecuniejow.pl. Keep these in ONE module (`src/lib/nap.ts`) and import them.
- Never invent prices, ratings, review counts, distances, opening hours or awards. Use `docs/source/*.md` (old site text). A missing fact gets a visible `TODO` marker in the copy and a line in `docs/content-todo.md`.
- The hotel has a wellness zone (jacuzzi, Finnish sauna, gym). It has NO thermal pools. Termy Uniejów is a separate public complex about 3 km away (source: old site).
- Phase 1 has no booking engine. "Rezerwuj" links to `/rezerwacja/` (form + phone link `tel:+48632888628`).

## Stack
- Next.js App Router, TypeScript strict, static export (`output: 'export'`, `trailingSlash: true`). No server code in Next.js. No API routes.
- The only server code: `public/api/contact.php` (PHP 8, runs on webd.pl).
- Pages are React Server Components. Client components only where interaction needs them (consent banner, form, mobile menu).
- Keep pages light: LCP below 2500 ms (mobile lab). Pre-sized images in `public/img/` with width and height. `next/font` with local subset or system fonts. No large client libraries.
- Accessibility: WCAG 2.2 AA. Semantic HTML, one `h1` per page, labels on all inputs, visible focus, contrast 4.5:1, target size 24x24 px, no `user-scalable=no`.

## Commands (all must pass before a commit; run `scripts/precommit.sh`)
- `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:redirects`, `npm run test:schema`, `npm run test:e2e`, `npm run lighthouse`.
- Use the formatter (`npm run format`). Do not format by hand.

## Tests
- Test behaviour that a user or a crawler can see (HTML output, JSON-LD, redirects, axe results).
- No network in tests. No personal data. Invented test data only.
- Do not weaken or skip a test. Do not disable an axe rule or a lint rule to pass.

## Git
- One issue = one branch = one PR. Commit messages start with `RALPH: #<issue>`. End with `## Verification` (command and pasted real output).
- Never commit secrets. `.sandcastle/.env` is git-ignored.
- Do not edit `docs/PRD.md`, `.sandcastle/` or `.claude/`. Edit `.github/` only when the issue tells you to.
