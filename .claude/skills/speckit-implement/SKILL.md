---
name: "speckit-implement"
description: "Execute the implementation plan by processing and executing all tasks defined in tasks.md, delegating each task to a subagent."
argument-hint: "Optional guidance for the implementation phase"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/implement.md"
user-invocable: true
disable-model-invocation: false
---

## Input

`$ARGUMENTS` (optional) = guidance for this run. Progress and the report are in Japanese.

## 1. Prerequisites

Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` from the repo root; parse `FEATURE_DIR` and `AVAILABLE_DOCS` (absolute paths; single quotes in args: `'I'\''m Groot'`). No or incomplete tasks.md → tell the user to run `/speckit-tasks` first.

## 2. Checklist gate (if `FEATURE_DIR/checklists/` exists)

Read-only: never modify checklist files or markers. For every checklist count total / checked (`- [x]`, `- [X]`) / unchecked (`- [ ]`) and print:

| Checklist | Total | Checked | Unchecked | Status |
|-----------|-------|---------|-----------|--------|

Any unchecked item → STOP and ask whether to proceed anyway; "no"/"wait"/"stop" halts, "yes"/"proceed"/"continue" continues. All checked → continue automatically. (`requirements.md` is the spec-quality checklist; custom ones are reviewer-owned requirements-quality artifacts — `[x]` never means implementation is done.)

## 3. Context

Read `tasks.md` and `plan.md` (required). Note which of `data-model.md`, `contracts/`, `research.md`, `quickstart.md`, `.specify/memory/constitution.md` exist; read them only when a task needs them, and pass their paths to the subagent that does.

Project setup: if the detected tools lack ignore files, create/verify them per `rules/ignore-files.md`.

## 4. Execute tasks.md

Extract phases (Setup → Tests → Core → Integration → Polish), task IDs, descriptions, file paths, `[P]` markers and dependencies. Then, phase by phase:

- Sequential tasks in order; `[P]` tasks may run together, but tasks touching the same file run sequentially.
- Test tasks before the implementation they cover (use the `test-driven-development` skill).
- **Delegate each task (or one `[P]` group) to a subagent.** Give it: the task line, the relevant plan/contract/data-model excerpts or paths, the files to touch, and the constitution rules that apply. Require back: what changed (files), how it was verified (command + result), anything unexpected. Only that summary enters this conversation — never raw diffs or logs.
- After each task: report progress and mark it `[X]` in tasks.md. Verify the phase is complete before starting the next.
- A failed sequential task halts execution; failed `[P]` tasks are reported while successful ones continue. Give the cause and a concrete next step.

## 5. Completion validation

Before claiming done, follow the `verification-before-completion` skill: actually run the test suite / build and read the result. Then confirm: every required task is `[X]`, the implementation matches spec.md, tests pass and coverage meets the plan's requirements, the structure follows plan.md.

## Report

Completed tasks, files changed, verification commands and their results, anything left open.
