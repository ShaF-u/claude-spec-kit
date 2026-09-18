# Clarification questions (when [NEEDS CLARIFICATION] markers remain)

1. Extract every `[NEEDS CLARIFICATION: ...]` marker from the spec.
2. If more than 3: keep the 3 with the biggest impact (scope > security/privacy > UX > technical), make informed guesses for the rest and record them in Assumptions.
3. Present all questions together, in Japanese, numbered Q1..Q3, then wait for the answers to all of them (e.g. "Q1: A, Q2: Custom - ..., Q3: B"):

```markdown
## Question [N]: [Topic]

**Context**: [Quote the relevant spec section]

**What we need to know**: [The specific question]

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A      | [First suggested answer] | [What this means for the feature] |
| B      | [Second suggested answer] | [What this means for the feature] |
| C      | [Third suggested answer] | [What this means for the feature] |
| Custom | Provide your own answer | [How to give it] |

**Your choice**: _[Wait for user response]_
```

Table rules: spaces around cell content (`| Content |`), header separator with at least 3 dashes, pipes aligned.

4. Replace each marker in the spec with the chosen/provided answer, then re-run the quality validation.
