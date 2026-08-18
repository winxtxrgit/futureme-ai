# Nara User Flow

## Primary flow

```text
Landing
→ “คุยกับนารา”
→ tier and decision context
→ A spacious counseling room UI with an optional voice waveform and private notes drawer.
→ editable evidence summary
→ choose a scenario mission
→ mission debrief
→ A counselor’s summary: what we heard, possible routes, what needs checking, and who can help.
→ compare three route strategies
→ A gentle weekly plan with a human support contact attached to difficult steps.
→ save
→ optional consent-based parent/counselor summary
```

## Interaction signature

Voice-or-text counseling session with reflective summaries and consent checkpoints.

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

