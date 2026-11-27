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

## Rooms (`/pokoje/`)

- TODO: Room prices. The old site shows none. `src/lib/rooms.ts` has `priceFrom: null` for all rooms (PRD D3). The page shows "Cena: zapytaj recepcję" with a visible TODO marker. When Tomasz gives real prices, set `priceFrom`. Then add `Offer` items to the JSON-LD.
- TODO (Tomasz, confirm): Room names. The old home page and the old `/pokoje/` page use different names for the same room types. The new site uses the names of the old `/pokoje/` page everywhere.

  | Old home page name      | New name on the site           | Slug                  |
  | ----------------------- | ------------------------------ | --------------------- |
  | Pokój klasyczny         | Pokój typu standard            | `standard`            |
  | Pokój typu superior     | Pokój typu superior            | `superior`            |
  | Pokój w standardzie 3\* | Pokój Deluxe w standardzie 3\* | `deluxe`              |
  | Rodzinny apartament     | Rodzinny Apartament            | `apartament-rodzinny` |

  The mapping is a guess from the home page text. "Pokój klasyczny" is the one for short stays and school trips, so it matches "standard". "Pokój w standardzie 3\*" is the quiet one for business guests, so it matches "Deluxe".

- TODO (Tomasz, confirm): Photo to room match. The old page has four photos and no captions. The match is from what each photo shows: `img-3729` (attic, roof window) = standard, `img-7041` (attic, desk, roof windows) = superior, `pokoj-3` (big terrace window) = Deluxe, `img-2999` (two rooms, bed for two) = Rodzinny Apartament. The old site has more room photos: `pokoj-1` and `foto-*`. Tomasz can add them.
- TODO: Number of rooms of each type, room size and bed types. The old text has none. The page gives none.

## Prices and packages (`/ceny/`, `/pakiety/`)

- TODO: Tomasz: give the "cena od" price for each room type. The old site has no room prices (PRD D3). `/ceny/` shows "Zapytaj recepcję" with a visible `TODO` marker. Set `priceFrom` in `src/lib/rooms.ts`. No `Offer` for a room until then.
- TODO: Confirm that the package "Kobiecy Chill & Fun" is still valid at 719 zł / osoba. The old page is dated 2025-09-22 (`docs/source/pakiet-kobiecy-weekend.md`). The page shows "Aktualność oferty potwierdź w recepcji" and a `TODO` marker. Change `price` in `src/lib/offers.ts` if it differs. Set it to `null` if the package ends. The `Offer` JSON-LD then goes away.
- TODO: Christmas offer "Święta w Gościńcu". The old page has only Lorem ipsum text, no details and no price (`docs/source/portfolio_swieta-w-goscincu.md`). `/pakiety/` has a short section "Zapytaj o ofertę świąteczną" and a `TODO` marker. In `offers.ts` its price is `null`, so it has no `Offer`.
- TODO: The old package page has a second phone number (789 017 995) and a "\*" after the price. The new page uses the hotel phone only. Ask the owner what the "\*" means (for example a condition).
  \

## Attractions (`/atrakcje/`)

- TODO: Links to official sites. The old site text has no URL for any attraction. The page has no external link. Add the URLs that the owner confirms.
- TODO: Distances from the hotel. Only "3 km to Termy Uniejów" is in the old site (`docs/source/home.md`). Add other distances only from a source.
- TODO: Opening hours, ticket prices and organizers. The old site gives none. The page shows a visible `TODO` marker for these attractions: zamek (hours, tickets), tężnie (place, access), Zagroda Młynarska (bread workshops), spływ kajakowy (organizer, route, price), ścieżka "Zieleń" (route, length), spacer z zielarką (organizer, dates), Spycimierz and Zoo Safari Borysew (distance, hours).
- TODO: Photos of attractions. `public/img/` has only the Termy photo (`termy`). Ask the owner for photos of the castle, the bulwary and the Zagroda, or for the right to use photos of the city.

## SPA (`/spa/`)

- TODO: List of massages and treatments, prices and hours. The old site says only "szeroki wybór masaży i zabiegów" (`docs/source/spa.md`, `docs/source/home.md`). The page shows a visible `TODO` marker.
- TODO: Access to the wellness zone for guests of standard rooms. Same open question as in the FAQ. The page lists Superior, Deluxe and Rodzinny Apartament (source: `docs/source/pokoje.md`) and shows a visible `TODO` marker for "standard".
- TODO: Rules for people who do not sleep in the hotel (can they use the wellness zone?). The old site is silent. The page says nothing about it.

## Restaurant (`/restauracja/`)

- TODO (Tomasz): Send the current menu as text or PDF. The old site has no menu. The page has the section "Menu" with the visible note "Aktualne menu wkrótce" and a `TODO` marker. Then add the dishes as `h2`/`h3` sections with name and description. Add a price only when Tomasz gives it. Add `hasMenu` to the `Restaurant` JSON-LD only after that.
- TODO: Opening hours of the restaurant. The old site gives none. The page shows a visible `TODO` marker. The `Restaurant` JSON-LD has no `openingHoursSpecification`. `check-schema` fails when a `Restaurant` has `openingHours`, `priceRange`, `aggregateRating` or `review`. Remove a key from the forbidden list only with real data.
- The photo `IMG_7522.heic` of the old page is missing (see "Photos" above).

## Family page (`/dla-dzieci/`)

- TODO: Family rules. The old site has no word about cots, high chairs, discounts for children or age limits. The page shows a visible `TODO` marker and gives no number.
- TODO: Playground facts (age range, opening, supervision) and the dates of the "ekologiczne warsztaty". The old site gives none.
- The warm-water tub ("balia") is a summer attraction in the old text. It has no photo on the old family page. The page shows no photo of it.
