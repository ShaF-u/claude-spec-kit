# スペックキット比較（2026-09-18）

`bench/measure.mjs --root` で各キットを空プロジェクトにインストール（またはclone）して計測。
トークンは簡易推定（`bench/README.md`参照）。数字は「指示のために固定で払う量」であり、生成物やモデルの作業分は含まない。

## 数字

| キット | 常時（毎セッション） | 典型1周 | 1周の内訳 |
|---|---|---|---|
| **spec-kit**（github/spec-kit） | 339 | **18,145** | constitution 3.1k / specify 5.2k / plan 2.6k / tasks 3.4k / implement 3.8k |
| cc-sdd（gotalab, Kiro流） | 1,472 | 31,366 | init 0.9k / requirements 4.0k / **design 12.5k** / tasks 6.1k / impl 7.8k |
| OpenSpec（Fission-AI） | 590 | 11,296 | propose 4.4k / apply 2.8k / archive 4.1k |
| superpowers（obra） | 558 | 6,091 | brainstorming 3.8k / writing-plans 1.7k / executing-plans 0.5k |
| BMAD-METHOD v6 | 1,919 | 15,997 | prd 5.7k / architecture 4.9k / epics 4.0k / build 1.4k（4ステップ分のみ） |
| claude-kiro（angelsen） | 380 | 3,998 | create 2.4k / implement 0.8k / review 0.9k |
| akiojin/skills speckit | 307 | （spec-kit本体を読むので同等） | 薄いラッパー |

常時コストはどのキットも小さい（最大でもBMADの1.9k）。「起動時に毎回読み込まれて重い」は杞憂で、**差が出るのは呼び出し時**。

## 各キットの取り込む価値がある部分

### spec-kit（ベース）
- 成果物の設計（constitution / spec / plan / tasks）、feature ブランチ・ディレクトリを作るスクリプト、clarifyの構造化質問。
- 悪い点: 全スキルに「extensions.yml のフック確認」約530トークンが重複（1周で約3.7k、全体で約6.9k）。本文が説明的で長い。

### cc-sdd
- **段階的開示**: SKILL.md を薄くし、`rules/*.md` を必要なステップでだけ読む構造。design には light/full の2段階がある。この「構造」は良いが、rules 自体が大きく合計では spec-kit より重い。
- EARS 記法（WHEN/IF … THEN THE SYSTEM SHALL …）の要件テンプレート。要件が曖昧にならない。
- レビューゲート（人の承認）をステップ間に置く思想。
- steering（プロジェクト知識の常設）は、このプロジェクトでは `context/AI/STRUCTURE.md` `DECISIONS.md` が同じ役割を担うので不要。

### OpenSpec
- **差分仕様（delta spec）**: 変更ごとに ADDED / MODIFIED / REMOVED の差分だけを書き、archive で本体の仕様にマージする。既存機能の変更時に**仕様全体を読み直さなくてよい**ので、プロジェクトが育つほどコンテキスト削減効果が大きい。
- 一周が3ステップで軽い。

### superpowers
- **実装をサブエージェントに委譲**して、メインの会話を計画とレビューだけに保つ（executing-plans が540トークンで済む理由）。context-templates の基本方針（重い作業はforkへ）と一致。
- verification-before-completion（完了宣言の前に実際に確認する）ゲート。
- TDD スキルは任意で取り込める。

### claude-kiro
- 最小構成（3コマンド）。フックで「ファイル操作後に仕様のコンテキストを再注入する」発想は面白いが、hooks は常時動くので慎重に。

### BMAD
- 役割エージェント（PM/アーキテクト/dev）で分業。重く、このプロジェクトの目的（軽量）とは逆方向。見送り。

### akiojin/skills
- 出力を日本語固定、SPEC-ID命名、clarifyの質問は最大5つ＋推奨回答。運用ルールとして取り込む。コンテキスト面の利点はない。

## 結論: 組み合わせ方針

| 取り込むもの | 出どころ | 狙い |
|---|---|---|
| 成果物とスクリプト | spec-kit | ベース |
| 薄いSKILL.md + `rules/` の段階的開示、フック定型文の削除 | cc-sdd の構造 | 1周の指示コストを 18k → 8k 以下に |
| EARS 要件テンプレート | cc-sdd | 曖昧さの排除 |
| 差分仕様 + archive | OpenSpec | 既存機能の変更時に全体を読まない |
| 実装のサブエージェント委譲、完了前検証 | superpowers | 実装ログをメイン会話に残さない |
| 日本語出力、clarify ≤5問 | akiojin | 運用ルール |
| プロジェクト知識（STRUCTURE/DECISIONS） | context-templates | steering の代替 |

目標値: 常時 ≤ 400（キット分）、典型1周 ≤ 8,000（現状 18,145 の 55%減）。
実セッションの総量は、委譲と差分仕様が効くので指示コスト以上に下がる見込み。
