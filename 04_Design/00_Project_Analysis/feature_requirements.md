# Feature Requirements and Shared Product Plan

## Project vision

Every Thai learner should be able to explore education and work possibilities through conversation, evidence, and small experiments—then leave with several understandable routes and one achievable next step.

## Problem statement

Students face fragmented information, limited individual guidance, static self-report tests, and high-stakes choices before they have experienced the work. Future Me should reduce uncertainty without pretending to predict a fixed future.

## Core value proposition

**Reflect → Try → Compare → Plan.** The product turns a learner’s stories and short practical missions into explainable route options and an editable roadmap.

## Must-have features

| Capability | Requirement | Acceptance signal |
|---|---|---|
| Guest start | Let a student explore before registration. | Interview can start with no account; saving requests sign-in. |
| Tier-aware onboarding | Capture age band, education level, broad context, language, accessibility needs. | Content and route types change by tier. |
| AI interview | 5–8 adaptive Socratic/STAR prompts using reflective listening. | User can pause, edit summaries, or answer “ไม่รู้.” |
| RIASEC signal | 30-item vocational-interest signal with transparent scoring. | Described as a signal, never diagnosis or personality truth. |
| Scenario mission | At least one 3–5 minute mission matched to initial hypotheses. | Captures action and reflection evidence. |
| Evidence profile | Store claims with source type: self-report, past action, mission, constraint. | Every route explanation cites relevant evidence. |
| Recommendation engine | Apply constraints/rules, retrieve grounded content, return three route types. | No route uses guaranteed or deterministic language. |
| Route result | Show fit reasons, open questions, trade-offs, requirements, and sources. | User can challenge, save, compare, or try a mission. |
| Education path | Include upper-secondary, vocational/DVE, higher-education, and skills options when relevant. | No automatic preference for university. |
| Personal roadmap | Generate a prerequisite-aware DAG with editable dates and status. | Branches remain visible and user can change a goal. |
| Dashboard | Resume interview, see next step, saved routes, progress, and privacy status. | Most important action visible above the fold. |
| Sharing/RBAC | Student-controlled parent/teacher summary; transcript private by default. | Consent is explicit, scoped, revocable, and logged. |
| Sources/freshness | Show source, last checked date, and warning for time-sensitive criteria. | Expired content cannot present as current. |

## Nice-to-have features

- Voice input and read-aloud mode.
- Collaborative counselor session and annotated route comparison.
- Parent conversation guide.
- School cohort dashboard with privacy-preserving aggregates.
- Scholarship, internship, course, and program matching.
- Portfolio artifact review and skill evidence.
- Calendar/deadline sync and SMS reminders.
- Offline-first missions and low-bandwidth content.
- Thai/English bilingual mode and additional local languages.
- Longitudinal “what changed” profile rather than static identity.

## AI interview workflow

1. **Consent and framing:** Explain purpose, privacy, limits, and that the tool does not predict destiny.
2. **Context:** Education level, decision horizon, constraints, and current uncertainty.
3. **Open story:** Ask about an energizing or proud moment.
4. **STAR probe:** Situation, task, the learner’s own action, result, and feeling.
5. **Laddering:** Move from liked activity → consequence → value.
6. **RIASEC hypothesis:** Maintain internal signals; do not label too early.
7. **Reflective summary:** Show editable evidence fragments and ask “Did I understand correctly?”
8. **Missing-evidence probe:** Ask 1–3 questions where signals conflict or confidence is low.
9. **Scenario mission:** Offer two missions and let the learner choose.
10. **Debrief:** Ask effort, energy, curiosity, and what they would change.
11. **Route generation:** Produce three different route strategies.

## Recommendation workflow

```text
Profile + consented context
  → hard constraints and age/level rules
  → RIASEC/values/skills evidence aggregation
  → mission evidence
  → candidate route retrieval from verified knowledge
  → transparent five-factor matrix
  → diversity check across three route strategies
  → safety, bias, freshness, and hallucination checks
  → explanation with evidence, caveats, and sources
  → user challenge/edit
  → roadmap DAG
```

The five-factor matrix documented in the source is a starting product rule, not a validated psychometric model:

- Interests 30%
- Strengths 20%
- Learning style 15%
- Feasibility 25%
- Future flexibility 10%

## Data requirements

### Learner data

- Account and role; age band rather than exact birth date where possible.
- Education level, broad location, learning context, and constraints.
- Assessment answers, interview evidence, mission artifacts/results.
- Saved routes, roadmap nodes, progress, and consent records.
- Accessibility and notification preferences.

### Knowledge data

- Career cluster, role, activities, skills, work context, and evidence source.
- Education pathway, level, program/provider, prerequisites, costs where verified.
- TCAS/program criteria with source URL, owner, effective date, and expiry.
- 12 ปวช. 2567 areas, DVE availability, and official references.
- Courses, missions, scholarships, internships, and geographic availability.
- Versioned source records and confidence/freshness status.

## Suggested database structure

| Table | Purpose |
|---|---|
| users, identities, roles | Authentication and RBAC. |
| learner_profiles | Tier, context, preferences, constraints. |
| consent_grants, audit_events | Scoped sharing, revocation, and accountability. |
| interview_sessions, messages | Session state; transcript access restricted. |
| evidence_items | Structured STAR/mission/self-report evidence with provenance. |
| assessments, assessment_responses | Versioned RIASEC instrument and results. |
| missions, mission_attempts, artifacts | Scenario content, rubric, behavior evidence. |
| careers, skills, career_skill_edges | Career/skill taxonomy. |
| education_programs, admissions_rules | Pathways and time-sensitive criteria. |
| source_records | URL, publisher, checked_at, valid_until, reviewer. |
| recommendations, route_options | Model/rule versions, explanations, uncertainty. |
| roadmap_nodes, roadmap_edges | DAG milestones and prerequisites. |
| saved_items, progress_events | User organization and longitudinal progress. |

## Privacy considerations

- Apply Thai PDPA with legal review; in-country hosting alone does not establish compliance.
- Minimize collection, separate identity from sensitive conversation content, encrypt in transit/at rest.
- Private by default; no parent/teacher transcript access without explicit lawful basis and consent.
- Age-appropriate consent/assent and guardian process.
- Clear deletion, export, correction, retention, and model-training opt-out.
- Do not use private learner content to train models by default.
- Log administrative access; use least privilege and field-level authorization.
- Redact direct personal identifiers before model calls where feasible.

## Safety considerations

- The AI is guidance support, not a therapist, admissions authority, or employment guarantor.
- Detect distress, abuse, self-harm, coercion, and unsafe work contexts; provide a reviewed escalation flow and human support.
- Avoid reinforcing gender, region, disability, income, school-type, or academic-track stereotypes.
- Never infer protected attributes or mental-health diagnoses.
- Separate eligibility facts from recommendations and clearly mark time-sensitive information.
- Human review for mission rubrics, high-stakes exclusions, and school deployment.
- Adversarial testing for manipulation, prompt injection, unsafe advice, and fabricated citations.

## Accessibility requirements

- WCAG 2.2 AA target.
- Full keyboard navigation, visible focus, skip link, semantic landmarks, and meaningful headings.
- Screen-reader announcements for streaming responses and progress changes.
- No color-only meaning; minimum 4.5:1 normal-text contrast and 3:1 UI contrast.
- Thai text at comfortable sizes; line height at least 1.5; zoom to 200% without loss.
- Captions/transcripts for audio, voice never mandatory, reduced-motion mode.
- Plain-language option, chunked forms, save/resume, error prevention, and review before submit.
- Large touch targets and low-bandwidth fallbacks.

## Mobile-first requirements

- Primary flow usable at 360 px width.
- One main action per viewport; sticky progress/continue control.
- Text/voice input resilient to keyboard resizing and interruptions.
- Uploads compressed, resumable, and optional.
- Roadmap has a list fallback for complex graphs.
- Bottom navigation uses labels, not icons alone.
- Offline draft for interview and mission answers where possible.

## Suggested frontend architecture

- Next.js + TypeScript with server-rendered public pages and authenticated app routes.
- Design tokens, accessible headless components, and concept-specific themes.
- State machine for onboarding/interview/mission flow.
- Query/cache layer for source-backed routes and roadmap updates.
- Responsive graph/list components with progressive enhancement.
- Analytics events that avoid raw conversation content.
- PWA capabilities for mobile resume and low bandwidth.

## Suggested backend architecture

- FastAPI gateway/orchestrator.
- PostgreSQL for transactional learner, consent, recommendation, and roadmap data.
- Qdrant for hybrid Thai curriculum/career retrieval.
- Object storage for consented mission artifacts.
- Background workers for indexing, report generation, notifications, and content freshness.
- Central authorization service, audit log, secrets manager, rate limiting, and observability.
- AIS Cloud/OCI is a candidate deployment, subject to commercial and technical validation.

## Suggested AI and recommendation architecture

- **Rule engine:** tier eligibility, prerequisites, hard constraints, matrix calculation, route diversity, safety rules.
- **Retriever:** Thai-capable embeddings plus sparse keyword filters; source and freshness metadata are mandatory.
- **LLM:** adaptive question selection, structured STAR evidence extraction, summaries, and grounded explanations.
- **Output schema:** strict JSON validated server-side before UI rendering.
- **Evaluation:** separate non-overlapping train/dev/test sets; grounded-claim accuracy, retrieval recall, bias slices, route diversity, counselor review, and student comprehension.
- **Guardrail:** unsupported facts are omitted or phrased as questions to verify.

## Non-goals for the MVP

- Predicting the learner’s “true” career.
- Ranking students or publishing social popularity.
- Replacing counseling, official admissions sources, or professional assessment.
- Guaranteeing acceptance, employment, income, or happiness.
- Building full NDLP/DEEP integration without official access.

