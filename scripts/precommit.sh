#!/usr/bin/env bash
# Run the local gates before each commit. Same commands as .sandcastle/checks.json.
# Lighthouse is not here: the GitHub `lighthouse` job is the gate (docs/checks.md).
set -euo pipefail
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:redirects
npm run test:schema
npm run test:e2e
