# Overview

```
src/app/            pages (App Router, static export)
src/lib/nap.ts      name, address, phone, e-mail (single source)
src/lib/schema/     JSON-LD builders (Hotel, FAQPage, Offer)
src/redirects/      typed 301 map + .htaccess generator
public/img/         pre-sized images
public/api/contact.php  mail endpoint for the forms (webd.pl, PHP)
scripts/            build helpers, precommit, start-loop
e2e/                Playwright + axe tests
docs/source/        text and image URLs of the old WordPress site (source material)
.sandcastle/        loop orchestrator and agent prompts (host only)
```

Build: `npm run build` writes `out/` (HTML, CSS, JS, images, `.htaccess`, `api/contact.php`, `robots.txt`, `sitemap.xml`).
Deploy (later, issue with label needs-validation): upload `out/` to a test directory on webd.pl.
