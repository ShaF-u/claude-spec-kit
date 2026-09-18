# Data Model: 計測結果の比較表示

## 計測結果（入力、既存の `measure.mjs` の保存形式）
- `label`: 文字列（例 `main@d9eb096`, `kit-cc-sdd`）
- `alwaysOn`: `{ claudeMd, skillListing, commandListing, agentListing, mcpTools, total }` 各整数
- `mcp[]`: `{ name, tokens? }`（`tokens` 無し = 計測不可）
- `skills[]` / `commands[]`: `{ name, bodyTokens, readsTokens }`
- `workflows[]`: `{ name, tokens }`

## 比較行（出力）
- `key`: 項目名（表示名）
- `before`: 整数 | 空（A に無い）
- `after`: 整数 | 空（B に無い）
- `delta`: `after - before`（片側のみなら存在する側の値に符号を付けたもの）

## 突き合わせ規則
- 常時コスト: 固定キー順（CLAUDE.md, skills listing, commands listing, agents listing, mcp:<name>…, TOTAL）
- スキル/コマンド: `name` で結合。値は `bodyTokens + readsTokens`。両方の名前の和集合を、A の順→B にだけあるもの の順で並べる
- ワークフロー: `name` で結合、同様
