# speckit-tasks 要件チェックリスト

## 前提
- [ ] `setup-tasks.ps1 -Json` を実行し FEATURE_DIR / TASKS_TEMPLATE_CONTENT / TASKS_TEMPLATE / AVAILABLE_DOCS を得る（TASKS_TEMPLATE_CONTENT が無い古いスクリプトなら TASKS_TEMPLATE を読む）
- [ ] 必須: plan.md（技術スタック・構成）、spec.md（優先度付きユーザーストーリー）。任意: data-model.md / contracts/ / research.md / quickstart.md。constitution.md があれば読む。無い文書があっても生成する
- [ ] `$ARGUMENTS` は生成のコンテキスト

## 生成
- [ ] ユーザーストーリー単位で編成（独立に実装・テストできるように）
- [ ] テストタスクは spec が要求するか TDD 指示がある時だけ
- [ ] フェーズ: 1 Setup、2 Foundational（全ストーリーの前提）、3+ ストーリーごと（優先度順、各フェーズにゴール・独立テスト基準・（テスト）・実装タスク）、最終 Polish
- [ ] ストーリー内の順序: Tests → Models → Services → Endpoints → Integration
- [ ] contracts → 対応ストーリーへ（テスト要求時は実装前に契約テスト [P]）
- [ ] data-model のエンティティ → 必要なストーリーへ（複数なら最初のストーリーか Setup）。制約（長さ・必須・enum・検証）はタスク文に原文引用
- [ ] 共有インフラ→Setup、ブロッキング→Foundational、ストーリー固有→そのフェーズ
- [ ] 依存グラフ（ストーリー完了順）、ストーリーごとの並行実行例、実装戦略（MVP優先・段階的）
- [ ] 完全性検証（各ストーリーに必要タスクが揃い独立テスト可能）

## タスク形式（厳守）
- [ ] `- [ ] T001 [P?] [US1?] 説明（正確なファイルパス）`
- [ ] ID は実行順の連番。[P] は別ファイルかつ未完了タスクに依存しない時だけ。[USn] はストーリーフェーズのみ（Setup/Foundational/Polish には付けない）
- [ ] 各タスクは追加コンテキストなしで LLM が実行できる具体性

## 完了報告
- [ ] tasks.md のパス、総タスク数、ストーリー別数、並行機会、各ストーリーの独立テスト基準、MVP範囲（通常 US1）、形式検証（全タスクが形式に従う）
- [ ] 日本語で報告
