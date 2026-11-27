import { describe, expect, it } from 'vitest';
import { validationCases } from './fixtures';
import { isValidDate, validateForm } from './validate';

describe('validateForm', () => {
  for (const testCase of validationCases) {
    it(testCase.name, () => {
      const result = validateForm(testCase.form, testCase.input);
      expect(result.ok ? {} : result.errors).toEqual(testCase.errors);
    });
  }

  it('lists errors in form order', () => {
    const result = validateForm('rezerwacja', {});
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors)).toEqual([
        'arrival',
        'departure',
        'adults',
        'name',
        'email',
        'consent',
      ]);
    }
  });

  it('returns trimmed values and no foreign fields', () => {
    const result = validateForm('kontakt', {
      subject: ' Pobyt ',
      name: ' Jan ',
      email: 'jan@example.com',
      message: 'a\r\nb',
      consent: 'on',
      arrival: '2027-01-01',
      website: 'spam',
    });
    expect(result).toEqual({
      ok: true,
      values: {
        subject: 'Pobyt',
        name: 'Jan',
        email: 'jan@example.com',
        phone: '',
        message: 'a\nb',
        consent: 'on',
      },
    });
  });
});

describe('isValidDate', () => {
  it('accepts real dates only', () => {
    expect(isValidDate('2027-12-31')).toBe(true);
    expect(isValidDate('2027-13-01')).toBe(false);
    expect(isValidDate('2027-02-29')).toBe(false);
    expect(isValidDate('2027-2-9')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});
