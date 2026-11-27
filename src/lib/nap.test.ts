import { describe, expect, it } from 'vitest';
import { nap } from './nap';

describe('nap', () => {
  it('holds the product facts', () => {
    expect(nap.name).toBe('Gościniec Uniejów');
    expect(nap.restaurantName).toBe('Restauracja Gościniec Uniejów');
    expect(nap.street).toBe('ul. Sienkiewicza 137');
    expect(nap.postalCode).toBe('99-210');
    expect(nap.city).toBe('Uniejów');
    expect(nap.country).toBe('PL');
    expect(nap.phoneDisplay).toBe('+48 63 28 88 628');
    expect(nap.phoneE164).toBe('+48632888628');
    expect(nap.email).toBe('kontakt@gosciniecuniejow.pl');
    expect(nap.siteUrl).toBe('https://gosciniecuniejow.pl');
  });

  it('keeps the E.164 number consistent with the display number', () => {
    expect(nap.phoneDisplay.replace(/\s/g, '')).toBe(nap.phoneE164);
  });
});
