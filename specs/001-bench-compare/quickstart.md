# Quickstart: 計測結果の比較表示

## 前提
- Node.js 24 以上
- `bench/results/` に計測結果が2件以上ある（`node bench/measure.mjs` を2回実行すれば作れる）

## 実行
```
node bench/measure.mjs --compare bench/results/<A>.json bench/results/<B>.json
node bench/measure.mjs --compare      # 最新2件（kit- を除く）
```

## 期待結果
- 「always-on」「skills / commands」「workflows」の3表が、各行 `項目 | 前 | 後 | 差分` で表示される
- 差分は符号付き。片側にしか無い項目は無い側が空欄
- 結果ファイルは新しく作られない（`bench/results/` の件数が変わらない）
- 引数なしで結果が1件以下なら、メッセージを出して終了コード 1

## テスト
```
node --test "bench/**/*.test.mjs"
```
