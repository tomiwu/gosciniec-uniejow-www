import { describe, expect, it } from 'vitest';
import { roomFromParam, subjectFromParam, subjects } from './prefill';

describe('subjectFromParam', () => {
  it('maps a known slug to its label', () => {
    expect(subjectFromParam('konferencje')).toBe('Konferencje i szkolenia');
  });

  it('gives an empty string for an unknown or missing slug', () => {
    expect(subjectFromParam('x')).toBe('');
    expect(subjectFromParam(null)).toBe('');
  });

  it('has unique slugs and labels without line breaks', () => {
    expect(new Set(subjects.map((s) => s.slug)).size).toBe(subjects.length);
    for (const subject of subjects) expect(subject.label).not.toMatch(/[\r\n]/);
  });
});

describe('roomFromParam', () => {
  it('turns a slug into words', () => {
    expect(roomFromParam('apartament-rodzinny')).toBe('Apartament rodzinny');
  });

  it('ignores anything that is not a plain slug', () => {
    expect(roomFromParam(null)).toBe('');
    expect(roomFromParam('')).toBe('');
    expect(roomFromParam('<script>')).toBe('');
    expect(roomFromParam('a'.repeat(61))).toBe('');
    expect(roomFromParam('standard\nBcc: x')).toBe('');
  });
});
