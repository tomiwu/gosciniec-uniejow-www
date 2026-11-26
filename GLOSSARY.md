# Glossary

- **NAP**: Name, Address, Phone. Must be identical on the site, in Google Business Profile and on portals.
- **GBP**: Google Business Profile (the hotel entry in Google Search and Maps).
- **LCP**: Largest Contentful Paint. Time until the largest visible element is drawn. Target: below 2500 ms (lab, mobile).
- **CMP**: Consent Management Platform. Here: the cookie banner `vanilla-cookieconsent`.
- **Consent Mode v2**: Google API that tells Google tags which consent the visitor gave (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`).
- **JSON-LD**: structured data (schema.org) in a `<script type="application/ld+json">` block.
- **Static export**: Next.js `output: 'export'`. The build writes plain HTML, CSS and JS files to `out/`.
- **Redirect map**: typed list of old WordPress URLs and their new targets (`src/redirects/map.ts`). The build writes `.htaccess` from it.
- **Sandcastle loop**: the program on the box that takes issues with the label `Sandcastle`, lets Claude Code write the code in a Podman container, and opens pull requests.
- **needs-validation**: label for a PR or issue that waits for Tomasz.
- **Phase 1 / Phase 2**: phase 1 is this static site. Phase 2 is the booking engine with Stripe (Scala 3, PostgreSQL, VPS).
- **Termy Uniejów**: the public thermal pool complex in Uniejów. It is not part of the hotel. Do not write that the hotel has thermal pools.
