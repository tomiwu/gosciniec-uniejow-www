# Restore the Sandcastle loop after a box replacement

The box can be replaced or rebooted. Then the loop process is dead. Podman can be missing. Image layers in the shared podman store can be damaged (example 2026-11-27: images without `/tmp`, so `apt-get` failed in the build).

What survives: the repository in `/workspace/gosciniec-uniejow-www`, `.sandcastle/.env`, `/workspace/gosciniec-www-secrets/loop-webhook.env`, and the log `/workspace/gosciniec-www-loop.log`. `.sandcastle/node_modules` can be gone (`scripts/start-loop.sh` installs it again).

## Steps

1. Install podman (rootless, Debian):
   `sudo apt-get update && sudo apt-get install -y podman crun fuse-overlayfs slirp4netns uidmap passt`
2. Check `/etc/subuid` and `/etc/subgid` have a line for `box` (for example `box:100000:65536`).
3. Delete the old own store if its images are damaged (this store is used by this project only; never run `podman system reset`):
   `podman unshare rm -rf /home/box/.local/share/containers-gosciniec-www`
4. Build the image and run the smoke test: `scripts/build-image.sh`.
5. Make sure no old loop runs: `cat /tmp/gosciniec-www-loop.pid` and `kill -0 <pid>`.
6. Remove stale local worktrees: `git worktree prune`. A local `sandcastle/issue-N-*` branch with no commits and no open PR can be deleted. A branch with an open PR stays: the loop resumes that PR.
7. Start: `scripts/start-loop.sh`. Check: the pid is alive, `/tmp/gosciniec-www-loop.status.json` has a fresh `lastOutputAt`, and `podman ps` (with `source scripts/podman-env.sh`) shows a `sandcastle-*` container with the image `localhost/sandcastle:gosciniec-uniejow-www`.

## Why the loop has its own XDG_RUNTIME_DIR and store

- crun keeps container state in `$XDG_RUNTIME_DIR/crun`. On the box, the default value is a desktop-session dir (`/tmp/xdg-runtime-box-N`). The box deletes it when that session ends. A long Claude-limit pause kept the sandbox container, and after the pause each `podman exec` failed with `crun: error opening file .../status` and `git config ... exit 127`. `scripts/podman-env.sh` sets `XDG_RUNTIME_DIR=/tmp/xdg-runtime-gosciniec-www`.
- `.sandcastle/main.mts` now crashes (event `loop_crashed`) on a container-runtime error, instead of 12 pauses in a broken sandbox.
- The own store (`.sandcastle/podman-storage.conf`) can be deleted and rebuilt without a risk to the images of other loops on the box.

## Cursor CLI fallback (issue #58)

- On a Claude limit, the loop runs the same phase with the local Cursor CLI (`agent`, `CURSOR_MODEL`, default `composer-2.5`) in the same podman sandbox. The log shows `Phase <name>: agent <agent>` for each run.
- When the parsed reset time has passed, the next phase uses Claude again. If the Cursor CLI also fails, the loop pauses until the Claude reset.
- Requirements: the image has the Cursor CLI (`scripts/build-image.sh`), and `.sandcastle/.env` has `CURSOR_API_KEY=<key>`. Without the key, the loop logs `Cursor CLI fallback is off` and keeps the old pause. `CURSOR_FALLBACK=0` turns the fallback off.
- `.cursor/cli.json` has the same deny rules as `.claude/settings.json` (no push, no PR or API calls, no `.env` reads, no edits of `docs/PRD.md`, `.sandcastle/`, `.claude/`, `.cursor/`).
- Never use Cursor cloud agents.
