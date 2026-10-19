---
name: git-commit
description: "Commit all changes and push, syncing project docs first."
disable-model-invocation: true
argument-hint: "[message hint] [--no-push]"
---

Commit the working tree and push the current branch. `$ARGUMENTS` may hold a message hint and/or `--no-push`.

Never create, switch, or delete branches. Never force-push, amend, or pass `--no-verify`. Never edit inside `context/` (submodule).

## Steps

1. **Preflight**: `git status --porcelain=v1 -b` and `git rev-parse --abbrev-ref HEAD`.
   - Stop and report if: detached HEAD, merge/rebase/cherry-pick in progress, or unmerged paths.
   - Nothing to commit and nothing unpushed → report "変更なし" and stop. Nothing to commit but unpushed commits → skip to step 6.
2. **Review changes**: `git diff HEAD --stat`, untracked files, then `git diff HEAD -- <path>` for files whose purpose is unclear from the stat.
   - Exclude anything that looks like a secret or local artifact (`.env*`, `*.pem`, `*.key`, credentials, large binaries, build output not already tracked). List exclusions in the report.
   - `context` gitlink changed → keep it only if the submodule was deliberately advanced (its HEAD is a commit on its remote); otherwise exclude and report.
3. **Sync docs** (edit only what the changes made stale; read just the relevant section via grep first; minimal edits):
   - Folders, files, or skill layout changed → `AI/STRUCTURE.md` (its own update rule requires the same commit).
   - Commands, usage, or numbers shown to users changed → `README.md` (and `bench/README.md` for bench changes).
   - A roadmap item was finished or added → `ROADMAP.md` (root or `Docs/`) if it exists: check it off / add it.
   - A rule or workflow for the AI changed → `CLAUDE.md`. Keep it short: it is loaded every session.
   - A design choice was explicitly settled by the user in this session → `AI/DECISIONS.md`. Do not invent decisions.
4. **Checks** (stop before committing on failure and report the output):
   - `.claude/skills/speckit-*` changed → `node bench/measure.mjs` (targets: kit always-on ≤ 400, core ≤ 8,000) and `node bench/validate.mjs`.
   - `bench/**/*.mjs` changed → `node --test "bench/**/*.test.mjs"`.
5. **Commit**:
   - Stage explicit paths (all reviewed changes + doc edits, minus exclusions). Prefer `git add -A` then `git reset -- <excluded>`.
   - Message in Japanese, matching the style of `git log --oneline -10`: one subject line saying what changed and why; a body only when the why needs more. Use the hint if given. Append the commit attribution trailer if the session provides one.
   - Write the message to a temp file in the scratchpad and run `git commit -F <file>`.
   - Hook fails → fix the cause, re-stage, and make a new commit attempt.
6. **Push** (skip if `--no-push`): upstream set → `git push`; else `git push -u origin <branch>`. Rejected (non-fast-forward) → stop and suggest `/git-sync`.

## Report (Japanese, always)

```
## コミット & プッシュ
- ブランチ: <branch> → <remote/branch | 未プッシュ>
- コミット: <short sha> <subject>
- 含めたファイル: <N>件（主なもの: ...）
- 自動更新したドキュメント: <file>: <何を変えたか> / なし
- 除外したファイル: <file>（理由） / なし
- 検査: <コマンド>: <結果> / 対象なし
- プッシュ: 成功 / スキップ / 失敗（<理由>）
```
