# Task

You work on `{{PROJECT}}`, issue #{{ISSUE}}, branch `{{BRANCH}}`. The branch has a merge conflict with `{{BASE}}`. Other pull requests changed the same files.

Files with a conflict:

```
{{CONFLICTS}}
```

# Steps

1. Run `git merge --no-edit {{BASE}}`. Do not rebase. Do not reset. Do not fetch (`{{BASE}}` is up to date).
2. Resolve each conflict. Keep the intent of BOTH sides: the work of this issue and the work that is already on `{{BASE}}`. Do not drop code, styles or tests from either side. If both sides add blocks at the same place, keep both blocks.
3. Run all commands in `.sandcastle/checks.json`. Fix the failures that the merge caused.
4. Commit the merge with the message `RALPH: #{{ISSUE}} merge {{BASE}}` and a short list of the resolved files.

The host pushes. Nobody but Tomasz merges. Do not edit `docs/PRD.md`, `.sandcastle/` or `.claude/`.

When you are done, output:

<promise>COMPLETE</promise>
