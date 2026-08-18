# Shared User Journey

## End-to-end journey

| Stage | Learner goal | Experience | Evidence/data created | Risk to manage |
|---|---|---|---|---|
| 1. Arrive | Decide whether this feels safe and relevant. | Plain promise, sample routes, privacy and non-prediction disclosure. | Anonymous analytics only. | Overclaiming outcomes. |
| 2. Frame | Tell the product what decision is near. | Tier, decision horizon, broad constraints, language/accessibility. | Minimal context profile. | Collecting too much too early. |
| 3. Reflect | Make sense of real experiences. | 5–8 adaptive Socratic/STAR questions. | Structured evidence with editable AI summaries. | Suggestive questions or false inference. |
| 4. Signal | Add a consistent interest measure. | 30-item RIASEC signal, chunked and skippable. | Versioned responses and six interest signals. | Treating scores as diagnosis. |
| 5. Try | Experience a small slice of work. | Choice of scenario mission, artifact or decision task, debrief. | Behavior, effort, energy, curiosity, reflection. | Rubric bias and device limitations. |
| 6. Compare | Understand several viable paths. | Three route strategies with evidence, uncertainty, trade-offs, sources. | Saved/challenged route choices. | Single-answer framing and stale facts. |
| 7. Plan | Convert curiosity into action. | Editable DAG/roadmap, 30-day trial, reminders. | Nodes, prerequisites, dates, progress. | Overwhelming or unrealistic plans. |
| 8. Share | Ask a trusted adult for useful help. | Student selects summary fields and expiry; transcript excluded. | Consent grant and audit record. | Coercive sharing or privacy leaks. |
| 9. Learn | Revisit as the learner changes. | Progress reflection, new evidence, rerun comparison. | Longitudinal profile and versioned routes. | Freezing identity from old answers. |

## Primary М.3 flow

```text
Landing → choose “I’m deciding after ม.3” → guest start
→ 3 context questions → adaptive interview → interest signal
→ choose a hands-on mission → debrief
→ compare: upper-secondary plan / ปวช. area / practical-access route
→ save one 30-day experiment → optional parent/counselor summary
```

## Primary М.5 flow

```text
Dashboard → resume evidence profile → interview/mission
→ compare faculty/career clusters with vocational or skills alternatives
→ inspect admissions assumptions and source dates
→ build portfolio + study + experiment roadmap
→ share selected summary with counselor
```

## AI interview state model

1. Explain boundaries and obtain consent.
2. Ask one open question.
3. Reflect in the learner’s language.
4. Probe only one STAR dimension at a time.
5. Present editable evidence.
6. Detect contradiction or missing evidence.
7. Offer a comparison or scenario when the learner says “ไม่รู้.”
8. Summarize and ask permission before moving to a mission.

## Service blueprint

| Frontstage | Backstage | System |
|---|---|---|
| Learner answers a prompt. | Safety and prompt-policy checks run. | Session state + streaming LLM. |
| Learner confirms a summary. | Evidence extractor creates structured item. | JSON schema + evidence database. |
| Learner completes a mission. | Rubric combines behavior and reflection. | Mission engine + artifact storage. |
| Learner opens routes. | Rules filter; retriever finds verified context; LLM explains. | FastAPI + Qdrant + source store. |
| Learner edits roadmap. | DAG validates prerequisites and cycles. | PostgreSQL graph tables. |
| Learner shares summary. | Authorization and consent scopes checked. | RBAC + audit log + expiring token. |

## Key experience metrics

- Completion rate by tier and device.
- “I felt understood” and “I understand why these routes appeared.”
- Percentage of routes challenged/edited—a healthy transparency signal.
- Mission completion and next-step adoption.
- Counselor-rated usefulness and factual grounding.
- Source freshness and unsupported-claim rate.
- Accessibility task completion.
- No metric should claim improved career outcomes until longitudinal evaluation supports it.

