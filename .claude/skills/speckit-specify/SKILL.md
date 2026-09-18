---
name: "speckit-specify"
description: "Create or update the feature specification (spec.md) from a natural-language feature description."
argument-hint: "Feature description, or an existing spec directory/name to update"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/specify.md"
user-invocable: true
disable-model-invocation: false
---

## Input

`$ARGUMENTS` is the feature description (the text typed after the command). It is already in this conversation: never ask the user to repeat it. Empty → ERROR "No feature description provided".

Artifacts and reports are written in Japanese. Never create or switch git branches (user-managed).

## 1. New spec or existing spec?

- Input names an existing spec directory/file, or says 追記/既存 → update that spec.
- Otherwise grep `specs/*/spec.md` for the main keywords: 1 match → update it; several → list candidates (directory + title) and ask; none → create new.
- Updating: edit only the affected sections (grep for the headings/FR ids, read those ranges, not the whole file). Keep heading order and FR numbering; add a dated entry under a `## Change log` section listing ADDED / MODIFIED / REMOVED requirements.

## 2. Create the feature directory (new spec only)

1. Short name: 2-4 words, action-noun, keep technical terms (e.g. "user-auth", "oauth2-api-integration", "fix-payment-timeout").
2. `SPECIFY_FEATURE_DIRECTORY` = user-provided value if given, else `specs/<prefix>-<short-name>`:
   - `.specify/init-options.json` `feature_numbering`: `"timestamp"` → `YYYYMMDD-HHMMSS`; `"sequential"` or absent → next unused 3-digit `NNN` in `specs/`.
   - Only deprecated `branch_numbering` present → use it and warn once: "⚠️ `branch_numbering` in init-options.json is deprecated. Rename to `feature_numbering`."
3. `mkdir -p` it, copy `.specify/templates/spec-template.md` to `<dir>/spec.md` (`SPEC_FILE`), and write `.specify/feature.json` = `{"feature_directory": "<resolved path, e.g. specs/003-user-auth>"}` so later commands find the feature without branch conventions.
4. One feature per invocation. Directory name and branch name are independent.

## 3. Write the spec

Read `.specify/memory/constitution.md` if it exists and respect it. Then, from the description: extract actors, actions, data, constraints → fill the template in heading order, replacing every placeholder:

- User Scenarios & Testing (no discernible user flow → ERROR "Cannot determine user scenarios").
- Functional Requirements: each testable. Unspecified details → reasonable defaults, recorded in Assumptions.
- Success Criteria: measurable, technology-agnostic, user-facing, verifiable without implementation details; quantitative and qualitative.
- Key Entities if data is involved.
- Unclear points: guess when a reasonable default exists. `[NEEDS CLARIFICATION: question]` only when the choice significantly changes scope/UX, has several interpretations with different implications, or has no reasonable default — max 3, priority scope > security/privacy > UX > technical.
- WHAT/WHY only, never HOW; delete inapplicable optional sections; no embedded checklists. Details and examples: `rules/writing-guidelines.md`.

## 4. Validate quality

1. Copy `.specify/templates/spec-quality-checklist.md` to `<dir>/checklists/requirements.md`, filling `[FEATURE NAME]`, `[DATE]`, `[Link to spec.md]`.
2. Judge every item pass/fail; for failures quote the spec section at fault.
3. Failures other than NEEDS CLARIFICATION → fix the spec, re-validate (max 3 rounds; then record what remains in Notes and warn the user).
4. NEEDS CLARIFICATION markers remain → follow `rules/clarification-questions.md`, apply the answers, re-validate.
5. Update the checklist file after every round.

## Report

`SPECIFY_FEATURE_DIRECTORY`, `SPEC_FILE`, checklist summary, and whether the spec is ready for `/speckit-clarify` or `/speckit-plan`.
