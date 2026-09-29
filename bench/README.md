# スペックキットのコンテキスト量ベンチマーク

このプロジェクトのClaude Code設定が、どれだけコンテキストを消費するかを測る。

```
node bench/measure.mjs            # 結果を表で表示 + bench/results/ にJSON保存
node bench/measure.mjs --json     # JSONのみ
node bench/measure.mjs --root DIR --label NAME   # 別ディレクトリの設定を測る
```

## 2つの軸

Claude Codeはスキル/コマンドの**名前と説明だけ**を起動時に読み、本文は呼び出されたときに読む。
なので「起動時に毎回乗る量」と「使ったときに乗る量」は別物として測る。

| 軸 | 何が入るか |
|---|---|
| **always-on** | `CLAUDE.md`（と`@`インポート先）、スキル/コマンド/エージェントの一覧行、接続中のMCPサーバーのツール定義（サーバーが起動できる場合のみ実測） |
| **on-invoke** | スキル/コマンドの本文 + 本文が読めと指示している`.specify/`配下のファイル（スクリプトは実行されるだけなので除外） |
| **workflows** | `bench/workflows.json` に定義した手順ごとに on-invoke を合計 |

トークン数は簡易推定（ASCIIは4文字/トークン、日本語等は1文字/トークン）。同じ推定を全変種に使うので比率は意味を持つ。絶対値は目安。

## 静的計測の限界

生成物（spec.md/plan.md/tasks.md）の読み書き、スクリプトの出力、モデル自身の思考・ツール呼び出しは含まない。
「指示のために固定で払うコスト」を比較する道具であり、実セッションの総量ではない。

## 変種の比較

`bench/results/` に `<日時>_<ブランチ@sha>.json` で残るので、最適化前後や別ブランチのファイルを見比べる。

## 結果の比較（--compare）

```
node bench/measure.mjs --compare A.json B.json   # 指定した2件を比較
node bench/measure.mjs --compare                 # bench/results/ の最新2件を比較
```

always-on / skills・commands / workflows の3表を `項目 | 前 | 後 | 差分` で表示する。計測も保存もしない。
引数なしのときはファイル名の辞書順（日時順）で最新2件を選ぶ。`--root` で測った外部キットの結果（`_kit-` を含む）は選択対象から除く。
