#!/usr/bin/env bash
# UX review of one PR (issue #26). It runs on the box, not in CI: it needs Claude Code and the
# Claude token in .sandcastle/.env. The visual-review workflow must have run for the PR head.
# Claude limit (issue #58): the script runs the same review with the local Cursor CLI (`agent`,
# UX_REVIEW_CURSOR_MODEL, default grok-4.7-high) when CURSOR_API_KEY is set. Never Cursor cloud agents.
#
#   scripts/ux-review.sh <pr-number-or-url> [--force]
#
# Result: one PR comment (updated on each run, marker <!-- ux-review -->) and the label
# "ux-regression" when the verdict is "regression". This is a report, not a merge gate.
# The script never prints secrets. Exit code 0 also when the review fails (the loop ignores it).
set -uo pipefail

PR_ARG="${1:?usage: scripts/ux-review.sh <pr-number-or-url> [--force]}"
FORCE="${2:-}"
# The loop runs a copy of this file (the work tree changes under a running script), so it sets
# UX_REVIEW_ROOT to the repository root.
ROOT="${UX_REVIEW_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
REPO="${UX_REVIEW_REPO:-tomiwu/gosciniec-uniejow-www}"
WAIT_MINUTES="${UX_REVIEW_WAIT_MINUTES:-40}"

log() { printf '[ux-review] %s\n' "$*"; }

if [[ -f "$ROOT/.sandcastle/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/.sandcastle/.env"
  set +a
fi
export GH_TOKEN CLAUDE_CODE_OAUTH_TOKEN
MODEL="${UX_REVIEW_MODEL:-${REVIEW_MODEL:-claude-sonnet-5-5}}"
CURSOR_MODEL_UX="${UX_REVIEW_CURSOR_MODEL:-grok-4.7-high}"
# Same limit words as CLAUDE_LIMIT in .sandcastle/loop-policy.mts.
LIMIT_RE='hit your ([A-Za-z0-9-]+ )?limit|usage limit|limit reached|rate limit|out of (extra )?usage'

PR="$(gh pr view "$PR_ARG" --repo "$REPO" --json number --jq .number)" || { log "PR not found"; exit 0; }
SHA="$(gh pr view "$PR" --repo "$REPO" --json headRefOid --jq .headRefOid)"
log "PR #$PR, head ${SHA:0:7}, model $MODEL"

# Skip when this commit already has a review (unless --force).
EXISTING_ID="$(gh api "repos/$REPO/issues/$PR/comments" --paginate \
  --jq '.[] | select(.body | startswith("<!-- ux-review -->")) | .id' | tail -n 1)"
if [[ -n "$EXISTING_ID" && "$FORCE" != "--force" ]]; then
  # A review with verdict "error" (for example a usage limit) does not count: run again.
  EXISTING_BODY="$(gh api "repos/$REPO/issues/comments/$EXISTING_ID" --jq .body)"
  if grep -q "ux-review-sha: $SHA" <<<"$EXISTING_BODY" && ! grep -q '^## UX review: .* error$' <<<"$EXISTING_BODY"; then
    log "commit ${SHA:0:7} already has a review. Use --force to run again."
    exit 0
  fi
fi

WORK="$(mktemp -d "/tmp/gosciniec-ux-review-$PR-XXXX")"
log "work dir $WORK"

# 1. Wait for the visual-review run of this commit.
RUN_ID=""
for _ in $(seq 1 $((WAIT_MINUTES * 4))); do
  read -r RUN_ID RUN_STATUS < <(gh run list --repo "$REPO" --workflow visual-review.yml \
    --commit "$SHA" --json databaseId,status --jq '.[0] | "\(.databaseId) \(.status)"' 2>/dev/null)
  [[ "${RUN_STATUS:-}" == "completed" ]] && break
  sleep 15
done
if [[ "${RUN_STATUS:-}" != "completed" ]]; then
  log "no completed visual-review run for ${SHA:0:7} after $WAIT_MINUTES min. Stop."
  exit 0
fi
gh run download "$RUN_ID" --repo "$REPO" -n visual-review -D "$WORK/visual" >/dev/null 2>&1 ||
  log "the visual-review artifact is missing (run $RUN_ID)."

# 2. CI results and Lighthouse reports of the same commit.
CI_ID="$(gh run list --repo "$REPO" --workflow ci.yml --commit "$SHA" --json databaseId --jq '.[0].databaseId')"
if [[ -n "$CI_ID" ]]; then
  gh run view "$CI_ID" --repo "$REPO" --json jobs --jq '[.jobs[] | {name, conclusion}]' >"$WORK/ci-jobs.json"
  gh run download "$CI_ID" --repo "$REPO" -n lighthouse-reports -D "$WORK/lighthouse" >/dev/null 2>&1 || true
fi
node "$ROOT/scripts/lighthouse-summary.mjs" "$WORK/lighthouse" >"$WORK/lighthouse-summary.json" 2>/dev/null ||
  echo '{"note":"no Lighthouse reports"}' >"$WORK/lighthouse-summary.json"
gh pr view "$PR" --repo "$REPO" --json title,body,files >"$WORK/pr.json"

# 3. The reviewer agent. It may only read files and write review.json in the work dir.
sed "s/{{PR}}/$PR/g" "$ROOT/.sandcastle/ux-review-prompt.md" >"$WORK/prompt.md"
AGENT_OK=1
(
  cd "$WORK" &&
    timeout 1500 claude -p "$(cat prompt.md)" --model "$MODEL" \
      --allowedTools "Read" "Glob" "Grep" "Edit(./review.json)" \
      --output-format text >"$WORK/agent.log" 2>&1
) || AGENT_OK=0

# 3b. Claude limit: run the same review with the local Cursor CLI (issue #58).
CURSOR_BIN="$(command -v agent || true)"
[[ -z "$CURSOR_BIN" && -x "$HOME/.local/bin/agent" ]] && CURSOR_BIN="$HOME/.local/bin/agent"
if [[ ! -s "$WORK/review.json" ]] && grep -Eqi "$LIMIT_RE" "$WORK/agent.log"; then
  if [[ -n "${CURSOR_API_KEY:-}" && -n "$CURSOR_BIN" && "${UX_REVIEW_CURSOR:-1}" != "0" ]]; then
    log "Claude reached its limit. Run the review with the Cursor CLI ($CURSOR_MODEL_UX)."
    mv "$WORK/agent.log" "$WORK/agent-claude.log"
    # Cursor CLI permissions for this work dir: no shell, no web, no MCP, no writes outside it.
    mkdir -p "$WORK/.cursor"
    cat >"$WORK/.cursor/cli.json" <<'JSON'
{
  "permissions": {
    "allow": ["Read(**)", "Write(review.json)"],
    "deny": ["Shell(*)", "WebFetch(*)", "Mcp(*:*)", "Write(/workspace/**)", "Write(/home/**)",
             "Read(/workspace/**/.env*)", "Read(/home/**/.env*)", "Read(/home/*/.config/**)"]
  }
}
JSON
    AGENT_OK=1
    (
      cd "$WORK" &&
        CURSOR_API_KEY="$CURSOR_API_KEY" timeout 1500 "$CURSOR_BIN" -p "$(cat prompt.md)" \
          --model "$CURSOR_MODEL_UX" --output-format text --force --trust --workspace "$WORK" \
          >"$WORK/agent.log" 2>&1
    ) || AGENT_OK=0
    [[ -s "$WORK/review.json" ]] && MODEL="$CURSOR_MODEL_UX (Cursor CLI)"
  else
    log "Claude reached its limit. No Cursor CLI fallback (CURSOR_API_KEY or agent is missing)."
  fi
fi
if [[ "$AGENT_OK" != 1 || ! -s "$WORK/review.json" ]]; then
  log "the reviewer agent ended with an error (see $WORK/agent.log)."
  # Last line of the agent output (for example "You've hit your limit"), without token-like words.
  UX_AGENT_ERROR="$(tail -n 1 "$WORK/agent.log" | cut -c1-160 | sed -E 's/[A-Za-z0-9_-]{32,}/[hidden]/g')"
  export UX_AGENT_ERROR
fi
log "reviewer: $MODEL"

# 4. Post or update the comment, set or remove the label.
node --no-warnings "$ROOT/scripts/ux-review-format.ts" "$WORK/review.json" "$SHA" >"$WORK/comment.md"
VERDICT="$(sed -n 's/^## UX review: [^ ]* \(.*\)$/\1/p' "$WORK/comment.md" | head -n 1)"
if [[ -n "$EXISTING_ID" ]]; then
  gh api -X PATCH "repos/$REPO/issues/comments/$EXISTING_ID" -F "body=@$WORK/comment.md" >/dev/null &&
    log "comment $EXISTING_ID updated."
else
  gh pr comment "$PR" --repo "$REPO" --body-file "$WORK/comment.md" >/dev/null && log "comment posted."
fi
if [[ "$VERDICT" == "regression" ]]; then
  gh pr edit "$PR" --repo "$REPO" --add-label ux-regression >/dev/null
elif [[ "$VERDICT" != "error" ]]; then
  gh pr edit "$PR" --repo "$REPO" --remove-label ux-regression >/dev/null 2>&1 || true
fi
log "verdict: ${VERDICT:-unknown}"
exit 0
