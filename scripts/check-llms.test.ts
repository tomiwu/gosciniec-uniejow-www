import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '../src/lib/seo-files';
import { nap } from '../src/lib/nap';
import { checkLlmsTxt } from './check-llms';

describe('checkLlmsTxt', () => {
  it('accepts plain text that contains the NAP', () => {
    const text = buildLlmsTxt();
    expect(checkLlmsTxt(text)).toEqual([]);
    expect(text).not.toMatch(/<html/i);
  });

  it('rejects HTML', () => {
    const errors = checkLlmsTxt('<!DOCTYPE html><html></html>');
    expect(errors.join('\n')).toContain('not HTML');
  });

  it('rejects text without the NAP', () => {
    const errors = checkLlmsTxt('Hotel example.');
    expect(errors.join('\n')).toContain(`must include the hotel name (${nap.name})`);
  });
});

describe('llms.txt export', () => {
  it('writes a plain-text file with the NAP', () => {
    const dir = mkdtempSync(join(tmpdir(), 'llms-'));
    const path = join(dir, 'llms.txt');
    writeFileSync(path, buildLlmsTxt(), 'utf8');
    expect(checkLlmsTxt(buildLlmsTxt())).toEqual([]);
  });
});
