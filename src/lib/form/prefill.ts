/** Values for the form fields that come from the query string (`?pokoj=` and `?temat=`). */

/** Subjects of the contact form. The label is the value that the mail shows. */
export const subjects = [
  { slug: 'pobyt', label: 'Pobyt w hotelu' },
  { slug: 'konferencje', label: 'Konferencje i szkolenia' },
  { slug: 'przyjecia', label: 'Przyjęcia okolicznościowe' },
  { slug: 'restauracja', label: 'Restauracja' },
  { slug: 'inne', label: 'Inne pytanie' },
] as const;

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Label of the subject for `?temat=<slug>`. Empty string for an unknown slug. */
export function subjectFromParam(param: string | null): string {
  return subjects.find((subject) => subject.slug === param)?.label ?? '';
}

/**
 * Room text for `?pokoj=<slug>`. There is no `rooms.ts` yet, so the room field is free text.
 * A later issue can replace the field with a select. The slug becomes plain words.
 * An invalid slug gives an empty string.
 */
export function roomFromParam(param: string | null): string {
  if (!param || param.length > 60 || !SLUG_PATTERN.test(param)) return '';
  const words = param.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}
