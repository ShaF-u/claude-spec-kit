# プロジェクト構造マップ

| パス | 役割 |
|---|---|
| `.claude/skills/speckit-*/` | スペックキット本体。`SKILL.md` は薄く、条件付きの詳細は `rules/*.md` |
| `.claude/skills/{verification-before-completion,systematic-debugging,test-driven-development}/` | superpowers 由来の汎用スキル（実装・デバッグ時に使う） |
| `.claude/skills/gh-*/` | akiojin 由来の GitHub PR/Issue スキル |
| `.specify/templates/` | spec / plan / tasks / constitution / checklist のテンプレート（スキルがコピーして使う） |
| `.specify/scripts/powershell/` | feature ディレクトリ作成や前提確認のスクリプト（スキルが実行する） |
| `.specify/memory/constitution.md` | プロジェクト原則。各スキルが読む |
| `specs/<NNN-name>/` | 生成物（spec.md, plan.md, research.md, data-model.md, quickstart.md, tasks.md, checklists/）。`001-bench-compare` はキットで1周回した実例 |
| `bench/` | コンテキスト量ベンチマーク。`measure.mjs` が本体（`--compare` で2結果の差分）、`lib/compare.mjs` が比較ロジック、`requirements/` は各スキルの要件チェックリスト、`results/` は計測履歴 |
| `Docs/` | 人向け。`kit-comparison.md` は他キットとの比較と取り込み方針 |
| `context/` | サブモジュール。`context/Core` が MCP サーバー（ユーザースコープに登録、設定はルートの `aistudio.config`）、`context/AI` `Shared` がテンプレート原本 |
| `THIRD_PARTY_NOTICES.md` | 同梱スキルの出典とライセンス |

## 主要機能とその場所
- 仕様→計画→タスク→実装の流れ: `speckit-specify` → (`speckit-clarify`) → `speckit-plan` → `speckit-tasks` → `speckit-implement`
- 計測: `node bench/measure.mjs`（`--root DIR` で他プロジェクトも測れる）、比較: `node bench/measure.mjs --compare [A B]`
- テスト: `node --test "bench/**/*.test.mjs"`（`node --test bench/` は Node 24 では動かない）

## 探索不要なパス
- `context/build/` — ビルド成果物
- `bench/results/` — 計測 JSON の履歴（比較したい時だけ）
- `context/Core/` — MCP サーバーの C++ 実装。変更はここではなく上流で

## 更新ルール
フォルダ構成やスキルの配置が変わったら、このファイルも同じコミットで更新する。
