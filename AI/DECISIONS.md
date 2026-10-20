# 決定済み事項

ここに書かれていることは議論済み。AIは同じ提案を繰り返さないこと。経緯は `Docs/kit-comparison.md` と git log。

- **ベース**: github/spec-kit の成果物・スクリプトを使う（他キットは構造や運用ルールだけ取り込む）
- **形式**: スラッシュコマンドではなくスキル。起動時に乗るのは一覧行だけで、本文は呼び出し時に読まれるため
- **段階的開示**: `SKILL.md` は手順だけ、条件付きの詳細は `rules/*.md`（cc-sdd の構造）。テンプレートは本文に埋め込まずコピーする
- **言語**: スキルの指示文は英語（日本語は約1文字1トークンで高くつく）、生成物と報告は日本語
- **拡張フック**: 使わない。`.specify/extensions.yml` 関連は全削除済み
- **ブランチ**: スキルは作成・切替をしない（ユーザー管理）。spec ディレクトリ名とブランチ名は独立
- **既存 spec の更新**: 該当セクションだけ読んで編集し、Change log に差分（ADDED/MODIFIED/REMOVED）を記録（OpenSpec の差分仕様の考え方）
- **実装と調査は委譲**: implement はタスクごと、plan の調査は不明点ごとにサブエージェントへ。メイン会話には要約だけ
- **完了前検証**: implement は verification-before-completion を通してから完了を報告
- **`context/` はサブモジュールとして main に含める**（他プロジェクトで既に入っている場合はそちらを使う）
- **任意スキル**（analyze / checklist / converge / taskstoissues）は未最適化のまま残している。使う時に同じ方式で圧縮する
- **計測の基準**: `bench/measure.mjs`。目標は常時 ≤ 400（キット分）、core ≤ 8,000
- **動作環境**: Windows 専用（スクリプトは PowerShell 版のみ）。bash 版の移植や pwsh 前提化はしない
- **Git 操作スキル**（`/git-commit` `/git-branches` `/git-sync`）は別リポジトリ `ShaF-u/claude-git-skills`（プラグイン `git-skills`）で配布し、このリポジトリには含めない。ここはスペックキット開発用のため。`disable-model-invocation: true` で / 専用（自動でコミット・プッシュさせない、一覧コストも 0）。ブランチ作成・切替・force push はしない
- **speckit はプラグインで配布する**: `.claude-plugin/` でこのリポジトリ自体をマーケットプレイス兼プラグイン `speckit` にする（`claude-` で始まる名前は予約済みで使えない）。雛形はプラグイン内の `.specify/` から作る
- **speckit はユーザースコープでも使える**: 原本はこのリポジトリ（git 管理・bench 計測対象）、`node install.mjs` で `~/.claude/skills/`（speckit-* と implement が呼ぶ TDD・verification）と `~/.claude/speckit/specify/`（.specify 雛形、constitution は含めない）へコピー。`.specify/` が無いプロジェクトでは specify / constitution が雛形を自動コピーする。同名ならユーザースコープが優先されるので、このリポジトリでも変更は install 後に効く
- **計測結果の保存**: `measure.mjs` は既定で保存しない。基準にしたい時だけ `--save`
