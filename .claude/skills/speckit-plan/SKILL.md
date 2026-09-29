---
name: "speckit-plan"
description: "Execute the implementation planning workflow using the plan template to generate design artifacts."
argument-hint: "Optional guidance for the planning phase"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/plan.md"
user-invocable: true
disable-model-invocation: false
---

## Input

`$ARGUMENTS` (optional) = guidance for planning. Artifacts and the report are in Japanese.

## 1. Setup

Run `.specify/scripts/powershell/setup-plan.ps1 -Json` from the repo root; parse `FEATURE_SPEC`, `IMPL_PLAN`, `FEATURE_DIR`, `BRANCH` (single quotes in args: `'I''m Groot'`). Read FEATURE_SPEC and `.specify/memory/constitution.md`. IMPL_PLAN already contains the plan template.

## 2. Fill the plan (template structure)

Technical Context (unknowns → `NEEDS CLARIFICATION`), Constitution Check, gate evaluation — ERROR on any violation that cannot be justified.

**Phase 0 — research.md**: turn each NEEDS CLARIFICATION into a research task, each dependency into a best-practices task, each integration into a patterns task. Delegate the research to subagents (one per unknown) and keep only their conclusions; consolidate as `Decision / Rationale / Alternatives considered`. Done when no NEEDS CLARIFICATION remains.

**Phase 1 — design** (requires research.md):
- `data-model.md`: entities from the spec — name, fields, relationships, validation rules, state transitions.
- `contracts/`: only if the project exposes interfaces (public API, CLI command schema, endpoints, parser grammar, UI contract); skip for purely internal work.
- `quickstart.md`: runnable validation scenarios — prerequisites, setup, run/test commands, expected outcomes; reference contracts and the data model instead of duplicating them; no implementation code, no full test suites.
- Re-evaluate the Constitution Check after the design.

Stop after Phase 1. Absolute paths for filesystem operations, project-relative paths inside documents. ERROR on gate failures or unresolved clarifications.

## Report

Branch, IMPL_PLAN path, generated artifacts.
