# speckit-plan 要件チェックリスト

- [ ] `setup-plan.ps1 -Json` を実行し FEATURE_SPEC / IMPL_PLAN / FEATURE_DIR / BRANCH を得る
- [ ] FEATURE_SPEC と constitution.md を読む。IMPL_PLAN テンプレートは既にコピー済み
- [ ] テンプレート構造に従い: Technical Context（不明は NEEDS CLARIFICATION）、Constitution Check、ゲート評価（正当化できない違反は ERROR）
- [ ] Phase 0: Technical Context の不明点→調査タスク、依存→ベストプラクティス、連携→パターン。調査エージェントを投げ research.md に Decision / Rationale / Alternatives で集約。NEEDS CLARIFICATION を全て解消
- [ ] Phase 1（research.md 完了が前提）: spec のエンティティ→data-model.md（名前・フィールド・関係・検証・状態遷移）。外部インターフェースがあれば contracts/（公開API・CLIスキーマ・エンドポイント・文法・UI契約。内部専用なら省略）。quickstart.md（前提・セットアップ・実行/テストコマンド・期待結果を書いた検証ガイド。契約やモデルは参照で済ませ、実装コードやテスト全文は書かない）
- [ ] 設計後に Constitution Check を再評価
- [ ] Phase 1 で終了。ファイル操作は絶対パス、文書内参照はプロジェクト相対
- [ ] ゲート失敗や未解決の明確化があれば ERROR
- [ ] 報告: ブランチ、IMPL_PLAN パス、生成物。日本語
- [ ] 追加（superpowers）: 調査はサブエージェントに委譲し結論だけ残す
