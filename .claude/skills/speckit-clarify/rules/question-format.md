# Question format (one question at a time, in Japanese)

Line 1: `**Question:** <a full interrogative sentence ending in ?>` — optionally followed by `(FR-023)`. Never a topic label, heading or requirement id as the question; a reader who doesn't know Spec Kit must be able to answer from this line alone. Everyday words; define any jargon in the same sentence.
Line 2: one plain "Why it matters" sentence (what is at stake for acceptance or shipping).

## Multiple choice (2-5 mutually exclusive options)
Pick the most suitable option (best practice for the project type, common patterns, risk reduction, alignment with the spec's goals) and lead with it:

`**Recommended:** Option X - <1-2 sentence reasoning>`

| Option | Description |
|--------|-------------|
| A | ... |
| B | ... |
| C | ... (D/E as needed, max 5) |
| Short | Provide a different short answer (<=5 words) — include only if a free-form alternative makes sense |

Then: `You can reply with the option letter (e.g., "A"), accept the recommendation by saying "yes" or "recommended", or provide your own short answer.`

## Short answer (no meaningful discrete options)
`**Suggested:** <proposed answer> - <brief reasoning>`
Then: `Format: Short answer (<=5 words). You can accept the suggestion by saying "yes" or "suggested", or provide your own answer.`

## Handling the reply
- "yes" / "recommended" / "suggested" → your stated recommendation is the answer.
- Otherwise check it maps to an option or fits <=5 words; if ambiguous, ask a quick disambiguation (same question, does not count).
- Record the accepted answer, integrate it (see SKILL.md), then move to the next queued question. Never reveal queued questions in advance.
