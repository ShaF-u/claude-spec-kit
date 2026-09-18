# Implementation Plan: 計測結果の比較表示

**Branch**: `main`（ブランチはユーザー管理。feature ディレクトリは `001-bench-compare`） | **Date**: 2026-09-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-bench-compare/spec.md`

## Summary

`bench/measure.mjs` に `--compare [A B]` を追加する。2つの計測結果 JSON を読み、常時コスト・スキル/コマンド・ワークフローの3表を「前 / 後 / 差分」で表示する。引数なしなら `bench/results/` のうち `kit-` ラベルを除いた最新2件を比較する。計測ロジックとは独立した `bench/lib/compare.mjs` に実装し、`measure.mjs` は `--compare` を見つけたら計測をせずにそれを呼んで終了する。

## Technical Context

**Language/Version**: Node.js 24（ESM、`.mjs`）

**Primary Dependencies**: なし（`node:fs`, `node:path` のみ。憲章「依存を増やさない」）

**Storage**: `bench/results/*.json`（読み取りのみ）

**Testing**: `node --test`（Node 標準のテストランナー）で `bench/lib/compare.test.mjs`

**Target Platform**: Windows / macOS / Linux のターミナル

**Project Type**: CLI（既存スクリプトへのサブコマンド追加）

**Performance Goals**: 数十 KB の JSON 2つの読み込みと整形。100ms 以内（実質的に制約なし）

**Constraints**: 出力は等幅テキストのみ。`--compare` 時に結果ファイルを保存しない（FR-008）

**Scale/Scope**: スキル数〜30、ワークフロー数〜10 程度

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 判定 | 根拠 |
|---|---|---|
| I. コンテキスト効率が第一 | pass | 常時コストに影響しない（bench 配下のみ） |
| II. 計測してから変える | pass | この機能自体が計測の比較を楽にする。スキルは変更しない |
| III. 手順は落とさない | pass | スキル変更なし |
| IV. 重い作業は委譲する | pass | 実装は `/speckit-implement` がタスクごとに委譲する |
| 制約: 依存を増やさない | pass | 標準モジュールのみ |
| 制約: 生成物は日本語 | pass | 表の見出し・メッセージは日本語 |

再チェック（Phase 1 後）: 設計はモジュール1つとテスト1つの追加のみ。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/001-bench-compare/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
└── tasks.md             # /speckit-tasks
```

`contracts/` は作らない（外部に公開するインターフェースは CLI 引数のみで、quickstart に記載する）。

### Source Code (repository root)

```text
bench/
├── measure.mjs          # 変更: --compare を検出したら compare.mjs に委譲して終了
├── lib/
│   ├── compare.mjs      # 新規: 結果の読み込み、行の突き合わせ、表の整形
│   └── compare.test.mjs # 新規: node --test
└── results/             # 入力
```

**Structure Decision**: 既存の `bench/lib/` 構成に倣い、ロジック（純粋関数）と表示を `compare.mjs` にまとめ、`measure.mjs` からは1関数を呼ぶだけにする。テストは純粋関数（突き合わせ・差分計算）を対象にし、ファイル I/O はテストしない。

## Complexity Tracking

違反なし。
