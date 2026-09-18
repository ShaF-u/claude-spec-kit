<!--
Sync Impact Report
- Version change: (template) → 1.0.0
- Modified principles: 全て新規（テンプレートのプレースホルダから初版を作成）
- Added sections: Core Principles ×4, 制約, 開発ワークフロー, Governance
- Removed sections: なし
- Follow-up TODOs: なし
-->
# claude-spec-kit Constitution

## Core Principles

### I. コンテキスト効率が第一
Claude Code に毎回読み込ませるもの（CLAUDE.md、スキルの一覧行、MCP ツール定義）は最小に保たなければならない（MUST）。
スキル本文は呼び出し時にだけ読まれるので、手順だけを書き、条件付きでしか要らない詳細は `rules/*.md` に分離する。
根拠: このプロジェクトの目的そのものであり、常時コストは全セッションに掛かる。

### II. 計測してから変える
`.claude/skills/speckit-*` や `.specify/` を変更したら `node bench/measure.mjs` を実行し、
`bench/requirements/<skill>.md` のチェックリストに照合しなければならない（MUST）。数字と要件の両方を満たさない変更は取り込まない。
目標: 常時 ≤ 400（キット分）、core ワークフロー ≤ 8,000 トークン。

### III. 手順は落とさない
圧縮は「冗長性の除去」であって「手順の省略」ではない。スキルから振る舞いを削る場合は、
`bench/requirements/` の該当項目を先に更新し、理由を `AI/DECISIONS.md` に残さなければならない（MUST）。

### IV. 重い作業は委譲する
実装・調査・大量のファイル読み込みはサブエージェントに委譲し、メインの会話には結論と変更点だけを残す（SHOULD）。
完了を報告する前に、テストやビルドを実際に実行して確認する（MUST）。

## 制約

- 生成物と報告は日本語。スキルの指示文は英語（トークン効率）。
- ブランチの作成・切替はユーザーが行う。スキルは現在のブランチで作業する。
- `context/`（サブモジュール）の中身はこのリポジトリでは編集しない。上流で変更してから参照を進める。
- 依存を増やさない: `bench/` は Node.js 標準モジュールのみ。

## 開発ワークフロー

- 機能追加は `/speckit-specify` → (`/speckit-clarify`) → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` の順。
- スキルの変更はフォルダ構成が変わるなら `AI/STRUCTURE.md` を同じコミットで更新する。
- コミットは変更の理由を書く（何をしたかは diff で分かる）。

## Governance

この憲章は他の慣習に優先する。改定は `/speckit-constitution` で行い、semver で版を上げる
（MAJOR: 原則の削除・再定義、MINOR: 原則・セクションの追加、PATCH: 文言）。
レビュー時は原則 I〜IV への適合を確認する。

**Version**: 1.0.0 | **Ratified**: 2026-09-18 | **Last Amended**: 2026-09-18
