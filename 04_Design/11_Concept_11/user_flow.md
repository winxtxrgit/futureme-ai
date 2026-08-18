# Aurora User Flow

## Core first-session flow

```text
Landing
  ├─ View sample routes → Sample result → Start discovery
  └─ Start as guest
       → Read plain-language privacy summary
       → Select education stage + near-term decision
       → Choose text / voice / short assessment support
       → AI interview: one question at a time
            → Student answers
            → Coach reflects
            → Student confirms, edits, or rejects evidence
            → Pause / delete / request human help available
       → Complete a short interest pulse
       → Choose one 3–12 minute mission
       → Reflect on energy, process, and constraints
       → Skills and strengths review
       → Three route strategies
            ├─ Inspect reasons and evidence
            ├─ Inspect unknowns and trade-offs
            ├─ Verify education-source freshness
            └─ Save two or three for comparison
       → Future-self conditional preview
       → Build one 30-day experiment
       → Sign up only to save across devices
       → Optional consent-scoped human summary
```

## AI interview workflow

1. **Orient:** explain that the coach explores evidence and does not predict a career.
2. **Invite:** ask about a real recent experience using plain Thai.
3. **Probe:** apply Socratic, Laddering, and STAR questions without interrogation.
4. **Reflect:** restate what the learner said and ask whether it is accurate.
5. **Extract:** create a provisional evidence item with source and uncertainty.
6. **Control:** learner confirms, edits, rejects, or deletes the item.
7. **Gap check:** ask only the minimum next question needed to separate hypotheses.
8. **Handoff:** if the user requests a person or a safety threshold is reached, show the relevant support route and stop normal coaching where required.
9. **Close:** summarize what was learned, what remains unknown, and the next mission.

## Recommendation workflow

```text
Validated profile context
+ confirmed interview evidence
+ RIASEC interest signals
+ mission observations
+ access constraints and preferences
+ verified education/career knowledge
→ deterministic eligibility and freshness checks
→ retrieval of relevant, cited options
→ structured AI synthesis
→ policy/safety/uncertainty validation
→ three strategy routes
→ learner review, challenge, save, or request human discussion
```

No single model output is displayed directly. A recommendation object must carry evidence references, unknowns, exclusions, alternatives, source dates, policy version, and a non-prediction disclaimer.

## Returning-user flow

```text
Login / resume token
→ Dashboard shows one next useful action
→ Continue interview, mission, comparison, or roadmap
→ New evidence triggers a visible route update
→ User reviews “what changed and why”
→ Optional reflection and counselor summary refresh
```

## Parent or teacher summary flow

```text
Student selects “แชร์สรุป”
→ Choose recipient role and purpose
→ Preview included fields
→ Raw transcript remains excluded
→ Choose expiration
→ Age/consent rule check
→ Share read-only link or PDF
→ Student can view access log or revoke
```

## Error, uncertainty, and recovery flows

| Situation | Product response |
|---|---|
| Student does not know | Offer examples, skip, voice, or “ยังไม่แน่ใจ” without penalty. |
| AI reflection is wrong | One-tap reject/edit; do not continue treating it as evidence. |
| Connection drops | Preserve local draft, show sync status, and resume at the same prompt. |
| Source is stale | Mark the affected fact, link the official source, and exclude it from hard eligibility decisions. |
| Recommendation evidence is thin | Say so plainly and suggest the smallest differentiating mission. |
| User expresses distress or danger | Apply safety protocol, show appropriate human support, minimize data exposure, and do not continue career coaching as normal when unsafe. |
| Minor cannot provide required consent | Preserve only permitted guest/session data and route to the appropriate adult or school process without exposing the private transcript. |

## Prototype interactions

- Page navigation works without a framework.
- Chat reply adds a safe text bubble and live status announcement.
- Evidence controls can mark an inference as corrected.
- Route buttons save state visually.
- Theme toggle persists.
- Roadmap checklist updates local progress.
- `mode=wireframe` removes visual styling while preserving hierarchy.

