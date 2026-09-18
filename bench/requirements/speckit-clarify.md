# speckit-clarify 要件チェックリスト

## 前提
- [ ] `check-prerequisites.ps1 -Json -PathsOnly` を1回実行し FEATURE_DIR / FEATURE_SPEC を得る。JSON失敗→中断し /speckit-specify 再実行を促す
- [ ] spec が無ければ /speckit-specify を促す（ここでは作らない）
- [ ] /speckit-plan の前に完了させる想定。ユーザーが明示的に省略する場合は手戻りリスクを警告して進める
- [ ] constitution.md があれば読む
- [ ] `$ARGUMENTS` は優先順位付けのコンテキスト

## スキャン
- [ ] 分類（機能範囲/ドメイン・データ/UXフロー/非機能/連携・外部依存/エッジケース/制約・トレードオフ/用語/完了シグナル/プレースホルダ）ごとに Clear/Partial/Missing を判定した内部カバレッジマップを作る（質問が無い場合以外は出力しない）
- [ ] Partial/Missing から候補質問を作る。ただし実装や検証に影響しない項目、実装方法・技術比較・タスク分解の項目は除外

## 質問キュー
- [ ] 最大5問。回答は 2〜5択 か 5語以内の短答
- [ ] アーキテクチャ/データ/タスク分解/テスト設計/UX/運用/コンプライアンスに実質的に影響する質問だけ
- [ ] 高影響カテゴリ優先、既回答・些末な好み・plan段階の詳細は除外。5超なら Impact×Uncertainty で上位5
- [ ] 質問が無ければ「No critical ambiguities detected worth formal clarification.」（日本語相当）と伝え、カバレッジ要約を出して次へ促す

## 質問ループ
- [ ] 1問ずつ提示。次の質問を先に見せない
- [ ] `**Question:** <疑問文>?`（末尾に任意で `(FR-xxx)`）。ラベルや見出しを質問にしない。直後に「なぜ重要か」1文
- [ ] 選択式: `**Recommended:** Option X - 理由` を先頭に、Option/Description 表（A〜E、必要なら Short）、返答方法の案内
- [ ] 短答式: `**Suggested:** 案 - 理由`、`Format: Short answer (<=5 words)...` の案内
- [ ] "yes"/"recommended"/"suggested" は推奨を採用。曖昧な回答は同じ質問内で聞き直す（カウントしない）
- [ ] 終了条件: 重要な曖昧さが解消、ユーザーの終了合図（done/good/no more/stop/proceed）、5問到達
- [ ] 技術スタックの憶測質問はしない（機能の明確さを妨げる場合を除く）

## 反映
- [ ] 回答ごとに即反映。初回は `## Clarifications` と `### Session YYYY-MM-DD` を作り `- Q: … → A: …` を追記
- [ ] 内容を適切なセクションへ反映（機能→FR、役割→User Stories/Actors、データ→Data Model、非機能→Success Criteria の測定可能な指標、エッジケース→Edge Cases、用語→全体を正規化し必要なら `(formerly referred to as "X")`）
- [ ] 古い曖昧な記述は置換（矛盾を残さない）。無関係なセクションは並べ替えない。追加見出しは上記2つのみ
- [ ] 反映のたびに保存
- [ ] 検証: セッションに回答ごと1行、重複なし、≤5、曖昧なプレースホルダ残りなし、矛盾なし、用語一貫

## チェックリスト再検証
- [ ] `FEATURE_DIR/checklists/requirements.md` があれば、チェックボックス行だけを更新後の spec で再評価し、状態が変わる行のマーカーだけ切り替える（他は一切変更しない）
- [ ] before/after の通過数、新規通過、後退、未通過を集計

## 完了報告
- [ ] 質問数、spec パス、触ったセクション、チェックリストの before/after と変化した項目、カバレッジ表（Resolved/Deferred/Clear/Outstanding）、Deferred/Outstanding があれば plan へ進むか再clarifyかの推奨、次のコマンド
- [ ] 上限到達で高影響カテゴリが残るなら Deferred として理由付きで明示
- [ ] 日本語で報告
