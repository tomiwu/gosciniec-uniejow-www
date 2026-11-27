import { describe, expect, it } from 'vitest';
import { buildLlmsTxt } from '../src/lib/seo-files';
import { nap } from '../src/lib/nap';
import { checkLlmsTxt } from './check-llms';

describe('checkLlmsTxt', () => {
  it('accepts the generated llms.txt', () => {
    expect(checkLlmsTxt(buildLlmsTxt())).toEqual([]);
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
