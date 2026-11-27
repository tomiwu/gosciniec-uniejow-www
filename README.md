# gosciniec-uniejow-www

New website of the hotel **Gościniec Uniejów** (https://gosciniecuniejow.pl/), phase 1: a static site.

- **Visibility: PRIVATE.** The repository contains hotel data. Later phases add payment code. No licence is granted.
- Stack: Next.js (App Router, static export) + TypeScript. Deploy: plain files on webd.pl shared hosting.
- Product requirements: [docs/PRD.md](docs/PRD.md). Terms: [GLOSSARY.md](GLOSSARY.md). Agent rules: [CLAUDE.md](CLAUDE.md).
- Work flow: GitHub issues with the label `Sandcastle` -> Sandcastle loop on the box (Claude Code in Podman) -> pull request -> all CI checks green -> Tomasz gives the OK -> squash merge.
- Local gate before each commit: `scripts/precommit.sh`.
- Loop on the box: `scripts/build-image.sh`, then `scripts/start-loop.sh`. After a box replacement: [docs/restore-loop.md](docs/restore-loop.md).
- Site copy is Polish. Code, docs, issues, PRs and commits are English (ASD-STE100).
