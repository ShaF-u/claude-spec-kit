# claude-spec-kit

[github/spec-kit](https://github.com/github/spec-kit) を Claude Code 向けに、コンテキスト消費を抑える方向で最適化したスペックキット。
仕様（spec）→ 計画（plan）→ タスク（tasks）→ 実装（implement）の流れはそのまま、指示に使うトークンを約4割にした。

| | 素の spec-kit | このキット |
|---|---|---|
| 起動時に毎回乗る量（スキル一覧） | 339 | 約360（+汎用・GitHub スキル7個で 772） |
| core ワークフロー1周の指示コスト | 18,145 | **6,895**（うち constitution.md の読み込み 958×2） |

core の値は constitution.md の分量で変わる（制定前は 6,113）。

**動作環境: Windows 専用。** `.specify/scripts/` は PowerShell 版だけで、スキルもそれを呼ぶ。

他キットとの比較と、どこから何を取り込んだかは `Docs/kit-comparison.md`。

## 使い方

```
/speckit-constitution   プロジェクト原則を .specify/memory/constitution.md に
/speckit-specify <説明>  specs/NNN-name/spec.md を作る（既存 spec なら追記）
/speckit-clarify        曖昧な点を最大5問で潰す（任意、plan の前に）
/speckit-plan           plan.md / research.md / data-model.md / contracts / quickstart.md
/speckit-tasks          tasks.md
/speckit-implement      tasks.md をサブエージェントに委譲して実行し、検証してから完了報告
```

生成物と報告は日本語。ブランチの作成・切替はスキルは行わない。

## 他プロジェクトへ持っていく

1. `.claude/skills/speckit-*/` と `.specify/` をコピーする。
2. 汎用スキルが欲しければ `.claude/skills/` の残り（`verification-before-completion` 等）と `THIRD_PARTY_NOTICES.md` も。
3. `context/`（context-templates）を使うなら `git submodule add https://github.com/ShaF-u/claude-context-templates.git context` し、`context/` 内で Core をビルドする。MCP サーバーの登録は **ユーザースコープに1度だけ**（`claude mcp add --scope user`、詳細は `context/README.md`）。プロジェクト側に置くのは `aistudio.config` 1ファイルだけで、`.mcp.json` は不要。
4. `AI/STRUCTURE.md` `AI/DECISIONS.md` はそのプロジェクトの内容に書き換える。

## 計測

```
node bench/measure.mjs            # このプロジェクト
node bench/measure.mjs --root DIR # 他のプロジェクト/キット
node bench/measure.mjs --save     # 結果を bench/results/ に残す（比較の基準にしたい時だけ）
node bench/validate.mjs           # specs/ の生成物の構造を検査
```

詳細は `bench/README.md`。スキルを書き換えたら `bench/requirements/<skill>.md` で振る舞いが落ちていないか照合し、固定のお題で1周回して `validate.mjs` を通す（手順は `bench/README.md` の「回帰確認」）。

## Core（MCP サーバー）のビルド

```
cd context
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Debug --target aistudio_core_cli
```

Core はユーザースコープに登録してあり（`~/.claude.json` の `context-reduction-core`）、このリポジトリに `.mcp.json` は無い。以前はあったが `command` が相対パスで、カレントディレクトリがこのリポジトリのときしか解決せず他プロジェクトから使えなかったため削除した。このプロジェクト向けのチューニングはルートの `aistudio.config` にある。
