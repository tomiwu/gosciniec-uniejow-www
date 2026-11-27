import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PLACEHOLDER_BADGE_TEXT,
  placeholders,
  type PlaceholderRecord,
} from '../src/content/placeholders';
import { isPreview } from '../src/lib/preview';
import { routes } from '../src/lib/routes';

/**
 * Stop an unverified export. A production build (no `NEXT_PUBLIC_PREVIEW=1`) must have no
 * placeholder. A preview build may keep them, but each page must show the badge.
 *
 * Without an argument: check the list in `src/content/placeholders.ts` (before the build).
 * With a folder argument: also read the exported HTML (after the build).
 */

/** HTML file of a site path in the export folder. */
export function htmlFileFor(outDir: string, path: string): string {
  return join(outDir, path, 'index.html');
}

export interface CheckInput {
  records: readonly PlaceholderRecord[];
  preview: boolean;
  /** Reads the exported HTML of a site path. `null` when the file is missing. Optional. */
  readPage?: (path: string) => string | null;
  /** Site paths of the exported pages. Needed in production to find a badge that has no record. */
  exportedPaths?: readonly string[];
}

export function checkPlaceholders({
  records,
  preview,
  readPage,
  exportedPaths = [],
}: CheckInput): string[] {
  const errors: string[] = [];

  for (const record of records) {
    if ((record as { isPlaceholder?: unknown }).isPlaceholder !== true) {
      errors.push(`${record.id}: a placeholder record must have isPlaceholder: true`);
    }
  }

  if (!preview) {
    for (const record of records) {
      errors.push(
        `${record.id}: placeholder still in use. A production build must not contain placeholders. ` +
          'Verify the figure with the owner, then remove the record from src/content/placeholders.ts.',
      );
    }
    for (const path of exportedPaths) {
      if (readPage?.(path)?.includes(PLACEHOLDER_BADGE_TEXT)) {
        errors.push(`${path}: shows the badge "${PLACEHOLDER_BADGE_TEXT}" in a production build`);
      }
    }
  } else if (readPage) {
    for (const record of records) {
      for (const path of record.pages) {
        const html = readPage(path);
        if (html === null) errors.push(`${record.id}: page ${path} is missing in the export`);
        else if (!html.includes(PLACEHOLDER_BADGE_TEXT)) {
          errors.push(
            `${record.id}: page ${path} does not show the badge "${PLACEHOLDER_BADGE_TEXT}"`,
          );
        }
      }
    }
  }
  return errors;
}

function main(): number {
  const outArg = process.argv[2];
  let input: CheckInput = { records: placeholders, preview: isPreview };
  if (outArg) {
    const outDir = resolve(outArg);
    if (!existsSync(outDir)) {
      console.error(`FAIL Missing directory: ${outDir}. Run npm run build.`);
      return 1;
    }
    const readPage = (path: string): string | null => {
      const file = htmlFileFor(outDir, path);
      return existsSync(file) ? readFileSync(file, 'utf8') : null;
    };
    // A badge on any page of the routes list is an error in production.
    input = { ...input, readPage, exportedPaths: routes.map((route) => route.path) };
  }
  const errors = checkPlaceholders(input);
  for (const error of errors) console.error(`FAIL ${error}`);
  if (errors.length === 0) {
    const mode = isPreview ? 'preview build' : 'production build';
    console.log(`placeholders OK: ${placeholders.length} in use, ${mode}`);
  }
  return errors.length === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
