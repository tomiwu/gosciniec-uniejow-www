/**
 * Guard for placeholder data (issue #33).
 *
 * A production build (`PRODUCTION_BUILD=1`, see `npm run build:production`) must not use
 * `src/content/placeholders.ts`. It also must not carry the badge "Dane testowe" in `out/`.
 * A preview build may keep placeholders. Then the badge must be on every page that uses them.
 *
 * Usage:
 *   tsx scripts/check-placeholders.ts        check the source files (before the build)
 *   tsx scripts/check-placeholders.ts out    also check the export (after the build)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLACEHOLDER_BADGE } from '../src/content/placeholders';

export function isProductionBuild(env: Record<string, string | undefined>): boolean {
  return env['PRODUCTION_BUILD'] === '1';
}

const IMPORT_PATTERN =
  /from\s+['"](?:@\/content\/placeholders|(?:\.{1,2}\/)+(?:content\/)?placeholders)['"]/;
const TEST_FILE = /\.test\.tsx?$/;

function listFiles(dir: string, extensions: readonly string[]): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((name) => extensions.some((ext) => name.endsWith(ext)))
    .map((name) => join(dir, name).replaceAll('\\', '/'))
    .sort();
}

/** Source files (not tests) that import the placeholder module. */
export function findPlaceholderUsers(srcDir: string = 'src'): string[] {
  return listFiles(srcDir, ['.ts', '.tsx'])
    .filter((file) => !TEST_FILE.test(file) && !file.endsWith('content/placeholders.ts'))
    .filter((file) => IMPORT_PATTERN.test(readFileSync(file, 'utf8')));
}

/** HTML files in the export folder that show the badge. Paths are relative to the folder. */
export function findBadgeInOutput(outDir: string): string[] {
  return listFiles(outDir, ['.html'])
    .filter((file) => readFileSync(file, 'utf8').includes(PLACEHOLDER_BADGE))
    .map((file) => relative(outDir, file).replaceAll('\\', '/'));
}

export interface PlaceholderInput {
  production: boolean;
  /** Source files that import the placeholder module. */
  users: readonly string[];
  /** HTML files with the badge. Leave empty when the export is not checked. */
  badgeFiles?: readonly string[];
  /** True when the export was scanned. */
  checkedOutput?: boolean;
}

export interface PlaceholderResult {
  ok: boolean;
  messages: string[];
}

export function checkPlaceholders(input: PlaceholderInput): PlaceholderResult {
  const messages: string[] = [];
  const badgeFiles = input.badgeFiles ?? [];
  if (input.production) {
    for (const file of input.users) {
      messages.push(
        `Production build: ${file} uses placeholder data (src/content/placeholders.ts).`,
      );
    }
    for (const file of badgeFiles) {
      messages.push(`Production build: ${file} shows the badge "${PLACEHOLDER_BADGE}".`);
    }
  } else if (input.checkedOutput && input.users.length > 0 && badgeFiles.length === 0) {
    messages.push(
      `Placeholder data is in use but the export has no badge "${PLACEHOLDER_BADGE}". Show the badge.`,
    );
  }
  return { ok: messages.length === 0, messages };
}

function main(): number {
  const production = isProductionBuild(process.env);
  const outArg = process.argv[2];
  const users = findPlaceholderUsers();
  let badgeFiles: string[] = [];
  let checkedOutput = false;
  if (outArg !== undefined) {
    const outDir = resolve(outArg);
    if (!existsSync(outDir)) {
      console.error(`FAIL Missing directory: ${outDir}. Run the build first.`);
      return 1;
    }
    badgeFiles = findBadgeInOutput(outDir);
    checkedOutput = true;
  }
  const result = checkPlaceholders({ production, users, badgeFiles, checkedOutput });
  for (const message of result.messages) console.error(`FAIL ${message}`);
  if (!result.ok) {
    console.error('FAIL A production build must not use placeholder data. Use a preview build.');
    return 1;
  }
  const mode = production ? 'production' : 'preview/non-production';
  console.log(
    `placeholders OK (${mode} build): ${users.length} source file(s) use placeholder data` +
      (checkedOutput ? `, ${badgeFiles.length} HTML file(s) show the badge` : ''),
  );
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
