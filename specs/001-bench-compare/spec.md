# Feature Specification: 計測結果の比較表示

**Feature Branch**: `001-bench-compare`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "bench/measure.mjs に --compare A B を追加し、2つの計測結果JSONの差分（常時コスト・各スキル・ワークフロー）を表で表示する"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 最適化前後の差分を一目で見る (Priority: P1)

スキルを書き換えた開発者が、変更前と変更後の計測結果ファイルを指定して、どの項目が何トークン増減したかを表で確認する。

**Why this priority**: 「計測してから変える」原則（憲章 II）の要。今は2つの JSON を目視で見比べており、増減の見落としが起きる。

**Independent Test**: `bench/results/` にある2ファイルを指定して実行し、常時コスト・各スキル・各ワークフローの前後値と差分が表示されれば完了。

**Acceptance Scenarios**:

1. **Given** 2つの結果ファイル A（前）と B（後）がある, **When** `node bench/measure.mjs --compare A B` を実行する, **Then** 常時コストの内訳、スキル/コマンドごと、ワークフローごとに「前 / 後 / 差分」の3列を持つ表が表示される
2. **Given** B にだけ存在するスキルがある, **When** 比較する, **Then** そのスキルは「前」が空欄で「後」の値と差分（＝後の値）が表示され、A にだけあるものはその逆になる
3. **Given** A と B が同一内容, **When** 比較する, **Then** 全ての差分が 0 と表示され、合計行も 0 になる

---

### User Story 2 - 最新の2件を指定なしで比較する (Priority: P2)

開発者がファイル名を調べずに、`bench/results/` の最新2件（このプロジェクトの計測に限る）を比較する。

**Why this priority**: 計測→比較の繰り返しで毎回ファイル名をコピーするのは手間。P1 が無いと成り立たないので P2。

**Independent Test**: 引数なしの `--compare` で、直近2回の計測が比較されれば完了。

**Acceptance Scenarios**:

1. **Given** `bench/results/` にこのプロジェクトの結果が3件以上ある, **When** `node bench/measure.mjs --compare` を実行する, **Then** 最新2件（古い方を「前」）が比較される
2. **Given** 結果が1件以下, **When** 引数なしで実行する, **Then** 比較できない旨のエラーで終了する

---

### Edge Cases

- ワークフロー定義が A と B で異なる（`workflows.json` を編集した）場合、両方に存在する名前だけ比較し、片方にしかないものは片側空欄で表示する。
- MCP サーバーが片方だけ計測できていない（未ビルド）場合、その行は片側空欄になる。
- 指定ファイルが存在しない、または JSON として読めない場合はエラーで終了する。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `--compare A B` は A を「前」、B を「後」として読み込み、常時コスト（CLAUDE.md、スキル一覧、コマンド一覧、エージェント一覧、MCP サーバーごと、合計）の前後値と差分を表示しなければならない
- **FR-002**: スキルとコマンドごとに、本文トークンと無条件の参照トークンの合計について前後値と差分を表示しなければならない
- **FR-003**: ワークフローごとに合計の前後値と差分を表示しなければならない
- **FR-004**: 片方にしか無い項目は、無い側を空欄にし、差分は存在する側の値（前だけなら負、後だけなら正）として表示しなければならない
- **FR-005**: 差分は符号付きで表示しなければならない（例: `+120`, `-340`, `0`）
- **FR-006**: 引数なしの `--compare` は、`bench/results/` のうち `--root` で外部を測った結果（ラベルが `kit-` で始まるもの）を除いた最新2件を、古い方を「前」として比較しなければならない
- **FR-007**: 比較対象が2件揃わない、ファイルが無い、JSON が不正な場合は、理由を示すメッセージを出して終了コード 1 で終了しなければならない
- **FR-008**: `--compare` 実行時は計測を行わず、結果ファイルも新規保存してはならない

### Key Entities *(include if feature involves data)*

- **計測結果**: `bench/results/*.json`。ラベル、常時コスト内訳、スキル/コマンドの配列、ワークフローの配列を持つ
- **比較行**: 項目名、前の値、後の値、差分

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 開発者は2ファイルを指定して1コマンドで、増減した項目を10秒以内に特定できる
- **SC-002**: 比較表の差分の符号と値は、2つの JSON を手で引き算した結果と全項目で一致する
- **SC-003**: 引数なしの比較は、ファイル名を一切入力せずに直近2回の計測を比較できる

## Assumptions

- 結果 JSON の形式は現在の `measure.mjs` が保存するもの（`alwaysOn`, `skills`, `commands`, `agents`, `mcp`, `workflows`）とする
- 出力先は標準出力の等幅テキストのみ。JSON 出力や色付けは対象外
- 3ファイル以上の比較、履歴のグラフ化は対象外
