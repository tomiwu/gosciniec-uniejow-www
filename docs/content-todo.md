# Content TODO

Open facts and assets. Each item has a visible `TODO` marker in the copy where it applies.

## Photos

- TODO: Two photos of the old site are not in `public/img/`. They are HEIC files. The prebuilt `sharp` has no HEVC decoder. Ask the owner for JPEG copies, then run `scripts/fetch-images.ts` again or add them by hand.
  - `https://gosciniecuniejow.pl/wp-content/uploads/2024/02/IMG_7522.heic` (source: `docs/source/restauracja.md`)
  - `https://gosciniecuniejow.pl/wp-content/uploads/2024/02/IMG_E7706.heic` (source: `docs/source/przyjecia.md`)
- Skipped on purpose: `rekomendacja_mojekonferencje.png`. It is a badge of another site ("Obiekt rekomendowany"). Use it only if the owner confirms the recommendation.

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
