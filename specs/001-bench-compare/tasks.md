# Tasks: 計測結果の比較表示

**Input**: Design documents from `/specs/001-bench-compare/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: plan.md が `node --test` を指定しているのでテストタスクを含める（純粋関数のみ。ファイル I/O は対象外）。

**Organization**: ユーザーストーリー単位。US1（指定比較）だけで MVP として成立する。

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [X] T001 `bench/lib/compare.mjs` を作成し、空の `export function compareResults(a, b)`（比較行の生成）と `export function renderComparison(rows)`（表の整形）、`export async function runCompare(argv, benchDir)`（エントリ）の骨組みを置く

## Phase 2: Foundational

- [X] T002 `bench/measure.mjs` で `--compare` を検出したら計測も保存もせず `runCompare(args, benchDir)` を呼んで終了コードを返すようにする（`--compare` が無ければ既存動作のまま）

## Phase 3: User Story 1 - 最適化前後の差分を一目で見る (P1)

**Goal**: `--compare A B` で常時コスト・スキル/コマンド・ワークフローの3表を「前 / 後 / 差分」で表示する。
**Independent Test**: `bench/results/` の2ファイルで実行し、3表と符号付き差分が出る。

- [X] T003 [P] [US1] `bench/lib/compare.test.mjs` に `compareResults` のテストを書く: 同一入力で全差分 0、片側にしか無いスキル（before 空 / delta = after）、片側にしか無いワークフロー、MCP が片側だけ計測不可（`tokens` 無し）の行
- [X] T004 [US1] `compareResults(a, b)` を実装する（data-model.md の突き合わせ規則: 常時コストは固定キー順、スキル/コマンドとワークフローは name の和集合を A の順→B のみの順、値は `bodyTokens + readsTokens`、片側のみは無い側を null）。戻り値は `{ alwaysOn: rows, invocables: rows, workflows: rows }`
- [X] T005 [US1] `renderComparison(rows, labelA, labelB)` を実装する: 各表を `項目 | 前 | 後 | 差分` の等幅テキストで、差分は `+n` / `-n` / `0`、null は空欄、見出しは日本語
- [X] T006 [US1] `runCompare` で A, B の読み込み（存在しない・JSON 不正なら理由を出して終了コード 1）と表示を繋ぐ。`node bench/measure.mjs --compare <A> <B>` で quickstart.md の期待結果を満たすことを確認する

## Phase 4: User Story 2 - 最新の2件を指定なしで比較する (P2)

**Goal**: 引数なしの `--compare` で `bench/results/` の最新2件（`kit-` を除く）を比較する。
**Independent Test**: 引数なしで直近2回の計測が比較され、1件以下なら終了コード 1。

- [X] T007 [P] [US2] `bench/lib/compare.test.mjs` に最新2件の選択ロジック（ファイル名の辞書順、`_kit-` を含むものを除外、2件未満なら null）のテストを追加する
- [X] T008 [US2] `pickLatestPair(fileNames)` を `compare.mjs` に実装し、`runCompare` で引数が無い場合に `bench/results/` を読んで使う。2件揃わなければメッセージを出して終了コード 1

## Phase 5: Polish

- [X] T009 `bench/README.md` に `--compare` の使い方を追記する
- [X] T010 `node --test bench/` と quickstart.md の手順を通し、`bench/results/` の件数が増えていないこと（FR-008）を確認する

## Dependencies

- T001 → T002 → (T003, T004) → T005 → T006 → (T007, T008) → T009, T010
- US2 は US1 の `runCompare` に依存する

## Parallel Execution

- US1: T003（テスト）は T004（実装）と並行して書ける（別ファイル）
- US2: T007 と T008 も同様

## Implementation Strategy

MVP = Phase 1〜3（US1）。US2 は後から足せる。
