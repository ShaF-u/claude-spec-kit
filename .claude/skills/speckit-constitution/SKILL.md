---
name: "speckit-constitution"
description: "Create or update the project constitution (.specify/memory/constitution.md) from interactive or provided principle inputs."
argument-hint: "Principles or governance changes to record"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/constitution.md"
user-invocable: true
disable-model-invocation: false
---

## Input and scope

`$ARGUMENTS` = principles / governance changes. The constitution and the report are in Japanese.

This command only edits `.specify/memory/constitution.md`. Classify every part of the input: constitution content vs. other intents (implementing, generating code, refactoring, building, deploying). Never execute the latter and never touch application sources, tests, deployment files or templates — record them as deferred intents and list them at the end under `Next Actions` with the fitting follow-up command (e.g. `/speckit-specify`), without invoking it (omit the section if there are none). Unsure whether something is constitution content → ask before changing anything.

## 1. Resolve the scaffold

Run `.specify/scripts/powershell/resolve-template.ps1 constitution-template -Json` from the repo root and use `TEMPLATE_CONTENT` as the structure. Failure → stop and report; never continue with a partial template. If `.specify/memory/constitution.md` exists, read it as the source of current values and amendments and keep whatever still applies; otherwise the template is the initial document. Never write back to template layers. Find every `[ALL_CAPS]` placeholder; if the user asked for a specific number of principles, follow it.

## 2. Values

User input first, then infer from the repo (README, docs, previous constitution). `RATIFICATION_DATE` = original adoption date (unknown → ask or `TODO(RATIFICATION_DATE): ...`); `LAST_AMENDED_DATE` = today when anything changes. `CONSTITUTION_VERSION` follows semver — MAJOR: principle removed/redefined incompatibly; MINOR: principle/section added or materially expanded; PATCH: wording, typos, clarifications. Ambiguous bump → state the reasoning before deciding.

## 3. Write

Replace every placeholder with concrete text (any deliberately retained slot must be justified). Keep the heading hierarchy; drop template comments once replaced unless still useful. Each principle: name line, non-negotiable rules (declarative, testable; "should" → MUST/SHOULD with rationale), rationale when not obvious. Governance: amendment procedure, versioning policy, compliance review. Put a Sync Impact Report as an HTML comment at the top (old → new version, modified principles incl. renames, added/removed sections, deferred TODOs) — scratch material for review, removed before commit. Critical unknowns → `TODO(<FIELD>): explanation`, also listed in the report.

## 4. Validate and save

No unexplained bracket tokens; version line matches the report; dates in YYYY-MM-DD; headings exactly as the template; one blank line between sections; no trailing whitespace. Partial updates still go through validation and the version decision. Overwrite `.specify/memory/constitution.md` — the only file written.

## Report

New version and bump rationale; TODOs / deferred items; suggested commit message (e.g. `docs: amend constitution to vX.Y.Z (...)`); `Next Actions` if any intents were deferred.
