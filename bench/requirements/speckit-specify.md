# speckit-specify 要件チェックリスト

圧縮前の本文から抽出した「必ず残す振る舞い」。書き換え後にこれで検証する。

## 入力
- [ ] `$ARGUMENTS` が機能説明。空なら ERROR "No feature description provided"
- [ ] ユーザーに説明の再入力を求めない（会話にある）

## 新規 or 既存（akiojin）
- [ ] SPEC ディレクトリ名/パス/「追記・既存」指示があれば既存を更新
- [ ] 迷う場合は `specs/*/spec.md` をキーワード検索: 1件→更新、複数→候補提示して選択、0件→新規

## 新規作成
- [ ] 2〜4語の short-name（action-noun、技術用語は保持、例: user-auth）
- [ ] ブランチは作成・切替しない（ユーザー管理）。ディレクトリ名とブランチ名は独立
- [ ] `SPECIFY_FEATURE_DIRECTORY` はユーザー指定があればそれ、なければ `specs/<prefix>-<short-name>`
- [ ] prefix: `.specify/init-options.json` の `feature_numbering` が `timestamp` なら `YYYYMMDD-HHMMSS`、`sequential`/未設定なら既存を走査して次の3桁 `NNN`
- [ ] `branch_numbering`（非推奨）しか無ければ使いつつ警告
- [ ] `spec-template.md` を `<dir>/spec.md` にコピーして起点にする
- [ ] `.specify/feature.json` に `{"feature_directory": "<実パス>"}` を書く（後続コマンドがブランチ名に依存せず場所を知るため）
- [ ] 1回の呼び出しで作る feature は1つ

## 内容
- [ ] `.specify/memory/constitution.md` があれば読んで制約に従う
- [ ] actors/actions/data/constraints を抽出
- [ ] 不明点は業界標準で推測し Assumptions に記録。`[NEEDS CLARIFICATION: 質問]` は最大3つ、範囲/UX に大きく影響・複数解釈・既定なし の時だけ
- [ ] 優先順位: scope > security/privacy > UX > technical
- [ ] User Scenarios & Testing を埋める。ユーザーフローが不明なら ERROR "Cannot determine user scenarios"
- [ ] Functional Requirements は各々テスト可能
- [ ] Success Criteria は測定可能・技術非依存・ユーザー視点・実装を知らずに検証可能。定量＋定性
- [ ] データがあれば Key Entities
- [ ] テンプレートの見出し順を保ち、プレースホルダを具体値に置換。該当しない任意セクションは削除（N/Aで残さない）
- [ ] WHAT/WHY を書き HOW（技術スタック・API・コード構造）を書かない。読者は非技術者
- [ ] spec 内にチェックリストを埋め込まない

## 品質検証
- [ ] `<dir>/checklists/requirements.md` を作る（Content Quality / Requirement Completeness / Feature Readiness の項目）
- [ ] 各項目を pass/fail 判定し、失敗は該当箇所を引用して記録
- [ ] 失敗（NEEDS CLARIFICATION 以外）は spec を直して再検証、最大3回。残れば notes に記録して警告
- [ ] NEEDS CLARIFICATION が残る場合: 3つ超なら影響の大きい3つに絞り残りは推測。質問は Context/質問/選択肢表（A/B/C/Custom と含意）/Your choice の形式でまとめて提示し、全回答を待ってから spec に反映、再検証
- [ ] 各反復後にチェックリストの状態を更新

## 完了報告
- [ ] `SPECIFY_FEATURE_DIRECTORY`、`SPEC_FILE`、チェックリスト結果、次フェーズ（/speckit-clarify か /speckit-plan）の準備状況を報告
- [ ] 生成物と報告は日本語（akiojin）
