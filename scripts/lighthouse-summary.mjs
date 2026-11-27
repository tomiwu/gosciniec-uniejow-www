// Median Lighthouse values per URL from an lhci .lighthouseci folder (issue #26, UX review input).
// Usage: node scripts/lighthouse-summary.mjs <dir> > lighthouse-summary.json
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? '.lighthouseci';
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
};
const byPath = new Map();
for (const file of readdirSync(dir).filter((f) => /^lhr-.*\.json$/.test(f))) {
  const lhr = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  const path = new URL(lhr.finalDisplayedUrl ?? lhr.finalUrl).pathname;
  const runs = byPath.get(path) ?? [];
  runs.push({
    lcpMs: lhr.audits['largest-contentful-paint']?.numericValue,
    cls: lhr.audits['cumulative-layout-shift']?.numericValue,
    tbtMs: lhr.audits['total-blocking-time']?.numericValue,
    performance: lhr.categories.performance?.score,
    accessibility: lhr.categories.accessibility?.score,
  });
  byPath.set(path, runs);
}
const summary = {};
for (const [path, runs] of byPath) {
  summary[path] = { runs: runs.length };
  for (const key of ['lcpMs', 'cls', 'tbtMs', 'performance', 'accessibility']) {
    const value = median(runs.map((r) => r[key]).filter((v) => typeof v === 'number'));
    summary[path][key] = typeof value === 'number' ? Math.round(value * 1000) / 1000 : null;
  }
}
process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
