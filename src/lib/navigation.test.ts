import { describe, expect, it } from 'vitest';
import { legalNav, mainNav } from './navigation';
import { routePaths } from './routes';

describe('navigation', () => {
  it('links only to existing routes', () => {
    for (const item of [...mainNav, ...legalNav]) {
      expect(routePaths, item.href).toContain(item.href);
    }
  });

  it('lists the 11 main items in the agreed order', () => {
    expect(mainNav.map((item) => item.label)).toEqual([
      'Pokoje',
      'Ceny',
      'Pakiety',
      'SPA',
      'Restauracja',
      'Konferencje',
      'Przyjęcia',
      'Dla dzieci',
      'Atrakcje',
      'FAQ',
      'Kontakt',
    ]);
  });
});
