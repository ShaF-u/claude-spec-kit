# Research: 計測結果の比較表示

Technical Context に NEEDS CLARIFICATION は無い。決定事項のみ記録する。

## テストランナー
- **Decision**: `node --test`（Node 標準）
- **Rationale**: 依存を増やさない制約。Node 24 では安定機能で、`*.test.mjs` を自動検出できる
- **Alternatives considered**: vitest / jest（依存追加になるため却下）

## 「最新2件」の決め方
- **Decision**: `bench/results/` のファイル名先頭の ISO 日時（`2026-09-18T09-41-23-370Z_...`）で辞書順ソートし、末尾2件を取る。`_kit-` を含むファイル名は除外
- **Rationale**: `measure.mjs` が保存時に必ずこの形式で命名しており、ファイルの更新日時より確実
- **Alternatives considered**: JSON 内の `measuredAt` を読む（全ファイルを開く必要があり無駄）

## 差分の表示
- **Decision**: `+120` / `-340` / `0` の符号付き整数。片側しか無い項目は無い側を空欄
- **Rationale**: spec FR-004/FR-005 の通り。パーセント表示は小さい値で誤解を招くため付けない
