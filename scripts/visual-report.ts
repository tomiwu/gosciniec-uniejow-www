/**
 * Summary of the visual snapshot run (issue #26).
 * Input: the Playwright JSON report of playwright.visual.config.ts.
 * Output: visual-report.json and visual-report.md (also added to the GitHub job summary).
 * This script never fails the job: the visual review is a report, not a gate.
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

export type ShotStatus = 'same' | 'changed' | 'new' | 'error';

export interface ShotRow {
  route: string;
  viewport: string;
  theme: string;
  status: ShotStatus;
  /** Part of the pixels that changed, 0..1. Null when the size changed or there is no baseline. */
  diffRatio: number | null;
  note: string;
  diffImage: string | null;
}

interface PwAttachment {
  name: string;
  path?: string;
}
interface PwResult {
  status: string;
  errors?: { message?: string }[];
  attachments?: PwAttachment[];
}
interface PwSpec {
  title: string;
  tests: { results: PwResult[] }[];
}
interface PwSuite {
  title: string;
  specs?: PwSpec[];
  suites?: PwSuite[];
}

// Playwright colours the error text. Remove the ANSI codes before we read it.
const stripAnsi = (text: string) => text.replace(/\u001b\[[0-9;]*m/g, '');

export function classify(
  result: PwResult | undefined,
): Pick<ShotRow, 'status' | 'diffRatio' | 'note'> {
  if (!result) return { status: 'error', diffRatio: null, note: 'no result' };
  if (result.status === 'passed') return { status: 'same', diffRatio: 0, note: '' };
  const message = stripAnsi(result.errors?.map((e) => e.message ?? '').join('\n') ?? '');
  if (/snapshot doesn't exist|writing actual/i.test(message)) {
    return { status: 'new', diffRatio: null, note: 'no baseline on main' };
  }
  const ratio = /\(ratio ([\d.]+) of all image pixels\)/.exec(message);
  if (ratio) return { status: 'changed', diffRatio: Number(ratio[1]), note: '' };
  const size = /Expected an image (\d+px by \d+px), received (\d+px by \d+px)/.exec(message);
  if (size) {
    return { status: 'changed', diffRatio: null, note: `size ${size[1]} -> ${size[2]}` };
  }
  return { status: 'error', diffRatio: null, note: message.split('\n')[0]?.slice(0, 160) ?? '' };
}

export function summarize(report: { suites: PwSuite[] }, baseDir = '.'): ShotRow[] {
  const rows: ShotRow[] = [];
  const walk = (suite: PwSuite, path: string[]) => {
    for (const spec of suite.specs ?? []) {
      const group = path.find((title) => /^(mobile|desktop) (light|dark)$/.test(title)) ?? '? ?';
      const [viewport = '?', theme = '?'] = group.split(' ');
      const result = spec.tests[0]?.results.at(-1);
      const diff = result?.attachments?.find((a) => a.name.endsWith('-diff.png'))?.path;
      rows.push({
        route: spec.title,
        viewport,
        theme,
        ...classify(result),
        diffImage: diff ? relative(baseDir, diff) : null,
      });
    }
    for (const child of suite.suites ?? []) walk(child, [...path, child.title]);
  };
  for (const suite of report.suites) walk(suite, [suite.title]);
  return rows.sort((a, b) =>
    `${a.route}${a.viewport}${a.theme}`.localeCompare(`${b.route}${b.viewport}${b.theme}`),
  );
}

export function toMarkdown(rows: readonly ShotRow[]): string {
  const changed = rows.filter((r) => r.status !== 'same').length;
  const pct = (r: ShotRow) => (r.diffRatio === null ? '–' : `${(r.diffRatio * 100).toFixed(2)} %`);
  const lines = [
    '## Visual review (report only, not a gate)',
    '',
    `${rows.length} shots, ${changed} differ from main. Images: artifact \`visual-review\`.`,
    '',
    '| Route | Viewport | Theme | Status | Changed pixels | Note |',
    '|---|---|---|---|---|---|',
    ...rows.map(
      (r) =>
        `| \`${r.route}\` | ${r.viewport} | ${r.theme} | ${r.status} | ${pct(r)} | ${r.note} |`,
    ),
  ];
  return `${lines.join('\n')}\n`;
}

function main(): void {
  const dir = process.env['VISUAL_DIR'] ?? 'visual';
  const input = join(dir, 'results.json');
  if (!existsSync(input)) {
    console.log(`visual-report: ${input} is missing. Nothing to report.`);
    return;
  }
  const rows = summarize(JSON.parse(readFileSync(input, 'utf8')), dir);
  const markdown = toMarkdown(rows);
  writeFileSync(join(dir, 'visual-report.json'), `${JSON.stringify(rows, null, 2)}\n`);
  writeFileSync(join(dir, 'visual-report.md'), markdown);
  const summary = process.env['GITHUB_STEP_SUMMARY'];
  if (summary) appendFileSync(summary, markdown);
  console.log(markdown);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
