# Compass Coach User Flow

## Primary flow

```text
Landing
→ “เริ่มค้นหาเส้นทาง”
→ tier and decision context
→ A side-by-side coach conversation and live evidence notebook.
→ editable evidence summary
→ choose a scenario mission
→ mission debrief
→ Three route cards—Balanced, Growth, Practical—anchored by evidence and open questions.
→ compare three route strategies
→ A vertical step path with expandable milestones and optional branches.
→ save
→ optional consent-based parent/counselor summary
```

## Interaction signature

Coach-led conversation with progressive disclosure and a single next-best action.

## Key branches

- **User says “ไม่รู้”:** offer two concrete scenarios; do not infer disinterest.
- **Evidence conflicts:** state the conflict and ask permission for one clarifying question.
- **Official criteria are stale:** hide definitive wording and provide a verify-current action.
- **User challenges an inference:** update the evidence item and regenerate only affected explanations.
- **User does not want an account:** allow completion and temporary local summary; account is required only to save/share.
- **User wants human help:** generate a short question list and consent-scoped summary.

## AI interview micro-flow

1. Frame the boundary: guidance, not prediction.
2. Ask one open prompt relevant to the student’s decision.
3. Reflect the answer in one sentence.
4. Probe one STAR element.
5. Show the inferred evidence and let the user correct it.
6. Continue until 5–8 prompts or the user pauses.
7. Summarize strengths, interests, values, and unknowns.
8. Ask which mission feels most useful to try.

## Failure and recovery

- Network interruption: retain an encrypted local draft and show last saved state.
- AI timeout: offer a structured non-AI prompt so the learner can continue.
- Unsafe or distressed disclosure: stop career probing, show reviewed support/escalation content, and preserve privacy.
- Artifact upload failure: allow text-only reflection or retry later.
- Graph failure: show the ordered roadmap list.

