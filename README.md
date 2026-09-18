# claude-spec-kit

[github/spec-kit](https://github.com/github/spec-kit) を Claude Code 向けに、コンテキスト消費を抑える方向で最適化したスペックキット。
仕様（spec）→ 計画（plan）→ タスク（tasks）→ 実装（implement）の流れはそのまま、指示に使うトークンを約1/3にした。

| | 素の spec-kit | このキット |
|---|---|---|
| 起動時に毎回乗る量（スキル一覧） | 339 | 約340（+汎用スキル7個で 751） |
| core ワークフロー1周の指示コスト | 18,145 | **6,113** |

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
3. `context/`（context-templates）を使うなら `git submodule add https://github.com/ShaF-u/claude-context-templates.git context` し、`context/` 内で Core をビルドして `.mcp.json` を置く。既に入っているプロジェクトではそちらを使う。
4. `AI/STRUCTURE.md` `AI/DECISIONS.md` はそのプロジェクトの内容に書き換える。

## 計測

```
node bench/measure.mjs            # このプロジェクト
node bench/measure.mjs --root DIR # 他のプロジェクト/キット
```

詳細は `bench/README.md`。スキルを書き換えたら `bench/requirements/<skill>.md` で振る舞いが落ちていないか照合する。

## Core（MCP サーバー）のビルド

```
cd context
cmake -S . -B build -G "Visual Studio 17 2022" -A x64
cmake --build build --config Debug --target aistudio_core_cli
```

`.mcp.json` は `context/build/Core/Debug/aistudio_core_cli.exe` を指している。Release で運用するならパスを変える。
