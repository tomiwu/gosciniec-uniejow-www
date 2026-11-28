import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  getPublishedPosts,
  loadPosts,
  parseFrontMatter,
  readingTimeMinutes,
  renderMarkdown,
} from './blog';

const file = (fields: string[], body = 'Treść wpisu.'): string =>
  ['---', ...fields, '---', '', body, ''].join('\n');

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'blog-test-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('parseFrontMatter', () => {
  it('reads title, description, date and draft', () => {
    const { data, body } = parseFrontMatter(
      file([
        'title: "Weekend w Uniejowie"',
        "description: 'Krótki opis'",
        'date: 2026-12-01',
        'draft: false',
      ]),
    );
    expect(data).toEqual({
      title: 'Weekend w Uniejowie',
      description: 'Krótki opis',
      date: '2026-12-01',
      draft: false,
    });
    expect(body.trim()).toBe('Treść wpisu.');
  });

  it('keeps a colon inside a value', () => {
    const { data } = parseFrontMatter(file(['title: Uniejów: zamek i termy']));
    expect(data['title']).toBe('Uniejów: zamek i termy');
  });

  it('throws when the front matter is missing', () => {
    expect(() => parseFrontMatter('Brak nagłówka')).toThrow(/front matter/i);
  });
});

describe('readingTimeMinutes', () => {
  it('is at least 1 minute', () => {
    expect(readingTimeMinutes('krótki tekst')).toBe(1);
  });
  it('rounds up at 200 words a minute', () => {
    expect(readingTimeMinutes('słowo '.repeat(401))).toBe(3);
  });
});

describe('renderMarkdown', () => {
  it('renders headings, lists and links to HTML', () => {
    const html = renderMarkdown('# Tytuł\n\n- jeden\n- dwa\n\n[tel](tel:+48632888628)');
    expect(html).toContain('<h2');
    expect(renderMarkdown('## Pod')).toContain('<h3');
    expect(html).toContain('<li>jeden</li>');
    expect(html).toContain('<a href="tel:+48632888628">tel</a>');
  });

  it('does not pass raw HTML or script tags through', () => {
    const html = renderMarkdown('Tekst <script>alert(1)</script> i <b>pogrubienie</b>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b>');
  });

  it('shifts a body h1 down, so the page keeps one h1', () => {
    expect(renderMarkdown('# Duży tytuł')).not.toContain('<h1');
  });
});

describe('loadPosts', () => {
  it('returns [] when the folder does not exist', () => {
    expect(loadPosts(join(dir, 'brak'))).toEqual([]);
  });

  it('skips drafts and sorts by date, newest first', () => {
    writeFileSync(
      join(dir, 'a.md'),
      file(['title: A', 'description: opis a', 'date: 2026-12-01', 'draft: false']),
    );
    writeFileSync(
      join(dir, 'b.md'),
      file(['title: B', 'description: opis b', 'date: 2027-01-10', 'draft: false']),
    );
    writeFileSync(
      join(dir, 'c.md'),
      file(['title: C', 'description: opis c', 'date: 2027-02-01', 'draft: true']),
    );
    writeFileSync(join(dir, 'notes.txt'), 'not markdown');
    const posts = loadPosts(dir);
    expect(posts.map((p) => p.slug)).toEqual(['b', 'a']);
    expect(posts[0]).toMatchObject({ title: 'B', path: '/blog/b/', readingMinutes: 1 });
    expect(posts[0]?.html).toContain('Treść wpisu.');
  });

  it('can include drafts when asked', () => {
    writeFileSync(
      join(dir, 'c.md'),
      file(['title: C', 'description: opis c', 'date: 2027-02-01', 'draft: true']),
    );
    expect(loadPosts(dir, { includeDrafts: true }).map((p) => p.slug)).toEqual(['c']);
  });

  it('throws on a bad date, a missing title or a bad slug', () => {
    mkdirSync(join(dir, 'x'));
    writeFileSync(join(dir, 'bad.md'), file(['title: A', 'description: d', 'date: wczoraj']));
    expect(() => loadPosts(dir)).toThrow(/date/);
    rmSync(join(dir, 'bad.md'));
    writeFileSync(join(dir, 'no-title.md'), file(['description: d', 'date: 2026-12-01']));
    expect(() => loadPosts(dir)).toThrow(/title/);
    rmSync(join(dir, 'no-title.md'));
    writeFileSync(
      join(dir, 'Zły Slug.md'),
      file(['title: A', 'description: d', 'date: 2026-12-01']),
    );
    expect(() => loadPosts(dir)).toThrow(/slug/);
  });
});

describe('content/blog in the repository', () => {
  it('has no published article yet (the only sample is a draft)', () => {
    expect(getPublishedPosts()).toEqual([]);
  });
});
