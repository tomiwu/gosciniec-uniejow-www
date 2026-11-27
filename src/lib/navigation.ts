/** Main navigation. Order and labels follow the issue. Every href is a route in `routes.ts`. */
export const mainNav = [
  { href: '/pokoje/', label: 'Pokoje' },
  { href: '/ceny/', label: 'Ceny' },
  { href: '/pakiety/', label: 'Pakiety' },
  { href: '/spa/', label: 'SPA' },
  { href: '/restauracja/', label: 'Restauracja' },
  { href: '/konferencje/', label: 'Konferencje' },
  { href: '/przyjecia/', label: 'Przyjęcia' },
  { href: '/dla-dzieci/', label: 'Dla dzieci' },
  { href: '/atrakcje/', label: 'Atrakcje' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/kontakt/', label: 'Kontakt' },
] as const;

export const legalNav = [
  { href: '/regulamin/', label: 'Regulamin' },
  { href: '/polityka-prywatnosci/', label: 'Polityka prywatności' },
] as const;
