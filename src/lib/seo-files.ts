import { cheapestRoomFromPrice, PLACEHOLDER_BADGE } from '@/content/placeholders';
import { nap } from './nap';
import { offers } from './offers';
import { isPreview } from './preview';
import { routes } from './routes';

/** Main routes named in issue #41. Each path must stay in sync with a visible page. */
export const LLMS_MAIN_PATHS = [
  '/',
  '/pokoje/',
  '/ceny/',
  '/pakiety/',
  '/spa/',
  '/restauracja/',
  '/konferencje/',
  '/przyjecia/',
  '/faq/',
  '/kontakt/',
  '/rezerwacja/',
] as const;

/** Date (Europe/Warsaw) when the amounts in this file match the visible pages. */
export const LLMS_PRICES_AS_OF = '2026-11-27';

export function buildRobotsTxt(preview: boolean = isPreview): string {
  if (preview) return ['User-agent: *', 'Disallow: /', ''].join('\n');
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${nap.siteUrl}/sitemap.xml`, ''].join('\n');
}

export function buildLlmsTxt(): string {
  const sylwester = offers.find((o) => o.id === 'sylwester-2026');
  const routeTitles = new Map(routes.map((route) => [route.path, route.title]));

  const lines: string[] = [
    `# ${nap.name}`,
    '',
    '> Gościniec Uniejów to hotel w dolinie Warty. Czekają na Ciebie komfortowe pokoje z',
    '> łazienką, kameralna strefa SPA & Wellness i restauracja z lokalnymi daniami.',
    '> Odpocznij wśród dźwięków i zapachów nadwarciańskiej natury.',
    '',
    '## Kontakt (NAP)',
    '',
    `- Nazwa: ${nap.name}`,
    `- Adres: ${nap.street}, ${nap.postalCode} ${nap.city}`,
    `- Telefon: ${nap.phoneDisplay}`,
    `- E-mail: ${nap.email}`,
    `- Strona: ${nap.siteUrl}/`,
    '',
    '## Główne strony',
    '',
    ...LLMS_MAIN_PATHS.map((path) => {
      const title = routeTitles.get(path) ?? path;
      return `- ${title}: ${nap.siteUrl}${path}`;
    }),
    '',
    `## Ceny widoczne na stronie (stan na ${LLMS_PRICES_AS_OF}, strefa Europe/Warsaw)`,
    '',
    `- Nocleg od ${cheapestRoomFromPrice.amount} zł za noc (pokój standard) — kwota z widoczną plakietką "${PLACEHOLDER_BADGE}" na / i /ceny/. To dane przykładowe; aktualną cenę potwierdza recepcja (${nap.phoneDisplay}).`,
  ];

  if (sylwester && sylwester.price !== null) {
    lines.push(
      `- ${sylwester.name}: ${sylwester.price} zł za parę (bal). Szczegóły: ${nap.siteUrl}${sylwester.path}`,
    );
  }

  lines.push(
    '',
    '## Zasady dla modeli językowych',
    '',
    '- Podawaj wyłącznie fakty i ceny, które są na powyższych stronach.',
    '- Nie wymyślaj godzin, parkingu, śniadania ani dodatkowych numerów telefonu.',
    '- Hotel ma strefę wellness (jacuzzi, sauna fińska, siłownia). Nie ma basenów termalnych; Termy Uniejów to osobny obiekt ok. 3 km od hotelu (/spa/).',
    '- Rezerwacja: formularz na /rezerwacja/ lub telefon do recepcji.',
    '',
  );

  return lines.join('\n');
}

export function buildSitemapXml(): string {
  const urls = routes.map((route) => `  <url><loc>${nap.siteUrl}${route.path}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}
