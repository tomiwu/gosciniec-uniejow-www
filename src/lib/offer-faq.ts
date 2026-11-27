import type { FaqItem } from './faq';
import { nap } from './nap';
import { offers } from './offers';
import { salesEmail, sylwester } from './venue';

/**
 * Questions about packages and the New Year's Eve ball (issue #36).
 * The same list shows on `/pakiety/`, on the offer page and on `/faq/`, so every page gives the same answer.
 * Only the facts of the owner decision of 2026-11-27 are used:
 * - the 740 zł amount comes from `offers.ts`, for the ball, per couple;
 * - no 599 zł Black Friday price (it ended on 2026-11-29 and a static page cannot hide it);
 * - no menu, no inclusions, no overnight rate;
 * - no sample package. A sample package is a placeholder (`src/content/placeholders.ts`).
 *   A question about it would need `isPlaceholder: true` and would stay out of the JSON-LD.
 */
const ball = offers.find((offer) => offer.id === 'sylwester-2026');
if (!ball || ball.price === null) {
  throw new Error('offers.ts needs the Sylwester offer with a price.');
}

const reception = `Prosimy o kontakt z recepcją: ${nap.phoneDisplay}`;

export const offerFaq: readonly FaqItem[] = [
  {
    id: 'oferta-rezerwacja',
    question: 'Jak zarezerwować pakiet lub bal sylwestrowy?',
    answer: `Zadzwoń do recepcji: ${nap.phoneDisplay}, albo napisz na ${nap.email}. Możesz też wysłać zapytanie przez formularz na stronie rezerwacji. Formularz nie rezerwuje terminu. W sprawie balu i innych wydarzeń pisz też na ${salesEmail}.`,
    link: { href: '/rezerwacja/', label: 'Przejdź do rezerwacji' },
  },
  {
    id: 'bal-termin',
    question: 'Kiedy jest bal sylwestrowy 2026/2027?',
    answer: `Bal Sylwestrowy odbędzie się 31.12.2026 (czwartek) w odnowionej sali balowej hotelu Gościniec Uniejów, ${nap.street}. Muzyka: ${sylwester.dj}. Do hotelu łatwo dojechać z autostrady A2 i drogi S8.`,
  },
  {
    id: 'bal-cena',
    question: 'Ile kosztuje bal sylwestrowy?',
    answer: `Bal kosztuje ${ball.price} zł za parę. Cena dotyczy balu. Menu i nocleg: na zapytanie. ${reception}.`,
  },
  {
    id: 'bal-nocleg',
    question: 'Czy w cenie balu jest nocleg?',
    answer: `Zapraszamy gości balu na nocleg. Nie publikujemy stawki za nocleg, a cena balu dotyczy balu. Zapytaj o nocleg w recepcji. ${reception}.`,
  },
  {
    id: 'bal-termy',
    question: 'Czy wstęp do Term Uniejów jest w cenie balu?',
    answer:
      'Nie. 1 stycznia rano możesz zregenerować siły w pobliskich Termach Uniejów. Termy to osobny, publiczny kompleks, około 3 km od hotelu. Wstęp do Term nie jest w cenie balu.',
  },
];
