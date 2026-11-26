export type Route = {
  /** Path with leading and trailing slash. */
  path: string;
  /** Polish page title. Also the `h1` text of the stub. */
  title: string;
  /** Placeholder meta description (Polish). A later issue replaces it. */
  description: string;
};

const placeholder = (topic: string): string =>
  `Gościniec Uniejów: ${topic}. Treść strony w przygotowaniu.`;

export const routes: readonly Route[] = [
  { path: '/', title: 'Gościniec Uniejów', description: placeholder('hotel w Uniejowie') },
  { path: '/pokoje/', title: 'Pokoje', description: placeholder('pokoje w Uniejowie') },
  { path: '/ceny/', title: 'Ceny', description: placeholder('ceny noclegów w Uniejowie') },
  { path: '/pakiety/', title: 'Pakiety', description: placeholder('pakiety pobytowe') },
  { path: '/spa/', title: 'SPA i wellness', description: placeholder('strefa wellness') },
  { path: '/restauracja/', title: 'Restauracja', description: placeholder('restauracja') },
  { path: '/konferencje/', title: 'Konferencje', description: placeholder('sale konferencyjne') },
  { path: '/przyjecia/', title: 'Przyjęcia', description: placeholder('wesela i przyjęcia') },
  { path: '/dla-dzieci/', title: 'Dla dzieci', description: placeholder('oferta dla rodzin') },
  { path: '/atrakcje/', title: 'Atrakcje', description: placeholder('atrakcje w okolicy') },
  { path: '/faq/', title: 'Najczęstsze pytania', description: placeholder('najczęstsze pytania') },
  { path: '/blog/', title: 'Blog', description: placeholder('blog') },
  { path: '/kontakt/', title: 'Kontakt', description: placeholder('dane kontaktowe') },
  { path: '/rezerwacja/', title: 'Rezerwacja', description: placeholder('rezerwacja pobytu') },
  { path: '/regulamin/', title: 'Regulamin', description: placeholder('regulamin') },
  {
    path: '/polityka-prywatnosci/',
    title: 'Polityka prywatności',
    description: placeholder('polityka prywatności'),
  },
];

export const routePaths: readonly string[] = routes.map((route) => route.path);

export function findRoute(path: string): Route | undefined {
  return routes.find((route) => route.path === path);
}
