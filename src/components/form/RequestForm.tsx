'use client';

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { PLACEHOLDER_BADGE } from '@/content/placeholders';
import {
  bookingOfferBySlug,
  bookingOfferOptions,
  packageFromParam,
} from '@/lib/form/booking-offers';
import { roomFromParam, subjectFromParam, subjects } from '@/lib/form/prefill';
import {
  FIELDS_BY_FORM,
  LIMITS,
  validateForm,
  type FieldName,
  type FormErrors,
  type FormKind,
} from '@/lib/form/validate';
import { nap } from '@/lib/nap';
import { isPreview, withBase } from '@/lib/preview';

const ENDPOINT = withBase('/api/contact.php');
const THANKS_PATH: Record<FormKind, string> = {
  kontakt: '/kontakt/dziekujemy/',
  rezerwacja: '/rezerwacja/dziekujemy/',
};
const NETWORK_ERROR = `Nie udało się wysłać formularza. Spróbuj ponownie lub zadzwoń: ${nap.phoneDisplay}.`;

function packageSlugFromUrl(): string {
  return packageFromParam(new URLSearchParams(window.location.search).get('pakiet'));
}

function subscribeToUrl(onStoreChange: () => void): () => void {
  window.addEventListener('popstate', onStoreChange);
  return () => window.removeEventListener('popstate', onStoreChange);
}

type FieldProps = {
  name: FieldName;
  label: string;
  error: string | undefined;
  hint?: string;
  required?: boolean;
  children: (aria: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': true | undefined;
  }) => ReactNode;
};

/** A label, a control, an optional hint and an error text. The error is linked with `aria-describedby`. */
function Field({ name, label, error, hint, required, children }: FieldProps) {
  const id = `field-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');
  return (
    <div className="field" data-invalid={error ? 'true' : undefined}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {hint ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {children({
        id,
        'aria-describedby': describedBy || undefined,
        'aria-invalid': error ? true : undefined,
      })}
      {error ? (
        <p className="field__error" id={errorId}>
          <span className="visually-hidden">Błąd: </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The contact form (`kontakt`) and the booking request form (`rezerwacja`).
 * Without JavaScript the browser posts the form to the PHP endpoint (normal POST).
 * With JavaScript the form validates, shows errors and posts with `fetch`.
 */
export function RequestForm({ kind }: { kind: FormKind }) {
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const urlPackageSlug = useSyncExternalStore(subscribeToUrl, packageSlugFromUrl, () => '');
  const [packageOverride, setPackageOverride] = useState<string | undefined>(undefined);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    // Native validation works without JavaScript. With JavaScript we show our own messages.
    form.noValidate = true;
    const params = new URLSearchParams(window.location.search);
    const setValue = (name: string, value: string) => {
      const control = form.elements.namedItem(name);
      if (!value || !(control instanceof HTMLInputElement || control instanceof HTMLSelectElement))
        return;
      control.value = value;
    };
    if (kind === 'rezerwacja') setValue('room', roomFromParam(params.get('pokoj')));
    else setValue('subject', subjectFromParam(params.get('temat')));
  }, [kind]);

  function show(next: FormErrors) {
    flushSync(() => setErrors(next));
    const first = FIELDS_BY_FORM[kind].find((field) => next[field]);
    if (first) document.getElementById(`field-${first}`)?.focus();
    else summaryRef.current?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const data = new FormData(event.currentTarget);
    const body = new URLSearchParams();
    const values: Record<string, string> = {};
    for (const [key, value] of data.entries()) {
      if (typeof value !== 'string') continue;
      body.append(key, value);
      values[key] = value;
    }
    const result = validateForm(kind, values);
    if (!result.ok) {
      show(result.errors);
      return;
    }
    setErrors({});
    setSending(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body,
      });
      const answer: { ok?: boolean; errors?: FormErrors } = await response.json().catch(() => ({}));
      if (response.ok && answer.ok) {
        window.location.assign(withBase(THANKS_PATH[kind]));
        return;
      }
      setSending(false);
      show(
        answer.errors && Object.keys(answer.errors).length > 0
          ? answer.errors
          : { form: NETWORK_ERROR },
      );
    } catch {
      setSending(false);
      show({ form: NETWORK_ERROR });
    }
  }

  const isBooking = kind === 'rezerwacja';
  const packageSlug = kind === 'rezerwacja' ? (packageOverride ?? urlPackageSlug) : '';
  const selectedOffer = packageSlug ? bookingOfferBySlug(packageSlug) : undefined;
  return (
    <form
      ref={formRef}
      className="request-form"
      method="post"
      action={ENDPOINT}
      onSubmit={onSubmit}
      aria-label={isBooking ? 'Zapytanie o pobyt' : 'Formularz kontaktowy'}
    >
      <input type="hidden" name="form" value={kind} />
      <p className="form-note">Pola oznaczone gwiazdką (*) są wymagane.</p>
      {errors.form ? (
        <p className="form-error" role="alert" tabIndex={-1} ref={summaryRef}>
          <span className="visually-hidden">Błąd: </span>
          {errors.form}
        </p>
      ) : null}

      {isBooking && selectedOffer ? (
        <p className="form-note" id="rezerwacja-oferta">
          Formularz dotyczy oferty: <strong>{selectedOffer.name}</strong>
          {selectedOffer.isPlaceholder ? (
            <>
              {' '}
              <span className="test-badge">{PLACEHOLDER_BADGE}</span>
            </>
          ) : null}
        </p>
      ) : null}

      {isBooking ? (
        <>
          <div className="field-row">
            <Field name="arrival" label="Data przyjazdu" error={errors.arrival} required>
              {(aria) => <input {...aria} name="arrival" type="date" required />}
            </Field>
            <Field name="departure" label="Data wyjazdu" error={errors.departure} required>
              {(aria) => <input {...aria} name="departure" type="date" required />}
            </Field>
          </div>
          <div className="field-row">
            <Field name="adults" label="Liczba dorosłych" error={errors.adults} required>
              {(aria) => (
                <input
                  {...aria}
                  name="adults"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={LIMITS.guestsMax}
                  defaultValue={2}
                  required
                />
              )}
            </Field>
            <Field name="children" label="Liczba dzieci" error={errors.children}>
              {(aria) => (
                <input
                  {...aria}
                  name="children"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={LIMITS.guestsMax}
                  defaultValue={0}
                />
              )}
            </Field>
          </div>
          <Field
            name="package"
            label="Oferta lub pakiet"
            error={errors.package}
            hint="Wybierz ofertę, jeśli zapytanie dotyczy konkretnego pakietu lub balu."
          >
            {(aria) => (
              <select
                {...aria}
                name="package"
                value={packageSlug}
                onChange={(event) => setPackageOverride(event.currentTarget.value)}
              >
                <option value="">Brak wybranej oferty</option>
                {bookingOfferOptions.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                    {item.isPlaceholder ? ` (${PLACEHOLDER_BADGE})` : ''}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field name="room" label="Typ pokoju" error={errors.room}>
            {(aria) => <input {...aria} name="room" type="text" maxLength={LIMITS.room} />}
          </Field>
        </>
      ) : (
        <Field name="subject" label="Temat" error={errors.subject} required>
          {(aria) => (
            <select {...aria} name="subject" required defaultValue="">
              <option value="">Wybierz temat</option>
              {subjects.map((subject) => (
                <option key={subject.slug} value={subject.label}>
                  {subject.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      )}

      <Field name="name" label="Imię i nazwisko" error={errors.name} required>
        {(aria) => (
          <input
            {...aria}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            required
          />
        )}
      </Field>
      <Field name="email" label="Adres e-mail" error={errors.email} required>
        {(aria) => (
          <input
            {...aria}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            required
          />
        )}
      </Field>
      <Field name="phone" label="Telefon" error={errors.phone}>
        {(aria) => (
          <input {...aria} name="phone" type="tel" autoComplete="tel" maxLength={LIMITS.phone} />
        )}
      </Field>
      <Field name="message" label="Wiadomość" error={errors.message} required={!isBooking}>
        {(aria) => (
          <textarea
            {...aria}
            name="message"
            rows={6}
            maxLength={LIMITS.message}
            required={!isBooking}
          />
        )}
      </Field>

      <div className="field field--check" data-invalid={errors.consent ? 'true' : undefined}>
        <div className="check">
          <input
            id="field-consent"
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'field-consent-error' : undefined}
          />
          <label htmlFor="field-consent">
            Wyrażam zgodę na przetwarzanie moich danych osobowych w celu odpowiedzi na to{' '}
            {isBooking ? 'zapytanie' : 'pytanie'}. Szczegóły w{' '}
            <a href={withBase('/polityka-prywatnosci/')}>polityce prywatności</a>.
            <span aria-hidden="true"> *</span>
          </label>
        </div>
        {errors.consent ? (
          <p className="field__error" id="field-consent-error">
            <span className="visually-hidden">Błąd: </span>
            {errors.consent}
          </p>
        ) : null}
      </div>

      {/* Honeypot. People do not see it and keyboard focus skips it. Bots fill it. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="field-website">Nie wypełniaj tego pola</label>
        <input id="field-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {isPreview ? (
        <p className="form-note" role="note">
          Podgląd: ten formularz nie wysyła wiadomości. Zadzwoń: {nap.phoneDisplay} lub napisz:{' '}
          {nap.email}.
        </p>
      ) : null}

      <button type="submit" className="button" aria-disabled={sending || undefined}>
        {sending ? 'Wysyłanie…' : isBooking ? 'Wyślij zapytanie' : 'Wyślij wiadomość'}
      </button>
    </form>
  );
}
