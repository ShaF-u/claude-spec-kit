---
name: "speckit-tasks"
description: "Generate an actionable, dependency-ordered tasks.md for the feature based on available design artifacts."
argument-hint: "Optional context for task generation"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/tasks.md"
user-invocable: true
disable-model-invocation: false
---

## Input

`$ARGUMENTS` (optional) = context for task generation. tasks.md and the report are in Japanese.

## 1. Setup

Run `.specify/scripts/powershell/setup-tasks.ps1 -Json` from the repo root; parse `FEATURE_DIR`, `TASKS_TEMPLATE_CONTENT` (older scripts: read `TASKS_TEMPLATE` instead), `AVAILABLE_DOCS` (single quotes in args: `'I''m Groot'`).

Read from FEATURE_DIR: `plan.md` (tech stack, libraries, structure) and `spec.md` (user stories with priorities) — required; `data-model.md`, `contracts/`, `research.md`, `quickstart.md` if present; `.specify/memory/constitution.md` if it exists. Missing optional docs are fine — generate from what exists.

## 2. Generate tasks.md from the template

Organize by user story so each story is independently implementable and testable:

- **Phase 1 Setup** (project init, shared infrastructure) → **Phase 2 Foundational** (blocking prerequisites for every story) → **Phase 3+ one phase per user story in priority order** (goal, independent test criteria, tests if requested, implementation tasks; inside a story: Tests → Models → Services → Endpoints → Integration) → **final Polish & cross-cutting**.
- Tests are optional: only when the spec asks for them or the user wants TDD. When requested, each contract gets a `[P]` contract-test task before its implementation.
- Contracts → the story they serve. Entities → the story that needs them (several stories → the earliest, or Setup); quote every field constraint from data-model.md (length, required, enum, validation) verbatim in the task text. Decisions in research.md → setup tasks.
- Also produce: dependency graph (story completion order), parallel-execution example per story, implementation strategy (MVP first — usually US1 — then incremental).
- Validate completeness: every story has all tasks it needs and can be tested on its own.

## Task format (strict)

`- [ ] T001 [P] [US1] Description with exact file path`

- Checkbox, then sequential ID in execution order (T001, T002…).
- `[P]` only if parallelizable: different files, no dependency on an unfinished task.
- `[USn]` only on user-story phases (never on Setup / Foundational / Polish).
- Description = concrete action + file path, specific enough for an LLM to do it without extra context.
- Right: `- [ ] T012 [P] [US1] Create User model in src/models/user.py`. Wrong: missing ID, checkbox, story label, or file path.

## Report

Path to tasks.md; total tasks; tasks per story; parallel opportunities; independent test criteria per story; suggested MVP scope; confirmation that every task follows the format.
