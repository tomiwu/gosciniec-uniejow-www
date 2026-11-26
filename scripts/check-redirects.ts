import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { routePaths } from '../src/lib/routes';
import { buildHtaccess, sourcePattern } from '../src/redirects/htaccess';
import { redirects, type Redirect } from '../src/redirects/map';

const EXTRA_TARGETS = ['/sitemap.xml'];

export function parseOldUrls(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

/** Returns a list of error messages. An empty list means all checks pass. */
export function checkRedirects(
  map: readonly Redirect[],
  oldUrls: readonly string[],
  routes: readonly string[],
  htaccess?: string,
): string[] {
  const errors: string[] = [];
  const routeSet = new Set(routes);
  const sources = new Map<string, string>();

  for (const entry of map) {
    if (sources.has(entry.from)) errors.push(`Duplicate source: ${entry.from}`);
    sources.set(entry.from, entry.to);
  }

  for (const url of oldUrls) {
    if (!routeSet.has(url) && !sources.has(url)) {
      errors.push(`Old URL is neither a route nor a redirect source: ${url}`);
    }
  }

  for (const entry of map) {
    if (entry.from === entry.to) errors.push(`Loop: ${entry.from} redirects to itself`);
    if (!routeSet.has(entry.to) && !EXTRA_TARGETS.includes(entry.to)) {
      errors.push(`Target is not a route: ${entry.from} -> ${entry.to}`);
    }
    if (sources.has(entry.to) && entry.to !== entry.from) {
      errors.push(`Chain: ${entry.from} -> ${entry.to} -> ${sources.get(entry.to)}`);
    }
    if (routeSet.has(entry.from)) {
      errors.push(`Source is a live route: ${entry.from}`);
    }
  }

  if (htaccess !== undefined) {
    const ruleLines = htaccess.split('\n').filter((line) => /^RewriteRule \^\S/.test(line));
    if (ruleLines.length !== map.length) {
      errors.push(`.htaccess has ${ruleLines.length} redirect rules, map has ${map.length}`);
    }
    for (const entry of map) {
      const line = `RewriteRule ${sourcePattern(entry.from)} ${entry.to} [R=301,L]`;
      if (!ruleLines.includes(line)) errors.push(`.htaccess misses a rule for ${entry.from}`);
    }
    if (!htaccess.includes('ErrorDocument 404 /404.html')) {
      errors.push('.htaccess misses ErrorDocument 404');
    }
  }

  return errors;
}

function main(): number {
  const oldUrlsPath = resolve('docs/source/old-urls.txt');
  const htaccessPath = resolve('out/.htaccess');
  const errors: string[] = [];

  if (!existsSync(oldUrlsPath)) errors.push(`Missing file: ${oldUrlsPath}`);
  if (!existsSync(htaccessPath)) errors.push(`Missing file: ${htaccessPath}. Run npm run build.`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`FAIL ${error}`);
    return 1;
  }

  const htaccess = readFileSync(htaccessPath, 'utf8');
  const oldUrls = parseOldUrls(readFileSync(oldUrlsPath, 'utf8'));
  errors.push(...checkRedirects(redirects, oldUrls, routePaths, htaccess));
  if (htaccess !== buildHtaccess(redirects)) {
    errors.push('out/.htaccess differs from the output of the generator');
  }

  for (const error of errors) console.error(`FAIL ${error}`);
  if (errors.length === 0) {
    console.log(`redirects OK: ${redirects.length} rules, ${oldUrls.length} old URLs checked`);
  }
  return errors.length === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
