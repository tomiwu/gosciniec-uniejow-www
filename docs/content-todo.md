# Content TODO

Open facts and assets. Each item has a visible `TODO` marker in the copy where it applies.

## Photos

- TODO: Two photos of the old site are not in `public/img/`. They are HEIC files. The prebuilt `sharp` has no HEVC decoder. Ask the owner for JPEG copies, then run `scripts/fetch-images.ts` again or add them by hand.
  - `https://gosciniecuniejow.pl/wp-content/uploads/2024/02/IMG_7522.heic` (source: `docs/source/restauracja.md`)
  - `https://gosciniecuniejow.pl/wp-content/uploads/2024/02/IMG_E7706.heic` (source: `docs/source/przyjecia.md`)
- Skipped on purpose: `rekomendacja_mojekonferencje.png`. It is a badge of another site ("Obiekt rekomendowany"). Use it only if the owner confirms the recommendation.

## FAQ (`/faq/`)

The old site has no answer to these questions. The page shows a visible `TODO` marker and sends the guest to reception (`+48 63 28 88 628`). Ask the owner, then change `src/lib/faq.ts`.

- TODO: Is breakfast in the price of a normal stay? The old site names buffet breakfasts only inside the package "Kobiecy Chill & Fun" (`docs/source/pakiet-kobiecy-weekend.md`).
- TODO: Check-in and check-out hours.
- TODO: Rules for pets (dogs). Is there a fee?
- TODO: Parking. Is there a car park? Is it free? How many places?
- TODO: Cancellation rules.
- TODO: Payment methods and prepayment rules.
- TODO: Access to the wellness zone for guests of standard rooms. The old site says the access is included for Superior, Deluxe and the Family Apartment (`docs/source/pokoje.md`). It is silent about standard rooms.

Source conflict (no visible TODO, the FAQ avoids the number): `docs/source/home.md` says "3 sale konferencyjne". `docs/source/konferencje.md` says "4 nowoczesne sale konferencyjne". Ask the owner for the right number before a page states it.
