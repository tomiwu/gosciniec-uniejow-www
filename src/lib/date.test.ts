import { describe, expect, it } from 'vitest';
import { formatDatePl } from './date';

describe('formatDatePl', () => {
  it('writes a Polish date', () => {
    expect(formatDatePl('2026-12-01')).toBe('1 grudnia 2026');
    expect(formatDatePl('2027-03-15')).toBe('15 marca 2027');
  });
  it('throws on a bad date', () => {
    expect(() => formatDatePl('abc')).toThrow();
  });
});
