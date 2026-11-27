#!/usr/bin/env bash
# Build the loop image in the own podman store of this project.
set -euo pipefail
cd "$(dirname "$0")/.."
# shellcheck disable=SC1091
source scripts/podman-env.sh
podman build -t localhost/sandcastle:gosciniec-uniejow-www \
  --build-arg AGENT_UID="$(id -u)" --build-arg AGENT_GID="$(id -g)" \
  -f .sandcastle/Containerfile .sandcastle
podman run --rm --entrypoint sh localhost/sandcastle:gosciniec-uniejow-www \
  -c 'touch /tmp/smoke && node -v && claude --version && gh --version | head -1 && "$CHROME_PATH" --version'
