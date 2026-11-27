import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  checkPlaceholders,
  findBadgeInOutput,
  findPlaceholderUsers,
  isProductionBuild,
} from './check-placeholders';

describe('isProductionBuild', () => {
  it('is true only when PRODUCTION_BUILD is 1', () => {
    expect(isProductionBuild({ PRODUCTION_BUILD: '1' })).toBe(true);
    expect(isProductionBuild({})).toBe(false);
    expect(isProductionBuild({ NEXT_PUBLIC_PREVIEW: '1' })).toBe(false);
    expect(isProductionBuild({ PRODUCTION_BUILD: '0' })).toBe(false);
  });
});

describe('checkPlaceholders', () => {
  it('fails a production build when a placeholder is in use', () => {
    const result = checkPlaceholders({ production: true, users: ['src/app/pakiety/page.tsx'] });
    expect(result.ok).toBe(false);
    expect(result.messages.join('\n')).toContain('src/app/pakiety/page.tsx');
  });

  it('fails a production build when the badge is in the export', () => {
    const result = checkPlaceholders({
      production: true,
      users: [],
      badgeFiles: ['pakiety/index.html'],
    });
    expect(result.ok).toBe(false);
    expect(result.messages.join('\n')).toContain('pakiety/index.html');
  });

  it('passes a production build with no placeholder', () => {
    expect(checkPlaceholders({ production: true, users: [], badgeFiles: [] }).ok).toBe(true);
  });

  it('passes a preview build that keeps placeholders', () => {
    const result = checkPlaceholders({
      production: false,
      users: ['src/app/pakiety/page.tsx'],
      badgeFiles: ['pakiety/index.html'],
    });
    expect(result.ok).toBe(true);
  });

  it('fails any build when a page uses a placeholder without the badge', () => {
    const result = checkPlaceholders({
      production: false,
      users: ['src/app/pakiety/page.tsx'],
      badgeFiles: [],
      checkedOutput: true,
    });
    expect(result.ok).toBe(false);
    expect(result.messages.join('\n')).toContain('badge');
  });
});

describe('findPlaceholderUsers', () => {
  it('finds source files that import the placeholder module, not tests', () => {
    const users = findPlaceholderUsers('src');
    expect(users).toContain('src/app/pakiety/page.tsx');
    expect(users.some((file) => file.endsWith('.test.ts') || file.endsWith('.test.tsx'))).toBe(
      false,
    );
    expect(users).not.toContain('src/content/placeholders.ts');
  });
});

describe('findBadgeInOutput', () => {
  it('lists the HTML files that contain the badge text', () => {
    const dir = mkdtempSync(join(tmpdir(), 'placeholders-'));
    mkdirSync(join(dir, 'pakiety'));
    writeFileSync(join(dir, 'pakiety', 'index.html'), '<span>Dane testowe</span>');
    writeFileSync(join(dir, 'index.html'), '<p>Strona główna</p>');
    expect(findBadgeInOutput(dir)).toEqual(['pakiety/index.html']);
  });
});
