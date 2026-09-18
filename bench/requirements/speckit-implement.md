# speckit-implement 要件チェックリスト

## 前提
- [ ] `check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` を実行し FEATURE_DIR / AVAILABLE_DOCS を得る。パスは絶対
- [ ] tasks.md が無い/不完全なら /speckit-tasks を促す

## チェックリストゲート（FEATURE_DIR/checklists/ があれば）
- [ ] 全チェックリストの Total/Checked/Unchecked を表にする。マーカーは読むだけで変更しない
- [ ] 未チェックがあれば表を出して STOP し「進めるか？」を聞く。no/wait/stop→停止、yes/proceed/continue→続行
- [ ] 全部チェック済みなら表を出して自動で続行

## コンテキスト
- [ ] tasks.md（必須）、plan.md（必須）を読む。data-model.md / contracts/ / research.md / quickstart.md / constitution.md は存在すれば（タスクが必要とする時に）参照

## プロジェクト設定
- [ ] git リポジトリなら .gitignore を、Docker/ESLint/Prettier/npm公開/Terraform/Helm があれば各 ignore ファイルを作成/検証（既存なら不足パターンだけ追記）。技術別の定型パターンを使う

## 実行
- [ ] tasks.md からフェーズ（Setup/Tests/Core/Integration/Polish）、依存、ID、説明、ファイルパス、[P] を抽出
- [ ] フェーズ順に実行し、各フェーズ完了を検証してから次へ
- [ ] 逐次タスクは順に、[P] は並行可。同一ファイルを触るタスクは逐次
- [ ] テストタスクは対応する実装タスクより先（TDD）
- [ ] Setup → Tests → Core → Integration → Polish の順序原則
- [ ] タスク完了ごとに進捗報告し、tasks.md の該当行を [X] にする
- [ ] 非並列タスクが失敗したら停止。[P] は成功分を続け失敗分を報告。原因の分かるエラーと次の手を示す

## 完了検証
- [ ] 必須タスクが全部完了、実装が spec に合致、テストが通りカバレッジ要件を満たす、plan に従っている、を確認

## 追加（superpowers）
- [ ] 各タスク（または [P] グループ）の実作業はサブエージェントに委譲し、メイン会話には要約・変更ファイル・テスト結果だけ残す
- [ ] 完了を宣言する前に verification-before-completion に従って実際にテスト/ビルドを走らせる
- [ ] 日本語で報告
