import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { nap } from '../src/lib/nap';

/** Returns error messages. An empty array means the file is valid. */
export function checkLlmsTxt(text: string): string[] {
  const errors: string[] = [];
  const trimmed = text.trimStart();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || /<\/html>/i.test(text)) {
    errors.push('llms.txt must be plain text, not HTML');
  }
  if (!text.includes(nap.name)) errors.push(`llms.txt must include the hotel name (${nap.name})`);
  if (!text.includes(nap.street)) errors.push('llms.txt must include the street address');
  if (!text.includes(`${nap.postalCode} ${nap.city}`)) {
    errors.push('llms.txt must include the postal code and city');
  }
  if (!text.includes(nap.phoneDisplay)) errors.push('llms.txt must include the official phone');
  if (!text.includes(nap.email)) errors.push('llms.txt must include the official e-mail');
  if (/Kobiecy|719/.test(text)) {
    errors.push('llms.txt must not include the archived Kobiecy package or 719 zł');
  }
  return errors;
}

function main(): void {
  const outDir = process.argv[2] ?? 'out';
  const filePath = resolve(outDir, 'llms.txt');
  if (!existsSync(filePath)) {
    console.error(`check-llms: missing ${filePath}`);
    process.exit(1);
  }
  const errors = checkLlmsTxt(readFileSync(filePath, 'utf8'));
  if (errors.length > 0) {
    for (const error of errors) console.error(`check-llms: ${error}`);
    process.exit(1);
  }
  console.log(`check-llms: OK (${filePath})`);
}

if (process.argv[1]?.includes('check-llms')) main();
