/**
 * Guard for placeholder data (issue #33).
 *
 * A production build (`PRODUCTION_BUILD=1`, see `npm run build:production`) must not use
 * `src/content/placeholders.ts`. It also must not carry the badge "Dane testowe" in `out/`.
 * A preview build may keep placeholders. Then the badge must be on every page that uses them.
 * A production build must also not show a visible `TODO` marker in any exported HTML file (issue #57).
 * A preview build may show `TODO` markers.
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

const NON_VISIBLE_BLOCKS = /<!--[\s\S]*?-->|<(script|style)\b[\s\S]*?<\/\1\s*>/gi;
const TAGS = /<[^>]*>/g;
const TODO_MARKER = /\bTODO\b/;

/** True when the HTML shows the word TODO as text. Scripts, styles, comments and tags do not count. */
export function hasVisibleTodo(html: string): boolean {
  return TODO_MARKER.test(html.replace(NON_VISIBLE_BLOCKS, ' ').replace(TAGS, ' '));
}

/** HTML files in the export folder that show a TODO marker. Paths are relative to the folder. */
export function findTodoInOutput(outDir: string): string[] {
  return listFiles(outDir, ['.html'])
    .filter((file) => hasVisibleTodo(readFileSync(file, 'utf8')))
    .map((file) => relative(outDir, file).replaceAll('\\', '/'));
}

export interface PlaceholderInput {
  production: boolean;
  /** Source files that import the placeholder module. */
  users: readonly string[];
  /** HTML files with the badge. Leave empty when the export is not checked. */
  badgeFiles?: readonly string[];
  /** HTML files with a visible TODO marker. Leave empty when the export is not checked. */
  todoFiles?: readonly string[];
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
  const todoFiles = input.todoFiles ?? [];
  if (input.production) {
    for (const file of input.users) {
      messages.push(
        `Production build: ${file} uses placeholder data (src/content/placeholders.ts).`,
      );
    }
    for (const file of badgeFiles) {
      messages.push(`Production build: ${file} shows the badge "${PLACEHOLDER_BADGE}".`);
    }
    for (const file of todoFiles) {
      messages.push(`Production build: ${file} shows a visible TODO marker.`);
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
  let todoFiles: string[] = [];
  let checkedOutput = false;
  if (outArg !== undefined) {
    const outDir = resolve(outArg);
    if (!existsSync(outDir)) {
      console.error(`FAIL Missing directory: ${outDir}. Run the build first.`);
      return 1;
    }
    badgeFiles = findBadgeInOutput(outDir);
    todoFiles = findTodoInOutput(outDir);
    checkedOutput = true;
  }
  const result = checkPlaceholders({ production, users, badgeFiles, todoFiles, checkedOutput });
  for (const message of result.messages) console.error(`FAIL ${message}`);
  if (!result.ok) {
    console.error(
      'FAIL A production build must not use placeholder data or show TODO markers. Use a preview build.',
    );
    return 1;
  }
  const mode = production ? 'production' : 'preview/non-production';
  console.log(
    `placeholders OK (${mode} build): ${users.length} source file(s) use placeholder data` +
      (checkedOutput
        ? `, ${badgeFiles.length} HTML file(s) show the badge, ${todoFiles.length} show a TODO marker`
        : ''),
  );
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
