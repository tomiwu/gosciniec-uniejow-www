# Visual and UX review after each PR

Issue #26. Tomasz asked for a UI/UX expert review after each PR (2026-11-27).

## Parts

1. **Workflow `Visual review`** (`.github/workflows/visual-review.yml`), on each PR:
   - builds the base (`main`) and the PR head;
   - takes full-page and first-screen shots of `/`, `/pokoje/`, `/kontakt/`, `/rezerwacja/`,
     `/faq/` at 390 px and 1280 px, light and dark theme (`e2e-visual/`, `playwright.visual.config.ts`);
   - compares the PR shots with the base shots (Playwright pixel diff, noise limit 0.1 %);
   - writes a table to the job summary and uploads the artifact `visual-review`
     (`baseline/`, `current/`, `current/fold/`, `test-results/**-diff.png`, `visual-report.json`).
   - It is **not a required check** and it always ends green. A change is not an error: the
     reviewer decides if it is intended.
2. **UX reviewer** (`scripts/ux-review.sh <pr>`, prompt `.sandcastle/ux-review-prompt.md`). It runs on
   the box, because it needs Claude Code. It reads the artifact, the Lighthouse reports and the CI
   job results, and posts **one** PR comment (updated on each run): regressions, UX issues with
   severity (`blocker`, `major`, `minor`) and a verdict (`ok`, `ok-with-notes`, `regression`).
   Verdict `regression` adds the label `ux-regression`.
3. **Loop hook**: the Sandcastle loop starts the reviewer in the background when a PR is green
   (`startUxReview` in `.sandcastle/main.mts`). PRs that the supervisor bot opens get the review
   from the bot (`scripts/ux-review.sh <pr>`).

## Merge rule

The 9 required checks stay the merge gate. The UX review is a report. Before a merge the
supervisor reads the comment. With the label `ux-regression` it asks Tomasz first.

## Run by hand

```bash
scripts/ux-review.sh 42            # skips a commit that already has a review
scripts/ux-review.sh 42 --force    # run again
VISUAL_SITE=out npx playwright test -c playwright.visual.config.ts --update-snapshots=all  # local baseline
```
