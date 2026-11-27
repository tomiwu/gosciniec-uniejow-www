export type Route = {
  /** Path with leading and trailing slash. */
  path: string;
  /** Polish page title. Also the `h1` text of the stub. */
  title: string;
  /** Polish page part of the `<title>` tag. `metadata.ts` adds the site suffix. */
  metaTitle: string;
  /** Polish meta description. 140 to 160 characters. A unit test checks this. */
  description: string;
};

export const routes: readonly Route[] = [
  {
    path: '/',
    title: 'Gościniec Uniejów',
    metaTitle: 'Hotel Uniejów – noclegi i SPA',
    description:
      'Gościniec Uniejów to hotel w Uniejowie z pokojami, strefą SPA i restauracją. Sprawdź noclegi w Uniejowie, zaplanuj pobyt i zarezerwuj pokój przez telefon.',
  },
  {
    path: '/pokoje/',
    title: 'Pokoje',
    metaTitle: 'Pokoje w Uniejowie',
    description:
      'Pokoje w hotelu Gościniec Uniejów: standard, superior, deluxe 3* i apartament rodzinny. Poznaj wyposażenie i wybierz pokój rodzinny lub apartament w Uniejowie.',
  },
  {
    path: '/ceny/',
    title: 'Ceny',
    metaTitle: 'Ceny noclegów w Uniejowie',
    description:
      'Ceny noclegów w hotelu Gościniec Uniejów. Sprawdź, jak poznać cenę pokoju w Uniejowie, zapytaj recepcję o ofertę i zobacz aktualne oferty sezonowe.',
  },
  {
    path: '/pakiety/',
    title: 'Pakiety',
    metaTitle: 'Pakiety i oferty w Uniejowie – Sylwester 2026',
    description:
      'Oferty hotelu Gościniec Uniejów: bal sylwestrowy 31.12.2026 w odnowionej sali balowej i pakiety pobytowe. Zobacz opisy ofert i zapytaj o termin.',
  },
  {
    path: '/spa/',
    title: 'SPA i wellness',
    metaTitle: 'Hotel SPA w Uniejowie – strefa wellness',
    description:
      'Strefa wellness w hotelu Gościniec Uniejów: jacuzzi, sauna fińska i siłownia. Kameralny relaks. Termy Uniejów to osobny kompleks, ok. 3 km od hotelu.',
  },
  {
    path: '/restauracja/',
    title: 'Restauracja',
    metaTitle: 'Restauracja w Uniejowie',
    description:
      'Restauracja w hotelu Gościniec Uniejów: lokalne dania, domowe wypieki i sala z wyjściem do ogrodu. Zjedz obiad w Uniejowie lub zorganizuj przyjęcie rodzinne.',
  },
  {
    path: '/konferencje/',
    title: 'Konferencje',
    metaTitle: 'Konferencje i szkolenia w Uniejowie',
    description:
      'Konferencje w Uniejowie: sale konferencyjne i szkoleniowe, noclegi, kuchnia i strefa wellness w jednym hotelu. Blisko autostrady A2, w centrum Polski.',
  },
  {
    path: '/przyjecia/',
    title: 'Przyjęcia',
    metaTitle: 'Sala weselna i przyjęcia w Uniejowie',
    description:
      'Sala weselna w Uniejowie i przyjęcia okolicznościowe: wesela, chrzciny, jubileusze i spotkania firmowe w hotelu Gościniec Uniejów z ogrodem. Zapytaj o termin.',
  },
  {
    path: '/dla-dzieci/',
    title: 'Dla dzieci',
    metaTitle: 'Uniejów z dziećmi',
    description:
      'Uniejów z dziećmi: hotel Gościniec Uniejów z placem zabaw w ogrodzie, spokojną okolicą i apartamentem rodzinnym. Sprawdź ofertę dla rodzin z dziećmi.',
  },
  {
    path: '/atrakcje/',
    title: 'Atrakcje',
    metaTitle: 'Atrakcje w Uniejowie – zamek, termy, tężnia',
    description:
      'Atrakcje w Uniejowie i okolicy: zamek, Termy Uniejów, tężnia, bulwary nad Wartą i trasy rowerowe. Zobacz, co zwiedzić podczas pobytu w Gościńcu Uniejów.',
  },
  {
    path: '/faq/',
    title: 'Najczęstsze pytania',
    metaTitle: 'FAQ – najczęstsze pytania o hotel',
    description:
      'Najczęstsze pytania o hotel Gościniec Uniejów w Uniejowie: śniadanie, parking, zameldowanie i kontakt z recepcją. Sprawdź odpowiedzi przed rezerwacją pobytu.',
  },
  {
    path: '/blog/',
    title: 'Blog',
    metaTitle: 'Blog – Uniejów i okolice',
    description:
      'Blog hotelu Gościniec Uniejów: pomysły na weekend w Uniejowie, atrakcje okolicy i nowości z hotelu. Pierwsze artykuły pojawią się wkrótce na tej stronie.',
  },
  {
    path: '/kontakt/',
    title: 'Kontakt',
    metaTitle: 'Kontakt – hotel w Uniejowie',
    description:
      'Kontakt z hotelem Gościniec Uniejów: telefon, e-mail i adres w Uniejowie. Zadzwoń lub napisz, a pomożemy zaplanować pobyt, konferencję albo przyjęcie.',
  },
  {
    path: '/rezerwacja/',
    title: 'Rezerwacja',
    metaTitle: 'Rezerwacja hotelu w Uniejowie',
    description:
      'Rezerwacja hotelu w Uniejowie: wyślij zapytanie przez formularz lub zadzwoń do recepcji Gościńca Uniejów. Zapytaj o dostępność pokoi i warunki pobytu.',
  },
  {
    path: '/regulamin/',
    title: 'Regulamin',
    metaTitle: 'Regulamin hotelu',
    description:
      'Regulamin hotelu Gościniec Uniejów: zasady rezerwacji, pobytu i korzystania z usług hotelu. Pełny tekst regulaminu pojawi się wkrótce na tej stronie.',
  },
  {
    path: '/polityka-prywatnosci/',
    title: 'Polityka prywatności',
    metaTitle: 'Polityka prywatności',
    description:
      'Polityka prywatności hotelu Gościniec Uniejów: jak przetwarzamy dane osobowe z formularzy i plików cookie. Pełny tekst pojawi się wkrótce na tej stronie.',
  },
];

export const routePaths: readonly string[] = routes.map((route) => route.path);

export function findRoute(path: string): Route | undefined {
  return routes.find((route) => route.path === path);
}
