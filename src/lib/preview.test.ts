import { describe, expect, it } from 'vitest';
import { basePath, isPreview, withBase } from './preview';

describe('withBase', () => {
  it('adds the base path to a site-absolute path', () => {
    expect(withBase('/img/a.jpg', '/repo')).toBe('/repo/img/a.jpg');
  });

  it('keeps other URLs', () => {
    expect(withBase('tel:+48632888628', '/repo')).toBe('tel:+48632888628');
    expect(withBase('https://example.com/', '/repo')).toBe('https://example.com/');
    expect(withBase('//cdn.example.com/x', '/repo')).toBe('//cdn.example.com/x');
  });

  it('changes nothing in the production build', () => {
    expect(isPreview).toBe(false);
    expect(basePath).toBe('');
    expect(withBase('/kontakt/')).toBe('/kontakt/');
  });
});
