import { LIMITS, MESSAGES, type FormInput } from './validate';

/** Invented test data. Both `validate.ts` and `public/api/contact.php` must give these results. */
export type ValidationCase = {
  name: string;
  form: string;
  input: FormInput;
  /** Expected errors in form order. An empty object means the input is valid. */
  errors: Record<string, string>;
};

const guest = {
  name: 'Jan Testowy',
  email: 'jan.testowy@example.com',
  phone: '+48 600 100 200',
  consent: 'on',
};

const booking = { ...guest, arrival: '2027-03-10', departure: '2027-03-12', adults: '2' };
const contact = { ...guest, subject: 'Konferencje', message: 'Dzień dobry, pytam o termin.' };

export const validationCases: ValidationCase[] = [
  { name: 'valid booking', form: 'rezerwacja', input: booking, errors: {} },
  {
    name: 'valid booking with all optional fields',
    form: 'rezerwacja',
    input: {
      ...booking,
      children: '1',
      room: 'Apartament rodzinny',
      message: 'Łóżeczko dla dziecka',
    },
    errors: {},
  },
  { name: 'valid contact', form: 'kontakt', input: contact, errors: {} },
  {
    name: 'contact without phone',
    form: 'kontakt',
    input: { ...contact, phone: '' },
    errors: {},
  },
  {
    name: 'unknown form',
    form: 'inny',
    input: contact,
    errors: { form: MESSAGES.unknownForm },
  },
  {
    name: 'empty booking',
    form: 'rezerwacja',
    input: {},
    errors: {
      arrival: MESSAGES.arrivalRequired,
      departure: MESSAGES.departureRequired,
      adults: MESSAGES.adultsRequired,
      name: MESSAGES.nameRequired,
      email: MESSAGES.emailRequired,
      consent: MESSAGES.consentRequired,
    },
  },
  {
    name: 'empty contact',
    form: 'kontakt',
    input: {},
    errors: {
      subject: MESSAGES.subjectRequired,
      name: MESSAGES.nameRequired,
      email: MESSAGES.emailRequired,
      message: MESSAGES.messageRequired,
      consent: MESSAGES.consentRequired,
    },
  },
  {
    name: 'spaces only count as empty',
    form: 'kontakt',
    input: { ...contact, name: '   ', message: ' \n ' },
    errors: { name: MESSAGES.nameRequired, message: MESSAGES.messageRequired },
  },
  {
    name: 'departure equals arrival',
    form: 'rezerwacja',
    input: { ...booking, departure: '2027-03-10' },
    errors: { departure: MESSAGES.departureNotAfterArrival },
  },
  {
    name: 'departure before arrival',
    form: 'rezerwacja',
    input: { ...booking, departure: '2027-03-01' },
    errors: { departure: MESSAGES.departureNotAfterArrival },
  },
  {
    name: 'impossible date',
    form: 'rezerwacja',
    input: { ...booking, arrival: '2027-02-30' },
    errors: { arrival: MESSAGES.arrivalInvalid },
  },
  {
    name: 'date in the wrong format',
    form: 'rezerwacja',
    input: { ...booking, departure: '12.03.2027' },
    errors: { departure: MESSAGES.departureInvalid },
  },
  {
    name: 'leap day is valid',
    form: 'rezerwacja',
    input: { ...booking, arrival: '2028-02-29', departure: '2028-03-01' },
    errors: {},
  },
  {
    name: 'adults below 1',
    form: 'rezerwacja',
    input: { ...booking, adults: '0' },
    errors: { adults: MESSAGES.adultsInvalid },
  },
  {
    name: 'adults above the limit',
    form: 'rezerwacja',
    input: { ...booking, adults: String(LIMITS.guestsMax + 1) },
    errors: { adults: MESSAGES.adultsInvalid },
  },
  {
    name: 'adults is not a number',
    form: 'rezerwacja',
    input: { ...booking, adults: 'dwóch' },
    errors: { adults: MESSAGES.adultsInvalid },
  },
  {
    name: 'children is negative',
    form: 'rezerwacja',
    input: { ...booking, children: '-1' },
    errors: { children: MESSAGES.childrenInvalid },
  },
  {
    name: 'room too long',
    form: 'rezerwacja',
    input: { ...booking, room: 'a'.repeat(LIMITS.room + 1) },
    errors: { room: MESSAGES.roomTooLong },
  },
  {
    name: 'room with a line break',
    form: 'rezerwacja',
    input: { ...booking, room: 'Standard\nBcc: x@example.com' },
    errors: { room: MESSAGES.roomNewline },
  },
  {
    name: 'valid booking with Sylwester package slug',
    form: 'rezerwacja',
    input: { ...booking, package: 'sylwester-2026-2027' },
    errors: {},
  },
  {
    name: 'unknown package slug',
    form: 'rezerwacja',
    input: { ...booking, package: 'pakiet-kobiecy-weekend' },
    errors: { package: MESSAGES.packageUnknown },
  },
  {
    name: 'name too long',
    form: 'kontakt',
    input: { ...contact, name: 'ł'.repeat(LIMITS.name + 1) },
    errors: { name: MESSAGES.nameTooLong },
  },
  {
    name: 'name at the limit (counted in characters, not bytes)',
    form: 'kontakt',
    input: { ...contact, name: 'ł'.repeat(LIMITS.name) },
    errors: {},
  },
  {
    name: 'name with CR LF',
    form: 'kontakt',
    input: { ...contact, name: 'Jan\r\nBcc: x@example.com' },
    errors: { name: MESSAGES.nameNewline },
  },
  {
    name: 'subject with CR LF',
    form: 'kontakt',
    input: { ...contact, subject: 'Temat\r\nBcc: x@example.com' },
    errors: { subject: MESSAGES.subjectNewline },
  },
  {
    name: 'subject too long',
    form: 'kontakt',
    input: { ...contact, subject: 'a'.repeat(LIMITS.subject + 1) },
    errors: { subject: MESSAGES.subjectTooLong },
  },
  {
    name: 'email without domain dot',
    form: 'kontakt',
    input: { ...contact, email: 'jan@example' },
    errors: { email: MESSAGES.emailInvalid },
  },
  {
    name: 'email with a space',
    form: 'kontakt',
    input: { ...contact, email: 'jan testowy@example.com' },
    errors: { email: MESSAGES.emailInvalid },
  },
  {
    name: 'email with CR LF',
    form: 'kontakt',
    input: { ...contact, email: 'jan@example.com\r\nBcc: x@example.com' },
    errors: { email: MESSAGES.emailInvalid },
  },
  {
    name: 'email too long',
    form: 'kontakt',
    input: { ...contact, email: `${'a'.repeat(LIMITS.email)}@example.com` },
    errors: { email: MESSAGES.emailInvalid },
  },
  {
    name: 'phone with letters',
    form: 'kontakt',
    input: { ...contact, phone: '600 abc 200' },
    errors: { phone: MESSAGES.phoneInvalid },
  },
  {
    name: 'phone too short',
    form: 'kontakt',
    input: { ...contact, phone: '123' },
    errors: { phone: MESSAGES.phoneInvalid },
  },
  {
    name: 'message too long',
    form: 'kontakt',
    input: { ...contact, message: 'a'.repeat(LIMITS.message + 1) },
    errors: { message: MESSAGES.messageTooLong },
  },
  {
    name: 'message at the limit with CR LF line breaks',
    form: 'kontakt',
    input: { ...contact, message: `${'a'.repeat(LIMITS.message - 3)}\r\nb` },
    errors: {},
  },
  {
    name: 'consent missing',
    form: 'kontakt',
    input: { ...contact, consent: '' },
    errors: { consent: MESSAGES.consentRequired },
  },
  {
    name: 'consent with a wrong value',
    form: 'kontakt',
    input: { ...contact, consent: 'maybe' },
    errors: { consent: MESSAGES.consentRequired },
  },
];
