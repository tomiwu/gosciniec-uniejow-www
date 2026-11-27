/**
 * Turn the UX reviewer's review.json into one PR comment (issue #26).
 * Usage: tsx scripts/ux-review-format.ts <review.json> <head-sha> > comment.md
 * The first line is a marker. scripts/ux-review.sh uses it to update the same comment.
 */
import { readFileSync } from 'node:fs';

export const MARKER = '<!-- ux-review -->';
export const VERDICTS = ['ok', 'ok-with-notes', 'regression'] as const;
export type Verdict = (typeof VERDICTS)[number] | 'error';
const SEVERITIES = ['blocker', 'major', 'minor'] as const;
type Severity = (typeof SEVERITIES)[number];

export interface Finding {
  severity: Severity;
  route: string;
  viewport: string;
  theme: string;
  problem: string;
  suggestion: string;
}

export interface Review {
  verdict: Verdict;
  summary: string;
  regressions: Finding[];
  issues: Finding[];
  intendedChanges: string[];
}

const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : fallback;

function finding(value: unknown): Finding | null {
  if (typeof value !== 'object' || value === null) return null;
  const v = value as Record<string, unknown>;
  const severity = SEVERITIES.find((s) => s === v['severity']) ?? 'minor';
  const problem = text(v['problem']);
  if (!problem) return null;
  return {
    severity,
    route: text(v['route'], '–'),
    viewport: text(v['viewport'], '–'),
    theme: text(v['theme'], '–'),
    problem,
    suggestion: text(v['suggestion']),
  };
}

const list = (value: unknown): Finding[] =>
  (Array.isArray(value) ? value : []).map(finding).filter((f): f is Finding => f !== null);

/** Read the agent output. Anything that is not a valid review becomes verdict "error". */
export function parseReview(raw: string): Review {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const verdict = VERDICTS.find((v) => v === data['verdict']);
    if (!verdict) throw new Error('no valid verdict');
    const review: Review = {
      verdict,
      summary: text(data['summary']),
      regressions: list(data['regressions']),
      issues: list(data['issues']),
      intendedChanges: (Array.isArray(data['intendedChanges']) ? data['intendedChanges'] : [])
        .map((c) => text(c))
        .filter(Boolean),
    };
    // A blocker or any regression always gives the verdict "regression".
    const blocker = [...review.regressions, ...review.issues].some((f) => f.severity === 'blocker');
    if (review.regressions.length > 0 || blocker) review.verdict = 'regression';
    return review;
  } catch (error) {
    return {
      verdict: 'error',
      summary: `The UX reviewer gave no valid review (${String(error).slice(0, 120)}).`,
      regressions: [],
      issues: [],
      intendedChanges: [],
    };
  }
}

const ICON: Record<Verdict, string> = {
  ok: '✅ ok',
  'ok-with-notes': '🟡 ok-with-notes',
  regression: '🔴 regression',
  error: '⚪ error',
};

function table(rows: Finding[]): string[] {
  if (rows.length === 0) return ['None.'];
  const order = (s: Severity) => SEVERITIES.indexOf(s);
  return [
    '| Severity | Route | Viewport | Theme | Problem | Suggestion |',
    '|---|---|---|---|---|---|',
    ...[...rows]
      .sort((a, b) => order(a.severity) - order(b.severity))
      .map(
        (f) =>
          `| ${f.severity} | \`${f.route}\` | ${f.viewport} | ${f.theme} | ${f.problem.replace(/\|/g, '/')} | ${f.suggestion.replace(/\|/g, '/')} |`,
      ),
  ];
}

export function toComment(review: Review, sha: string): string {
  return [
    `${MARKER}`,
    `<!-- ux-review-sha: ${sha} -->`,
    `## UX review: ${ICON[review.verdict]}`,
    '',
    review.summary,
    '',
    `### Regressions (${review.regressions.length})`,
    ...table(review.regressions),
    '',
    `### UX issues (${review.issues.length})`,
    ...table(review.issues),
    '',
    '### Intended visual changes',
    ...(review.intendedChanges.length ? review.intendedChanges.map((c) => `- ${c}`) : ['None.']),
    '',
    `<sub>Commit \`${sha.slice(0, 7)}\`. Inputs: visual-review artifact (390 px and 1280 px, light and dark, pixel diff against main), Lighthouse reports, CI results. This review is a report. A verdict "regression" adds the label \`ux-regression\`; then Tomasz decides about the merge.</sub>`,
    '',
  ].join('\n');
}

function main(): void {
  const [file, sha = 'unknown'] = process.argv.slice(2);
  let raw = '';
  try {
    raw = file ? readFileSync(file, 'utf8') : '';
  } catch {
    raw = '';
  }
  const review = parseReview(raw);
  const agentError = process.env['UX_AGENT_ERROR']?.trim();
  if (review.verdict === 'error' && agentError) {
    review.summary = `${review.summary} Agent output: "${agentError}". Run \`scripts/ux-review.sh <pr>\` again later.`;
  }
  process.stdout.write(toComment(review, sha));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
