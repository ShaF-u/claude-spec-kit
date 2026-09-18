# Spec writing guidelines (read when unsure what belongs in a spec)

## What, not how
- Describe WHAT users need and WHY. No tech stack, APIs, code structure. Readers are business stakeholders.
- Mandatory template sections are always filled; optional ones are included only when relevant and otherwise deleted (never left as "N/A").
- Do not embed checklists in the spec (that is a separate command).

## Filling gaps
- Make informed guesses from context, industry standards and common patterns; record them in Assumptions.
- `[NEEDS CLARIFICATION: question]` only when the choice significantly changes scope or UX, has several reasonable interpretations with different implications, or has no reasonable default. Max 3. Priority: scope > security/privacy > UX > technical.
- Typical things that DO need asking (when no default exists): feature scope/boundaries, conflicting user types/permissions, legally or financially significant security/compliance rules.
- Reasonable defaults you should NOT ask about: data retention (industry standard), performance targets (standard web/mobile expectations), error handling (user-friendly messages with fallbacks), authentication (session or OAuth2 for web), integration patterns (REST/GraphQL for services, function calls for libraries, CLI args for tools).
- Think like a tester: any vague requirement fails "testable and unambiguous".

## Success criteria
Measurable (time, %, count, rate), technology-agnostic, user-focused, verifiable without knowing the implementation.
- Good: "Users can complete checkout in under 3 minutes", "95% of searches return results in under 1 second", "Task completion rate improves by 40%".
- Bad: "API response time under 200ms" (say "users see results instantly"), "Database handles 1000 TPS", "React components render efficiently", "Redis cache hit rate above 80%".
