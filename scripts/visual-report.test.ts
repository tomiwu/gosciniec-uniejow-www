import { describe, expect, it } from 'vitest';
import { classify, summarize, toMarkdown } from './visual-report';

const failed = (message: string) => ({ status: 'failed', errors: [{ message }] });

describe('classify', () => {
  it('reads the pixel ratio of a changed shot', () => {
    expect(
      classify(failed('\u001b[31m1234 pixels (ratio 0.03 of all image pixels) are different.')),
    ).toEqual({ status: 'changed', diffRatio: 0.03, note: '' });
  });

  it('reports a change of the page size', () => {
    expect(
      classify(failed('Expected an image 390px by 3000px, received 390px by 3200px.')),
    ).toMatchObject({
      status: 'changed',
      diffRatio: null,
      note: 'size 390px by 3000px -> 390px by 3200px',
    });
  });

  it('marks a shot without baseline as new', () => {
    expect(classify(failed("A snapshot doesn't exist at /x.png, writing actual."))).toMatchObject({
      status: 'new',
    });
  });

  it('marks a passed shot as same', () => {
    expect(classify({ status: 'passed' })).toEqual({ status: 'same', diffRatio: 0, note: '' });
  });
});

describe('summarize', () => {
  it('takes route, viewport and theme from the test titles', () => {
    const report = {
      suites: [
        {
          title: 'snapshots.spec.ts',
          suites: [
            {
              title: 'mobile dark',
              specs: [
                {
                  title: '/pokoje/',
                  tests: [
                    {
                      results: [
                        {
                          status: 'failed',
                          errors: [{ message: '10 pixels (ratio 0.5 of all image pixels)' }],
                          attachments: [
                            {
                              name: 'pokoje-mobile-dark-diff.png',
                              path: 'visual/test-results/a/d.png',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    const rows = summarize(report, 'visual');
    expect(rows).toEqual([
      {
        route: '/pokoje/',
        viewport: 'mobile',
        theme: 'dark',
        status: 'changed',
        diffRatio: 0.5,
        note: '',
        diffImage: 'test-results/a/d.png',
      },
    ]);
    expect(toMarkdown(rows)).toContain('| `/pokoje/` | mobile | dark | changed | 50.00 % |  |');
  });
});
