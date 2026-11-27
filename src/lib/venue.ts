import { nap } from './nap';

/**
 * Facts for `/konferencje/` and `/przyjecia/`.
 * Sources: `docs/source/konferencje.md`, `docs/source/przyjecia.md` and the Sylwester facts of issue #11.
 * Rules:
 * - No room count, capacity, area or price here. The old site contradicts itself.
 *   Sample figures live in `src/content/placeholders.ts` and show the badge "Dane testowe".
 * - No name of a person. No MojeKonferencje badge.
 * - Contact: the sales mailbox and the official phone only.
 */

/** Mailbox for event and conference inquiries. */
export const salesEmail = 'sprzedaz@gosciniecuniejow.pl';

/** Layouts named in `konferencje.md`. No seat counts. */
export const layouts = [
  { name: 'teatralny', use: 'na wykłady i prelekcje' },
  { name: 'szkoleniowy', use: 'przy kursach i warsztatach' },
  { name: 'w podkowę', use: 'do dyskusji i spotkań zarządu' },
  { name: 'warsztatowy', use: 'do pracy w mniejszych grupach' },
] as const;

/** Equipment named in `konferencje.md`. */
export const equipment = [
  'rzutnik',
  'ekran',
  'system nagłośnienia',
  'flipchart',
  'szybkie Wi-Fi',
  'klimatyzacja',
] as const;

/** Event types named in `przyjecia.md`. */
export const partyTypes = ['wesela', 'chrzciny', 'jubileusze', 'spotkania firmowe'] as const;

/**
 * Sylwester 2026/2027. One place for the offer URL and the facts.
 * The offer page itself belongs to issue #34. The amount is NOT here on purpose:
 * the promo price ends on 2026-11-29 and the offer page owns the price.
 */
export const sylwester = {
  title: 'Bal Sylwestrowy – Sylwester 2026/2027',
  /** Page of the offer (issue #34). */
  path: '/pakiety/sylwester-2026-2027/',
  dateText: '31 grudnia 2026 (czwartek)',
  place: 'odnowiona sala balowa w Gościńcu Uniejów',
  dj: 'DJ Letsky',
} as const;

export const contact = {
  email: salesEmail,
  mailto: `mailto:${salesEmail}`,
  phoneDisplay: nap.phoneDisplay,
  tel: `tel:${nap.phoneE164}`,
} as const;
