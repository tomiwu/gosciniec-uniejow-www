#!/usr/bin/env bash
# Run the local gates before each commit. Same commands as the CI jobs and .sandcastle/checks.json.
set -euo pipefail
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:redirects
npm run test:schema
npm run test:e2e
npm run lighthouse
