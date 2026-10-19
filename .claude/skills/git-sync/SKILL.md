---
name: git-sync
description: "Fetch and fast-forward the current branch from its upstream, updating submodules."
disable-model-invocation: true
---

Bring the current branch up to date with its upstream. Do not create or switch branches, force anything, or discard local changes.

## Steps

1. `git rev-parse --abbrev-ref HEAD`, `git status --porcelain=v1 -b`. Stop and report on detached HEAD or an in-progress merge/rebase.
2. `git fetch --all --prune`.
3. No upstream → report and stop (suggest `/git-commit` to push with `-u`).
4. `git rev-list --left-right --count 'HEAD...@{u}'` (quote `@{u}` in PowerShell) → ahead A / behind B.
   - B = 0 → already up to date (mention A unpushed commits if any).
   - A = 0, B > 0 → `git pull --ff-only`. If it refuses because of local changes, report the conflicting files and stop (do not stash or reset).
   - A > 0 and B > 0 (diverged) → do nothing; show both sides (`git log --oneline 'HEAD..@{u}'` and `'@{u}..HEAD'`) and ask the user whether to rebase or merge.
5. If the pull changed the `context` gitlink: `git submodule update --init --recursive`.

## Report (Japanese)

```
## 同期
- ブランチ: <branch> ← <upstream>
- 結果: 最新 / <N>コミット取り込み（ff） / 分岐あり（要判断） / 中断（<理由>）
- 取り込んだコミット: <short sha> <subject> ...（最大5件、残りは件数）
- 未プッシュ: <N>件 / なし
- サブモジュール: 更新 / 変化なし
```
