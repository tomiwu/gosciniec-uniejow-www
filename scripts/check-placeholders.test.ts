import { describe, expect, it } from 'vitest';
import {
  PLACEHOLDER_BADGE_TEXT,
  placeholders,
  type PlaceholderRecord,
} from '../src/content/placeholders';
import { checkPlaceholders } from './check-placeholders';

const sample: PlaceholderRecord = {
  id: 'invented-record',
  isPlaceholder: true,
  note: 'Invented record for the test.',
  pages: ['/test/'],
};

describe('checkPlaceholders', () => {
  it('fails a production build while a placeholder is in use', () => {
    const errors = checkPlaceholders({ records: [sample], preview: false });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('invented-record');
    expect(errors[0]).toContain('production build');
  });

  it('passes a production build without placeholders', () => {
    expect(checkPlaceholders({ records: [], preview: false })).toEqual([]);
  });

  it('passes a preview build that keeps placeholders', () => {
    expect(checkPlaceholders({ records: [sample], preview: true })).toEqual([]);
  });

  it('rejects a record without isPlaceholder: true, also in a preview build', () => {
    const bad = { ...sample, isPlaceholder: false } as unknown as PlaceholderRecord;
    const errors = checkPlaceholders({ records: [bad], preview: true });
    expect(errors.join(' ')).toContain('isPlaceholder: true');
  });

  it('needs the visible badge on each page of a record in a preview export', () => {
    const withBadge = checkPlaceholders({
      records: [sample],
      preview: true,
      readPage: () => `<p>${PLACEHOLDER_BADGE_TEXT}</p>`,
    });
    expect(withBadge).toEqual([]);
    const without = checkPlaceholders({
      records: [sample],
      preview: true,
      readPage: () => '<p>no badge</p>',
    });
    expect(without.join(' ')).toContain('does not show the badge');
    const missing = checkPlaceholders({ records: [sample], preview: true, readPage: () => null });
    expect(missing.join(' ')).toContain('missing in the export');
  });

  it('finds a badge in a production export even when no record exists', () => {
    const errors = checkPlaceholders({
      records: [],
      preview: false,
      exportedPaths: ['/a/', '/b/'],
      readPage: (path) => (path === '/b/' ? `<span>${PLACEHOLDER_BADGE_TEXT}</span>` : '<p></p>'),
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('/b/');
  });
});

describe('placeholders.ts', () => {
  it('marks every record as a placeholder with a unique id and at least one page', () => {
    expect(placeholders.length).toBeGreaterThan(0);
    expect(new Set(placeholders.map((r) => r.id)).size).toBe(placeholders.length);
    for (const record of placeholders) {
      expect(record.isPlaceholder).toBe(true);
      expect(record.pages.length).toBeGreaterThan(0);
    }
  });

  it('uses none of the conflicting figures of the old site', () => {
    const text = JSON.stringify(placeholders);
    for (const figure of [
      '"sampleCapacity":400',
      '"sampleCapacity":120',
      '"sampleRoomCount":3',
      '"sampleRoomCount":4',
    ]) {
      expect(text).not.toContain(figure);
    }
  });
});
