#!/usr/bin/env bash
# Start the Sandcastle loop of gosciniec-uniejow-www one time. Safe to call many times at the same moment.
# Fixed paths (the loop-health routine reads them):
#   pid    /tmp/gosciniec-www-loop.pid
#   status /tmp/gosciniec-www-loop.status.json (lastOutputAt)
#   log    /workspace/gosciniec-www-loop.log (appended)
set -euo pipefail
NAME=gosciniec-www
DIR="$(cd "$(dirname "$0")/.." && pwd)"
exec 9>"/tmp/${NAME}-loop.lock"
flock -n 9 || { echo "locked: another start is in progress"; exit 0; }
PIDFILE="/tmp/${NAME}-loop.pid"
if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "running: pid $(cat "$PIDFILE")"; exit 0
fi
if pgrep -f "${DIR}/.sandcastle/node_modules/.bin/tsx .sandcastle/main.mts" >/dev/null; then
  echo "running: a loop process exists without a pid file"; exit 0
fi
cd "$DIR"
# The box GH_TOKEN is invalid. Drop it, then load the project file (PAT, Claude token, webhook).
unset GH_TOKEN
[ -f .sandcastle/.env ] || { echo ".sandcastle/.env is missing" >&2; exit 1; }
set -a
# shellcheck disable=SC1091
source .sandcastle/.env
set +a
[ -n "${GH_TOKEN:-}" ] || { echo "GH_TOKEN is missing in .sandcastle/.env" >&2; exit 1; }
export PROJECT="${PROJECT:-gosciniec-uniejow-www}"
export STATUS_FILE="/tmp/${NAME}-loop.status.json"
export AUTO_MERGE=0
[ -x .sandcastle/node_modules/.bin/tsx ] || (cd .sandcastle && npm install --no-audit --no-fund)
LOG="/workspace/${NAME}-loop.log"
echo "=== start $(date -Is) ===" >>"$LOG"
setsid nohup bash -c "cd '$DIR' && exec '$DIR/.sandcastle/node_modules/.bin/tsx' .sandcastle/main.mts" >>"$LOG" 2>&1 9>&- &
echo $! >"$PIDFILE"
sleep 5
echo "started: pid $(cat "$PIDFILE") log $LOG"
