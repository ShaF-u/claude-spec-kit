---
name: "speckit-clarify"
description: "Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec."
argument-hint: "Optional context to prioritize which ambiguities to clarify"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/clarify.md"
user-invocable: true
disable-model-invocation: false
---

## Input

`$ARGUMENTS` (optional) = context for prioritizing what to clarify. Questions and the report are in Japanese.

Run this before `/speckit-plan`. If the user explicitly skips clarification (e.g. an exploratory spike), proceed but warn that rework risk downstream increases.

## 1. Locate the spec

Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly` once from the repo root and parse `FEATURE_DIR`, `FEATURE_SPEC` (single quotes in args: `'I''m Groot'`). Parse failure → abort, tell the user to re-run `/speckit-specify` or check the feature environment. Spec missing → tell the user to run `/speckit-specify` first; never create one here. Read `.specify/memory/constitution.md` if it exists.

## 2. Coverage scan (internal)

Read the spec once and rate each category Clear / Partial / Missing:

- Functional scope: core goals & success criteria, explicit out-of-scope, user roles
- Domain & data: entities/attributes/relationships, identity & uniqueness, lifecycle/state, volume/scale
- Interaction & UX: critical journeys, error/empty/loading states, accessibility/localization
- Non-functional: performance, scalability, reliability/availability, observability, security & privacy, compliance
- Integration: external services and their failure modes, import/export formats, protocol/versioning
- Edge cases: negative scenarios, rate limiting, conflict resolution
- Constraints & tradeoffs: technical constraints, rejected alternatives
- Terminology: canonical terms, deprecated synonyms
- Completion signals: testable acceptance criteria, measurable Definition of Done
- Placeholders: TODOs, unquantified adjectives ("robust", "intuitive")

Partial/Missing → candidate question, except when the answer would not change implementation or validation, or the item is about implementation method, tech-stack comparison or task breakdown (note those internally as Deferred).

## 3. Question queue (max 5 for the whole session)

Keep only questions whose answer materially affects architecture, data model, task decomposition, test design, UX behavior, operations or compliance; each answerable by 2-5 exclusive options or a <=5-word answer. Cover the highest-impact unresolved categories first; drop already-answered items, stylistic preferences and plan-level details (unless blocking correctness); no speculative tech-stack questions unless functional clarity depends on it. More than 5 candidates → top 5 by impact x uncertainty. No valid questions → say no critical ambiguities were found, print the coverage summary (all Clear), suggest proceeding.

## 4. Ask, one at a time

Format each question and handle the reply per `rules/question-format.md`. Stop when critical ambiguities are resolved, the user signals completion ("done", "good", "no more", "stop", "proceed"), or 5 questions have been asked (retries of one question don't count).

## 5. Integrate after EACH accepted answer

1. First answer of the session: ensure `## Clarifications` exists (right after the top-level overview section) with `### Session YYYY-MM-DD` for today.
2. Append `- Q: <question> → A: <answer>` there.
3. Apply it where it belongs: functional → Functional Requirements bullet; actor/role → User Stories/Actors; data shape → Data Model (keep ordering); non-functional → measurable target in Success Criteria; negative flow → Edge Cases; terminology → normalize across the spec, at most one `(formerly referred to as "X")`.
4. Replace the earlier ambiguous statement rather than duplicating it; no contradictions left. Don't reorder unrelated sections; only the two headings above may be added; keep insertions minimal and testable.
5. Save the spec after every integration, then check: one bullet per accepted answer, no duplicates, <=5, no lingering placeholders the answer was meant to resolve, consistent terms.

## 6. Re-validate the quality checklist

If `FEATURE_DIR/checklists/requirements.md` exists: re-evaluate every `- [ ]`/`- [x]` line (outside code fences) against the updated spec and toggle only markers whose state changed — nothing else in the file may change. Compute before/after pass counts, newly passing, regressions, still unchecked.

## Report

Questions asked/answered; spec path; sections touched; checklist before → after (e.g. 12/16 → 15/16) with items that changed state and any still unchecked; coverage table per category (Resolved / Deferred with reason / Clear / Outstanding); if Deferred or Outstanding remain, recommend `/speckit-plan` now or another clarify pass later; suggested next command.
