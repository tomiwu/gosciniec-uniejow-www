import type { ImageSlug } from './images';

/**
 * Copy of the home page sections from the design demo (issue #32).
 * Every fact comes from the old site text in `docs/source/`. Add no fact that the source lacks.
 */

/** Marquee items. Sources: home.md, spa.md, ogrod.md, przyjecia.md, konferencje.md. */
export const amenities = [
  'Jacuzzi',
  'Sauna fińska',
  'Wanna z hydromasażem',
  'Siłownia',
  'Restauracja',
  'Sala balowa',
  'Sale konferencyjne',
  'Ogród z oczkiem wodnym',
  'Altana grillowa',
  'Balia ogrodowa',
  'Plac zabaw',
  'Boisko do siatkówki',
] as const;

export interface DayStep {
  time: string;
  title: string;
  text: string;
  image: ImageSlug;
  imageAlt: string;
}

/** Time-of-day story. Sources: wokol-hotelu.md, restauracja.md, ogrod.md, dla-dzieci.md. */
export const dayStory: readonly [DayStep, ...DayStep[]] = [
  {
    time: 'Poranek',
    title: 'Kawa i ptaki nad łąkami',
    text: 'Poranki zaczynają się od głosów żurawi i gęsi nad łąkami we mgle. Z tarasu restauracji można obserwować młode pisklęta, a w ogrodzie czeka hamak.',
    image: 'foto-8',
    imageAlt: 'Poranne słońce nad ogrodem hotelu i trawami ozdobnymi',
  },
  {
    time: 'Południe',
    title: 'Obiad z lokalnej kuchni',
    text: 'Restauracja serwuje świeże wypieki z miejscowej piekarni, wędliny i przetwory wyrabiane na miejscu oraz dania z dziczyzny. Sala ma bezpośrednie wyjście do ogrodu.',
    image: 'dsc0e0147',
    imageAlt: 'Tatar z żółtkiem, piklami i pieczywem na talerzu w restauracji hotelu',
  },
  {
    time: 'Popołudnie',
    title: 'Ogród, plac zabaw i boisko',
    text: 'Dzieci bawią się na bezpiecznym placu zabaw z dala od drogi. Starsi grają w siatkówkę, a dorośli odpoczywają w ogrodowej balii z hydromasażem z widokiem na pola.',
    image: 'foto-12',
    imageAlt: 'Dzieci biegają po trawniku w ogrodzie hotelu, w tle plac zabaw',
  },
  {
    time: 'Wieczór',
    title: 'Altana grillowa i SPA',
    text: 'W letnie wieczory goście spotykają się w altanie grillowej i przy ognisku. Na koniec dnia czeka strefa wellness: jacuzzi, sauna fińska i wanna z hydromasażem.',
    image: 'img-2852',
    imageAlt: 'Goście przy długim stole w altanie grillowej oświetlonej girlandą lampek',
  },
];

/** Ballroom and conferences. Sources: przyjecia.md, konferencje.md. */
export const venue = {
  lead: 'Sześć sal o różnej wielkości, w tym sala balowa: od dużego wesela na 300 osób po kameralne przyjęcie w gronie najbliższych.',
  text: 'Gościniec Uniejów ma ponad 30 lat doświadczenia w organizacji przyjęć. Do konferencji są 4 sale z pełnym wyposażeniem, dla dużych grup do 400 uczestników i dla spotkań do 12 osób. Hotel leży w centrum Polski, blisko autostrady A2.',
  stats: [
    { value: '300', label: 'gości na weselu' },
    { value: '400', label: 'uczestników konferencji' },
    { value: '4', label: 'sale konferencyjne' },
    { value: '60', label: 'pokoi dla 150 osób' },
  ],
  parties:
    'Wesela, chrzciny, jubileusze i spotkania firmowe. Bankiety nawet dla 300 osób, a latem także imprezy w ogrodzie i w altanie grillowej.',
  conferences:
    'Układ sali teatralny, szkoleniowy, w podkowę lub warsztatowy. Noclegi, przerwy kawowe i bankiety na miejscu.',
  equipment: ['rzutnik i ekran', 'nagłośnienie', 'flipchart', 'Wi-Fi', 'klimatyzacja'],
} as const;

/** Home gallery: photos of the old site (`public/img`). The alt texts describe what each photo shows. */
export const gallery: readonly { slug: ImageSlug; alt: string; caption: string }[] = [
  {
    slug: 'foto-10',
    alt: 'Drewniana altana grillowa w ogrodzie hotelu z girlandą lampek',
    caption: 'Altana w ogrodzie',
  },
  {
    slug: 'dsc08221',
    alt: 'Pokój hotelowy z dwoma łóżkami, stołem i dużym oknem',
    caption: 'Pokój',
  },
  {
    slug: 'dsc0e0185',
    alt: 'Biała kiełbasa z kapustą i chrzanem, z gałązką rozmarynu',
    caption: 'Kuchnia',
  },
  {
    slug: 'foto-6',
    alt: 'Oczko wodne z kamieniami i irysami w ogrodzie hotelu',
    caption: 'Oczko wodne',
  },
  {
    slug: 'foto-2-1',
    alt: 'Siłownia w hotelu: atlas, bieżnia i rowerek treningowy',
    caption: 'Siłownia',
  },
  {
    slug: 'img-2002',
    alt: 'Sala przygotowana na przyjęcie: długi stół i balony',
    caption: 'Przyjęcia',
  },
  {
    slug: 'foto-14',
    alt: 'Plac zabaw z dmuchanym zamkiem w ogrodzie przed hotelem',
    caption: 'Plac zabaw',
  },
  {
    slug: 'foto-2',
    alt: 'Ogród hotelu zimą, pod śniegiem',
    caption: 'Ogród zimą',
  },
];

/** FAQ teaser on the home page: only questions with a confirmed answer (no `todo`). */
export const homeFaqIds = ['termy', 'rodzinne', 'rezerwacja', 'dojazd'] as const;
