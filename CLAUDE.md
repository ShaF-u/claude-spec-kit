# claude-spec-kit

spec-kit を Claude Code 向けにコンテキスト効率で最適化したスペックキット。`context/`（サブモジュール）は context-templates（Core MCPサーバー + AI/Docs/Shared テンプレート）。

作業前に `@AI/STRUCTURE.md` と `@AI/DECISIONS.md` を読む。探索はそこに書いてある範囲で済ませる。

## ルール
- 生成物・報告は日本語。スキルの指示文は英語（トークン効率のため）。
- `.claude/skills/speckit-*` を変えたら `node bench/measure.mjs` で計測し、`bench/requirements/<skill>.md` に照合する。目標: 常時 ≤ 400（キット分）、core ワークフロー ≤ 8,000。
- `context/` の中身はここで編集しない（上流リポジトリで変更してサブモジュールを進める）。
- ブランチの作成・切替はユーザーが行う。
