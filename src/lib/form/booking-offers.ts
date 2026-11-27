/**
 * Package and offer slugs for the `/rezerwacja/` form (`?pakiet=<slug>`).
 * Real offers come from `offers.ts`. Sample packages come from `placeholders.ts` only here.
 */
import { PLACEHOLDER_BADGE, placeholderPackages } from '@/content/placeholders';
import { offers } from '@/lib/offers';
import { sylwester } from '@/lib/venue';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type BookingOfferOption = {
  slug: string;
  /** Polish name shown in the form and in the mail. */
  name: string;
  isPlaceholder?: true;
};

function slugFromOfferPath(path: string): string {
  const trimmed = path.replace(/\/$/, '');
  return trimmed.slice(trimmed.lastIndexOf('/') + 1);
}

const sylwesterOffer = offers.find((item) => item.id === 'sylwester-2026');
if (!sylwesterOffer) {
  throw new Error('offers.ts needs the Sylwester offer.');
}

/** Stable slug for `?pakiet=` links (issue #34 path segment). */
export const sylwesterBookingSlug = slugFromOfferPath(sylwester.path);

/** Options in the booking form. Unknown slugs are not listed. */
export const bookingOfferOptions: readonly BookingOfferOption[] = [
  {
    slug: slugFromOfferPath(sylwester.path),
    name: sylwesterOffer.name,
  },
  ...placeholderPackages.map((item) => ({
    slug: item.id,
    name: item.name,
    isPlaceholder: true as const,
  })),
];

const bySlug = new Map(bookingOfferOptions.map((item) => [item.slug, item]));

/** Resolve a `?pakiet=` value. Empty string when the slug is missing or unknown. */
export function packageFromParam(param: string | null): string {
  if (!param || param.length > 60 || !SLUG_PATTERN.test(param)) return '';
  return bySlug.has(param) ? param : '';
}

export function bookingOfferBySlug(slug: string): BookingOfferOption | undefined {
  return bySlug.get(slug);
}

export function isKnownBookingOfferSlug(slug: string): boolean {
  return slug === '' || bySlug.has(slug);
}

export function bookingOfferNameForMail(slug: string): string {
  if (slug === '') return '';
  return bySlug.get(slug)?.name ?? '';
}

/** Re-export for the form badge. */
export { PLACEHOLDER_BADGE };
