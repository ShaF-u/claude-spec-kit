---
name: git-branches
description: "Show all local/remote branches with tracking state, plus status, stashes and worktrees."
disable-model-invocation: true
argument-hint: "[--offline]"
---

Read-only overview of the repository's branches. Do not create, switch, delete, merge, or push anything.

## Steps

1. Unless `$ARGUMENTS` has `--offline`: `git fetch --all --prune --quiet` (updates remote refs only).
2. Default branch: `git symbolic-ref --short refs/remotes/origin/HEAD` (fallback `main`).
3. Collect (run in parallel):
   - Local: `git for-each-ref --sort=-committerdate refs/heads --format='%(HEAD)|%(refname:short)|%(upstream:short)|%(upstream:track)|%(committerdate:short)|%(objectname:short)|%(subject)'`
   - Remote: `git for-each-ref --sort=-committerdate refs/remotes --format='%(refname:short)|%(committerdate:short)|%(objectname:short)|%(subject)'` (skip `*/HEAD`)
   - Merged into default: `git branch --merged <default> --format='%(refname:short)'`
   - `git status -sb`, `git stash list`, `git worktree list`
4. Remote branches with no local counterpart are "リモートのみ".

## Report (Japanese)

```
## ブランチ一覧（既定: <default>、現在: <branch>）
### ローカル
| | ブランチ | 追跡先 | 状態 | 最終コミット | 内容 |
|---|---|---|---|---|---|
| * | main | origin/main | 同期済み / ↑2 ↓1 / 追跡なし / 追跡先削除済み | 2026-10-19 abc1234 | <subject> |
### リモートのみ
| ブランチ | 最終コミット | 内容 |
### 作業ツリー
- 未コミット: <N>件 / なし ・ stash: <N>件 ・ worktree: <N>個
### 整理候補
- <default> にマージ済み: <branches>（削除は `git branch -d <name>`、実行はユーザー判断）
- 追跡先削除済み: <branches>
```

Omit empty sections. Do not suggest commands that switch branches.
