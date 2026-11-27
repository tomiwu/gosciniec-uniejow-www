import type { FAQPage, WithContext } from 'schema-dts';
import { nap } from './nap';

/**
 * FAQ list. One source of truth for the visible page and the FAQPage JSON-LD.
 * Each answer uses only facts of `docs/source/*.md`.
 * When the source has no answer, `todo` is true and the answer sends the guest to reception.
 * Open facts are also in `docs/content-todo.md`.
 */
export type FaqItem = {
  id: string;
  question: string;
  /** Plain text. The same text goes to the page and to the JSON-LD. */
  answer: string;
  /** True when the source has no answer. The page shows a TODO marker. */
  todo?: true;
  /** Optional link shown under the answer on the page. */
  link?: { href: string; label: string };
};

const reception = `Prosimy o kontakt z recepcją: ${nap.phoneDisplay}`;

export const faq: readonly FaqItem[] = [
  {
    id: 'sniadanie',
    question: 'Czy w cenie jest śniadanie?',
    answer: `Śniadania w formie bufetu są częścią pakietu „Kobiecy Chill & Fun”. Nie mamy potwierdzonej informacji, czy śniadanie jest w cenie zwykłego noclegu. ${reception}.`,
    todo: true,
    link: { href: '/pakiety/', label: 'Zobacz pakiety' },
  },
  {
    id: 'zameldowanie',
    question: 'O której godzinie jest zameldowanie i wymeldowanie?',
    answer: `Godziny zameldowania i wymeldowania podaje recepcja. ${reception}.`,
    todo: true,
  },
  {
    id: 'pies',
    question: 'Czy można przyjechać z psem?',
    answer: `Zasady pobytu ze zwierzętami podaje recepcja. ${reception}.`,
    todo: true,
  },
  {
    id: 'parking',
    question: 'Czy przy hotelu jest parking?',
    answer: `Informacje o parkingu podaje recepcja. ${reception}.`,
    todo: true,
  },
  {
    id: 'termy',
    question: 'Jak daleko hotel jest od Term Uniejów?',
    answer:
      'Do centrum miasta i do kompleksu basenowego Termy Uniejów jest około 3 km. Termy Uniejów to osobny kompleks w mieście. Hotel ma własną strefę wellness, ale nie ma basenów termalnych.',
    link: { href: '/atrakcje/', label: 'Atrakcje w Uniejowie i okolicy' },
  },
  {
    id: 'spa',
    question: 'Czy w hotelu jest SPA (jacuzzi, sauna fińska, siłownia)?',
    answer: `Tak. Kameralna strefa SPA & Wellness ma jacuzzi, wannę z hydromasażem i saunę fińską. Jest też siłownia. W ofercie są masaże i zabiegi relaksacyjno-pielęgnacyjne. Goście pokoi Superior, Deluxe i Apartamentu Rodzinnego mają dostęp do strefy Wellness. Zasady dla pokoi typu standard podaje recepcja. ${reception}.`,
    todo: true,
    link: { href: '/spa/', label: 'Poznaj strefę SPA' },
  },
  {
    id: 'rezerwacja',
    question: 'Jak zarezerwować pobyt?',
    answer: `Zadzwoń do recepcji: ${nap.phoneDisplay}. Możesz też wysłać zapytanie przez formularz na stronie rezerwacji. Formularz nie rezerwuje pokoju. Potwierdzimy dostępność w odpowiedzi.`,
    link: { href: '/rezerwacja/', label: 'Przejdź do formularza' },
  },
  {
    id: 'anulacja',
    question: 'Jakie są zasady anulacji rezerwacji?',
    answer: `Zasady anulacji podaje recepcja. ${reception}.`,
    todo: true,
  },
  {
    id: 'platnosc',
    question: 'Jak można zapłacić za pobyt?',
    answer: `Informacje o formach płatności podaje recepcja. ${reception}.`,
    todo: true,
  },
  {
    id: 'rodzinne',
    question: 'Czy są pokoje rodzinne?',
    answer:
      'Tak. Rodzinny Apartament ma dwa pokoje: sypialnię z łożem małżeńskim i pokój dzienny z rozkładaną sofą. Można dodać dostawkę. Apartamenty są w nowym skrzydle budynku, z dala od restauracji i sali balowej. W ogrodzie hotelu jest bezpieczny plac zabaw.',
    link: { href: '/pokoje/', label: 'Zobacz pokoje' },
  },
  {
    id: 'przyjecia-konferencje',
    question: 'Czy hotel organizuje przyjęcia i konferencje?',
    answer:
      'Tak. Organizujemy chrzciny, jubileusze, spotkania firmowe i wesela. Do przyjęć służy sześć sal różnej wielkości. Wesele może mieć 300 osób. Konferencje, szkolenia i warsztaty odbywają się w salach z pełnym wyposażeniem multimedialnym. Największe sale mieszczą do 400 uczestników.',
    link: { href: '/konferencje/', label: 'Konferencje' },
  },
  {
    id: 'dojazd',
    question: 'Jak dojechać do hotelu (A2, Łódź, Warszawa)?',
    answer: `Hotel jest przy ${nap.street} w Uniejowie. Do autostrady A2 jest 12 km. Do Łodzi jest 50 km, a do Warszawy 150 km.`,
    link: { href: '/kontakt/', label: 'Kontakt i dojazd' },
  },
];

export type FaqSchema = Exclude<WithContext<FAQPage>, string>;

/** JSON-LD for the FAQ page. Built from the same list as the visible page. */
export function buildFaqSchema(): FaqSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
