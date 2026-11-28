/** Key routes, screen sizes and themes of the visual review (issue #26). */
export const VISUAL_ROUTES = [
  '/',
  '/pokoje/',
  '/kontakt/',
  '/rezerwacja/',
  '/faq/',
  '/pakiety/',
  '/pakiety/sylwester-2026-2027/',
  '/blog/',
  '/regulamin/',
  '/polityka-prywatnosci/',
  // Add the path of each published blog article here. Draft articles stay out.
] as const;

export const VISUAL_VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
] as const;

export const VISUAL_THEMES = ['light', 'dark'] as const;

/** File name of one shot, for example `pokoje-mobile-dark.png`. */
export function shotName(route: string, viewport: string, theme: string): string {
  const slug = route.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
  return `${slug}-${viewport}-${theme}.png`;
}
