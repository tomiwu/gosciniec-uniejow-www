import { describe, expect, it } from 'vitest';
import { allPlaceholders, PLACEHOLDER_BADGE, placeholderPackages } from './placeholders';

describe('placeholder records', () => {
  it('uses the exact badge text "Dane testowe"', () => {
    expect(PLACEHOLDER_BADGE).toBe('Dane testowe');
  });

  it('has at least one sample package', () => {
    expect(placeholderPackages.length).toBeGreaterThan(0);
  });

  it('marks every record with isPlaceholder: true', () => {
    expect(allPlaceholders.length).toBeGreaterThan(0);
    for (const record of allPlaceholders) expect(record.isPlaceholder).toBe(true);
  });

  it('has unique ids', () => {
    const ids = allPlaceholders.map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not copy the archived 719 zł amount or its name into a sample', () => {
    const text = JSON.stringify(allPlaceholders);
    expect(text).not.toContain('719');
    expect(text).not.toMatch(/Kobiecy/i);
  });
});
