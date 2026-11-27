import type { ImageSlug } from './images';

/** One room type of the hotel. Source: `docs/source/pokoje.md`. Add no fact that the source lacks. */
export interface Room {
  /** URL-safe id. Used in `/rezerwacja/?pokoj=<slug>`. */
  slug: string;
  /** Polish name. One name for each type on the whole site. */
  name: string;
  /** Polish text for the page and for the JSON-LD `description`. */
  shortDescription: string;
  /** Polish list of facts about the room. */
  features: readonly string[];
  /** Photos of the room. The page shows the first one. */
  imageSlugs: readonly ImageSlug[];
  /** Polish alt text for the first photo. It describes only what the photo shows. */
  imageAlt: string;
  /** Lowest price per night in PLN. `null` until the owner gives real prices (PRD D3). */
  priceFrom: number | null;
}

export const rooms: readonly Room[] = [
  {
    slug: 'standard',
    name: 'Pokój typu standard',
    shortDescription:
      'Funkcjonalny pokój z prywatną łazienką, Wi-Fi i ręcznikami. Dobry wybór na krótkie wypady, wyjazdy grupowe i wycieczki szkolne. Niektóre pokoje są na poddaszu.',
    features: [
      'prywatna łazienka i ręczniki',
      'łóżko z szafką nocną',
      'stolik i krzesła',
      'szafa i lustro',
      'telewizor',
      'Wi-Fi',
      'niektóre pokoje na poddaszu, z oknami dachowymi',
    ],
    imageSlugs: ['img-3729'],
    imageAlt: 'Pokój typu standard na poddaszu: łóżko, stolik z krzesłami i okno dachowe',
    priceFrom: null,
  },
  {
    slug: 'superior',
    name: 'Pokój typu superior',
    shortDescription:
      'Pokój na poddaszu, z oknami dachowymi i biurkiem. W czasie pobytu goście mają nieograniczony dostęp do strefy Wellness. Pokój leży nad salą balową, więc często wybierają go goście wesel i grupy zorganizowane.',
    features: [
      'poddasze z oknami dachowymi',
      'prywatna łazienka i ręczniki',
      'łóżko z szafką nocną',
      'stolik, krzesła i biurko',
      'szafa i lustro',
      'telewizor',
      'zestaw do kawy i herbaty',
      'nieograniczony dostęp do strefy Wellness: jacuzzi, sauna fińska i siłownia',
      'położenie nad salą balową',
    ],
    imageSlugs: ['img-7041'],
    imageAlt: 'Pokój typu superior na poddaszu: łóżko, biurko z telewizorem i okna dachowe',
    priceFrom: null,
  },
  {
    slug: 'deluxe',
    name: 'Pokój Deluxe w standardzie 3*',
    shortDescription:
      'Jasny i przestronny pokój w nowym skrzydle budynku, z dala od restauracji i sali balowej. Widok na zielone pola lub ogród. Najczęściej wybierają go klienci biznesowi i goście, którzy chcą odpocząć w strefie SPA & Wellness.',
    features: [
      'nowe skrzydło budynku, z dala od restauracji i sali balowej',
      'widok na zielone pola lub ogród',
      'niektóre pokoje z balkonem, inne z dużymi oknami tarasowymi',
      'łóżko z szafką nocną',
      'biurko i krzesło',
      'szafa i lustro',
      'telewizor',
      'zestaw do kawy i herbaty',
      'ręczniki i szlafrok',
      'dostęp do strefy Wellness w cenie pokoju: jacuzzi, sauna fińska i siłownia',
    ],
    imageSlugs: ['pokoj-3'],
    imageAlt: 'Pokój Deluxe: łóżko i duże okno tarasowe z widokiem na zieleń',
    priceFrom: null,
  },
  {
    slug: 'apartament-rodzinny',
    name: 'Rodzinny Apartament',
    shortDescription:
      'Dwupokojowy apartament dla rodzin, w nowym skrzydle budynku, oddzielony od restauracji i sali balowej. Sypialnia z łożem małżeńskim i pokój dzienny z rozkładaną sofą. Często wybierają go rodziny z dziećmi.',
    features: [
      'dwa pokoje: sypialnia i pokój dzienny',
      'łoże małżeńskie w sypialni',
      'rozkładana sofa w pokoju dziennym i możliwość dostawki',
      'prywatna łazienka z podstawowymi przyborami kosmetycznymi',
      'stolik, krzesła i biurko',
      'szafa i lustro',
      'telewizor',
      'ręczniki i szlafroki',
      'wybrane apartamenty z balkonem i widokiem na pola, inne z dużymi oknami tarasowymi i widokiem na ogród',
      'dostęp do strefy Wellness w cenie noclegu: jacuzzi, sauna fińska i siłownia',
      'nowe skrzydło budynku, z dala od restauracji i sali balowej',
    ],
    imageSlugs: ['img-2999'],
    imageAlt: 'Rodzinny Apartament: sypialnia z łożem małżeńskim i przejście do drugiego pokoju',
    priceFrom: null,
  },
];
