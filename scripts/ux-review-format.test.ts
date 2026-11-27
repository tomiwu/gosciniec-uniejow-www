import { describe, expect, it } from 'vitest';
import { MARKER, parseReview, toComment } from './ux-review-format';

const issue = {
  severity: 'minor',
  route: '/pokoje/',
  viewport: 'mobile',
  theme: 'dark',
  problem: 'Tag text is small',
  suggestion: 'Use 15 px',
};

describe('parseReview', () => {
  it('keeps a valid review', () => {
    const review = parseReview(
      JSON.stringify({
        verdict: 'ok-with-notes',
        summary: 'Fine.',
        regressions: [],
        issues: [issue],
      }),
    );
    expect(review.verdict).toBe('ok-with-notes');
    expect(review.issues).toHaveLength(1);
  });

  it('forces "regression" when there is a regression or a blocker', () => {
    expect(
      parseReview(JSON.stringify({ verdict: 'ok', regressions: [issue], issues: [] })).verdict,
    ).toBe('regression');
    expect(
      parseReview(
        JSON.stringify({
          verdict: 'ok',
          regressions: [],
          issues: [{ ...issue, severity: 'blocker' }],
        }),
      ).verdict,
    ).toBe('regression');
  });

  it('gives "error" for output that is not a review', () => {
    expect(parseReview('no json').verdict).toBe('error');
    expect(parseReview(JSON.stringify({ verdict: 'great' })).verdict).toBe('error');
  });
});

describe('toComment', () => {
  it('starts with the marker and contains the sha and the tables', () => {
    const comment = toComment(
      parseReview(JSON.stringify({ verdict: 'ok-with-notes', summary: 'S', issues: [issue] })),
      'abcdef1234',
    );
    expect(comment.startsWith(MARKER)).toBe(true);
    expect(comment).toContain('<!-- ux-review-sha: abcdef1234 -->');
    expect(comment).toContain(
      '| minor | `/pokoje/` | mobile | dark | Tag text is small | Use 15 px |',
    );
  });
});
