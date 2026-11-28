import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanBlogOutput } from './blog-output';

let out: string;
const page = (...parts: string[]) => {
  const dir = join(out, ...parts);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), '<html></html>');
};

beforeEach(() => {
  out = mkdtempSync(join(tmpdir(), 'blog-out-'));
});
afterEach(() => {
  rmSync(out, { recursive: true, force: true });
});

describe('cleanBlogOutput', () => {
  it('removes the dummy slug folder and keeps the list page', () => {
    page('blog');
    page('blog', '_');
    cleanBlogOutput(out, []);
    expect(existsSync(join(out, 'blog', '_'))).toBe(false);
    expect(existsSync(join(out, 'blog', 'index.html'))).toBe(true);
  });

  it('keeps a published article', () => {
    page('blog', 'wpis');
    cleanBlogOutput(out, ['szkic']);
    expect(existsSync(join(out, 'blog', 'wpis', 'index.html'))).toBe(true);
  });

  it('throws when a draft article is in the output', () => {
    page('blog', 'szkic');
    expect(() => cleanBlogOutput(out, ['szkic'])).toThrow(/szkic/);
  });

  it('does nothing when the output has no blog folder', () => {
    expect(() => cleanBlogOutput(out, ['szkic'])).not.toThrow();
  });
});
