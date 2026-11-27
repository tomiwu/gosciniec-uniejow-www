# Overview

```
src/app/            pages (App Router, static export). One stub page for each route.
src/components/     shared React components (StubPage, NapBlock, JsonLd)
src/lib/routes.ts   typed list of all phase 1 routes (title, meta description)
src/lib/seo-files.ts  robots.txt and sitemap.xml builders
src/lib/nap.ts      name, address, phone, e-mail (single source)
src/lib/schema/     JSON-LD builders (Hotel, FAQPage, Offer)
src/redirects/      typed 301 map + .htaccess generator
public/img/         pre-sized images
public/api/contact.php  mail endpoint for the forms (webd.pl, PHP)
scripts/            postbuild, check-redirects, check-schema (+ tests), precommit, start-loop
e2e/                Playwright + axe tests (serve.json: static server config)
.github/workflows/  ci.yml with the 9 required jobs
docs/source/        text and image URLs of the old WordPress site (source material)
.sandcastle/        loop orchestrator and agent prompts (host only)
```

Build: `npm run build` writes `out/` (HTML, CSS, JS, images, `.htaccess`, `api/contact.php`, `robots.txt`, `sitemap.xml`).
Placeholder data (sample packages) lives in `src/content/placeholders.ts`. Every page that shows it carries the badge "Dane testowe". `npm run build` (CI, preview) keeps it. The build for webd.pl MUST use `npm run build:production`: it fails while any page uses placeholder data.
Deploy (later, issue with label needs-validation): upload `out/` to a test directory on webd.pl.
