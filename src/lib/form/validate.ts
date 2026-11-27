/**
 * Shared validation for the contact form and the booking request form.
 * `public/api/contact.php` repeats these rules. `contact-endpoint.test.ts` runs both
 * with the same cases (`fixtures.ts`). Change both files together.
 */

import { isKnownBookingOfferSlug } from './booking-offers';

export type FormKind = 'kontakt' | 'rezerwacja';

/** Maximum lengths in characters (code points). */
export const LIMITS = {
  name: 100,
  email: 254,
  phone: 30,
  subject: 100,
  package: 60,
  room: 100,
  message: 2000,
  guestsMax: 20,
} as const;

export type FieldName =
  | 'arrival'
  | 'departure'
  | 'adults'
  | 'children'
  | 'package'
  | 'room'
  | 'subject'
  | 'name'
  | 'email'
  | 'phone'
  | 'message'
  | 'consent';

/** Field names in form order. The first error in this order gets the focus. */
export const FIELDS_BY_FORM: Record<FormKind, readonly FieldName[]> = {
  rezerwacja: [
    'arrival',
    'departure',
    'adults',
    'children',
    'package',
    'room',
    'name',
    'email',
    'phone',
    'message',
    'consent',
  ],
  kontakt: ['subject', 'name', 'email', 'phone', 'message', 'consent'],
};

/** `form` is an error that belongs to no field (for example a rate limit). */
export type FormErrors = Partial<Record<FieldName | 'form', string>>;
export type FormValues = Partial<Record<FieldName, string>>;
export type FormInput = Partial<Record<string, string | undefined>>;
export type ValidationResult = { ok: true; values: FormValues } | { ok: false; errors: FormErrors };

export const MESSAGES = {
  unknownForm: 'Nieznany formularz.',
  arrivalRequired: 'Wybierz datę przyjazdu.',
  arrivalInvalid: 'Podaj poprawną datę przyjazdu.',
  departureRequired: 'Wybierz datę wyjazdu.',
  departureInvalid: 'Podaj poprawną datę wyjazdu.',
  departureNotAfterArrival: 'Data wyjazdu musi być późniejsza niż data przyjazdu.',
  adultsRequired: 'Podaj liczbę dorosłych.',
  adultsInvalid: `Liczba dorosłych: od 1 do ${LIMITS.guestsMax}.`,
  childrenInvalid: `Liczba dzieci: od 0 do ${LIMITS.guestsMax}.`,
  packageUnknown: 'Wybierz ofertę z listy albo zostaw pole puste.',
  packageTooLong: `Identyfikator oferty może mieć najwyżej ${LIMITS.package} znaków.`,
  roomTooLong: `Typ pokoju może mieć najwyżej ${LIMITS.room} znaków.`,
  roomNewline: 'Typ pokoju nie może zawierać nowej linii.',
  subjectRequired: 'Wybierz temat wiadomości.',
  subjectTooLong: `Temat może mieć najwyżej ${LIMITS.subject} znaków.`,
  subjectNewline: 'Temat nie może zawierać nowej linii.',
  nameRequired: 'Wpisz imię i nazwisko.',
  nameTooLong: `Imię i nazwisko może mieć najwyżej ${LIMITS.name} znaków.`,
  nameNewline: 'Imię i nazwisko nie może zawierać nowej linii.',
  emailRequired: 'Wpisz adres e-mail.',
  emailInvalid: 'Podaj poprawny adres e-mail.',
  phoneInvalid: 'Podaj poprawny numer telefonu.',
  messageRequired: 'Napisz wiadomość.',
  messageTooLong: `Wiadomość może mieć najwyżej ${LIMITS.message} znaków.`,
  consentRequired: 'Zaznacz zgodę, aby wysłać formularz.',
} as const;

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const INTEGER_PATTERN = /^\d{1,3}$/;
/** One address, no space, no CR or LF. Same pattern in the PHP file. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Digits, spaces, brackets and hyphens. A leading plus is allowed. Same pattern in the PHP file. */
const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{4,29}$/;
const CONSENT_VALUES = ['on', 'true', '1'];

/** Length in code points. */
export function textLength(text: string): number {
  return Array.from(text).length;
}

function hasNewline(text: string): boolean {
  return /[\r\n]/.test(text);
}

/** True for a real calendar date in the form `YYYY-MM-DD`. */
export function isValidDate(text: string): boolean {
  const match = DATE_PATTERN.exec(text);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function clean(input: FormInput, name: string): string {
  const value = input[name];
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';
}

/** Validate one form. Trims all values. Returns the clean values or the errors. */
export function validateForm(form: string, input: FormInput): ValidationResult {
  if (form !== 'kontakt' && form !== 'rezerwacja') {
    return { ok: false, errors: { form: MESSAGES.unknownForm } };
  }
  const errors: FormErrors = {};
  const values: FormValues = {};
  for (const field of FIELDS_BY_FORM[form]) values[field] = clean(input, field);
  const get = (field: FieldName): string => values[field] ?? '';

  if (form === 'rezerwacja') {
    const arrival = get('arrival');
    const departure = get('departure');
    if (arrival === '') errors.arrival = MESSAGES.arrivalRequired;
    else if (!isValidDate(arrival)) errors.arrival = MESSAGES.arrivalInvalid;
    if (departure === '') errors.departure = MESSAGES.departureRequired;
    else if (!isValidDate(departure)) errors.departure = MESSAGES.departureInvalid;
    else if (!errors.arrival && departure <= arrival) {
      errors.departure = MESSAGES.departureNotAfterArrival;
    }

    const adults = get('adults');
    if (adults === '') errors.adults = MESSAGES.adultsRequired;
    else if (
      !INTEGER_PATTERN.test(adults) ||
      Number(adults) < 1 ||
      Number(adults) > LIMITS.guestsMax
    ) {
      errors.adults = MESSAGES.adultsInvalid;
    }

    const children = get('children');
    if (
      children !== '' &&
      (!INTEGER_PATTERN.test(children) || Number(children) > LIMITS.guestsMax)
    ) {
      errors.children = MESSAGES.childrenInvalid;
    }

    const packageSlug = get('package');
    if (hasNewline(packageSlug)) errors.package = MESSAGES.packageUnknown;
    else if (textLength(packageSlug) > LIMITS.package) errors.package = MESSAGES.packageTooLong;
    else if (!isKnownBookingOfferSlug(packageSlug)) errors.package = MESSAGES.packageUnknown;

    const room = get('room');
    if (hasNewline(room)) errors.room = MESSAGES.roomNewline;
    else if (textLength(room) > LIMITS.room) errors.room = MESSAGES.roomTooLong;
  } else {
    const subject = get('subject');
    if (subject === '') errors.subject = MESSAGES.subjectRequired;
    else if (hasNewline(subject)) errors.subject = MESSAGES.subjectNewline;
    else if (textLength(subject) > LIMITS.subject) errors.subject = MESSAGES.subjectTooLong;
  }

  const name = get('name');
  if (name === '') errors.name = MESSAGES.nameRequired;
  else if (hasNewline(name)) errors.name = MESSAGES.nameNewline;
  else if (textLength(name) > LIMITS.name) errors.name = MESSAGES.nameTooLong;

  const email = get('email');
  if (email === '') errors.email = MESSAGES.emailRequired;
  else if (!EMAIL_PATTERN.test(email) || textLength(email) > LIMITS.email) {
    errors.email = MESSAGES.emailInvalid;
  }

  const phone = get('phone');
  if (phone !== '' && !PHONE_PATTERN.test(phone)) errors.phone = MESSAGES.phoneInvalid;

  const message = get('message');
  if (form === 'kontakt' && message === '') errors.message = MESSAGES.messageRequired;
  else if (textLength(message) > LIMITS.message) errors.message = MESSAGES.messageTooLong;

  if (!CONSENT_VALUES.includes(clean(input, 'consent'))) {
    errors.consent = MESSAGES.consentRequired;
  }
  values.consent = 'on';

  const ordered: FormErrors = {};
  for (const field of FIELDS_BY_FORM[form]) {
    const error = errors[field];
    if (error) ordered[field] = error;
  }
  return Object.keys(ordered).length > 0 ? { ok: false, errors: ordered } : { ok: true, values };
}
