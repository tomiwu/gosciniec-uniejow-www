# PRD: gosciniec-uniejow-www (Phase 1)

Status: approved by Tomasz Wujec on 2026-11-26 (grill in the bot "Strona Hotelu SEO").
Owner bot: Strona Hotelu SEO. Other bots do not touch this repository.
Source plan: "Plan v1: Gościniec Uniejów", phase 1 (new site, content and SEO, no booking engine yet).

## 1. Problem

The hotel Gościniec Uniejów (ul. Sienkiewicza 137, 99-210 Uniejów) has an old WordPress site.
The audit of 2026-11-11 found these problems:

- No booking path. `/rezerwacja/` and `/kontakt/` return 404.
- Weak SEO. The home title is "Gościniec Uniejów – Witaj!". No meta description. No schema.org data.
- Mixed NAP data: different phone numbers and the old name "Nad Wartą".
- Slow pages: mobile LCP 22.7 s (PageSpeed Insights). PHP 7.4.
- No consent banner with Google Consent Mode v2. No GA4. No Search Console.

## 2. Goal

A new fast, accessible static site on the same domain `gosciniecuniejow.pl`.
It must get more direct bookings (form and phone in phase 1) and better visibility in Google, Google Maps and AI search.
Main measure (Tomasz): revenue per change, then page views.

## 3. Scope of phase 1

Pages (Polish copy, one main search intent for each URL):

| URL | Content | Main keywords |
| --- | --- | --- |
| `/` | short description, rooms, SPA, restaurant, CTA "Rezerwuj" | hotel Uniejów, noclegi Uniejów, Gościniec Uniejów |
| `/pokoje/` | 4 room types (standard, superior, deluxe 3*, family apartment) | pokoje Uniejów, apartament Uniejów, pokój rodzinny Uniejów |
| `/ceny/` | "cena od" for each room type and package prices | hotel Uniejów ceny, nocleg Uniejów ceny |
| `/pakiety/` | packages (for example "Kobiecy Chill & Fun", 719 zł / person, source: old site) | pakiet spa Uniejów, weekend SPA Uniejów |
| `/spa/` | wellness zone: jacuzzi, Finnish sauna, gym | hotel spa Uniejów |
| `/restauracja/` | restaurant with the menu as HTML text | restauracja Uniejów |
| `/konferencje/` | conference rooms | konferencje Uniejów, sala szkoleniowa Uniejów |
| `/przyjecia/` | weddings and parties | sala weselna Uniejów, przyjęcie okolicznościowe Uniejów |
| `/dla-dzieci/` | offer for families | Uniejów z dziećmi |
| `/atrakcje/` | attractions: Termy Uniejów, castle, tężnia, bulwary, routes | zamek Uniejów, termy Uniejów atrakcje |
| `/faq/` | FAQ (FAQPage schema) | czy jest śniadanie, parking, zameldowanie |
| `/blog/` | blog structure only (list and article template, 1 sample article marked draft) | - |
| `/kontakt/` | NAP, map, contact form | Gościniec Uniejów kontakt |
| `/rezerwacja/` | booking request form + phone (phase 1 "Rezerwuj" target) | rezerwacja hotelu Uniejów |
| `/regulamin/`, `/polityka-prywatnosci/` | placeholders. A lawyer writes the text. | - |

Out of scope (phase 2 and later): booking engine, Stripe, PostgreSQL, Scala 3 backend on a VPS, channel manager, Google Hotels feed, English version (no hreflang until EN exists).

## 4. Acceptance criteria of phase 1

1. 301 redirects from every old WordPress URL in the map (`src/redirects/map.ts`) to the new URL. `.htaccess` is generated from the map. HTTP to HTTPS and `www` to the bare domain also use 301.
2. Lab LCP below 2500 ms on `/` and `/pokoje/` (Lighthouse CI, mobile preset, static output).
3. No 404 on `/kontakt/` and `/rezerwacja/`.
4. FAQ and attractions pages are live with real text.
5. JSON-LD: `Hotel` (a `LodgingBusiness` type) on every page, `FAQPage` on `/faq/`, `Offer` only where a real price exists.
6. WCAG 2.2 AA: axe-core (tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa) finds 0 violations on every page. No `user-scalable=no`. Visible focus. Alt text on every image.
7. NAP is the same on every page: "Gościniec Uniejów", ul. Sienkiewicza 137, 99-210 Uniejów, tel. +48 63 28 88 628, kontakt@gosciniecuniejow.pl.
8. GA4 loads only after consent (Consent Mode v2 defaults denied).
9. The site runs from plain files on webd.pl shared hosting, first on a test address.

## 5. Decisions (veto allowed)

| ID | Decision | Reason |
| --- | --- | --- |
| PS1 | Repository `tomiwu/gosciniec-uniejow-www`. | Approved 2026-11-26. |
| PS2 | Private repository. No licence file. | Hotel data now, payment data later. |
| PS3 | Fine-grained PAT for this repo only (Contents, Issues, Pull requests, Workflows, Administration, read/write). Only in `.sandcastle/.env` on the box. | code-rules.md. |
| PS4 | Reuse Tomasz's `CLAUDE_CODE_OAUTH_TOKEN`. Loop webhook values in `.sandcastle/.env`. No other secrets in phase 1. | Approved 2026-11-26. |
| PS5 | Phase 1: static site, Next.js (App Router) + TypeScript, `output: 'export'`, `trailingSlash: true`, images pre-resized by a build script (`images.unoptimized: true`). Deploy as plain files to the existing webd.pl shared hosting (cPanel, LiteSpeed, `public_html`). Phase 2: Scala 3 backend (ZIO HTTP or Tapir), PostgreSQL, stripe-java, on a VPS. | webd.pl shared hosting has no stable Node, no Java, no PostgreSQL. Static HTML is best for SEO and LCP. Approved 2026-11-26. |
| PS6 | Required CI jobs: `format`, `lint`, `typecheck`, `test`, `build`, `e2e-a11y`, `lighthouse`, `redirects`, `schema`. All are required in branch protection. No "skip if missing" step. | Approved 2026-11-26. |
| Q18 | Copy and photos come from the old site (`docs/source/`) and get rewritten for local keywords. Tomasz accepts the copy in the PR. | Approved 2026-11-26. |
| Q19 | Contact and booking forms post to `public/api/contact.php` on webd.pl. It sends mail to kontakt@gosciniecuniejow.pl. Honeypot field, server-side validation, rate limit (5 messages per IP per hour, file-based). | PHP is available on webd.pl. No third-party form service, so no extra data processor (GDPR). |
| Q20 | Consent banner: `vanilla-cookieconsent` (orestbida). Consent Mode v2 defaults `denied`. GA4 loads only after `analytics` consent. | Free, open source. Approved 2026-11-26. |
| Q21 | GA4 measurement ID comes later as the build variable `NEXT_PUBLIC_GA4_ID`. No value: no GA tag in the HTML. Tomasz creates GA4 and Search Console on his account later. | Approved 2026-11-26. |
| Q22 | Domain and DNS stay at webd.pl (NS ns5.webd.pl, ns7.webd.pl). The production switch happens only after Tomasz says "przełącz". | Approved 2026-11-26. |
| D1 | Merge rule: NO auto-merge. The loop opens a PR, waits for green CI, adds the label `needs-validation` and stops work on that issue. Tomasz gives the OK for each merge. Squash merge only. | Tomasz's rule. |
| D2 | Deploy (FTP to a test directory) is a separate issue with the label `needs-validation` and no `Sandcastle` label. CI never deploys to production. FTP credentials come later in a masked field. | No secret in CI yet. |
| D3 | Room prices: the old site shows none. `/ceny/` shows a visible placeholder ("Cena od: zapytaj recepcję", TODO) until Tomasz gives real prices. No `Offer` schema without a real price. The only real price now: package "Kobiecy Chill & Fun" 719 zł / person (old site, 2025-09-22); it is marked "check if valid". | Never invent prices. |
| D4 | The old name "Gościniec Nad Wartą" appears only in one sentence on `/` ("dawniej Gościniec Nad Wartą") and in redirects. | Brand protection. |
| D5 | Second phone 789 017 995 from the old package page is not used. Only +48 63 28 88 628. | One NAP. |
| D6 | Sandcastle orchestrator package `@ai-hero/sandcastle` 0.12.0 (not 0.14.0). | 0.12.0 runs in the other loops on this box. Change later in a separate issue. |
| D7 | Node.js 26 LTS in CI and in the loop image. | Newest LTS on 2026-11-26 (26.13.1). |
| D8 | Images: download from the old site once (`scripts/fetch-images.ts`), commit resized AVIF/WebP + JPEG fallback (max width 1600 px) in `public/img/`. | Pre-sized images are needed for LCP on static hosting. |

## 6. Test decisions

- Unit tests (Vitest): redirect map (unique sources, targets exist as pages, no chains, no loops), `.htaccess` generator, JSON-LD builders, NAP constants, consent defaults, form validation helpers.
- `redirects` job: builds `.htaccess` from the typed map and checks it against the map and against the list of old URLs in `docs/source/old-urls.txt`.
- `schema` job: reads every HTML file in `out/`, parses each `application/ld+json` block, validates it with typed checks (`schema-dts` types + a structural validator). `Hotel` on every page, `FAQPage` on `/faq/`, `Offer` with `price` and `priceCurrency: PLN` where present.
- `e2e-a11y` job: Playwright serves `out/` with a static server. For every page: HTTP 200, axe-core 0 violations for WCAG 2.2 AA tags, keyboard focus visible, `/kontakt/` and `/rezerwacja/` exist.
- `lighthouse` job: Lighthouse CI on `out/`, mobile preset, 3 runs, assert `largest-contentful-paint` max 2500 ms on `/` and `/pokoje/`; accessibility score 1.0 is a warning only (axe is the hard gate).
- PHP endpoint: `php -l` plus a PHP-free unit test of the shared validation rules in TypeScript. No mail is sent in CI.
- Tests use no network. No personal data in tests. Invented test data only.

## 7. Limits and risks

- Domain `gosciniecuniejow.pl` is paid until 2027-01-15. The registry still shows the old subscriber "Gościniec Nad Wartą" Teresa Krajewska. Risk: expiry or a transfer problem. Action for Tomasz: renew before 2027-01-15.
- webd.pl shared hosting: no SSH below the "Extra" package, no Node, no Java. PHP and `.htaccess` (LiteSpeed) are available.
- GitHub Actions minutes on a private repository are limited by the plan of `tomiwu`.
- Branch protection on a private repository needs a paid GitHub plan or a rule set that the plan allows.
- The loop agent has an idle timeout. Issues contain exact tool versions, so the agent does not search the web.
- Disk on the box is small (about 9 GB free on 2026-11-26). One loop image only.

## 8. Glossary

See `GLOSSARY.md`.
