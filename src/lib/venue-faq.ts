import { faq, type FaqItem } from './faq';
import { nap } from './nap';
import { equipment, layouts, partyTypes, salesEmail, sylwester } from './venue';

/**
 * Visible FAQ of `/konferencje/` and `/przyjecia/`. The same list feeds the FAQPage JSON-LD.
 * The shared question comes from `faq.ts`, so `/faq/` and these pages give the same answer.
 * No capacity, room count, area or price. Open facts are in `docs/content-todo.md`.
 */
const reception = `Prosimy o kontakt z recepcją: ${nap.phoneDisplay}`;
const inquiry = `Zapytanie wyślij na ${salesEmail} albo zadzwoń: ${nap.phoneDisplay}.`;

const shared = faq.find((item) => item.id === 'przyjecia-konferencje');
if (!shared) throw new Error('faq.ts needs the item "przyjecia-konferencje".');
/** Same answer on every page. Only the link differs, so no page links to itself. */
const sharedItem: FaqItem = { ...shared };
const sharedForConferences: FaqItem = {
  ...shared,
  link: { href: '/przyjecia/', label: 'Przyjęcia i sala balowa' },
};

const capacityQuestion = (what: string): FaqItem => ({
  id: 'pojemnosc',
  question: `Ile osób mieści ${what}?`,
  answer: `Liczba miejsc nie jest jeszcze potwierdzona. Liczby podane na tej stronie są przykładowe. Prawdziwą pojemność podamy w odpowiedzi na zapytanie. ${reception}. ${inquiry}`,
  todo: true,
});

export const conferenceFaq: readonly FaqItem[] = [
  sharedForConferences,
  {
    id: 'wyposazenie',
    question: 'Jakie wyposażenie mają sale konferencyjne?',
    answer: `Sale są wyposażone w: ${equipment.join(', ')}.`,
  },
  {
    id: 'uklady',
    question: 'Jakie układy sali są możliwe?',
    answer: `Układ sali dopasujemy do wydarzenia: ${layouts.map((l) => l.name).join(', ')}.`,
  },
  {
    id: 'catering',
    question: 'Czy hotel zapewnia catering i przerwy kawowe?',
    answer: `Tak, na zapytanie. Kuchnia przygotowuje lekkie przekąski i bufety kawowe, regionalne dania polskiej kuchni oraz zestawy i bankiety. Menu i cenę ustalamy w ofercie indywidualnej. ${inquiry}`,
  },
  {
    id: 'nocleg',
    question: 'Czy uczestnicy konferencji mogą zostać na noc?',
    answer: `Tak. Hotel ma pokoje w kilku standardach, od pokoi typu standard po apartament rodzinny. Warunki noclegu dla grupy ustalamy w ofercie. ${inquiry}`,
  },
  capacityQuestion('sala konferencyjna'),
];

export const partiesFaq: readonly FaqItem[] = [
  sharedItem,
  {
    id: 'rodzaje',
    question: 'Jakie przyjęcia można zorganizować w hotelu?',
    answer: `Hotel organizuje ${partyTypes.slice(0, -1).join(', ')} i ${partyTypes.at(-1)}. Ma ponad 30 lat doświadczenia w organizacji przyjęć. ${inquiry}`,
  },
  {
    id: 'sylwester',
    question: 'Czy hotel organizuje Sylwestra?',
    answer: `Tak. ${sylwester.title} odbędzie się ${sylwester.dateText} w sali balowej hotelu. Szczegóły i cena są na stronie oferty.`,
    link: { href: sylwester.path, label: 'Zobacz ofertę Sylwestra 2026/2027' },
  },
  {
    id: 'nocleg',
    question: 'Czy goście przyjęcia mogą zostać na noc?',
    answer: `Tak. Hotel ma pokoje, a gości balu sylwestrowego zapraszamy na nocleg. Stawki za nocleg podaje recepcja. ${reception}.`,
    link: { href: '/pokoje/', label: 'Zobacz pokoje' },
  },
  capacityQuestion('sala balowa'),
];
