import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { concepts } from "./concepts.mjs";

const workspace = path.resolve(".");
const root = path.join(workspace, "FutureMe_Web_Design_Concepts");
const analysisDir = path.join(root, "00_Project_Analysis");
const comparisonDir = path.join(root, "99_Final_Comparison");

const ensure = (p) => fs.mkdirSync(p, { recursive: true });
const write = (p, content) => {
  ensure(path.dirname(p));
  fs.writeFileSync(p, content.trimStart().replace(/\r\n/g, "\n") + "\n", "utf8");
};
const list = (items) => items.map((x) => `- ${x}`).join("\n");
const safe = (value) => String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
const sha256 = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

ensure(analysisDir);
ensure(comparisonDir);

const knowledgeSummary = `# Future Me Knowledge-Base Summary

## Executive summary

Future Me (also called FuturePath AI in several source files) is an evidence-informed Thai education and career exploration web app for learners from upper primary through vocational and upper-secondary education. Its strongest product idea is a **sequential two-phase discovery process**:

1. a 5–10 minute adaptive AI conversation using Socratic questioning, Motivational Interviewing, RIASEC, Laddering, and STAR;
2. a 3–5 minute scenario mission that collects evidence from what the learner actually does.

The system then combines rule-based eligibility and constraint checks with a Thai curriculum/career knowledge base to present **several explainable routes**, not a guaranteed prediction. Each route can become a dynamic roadmap of skills, study options, TCAS context, portfolio work, and early career steps.

## What was inspected

The review covered all relevant files inside \`Data/\`: 26 Markdown knowledge documents, 26 matching PDF exports, two JSONL datasets, the reference index, the folder README, and the system blueprints. The PDF titles, page counts, first-page content, and blueprint pages were inspected; the PDFs are presentation exports of the Markdown material, and the Mermaid diagrams are more usable in the Markdown sources because the PDF export shows them as code blocks.

The knowledge base contains no standalone raster images, native design files, user-interview transcripts, questionnaires, personas, or presentation decks inside \`Data/\`. Some files reference assets and briefs outside \`Data/\`; these were treated as referenced-but-out-of-scope because the task specifically defined \`Data/\` as the knowledge base.

## Information found in the source files

### 1. What Future Me is

- A Thai AI guidance and pathway platform prepared for JUMP Thailand Hackathon 2026.
- A complement to human guidance and, potentially, to national learning systems—not a replacement for teachers, counselors, NDLP, or DEEP.
- A product for four learner tiers: ป.4–ป.6, ม.1–ม.3, ม.4–ม.6, and ปวช./ปวส.
- A hybrid system: deterministic rules for RIASEC calculations, level/eligibility filters, and route constraints; an LLM for adaptive dialogue, evidence extraction, and grounded explanations.
- A roadmap product using Directed Acyclic Graphs and topological ordering to show prerequisites and alternate routes.

### 2. The problem it is trying to solve

- Thai students often choose education routes without enough individualized guidance or a clear link from subjects to degrees, vocational programs, skills, and work.
- The source reports TDRI’s 2025 finding that 56% of higher-education graduates worked outside their field and 27% worked below their qualification level.
- One school counselor may support roughly 300–500 students, while guidance time is limited or repurposed.
- Static multiple-choice assessments invite socially desirable answers and do not reveal how a student behaves in real situations.
- Curriculum and career information is fragmented, especially for provincial or smaller schools and for vocational/dual-education options.
- Fast-changing skills, limited work experience, and unclear portfolio expectations make long-term choices feel risky.

### 3. Target users found in the sources

- **Upper primary (ป.4–ป.6):** early, play-based interest exploration.
- **Lower secondary (ม.1–ม.3):** choosing upper-secondary learning plans, one of 12 ปวช. 2567 areas, or dual vocational routes.
- **Upper secondary and vocational (ม.4–ม.6 / ปวช.–ปวส.):** faculty/TCAS context, certifications, portfolio work, 30-day experiments, and career preparation.
- **Parents/guardians:** consent-based summary of interests and a 30-day plan, without private chat transcripts.
- **Teachers/counselors:** class-level overview, uncertainty signals, and suggested coaching questions, without private transcripts unless a student explicitly shares them.

University students are only indirectly supported in the source material through career/skill planning; they are not defined as a primary segment.

### 4. Main user needs found in the sources

- A low-pressure way to start when the student says “I don’t know.”
- Questions based on real past behavior, not only self-description.
- Multiple education routes, including vocational and dual-education pathways.
- A clear explanation of why each route appeared and what evidence is missing.
- Short practical trials before a consequential choice.
- Current curriculum, TCAS, career, skill, and course information.
- A personal, editable roadmap with manageable next steps.
- Privacy, control over sharing, and age-appropriate language.
- A path to discuss results with a trusted adult or counselor.

### 5. Main web-app features found in the sources

- Authentication with role selection; AIS Number Verification/OTP/SMS are proposed future integrations.
- Age/education-level adaptation.
- 30-item RIASEC interest assessment as an interest signal, not a diagnosis.
- Five to eight adaptive Socratic/STAR questions.
- Scenario missions and evidence capture.
- Five-factor decision matrix: Interests 30%, Strengths 20%, Learning style 15%, Feasibility 25%, Future flexibility 10%.
- Three route types: Balanced Next Step, Interest Growth Route, and Practical Access Route.
- Thai career, skill, curriculum, vocational, and TCAS-context knowledge retrieval.
- Explainable route results with sources and uncertainty.
- Dynamic roadmap/DAG and progress tracking.
- Saved routes, programs, courses, and portfolio actions.
- Student, parent, and counselor views with role-based access.
- Consent, deletion, retention, and sharing controls.

## Data-quality observations

1. \`qwen_qlora_dataset.jsonl\` and \`test_qwen_qlora.jsonl\` are byte-for-byte identical (the same SHA-256) and contain only ten examples. This creates train/test leakage and cannot support a credible evaluation.
2. Naming is inconsistent: “FutureMe AI,” “FuturePath AI,” and “FuturePath” are used. A naming decision is required before production design.
3. The career mapping is a useful seed but covers only 15 example roles across five clusters, while blueprints refer to 50+ clusters.
4. Source documents link to authoritative organizations, but this design review did not independently re-verify every statistic or admissions rule on the live web. Time-sensitive admissions and course data need a freshness and verification process.
5. The PDFs duplicate Markdown and do not add visual information; the detailed blueprint PDFs render Mermaid diagrams as code rather than diagrams.
6. The architecture alternates between a hosted LLM API and a small fine-tuned Qwen/Typhoon model. The MVP model strategy is not final.

## Missing information

- Direct interviews, survey results, usability tests, or validated student quotes.
- Confirmed primary launch segment and exact school context.
- A final product/brand name and bilingual naming rules.
- A validated 30-item assessment instrument and scoring/psychometric evidence.
- Mission content library, rubrics, bias testing, and inter-rater reliability.
- Exact data-retention periods, lawful bases, guardian-consent rules by age, incident response, and data processor agreements.
- Official NDLP/DEEP/AIS API documentation, access, commercial terms, and partnership approval.
- Current authoritative TCAS/program/course feed and an owner for data freshness.
- Accessibility research with Thai screen-reader users, low-literacy users, and students with disabilities.
- Budget, team size, timeline, hosting limits, and production service-level requirements.
- Definition of success, baseline metrics, and long-term outcome evaluation.

## Assumptions made for these concepts

These are design assumptions, not source facts:

- The first launch should prioritize Thai students in ม.3 and ม.5 because they face near-term pathway decisions and are explicitly supported by the source architecture.
- Thai is the default UI language, with English terminology shown only when useful for careers, tests, and technical skills.
- The MVP offers text input first; voice is optional and never required.
- Users may explore before creating an account; saving and sharing require authentication.
- Results always show at least three viable routes and never use “perfect match,” “destiny,” or guaranteed employment language.
- Parent/teacher access requires explicit, revocable student consent except where law or safeguarding policy requires otherwise.
- The prototypes use fictional sample evidence and routes; they are design demonstrations, not a functioning recommendation engine.
- A production knowledge base will add source dates, owners, confidence, and expiry rules to every time-sensitive record.

## Product language rule

Use a persistent disclosure near recommendations:

> แนวทางเหล่านี้เป็นข้อมูลเพื่อช่วยสำรวจจากคำตอบและหลักฐานที่คุณให้ ไม่ใช่คำทำนายหรือการรับประกันการเรียนต่อ อาชีพ หรือรายได้ โปรดตรวจสอบเกณฑ์ล่าสุดและพูดคุยกับครูแนะแนวหรือผู้ใหญ่ที่ไว้ใจ

## Source map

| Source area | Product implication |
|---|---|
| Graduate mismatch statistics | Establish urgency, but avoid fear-based messaging and unsupported causal claims. |
| Thai curricula | Support ม.ปลาย, 12 vocational areas, DVE, six internal higher-education groups, and TCAS context. |
| Career/degree/skill mapping | Seed route content, skill gaps, portfolio ideas, and 30-day experiments. |
| Qualitative interviewing research | Make open dialogue and behavioral evidence the core interaction. |
| NDLP/DEEP research | Position Future Me as a future integration layer subject to approval. |
| AIS cloud research | Design for in-country hosting, OTP/SMS options, RBAC, and app-level PDPA controls. |
| System blueprints | Preserve two-phase assessment, hybrid recommendation, multiple roles, and DAG roadmaps. |
| JSONL examples | Useful only as a schema/style seed; not an adequate training or test corpus. |
`;

const targetUsers = `# Target Users and Personas

## Prioritization

### Primary launch segment

1. **ม.3 transition students** choosing between upper-secondary plans, vocational areas, and dual education.
2. **ม.5 exploration students** preparing for faculty/program choices, portfolios, and subject/exam planning.

These groups have near-term, reversible decisions that suit a guidance-and-experiment product.

### Secondary segments

- ม.1–ม.2 for early exploration.
- ม.4, ม.6, ปวช., and ปวส. for route refinement.
- Counselors and teachers supporting many students.
- Parents/guardians receiving consented summaries.

### Future segments

- ป.4–ป.6 with a much simpler, play-based version.
- University students seeking transferable-skill and early-career routes.

## Persona 1 — “Mild,” ม.3, provincial school

- **Context:** Good at several subjects, family expects a general academic route, curious about digital and creative work.
- **Goal:** Compare ม.4 plans with ปวช. digital/creative routes without feeling that one is “less successful.”
- **Pain points:** Limited counselor time, confusing program language, fear of disappointing family.
- **Behaviors:** Uses a phone, watches short tutorials, rarely writes long answers.
- **Needs:** Plain Thai, short missions, side-by-side trade-offs, a shareable parent summary.
- **Trust risk:** Recommendations that look like a hidden advertisement or one “correct” future.
- **Accessibility:** Low data use, large tap targets, offline/resume support.

## Persona 2 — “Krit,” ม.5, Bangkok

- **Context:** Science–math student who likes design and coding but is unsure about engineering, computer science, or UX/UI.
- **Goal:** Test day-to-day activities and plan a portfolio before TCAS deadlines.
- **Pain points:** Too many online opinions, opaque match percentages, anxiety about changing direction.
- **Behaviors:** Comfortable with dashboards and English skill terms; saves courses and projects.
- **Needs:** Evidence inspector, current admissions links, multiple routes, a 30-day experiment.
- **Trust risk:** Outdated TCAS criteria or fabricated salary claims.
- **Accessibility:** Keyboard access on laptop and full mobile continuity.

## Persona 3 — “Fern,” ปวช.2, digital business

- **Context:** Enjoys practical work and wants employment options while keeping a path to further study.
- **Goal:** Map current skills to internships, certifications, ปวส., and bachelor routes.
- **Pain points:** University-centric guidance and unclear recognition of practical experience.
- **Behaviors:** Learns through projects, maintains a social portfolio, values concrete tasks.
- **Needs:** Practical Access Route, skills evidence, experience milestones, dual-education context.
- **Trust risk:** Treating vocational pathways as a fallback rather than a valid first choice.
- **Accessibility:** Artifact upload must work on budget Android devices.

## Persona 4 — “Teacher Anong,” guidance counselor

- **Context:** Supports hundreds of students with limited weekly time.
- **Goal:** Identify undecided students, prepare better questions, and run group guidance efficiently.
- **Pain points:** Static reports, private transcript risks, no clear student follow-up.
- **Needs:** Class overview, uncertainty flags, consent status, summary only, exportable action plans.
- **Trust risk:** AI replacing professional judgment or exposing confidential conversations.
- **Accessibility:** Dense desktop view, printable reports, clear status labels not based on color alone.

## Persona 5 — “Mother Ploy,” parent

- **Context:** Wants a secure future for her child but is unfamiliar with newer careers and vocational routes.
- **Goal:** Understand the child’s evidence and support a realistic experiment.
- **Pain points:** Technical jargon, fear of unstable work, uncertainty about admissions.
- **Needs:** Short summary, questions to ask, costs/time trade-offs, official source links.
- **Trust risk:** Private chat access or pressure to accept the AI’s suggestion.
- **Accessibility:** Plain language, mobile-first, readable type, downloadable/printable summary.

## Jobs to be done

- “When I do not know what I like, help me start from a real story instead of forcing a label.”
- “When I must choose a study route, show more than one valid option and what each requires.”
- “Before I commit, give me a small way to try the work.”
- “When a route appears, show why, what is uncertain, and where the information came from.”
- “When I need support, help me share only the right summary with a trusted adult.”
`;

const featureRequirements = `# Feature Requirements and Shared Product Plan

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

\`\`\`text
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
\`\`\`

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
`;

const userJourney = `# Shared User Journey

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

\`\`\`text
Landing → choose “I’m deciding after ม.3” → guest start
→ 3 context questions → adaptive interview → interest signal
→ choose a hands-on mission → debrief
→ compare: upper-secondary plan / ปวช. area / practical-access route
→ save one 30-day experiment → optional parent/counselor summary
\`\`\`

## Primary М.5 flow

\`\`\`text
Dashboard → resume evidence profile → interview/mission
→ compare faculty/career clusters with vocational or skills alternatives
→ inspect admissions assumptions and source dates
→ build portfolio + study + experiment roadmap
→ share selected summary with counselor
\`\`\`

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
`;

const sitemap = `# Shared Sitemap and Information Architecture

\`\`\`text
Public
├── Landing
├── How it works
├── Explore careers and pathways
├── For students
├── For parents
├── For schools/counselors
├── Evidence, sources, and limitations
├── Accessibility
├── Privacy and safety
└── Sign up / Log in

Student app
├── Home dashboard
├── Discovery
│   ├── Context onboarding
│   ├── AI interview
│   ├── RIASEC interest signal
│   ├── Scenario missions
│   └── Evidence review
├── Routes
│   ├── Recommendation overview
│   ├── Route comparison
│   ├── Career detail
│   ├── Education-path detail
│   └── Sources and assumptions
├── Roadmap
│   ├── Interactive map / accessible list
│   ├── 30-day experiment
│   ├── Portfolio milestones
│   └── Progress history
├── Saved
│   ├── Careers
│   ├── Programs
│   ├── Courses/missions
│   └── Comparisons
├── Share
│   ├── Parent summary
│   ├── Counselor summary
│   └── Consent controls
└── Profile
    ├── Personal context
    ├── Evidence and assessment history
    ├── Accessibility/language
    ├── Notifications
    ├── Privacy, export, deletion
    └── Account/security

Parent/guardian
├── Shared student summary
├── Conversation guide
├── 30-day support plan
└── Access/consent status

Counselor/teacher
├── Cohort overview
├── Student summaries (authorized)
├── Uncertainty/follow-up queue
├── Guidance prompts
├── Group activities
└── Export and audit
\`\`\`

## Information-architecture rules

- “Discovery” describes the process; “Results” is avoided in primary navigation because profiles can change.
- Career and education routes are peers, not a hierarchy where university is automatically preferred.
- Sources and uncertainty live beside the claim they support, not only in a footer.
- Private conversation and shareable summary are separate data objects.
- Graph roadmaps always have a linear accessible-list alternative.
- Saved items retain source date and show a freshness warning when underlying criteria change.
`;

const designRecommendations = `# Design Recommendations

## Recommended product direction

Use **Compass Coach** as the core product shell, combine **QuestMap missions** for engagement, add **PathLab evidence transparency**, and use **Timefold’s roadmap** only after the student has completed enough evidence. This hybrid provides the best balance of trust, demonstration impact, technical feasibility, and future scale.

## Ten shared design principles

1. **Start with uncertainty, not a quiz.** Provide “ยังไม่รู้” as a valid answer and offer a concrete comparison.
2. **Evidence before labels.** Show the learner’s story/action before showing RIASEC or career families.
3. **Three routes, three strategies.** Balanced, Growth, and Practical routes must differ in trade-off—not just color.
4. **Try before commitment.** Every route has a short mission or real conversation as the next step.
5. **Uncertainty is UI content.** Show what is inferred, what is verified, and what needs checking.
6. **No prediction language.** Prefer “เส้นทางที่น่าลองสำรวจ” to “อาชีพที่เหมาะกับคุณ.”
7. **Thai-first, jargon-second.** Put technical terms in supporting text and define TCAS/vocational language.
8. **Privacy in context.** Ask for sharing consent at the moment of sharing, not buried in terms.
9. **Mobile task, desktop review.** Make interview/missions effortless on mobile; make comparison and planning powerful on desktop.
10. **Human handoff is a feature.** Give counselors and parents useful questions, not private transcripts.

## Visual-system recommendations

- Use original, culturally contemporary imagery without school stereotypes, prestige symbols, or fortune-telling metaphors.
- Keep consequential text in HTML; generated images must not contain required labels.
- Ensure every concept can pass contrast and reduced-motion checks even when visually expressive.
- Build one shared token architecture; themes may vary without duplicating accessibility behavior.
- Use motion to explain state change or graph traversal, never to imply certainty.

## Content recommendations

- Replace match percentages with evidence coverage and transparent confidence categories.
- Distinguish “recommended preparation” from official eligibility.
- Mark the six higher-education groups as an internal Future Me organization.
- Show DVE as a valid route, not a fallback.
- Put source publisher, checked date, and “verify current criteria” beside admissions content.

## Research needed before build

1. Interview at least 8–12 learners each in ม.3 and ม.5 across urban/provincial contexts.
2. Test terminology with vocational learners and parents.
3. Co-design privacy/share boundaries with students and counselors.
4. Validate the assessment instrument and mission rubrics with qualified experts.
5. Test prototypes with screen-reader, low-vision, motor, and low-literacy users.
6. Confirm official data integrations and content ownership.
7. Decide Future Me vs FuturePath naming.

## Prototype evaluation tasks

- Start without an account and explain what the product will do.
- Complete one STAR answer and correct an AI summary.
- Compare the three route strategies and identify one trade-off.
- Find the source date for an admissions rule.
- Add a 30-day experiment to the roadmap.
- Share a summary without sharing the transcript.
- Resume the same task on a 360 px mobile viewport.
`;

write(path.join(analysisDir, "knowledge_base_summary.md"), knowledgeSummary);
write(path.join(analysisDir, "target_users.md"), targetUsers);
write(path.join(analysisDir, "feature_requirements.md"), featureRequirements);
write(path.join(analysisDir, "user_journey.md"), userJourney);
write(path.join(analysisDir, "sitemap.md"), sitemap);
write(path.join(analysisDir, "design_recommendations.md"), designRecommendations);

const pages = [
  {
    name: "1. Landing Page",
    objective: "Establish relevance, trust, and a low-pressure first step.",
    content: "Value proposition, four-step model, sample route alternatives, privacy/non-prediction disclosure, audiences.",
    components: "Hero, primary/secondary CTA, trust note, process cards, sample evidence, footer.",
    cta: "Start discovery as a guest."
  },
  {
    name: "2. Sign Up and Login",
    objective: "Create or recover an account only when saving or sharing is needed.",
    content: "Phone/OTP or email options, role, age-appropriate consent, privacy summary, recovery.",
    components: "Authentication form, OTP state, passwordless explanation, consent links, error summary.",
    cta: "Continue securely."
  },
  {
    name: "3. User Onboarding",
    objective: "Capture the minimum context needed to adapt the journey.",
    content: "Education tier, near-term decision, broad constraints, preferred input, language/accessibility.",
    components: "Step progress, selectable cards, skip/unsure choice, save-and-exit, privacy reminder.",
    cta: "Begin my discovery."
  },
  {
    name: "4. AI Interview Page",
    objective: "Collect real behavioral evidence through an adaptive, safe conversation.",
    content: "One Socratic prompt at a time, STAR probes, reflective summaries, evidence review.",
    components: "Conversation/prompt area, input, quick comparison, progress, evidence panel, pause/delete controls.",
    cta: "Confirm this reflection / continue."
  },
  {
    name: "5. Personality and Interest Assessment",
    objective: "Add a consistent RIASEC interest signal without turning it into a label.",
    content: "30 items in short groups, why each signal is used, result explanation and limitations.",
    components: "Statement cards, response scale, progress, back/review, plain-language help.",
    cta: "Save my interest signals."
  },
  {
    name: "6. Skills and Strengths Analysis",
    objective: "Separate demonstrated strengths, emerging skills, and unverified self-beliefs.",
    content: "Evidence from STAR stories and missions, skill clusters, gaps, transferable skills.",
    components: "Evidence cards, skill map/list, source tags, coverage legend, challenge/edit action.",
    cta: "Choose a skill to test."
  },
  {
    name: "7. Career Recommendation Results",
    objective: "Present three different route strategies with understandable evidence and trade-offs.",
    content: "Balanced, Growth, and Practical routes; evidence, uncertainty, work activities, next trial.",
    components: "Route cards, comparison controls, evidence drawer, source/freshness, disclaimer.",
    cta: "Compare routes / try a mission."
  },
  {
    name: "8. Education Path Recommendation",
    objective: "Connect a route to realistic upper-secondary, vocational, higher-education, and skill options.",
    content: "Preparation, prerequisites, TCAS context, DVE, cost/time questions, official source links.",
    components: "Path alternatives, requirement tags, timeline, verify-current warning, counselor questions.",
    cta: "Add one education option to compare."
  },
  {
    name: "9. Personal Future Roadmap",
    objective: "Turn a chosen hypothesis into an editable prerequisite-aware plan.",
    content: "Current state, skills, mission, study milestones, portfolio, experience, career-entry hypothesis.",
    components: "DAG/list toggle, milestone nodes, dependencies, dates, branch action, progress states.",
    cta: "Start the next 30-day experiment."
  },
  {
    name: "10. User Dashboard",
    objective: "Make the next useful action obvious and preserve continuity.",
    content: "Current decision, next mission, recent evidence, route status, roadmap progress, sharing status.",
    components: "Next-step hero, progress summary, saved routes, reminders, privacy badge, resume control.",
    cta: "Continue where I left off."
  },
  {
    name: "11. Saved Careers or Programs",
    objective: "Organize options without implying that saving equals commitment.",
    content: "Saved careers, programs, courses, source dates, notes, comparison sets.",
    components: "Filter/sort, freshness status, compare checkboxes, note editor, remove/archive.",
    cta: "Compare selected items."
  },
  {
    name: "12. User Profile",
    objective: "Give the learner ownership of context, evidence, accessibility, and data.",
    content: "Profile context, evidence history, assessment versions, settings, export/delete, consent.",
    components: "Editable sections, privacy center, access log, notification controls, account security.",
    cta: "Review or update my data."
  },
  {
    name: "13. Progress Tracking",
    objective: "Show learning over time without streak pressure or public ranking.",
    content: "Completed missions, evidence gained, roadmap changes, reflections, upcoming checkpoints.",
    components: "Progress timeline, milestone status, reflection prompt, change history, celebrate/pause.",
    cta: "Reflect on this milestone."
  },
  {
    name: "14. Parent or Teacher Summary",
    objective: "Support a constructive human conversation while protecting the private transcript.",
    content: "Student-selected interests, evidence summary, three routes, questions, 30-day plan, sources.",
    components: "Consent scope, role label, expiry, print/PDF view, revoke action, transcript-excluded notice.",
    cta: "Share this summary / revoke access."
  }
];

function pageLayoutFor(c, pageName) {
  if (pageName.includes("Landing")) return c.landingLayout;
  if (pageName.includes("Interview") || pageName.includes("Assessment")) return c.interviewModel;
  if (pageName.includes("Career Recommendation") || pageName.includes("Education Path")) return c.resultsLayout;
  if (pageName.includes("Roadmap") || pageName.includes("Progress")) return c.roadmapLayout;
  if (pageName.includes("Dashboard")) return c.dashboardLayout;
  if (pageName.includes("Sign Up")) return c.authLayout;
  if (pageName.includes("Parent")) return `${c.resultsLayout} transformed into a read-only, consent-scoped summary.`;
  return `${c.navigation} with content presented in the ${c.visual.toLowerCase()} system.`;
}

function conceptOverview(c) {
  return `# ${c.name} — ${c.thaiName}

## Concept snapshot

| Item | Direction |
|---|---|
| **Concept name** | ${c.name} / ${c.thaiName} |
| **One-sentence description** | ${c.sentence} |
| **Main idea** | ${c.positioning} |
| **Target user group** | ${c.target} |
| **Main user problem** | ${c.problem} |
| **Unique value proposition** | ${c.uvp} |
| **Emotional experience** | ${c.emotional} |
| **Visual direction** | ${c.visual} |
| **Development difficulty** | ${c.difficulty} |
| **Recommended technology** | ${c.tech} |

## Main features

${list(c.features)}

## Advantages

${list(c.advantages)}

## Disadvantages

${list(c.disadvantages)}

## Why this fits Future Me

${c.fit}

## Product positioning

**Category:** ${c.descriptor}  
**Promise:** ${c.uvp}  
**Primary CTA:** ${c.cta}  
**Voice:** ${c.voice}

## Distinct interaction model

${c.interaction}

### Navigation structure

${c.navigation}

- Desktop: ${c.desktopNav}
- Mobile: ${c.mobileNav}

### Core layouts

- **Homepage:** ${c.landingLayout}
- **AI interview:** ${c.interviewModel}
- **Dashboard:** ${c.dashboardLayout}
- **Results:** ${c.resultsLayout}
- **Roadmap:** ${c.roadmapLayout}

## Design guardrails

- Present routes as hypotheses for educational exploration, never guaranteed predictions.
- Keep private chat content separate from any parent/teacher summary.
- Keep official admissions facts, source dates, and assumptions distinguishable.
- Offer a list alternative to any graph, map, or highly visual interaction.
- Make “ยังไม่รู้” and “แก้ไขสิ่งที่ AI เข้าใจ” first-class actions.
`;
}

function designSystem(c) {
  return `# ${c.name} Design System

## Design intent

${c.visual}

## Color tokens

| Token | Value | Use |
|---|---:|---|
| Background | \`${c.color.bg}\` | Page canvas |
| Surface | \`${c.color.surface}\` | Cards, dialogs, forms |
| Primary text | \`${c.color.ink}\` | Headings and body |
| Muted text | \`${c.color.muted}\` | Supporting copy; verify AA contrast at each size |
| Primary action | \`${c.color.primary}\` | Main CTA and active states |
| Secondary | \`${c.color.secondary}\` | Supporting visualization/choice |
| Accent | \`${c.color.accent}\` | Small highlights only |
| Border | \`${c.color.border}\` | Dividers and control outlines |

Never use color alone to represent route status, RIASEC signal, confidence, or progress.

## Typography

- UI/body stack: \`${c.font}\`
- Display stack: \`${c.headingFont}\`
- Display: clamp(2.6rem, 6vw, 6.4rem), line-height 0.95–1.08.
- H1: 48–72 px desktop, 38–48 px mobile.
- H2: 30–44 px desktop, 28–34 px mobile.
- Body: 18 px preferred, 16 px minimum; Thai line-height 1.55–1.75.
- Label: 13–14 px with clear casing; avoid excessive letter spacing in Thai.

The prototype uses local system fonts so it runs offline. Production should test an appropriate Thai webfont and performance budget.

## Spacing and shape

- 4 px base grid.
- Content max width: 1240 px.
- Section spacing: 96–144 px desktop; 64–88 px mobile.
- Card padding: 24–32 px.
- Default radius: \`${c.radius}\`.
- Touch target: at least 44 × 44 px; use 48 px for primary mobile controls.

## Components

### Primary button

Solid primary color, high-contrast label, optional arrow, visible focus ring, and clear disabled state.

### Route card

Must include route strategy, short rationale, 2–3 evidence items, open question, trade-off, source state, and a Try next action. A route card never shows a “perfect match” badge.

### Evidence chip

Carries both a label and source type: \`เรื่องที่เล่า\`, \`ภารกิจ\`, \`ความสนใจ\`, or \`ข้อจำกัด\`. Clicking opens the original editable evidence.

### AI message or prompt

One question per message. Streaming text is announced accessibly after a complete thought, not token by token.

### Roadmap node

Uses icon/label/status text, prerequisite disclosure, and accessible list order. Locked means “requires a previous step,” never “failed.”

### Source/freshness badge

Shows publisher, last checked date, and whether the learner must verify current criteria.

## Illustration and imagery

- Direction: ${c.visual}
- Generated hero: \`assets/hero-visual.png\`.
- Keep headlines, labels, statistics, and calls to action out of generated images.
- Use meaningful alt text when the image communicates content; use empty alt text when purely decorative.
- Avoid prestige cues, gendered job imagery, copied platform layouts, branded uniforms, and fortune-telling symbols.

## Motion

- 160–240 ms for controls, 320–480 ms for layout transitions.
- Animate relationship changes—not decorative loops.
- Respect \`prefers-reduced-motion\`; maps and timelines must work without animation.

## Accessibility QA

- WCAG 2.2 AA target.
- Test 360 px, 200% zoom, keyboard-only, VoiceOver/TalkBack, reduced motion, and high contrast.
- Focus ring uses a 3 px outline with at least 3:1 contrast.
- Error messages appear in an error summary and beside the field.
- All charts/graphs include a table or list view.
`;
}

function conceptSitemap(c) {
  return `# ${c.name} Sitemap

## Navigation model

${c.navigation}

\`\`\`text
Public
├── Home — ${c.landingLayout}
├── How ${c.name} works
├── Sample experience
├── For students
├── For families and schools
├── Privacy, safety, evidence
└── Sign in

Authenticated student
├── ${c.navigation}
├── Discovery
│   ├── Onboarding
│   ├── AI interview
│   ├── RIASEC interest signal
│   ├── Scenario mission
│   └── Evidence review
├── Possibilities
│   ├── Three-route result
│   ├── Career detail
│   ├── Education-path detail
│   └── Compare and sources
├── Personal roadmap
├── Saved items
├── Progress
├── Share summary
└── Profile and privacy
\`\`\`

## Responsive navigation

- Desktop: ${c.desktopNav}
- Mobile: ${c.mobileNav}
- Focus mode: Interview and assessment views suppress nonessential navigation but retain Exit, Save, Help, and Privacy.
`;
}

function userFlow(c) {
  return `# ${c.name} User Flow

## Primary flow

\`\`\`text
Landing
→ “${c.cta}”
→ tier and decision context
→ ${c.interviewModel}
→ editable evidence summary
→ choose a scenario mission
→ mission debrief
→ ${c.resultsLayout}
→ compare three route strategies
→ ${c.roadmapLayout}
→ save
→ optional consent-based parent/counselor summary
\`\`\`

## Interaction signature

${c.interaction}

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
`;
}

function pageStructure(c) {
  const rows = pages.map((p) => {
    const mobile = `${c.mobileNav} Stack content in one column, keep the primary action reachable above the mobile keyboard, and provide save/resume.`;
    const desktop = `${pageLayoutFor(c, p.name)} ${c.desktopNav}`;
    const a11y = `Semantic landmarks, keyboard order, visible focus, Thai text at 16 px+, no color-only meaning, descriptive errors, and reduced-motion support.`;
    return `| ${safe(p.name)} | ${safe(p.objective)} | ${safe(p.content)} | ${safe(p.components)} | ${safe(p.cta)} | ${safe(c.interaction)} | ${safe(mobile)} | ${safe(desktop)} | ${safe(a11y)} |`;
  }).join("\n");
  return `# ${c.name} Page Structure

Every required page is specified below. The layouts use ${c.visual.toLowerCase()}, while the product logic remains consistent with the shared two-phase evidence model.

| Page | Page objective | Main content | Important components | Main CTA | User interaction | Mobile considerations | Desktop considerations | Accessibility considerations |
|---|---|---|---|---|---|---|---|---|
${rows}

## Prototype scope

The responsive prototype demonstrates Landing, AI Interview, Career Results, Dashboard, and Future Roadmap. The remaining required pages are fully described here and inherit the design system and navigation model.
`;
}

function contentGuide(c) {
  return `# ${c.name} Content Guide

## Voice

${c.voice}

## Hero copy

- Eyebrow: \`${c.descriptor}\`
- Headline: **${c.headline}**
- Supporting copy: ${c.subhead}
- Primary CTA: **${c.cta}**
- Secondary CTA: **ดูตัวอย่างก่อน**

## Required disclosure

> แนวทางเหล่านี้เป็นข้อมูลเพื่อช่วยสำรวจจากคำตอบและหลักฐานที่คุณให้ ไม่ใช่คำทำนายหรือการรับประกันการเรียนต่อ อาชีพ หรือรายได้ โปรดตรวจสอบเกณฑ์ล่าสุดและพูดคุยกับครูแนะแนวหรือผู้ใหญ่ที่ไว้ใจ

## Preferred language

| Avoid | Prefer |
|---|---|
| อาชีพที่ใช่ที่สุด | เส้นทางที่น่าลองสำรวจ |
| คุณเหมาะ 96% | หลักฐานที่สนับสนุนเส้นทางนี้ |
| AI รู้จักคุณแล้ว | นี่คือสิ่งที่ AI เข้าใจ—แก้ไขได้ |
| คุณต้องเรียน… | ทางเลือกหนึ่งคือ… |
| ไม่ผ่าน / ล้มเหลว | ยังต้องมีหลักฐานเพิ่ม / ลองอีกแบบ |
| การันตีงาน | ทักษะและประสบการณ์ที่เส้นทางนี้มักต้องใช้ |

## Sample AI exchange

**AI:** เล่าเหตุการณ์หนึ่งที่คุณทำอะไรจนลืมเวลาให้ฟังได้ไหม ไม่จำเป็นต้องเป็นเรื่องเรียน  
**Student:** ตอนทำโปสเตอร์งานโรงเรียน เราแก้หลายรอบแต่ยังอยากทำต่อ  
**AI:** ฟังดูเหมือนคุณมีพลังกับการทำให้ไอเดียมองเห็นได้จริง ตอนนั้นส่วนไหนที่คุณลงมือเองและภูมิใจที่สุด?  
**Evidence preview:** “ทดลองหลายแบบและปรับจากข้อเสนอแนะ” — แหล่งที่มา: เรื่องที่เล่า — **แก้ไขได้**

## Result-card anatomy

1. Route strategy label.
2. Plain-language route title.
3. Two-sentence rationale.
4. Evidence items and their source type.
5. One uncertainty or assumption.
6. Education/work pathway alternatives.
7. One short mission.
8. Source and freshness note.

## Thai/English conventions

- Thai first; English in parentheses for widely used terms such as UX/UI, DVE, TCAS, or RIASEC.
- Use Thai Buddhist/calendar dates only when the official source uses them; show Gregorian year where confusion is possible.
- Do not translate official test names loosely.
- Use Arabic numerals for scanability but do not rely on numerals alone for step names.
`;
}

function imagePrompts(c) {
  return `# ${c.name} Image Prompts

## Asset 01 — Generated landing hero

- **Filename:** \`assets/hero-visual.png\`
- **Generator:** OpenAI built-in image generation tool
- **Use case:** Landing-page hero
- **Aspect ratio:** 16:9 landscape
- **Text inside image:** Excluded
- **Traceability:** The exact generation prompt is reproduced below.

\`\`\`text
${c.heroPrompt}
\`\`\`

## Planned derivative assets

The following are intentionally specified but not independently generated in this concept package; UI mockups use the original hero plus code-native interface graphics.

### AI guide or motif

**Prompt:** Create an original supporting motif derived from the ${c.name} visual language: ${c.visual}. Center one simple, non-branded symbol that represents reflective guidance rather than prediction. Soft studio lighting, palette ${Object.values(c.color).slice(0, 5).join(", ")}, clean background, square 1:1, no text, no letters, no numbers, no logos, no watermark.

### Career-cluster illustration set

**Prompt:** Create five original editorial vignettes for digital work, business, care, creative work, and engineering in the ${c.name} visual language. Show diverse age-appropriate Thai students trying activities rather than posing as professionals. Consistent lighting and palette, modular 4:3 compositions, no text, no logos, no copied interface, no watermark.

### Roadmap background

**Prompt:** Create a subtle abstract background suggesting connected milestones and alternate pathways in the ${c.name} design language. High negative space, low contrast so HTML nodes remain readable, wide 16:9, no text, no logos, no arrows implying one inevitable future, no watermark.
`;
}

function prototypeReadme(c) {
  return `# ${c.name} Prototype

This dependency-free prototype demonstrates:

- Responsive landing page
- Navigation
- AI interview interface
- Career route results
- Dashboard
- Future roadmap
- Mobile layout
- Wireframe rendering mode

## Run

From the workspace root:

\`\`\`bash
python3 -m http.server 8080 --directory FutureMe_Web_Design_Concepts
\`\`\`

Open:

\`http://localhost:8080/${c.folder}/prototype/\`

Use the prototype navigation or query parameters:

- \`?page=landing\`
- \`?page=interview\`
- \`?page=results\`
- \`?page=dashboard\`
- \`?page=roadmap\`
- add \`&mode=wireframe\` for grayscale wireframe mode.

All data and interactions are fictional design-demo content. The prototype does not call an AI model or make real recommendations.
`;
}

function prototypeHtml(c) {
  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="description" content="${safe(c.sentence)}">
  <title>${c.name} — Future Me concept</title>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
<body class="theme-${c.slug}">
  <a class="skip-link" href="#main">ข้ามไปยังเนื้อหา</a>
  <header class="site-header">
    <a class="brand" href="?page=landing" data-page="landing" aria-label="${c.name} home">
      <span class="brand-mark" aria-hidden="true"></span>
      <span><strong>${c.name}</strong><small>Future Me concept ${String(c.id).padStart(2, "0")}</small></span>
    </a>
    <nav class="top-nav" aria-label="การนำทางหลัก">
      <a href="?page=interview" data-page="interview">ค้นหาตัวตน</a>
      <a href="?page=results" data-page="results">เส้นทาง</a>
      <a href="?page=roadmap" data-page="roadmap">Roadmap</a>
      <a href="?page=dashboard" data-page="dashboard">แดชบอร์ด</a>
    </nav>
    <a class="header-cta" href="?page=interview" data-page="interview">${c.cta}</a>
  </header>
  <main id="main" tabindex="-1"></main>
  <nav class="mobile-nav" aria-label="การนำทางมือถือ">
    <a href="?page=landing" data-page="landing"><span aria-hidden="true">●</span>หน้าแรก</a>
    <a href="?page=interview" data-page="interview"><span aria-hidden="true">◐</span>ค้นหา</a>
    <a href="?page=results" data-page="results"><span aria-hidden="true">◇</span>เส้นทาง</a>
    <a href="?page=dashboard" data-page="dashboard"><span aria-hidden="true">▦</span>ของฉัน</a>
  </nav>
  <div class="a11y-status" aria-live="polite" aria-atomic="true"></div>
</body>
</html>`;
}

function themeExtra(c) {
  const blocks = {
    compass: `
.theme-compass .hero-copy{padding:32px 0 48px}.theme-compass .hero-media img{clip-path:inset(0 round 44% 18% 22% 18%)}
.theme-compass .journey-card:nth-child(2){transform:translateY(22px)}.theme-compass .route-card{border-top:5px solid var(--primary)}
.theme-compass .dashboard-grid{grid-template-areas:"mission mission evidence" "saved plan plan" "sharing plan plan"}`,
    mirror: `
.theme-mirror .site-header{width:min(920px,calc(100% - 32px));left:50%;transform:translateX(-50%);top:14px;border:1px solid var(--border);border-radius:999px}
.theme-mirror .hero{padding-top:78px}.theme-mirror h1,.theme-mirror h2{font-family:var(--heading-font);font-weight:500}
.theme-mirror .hero-media{border-radius:48% 48% 24% 24%}.theme-mirror .hero-media img{filter:saturate(.82)}
.theme-mirror .journey-card{border-radius:48px}.theme-mirror .prompt-card{max-width:820px;margin-inline:auto;text-align:center}
.theme-mirror .dashboard-grid{grid-template-columns:1fr 1fr;grid-template-areas:"mission evidence" "plan plan" "saved sharing"}.theme-mirror .mission-card{border-radius:90px 28px 28px 28px}.theme-mirror .route-card{border-radius:48px}.theme-mirror .route-card:nth-child(2){transform:translateY(28px)}
@media(max-width:800px){.theme-mirror .site-header{width:calc(100% - 24px);top:8px;left:auto;transform:none;margin-inline:auto}.theme-mirror .hero{padding-top:24px}}`,
    timeline: `
.theme-timeline .site-header{background:rgba(7,20,38,.76);backdrop-filter:blur(18px);border-color:rgba(255,255,255,.1)}
.theme-timeline .hero{min-height:720px;isolation:isolate}.theme-timeline .hero-media{position:absolute;inset:0;z-index:-1;border-radius:0;opacity:.88}
.theme-timeline .hero-media:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--bg) 4%,rgba(7,20,38,.86) 34%,rgba(7,20,38,.08) 76%)}
.theme-timeline .hero-copy{max-width:630px;align-self:center}.theme-timeline .hero-grid{display:block}
.theme-timeline .hero-media img{height:100%;object-fit:cover}.theme-timeline .proof-card{background:rgba(13,32,56,.8);backdrop-filter:blur(14px)}
.theme-timeline .roadmap{display:flex;overflow:auto;align-items:flex-start}.theme-timeline .roadmap-node{min-width:260px}.theme-timeline .roadmap-line{width:72px;height:3px}
.theme-timeline .dashboard-grid{grid-template-columns:repeat(4,1fr);grid-template-areas:"mission mission mission evidence" "plan plan saved sharing"}.theme-timeline .route-grid{display:flex;overflow-x:auto;padding:10px 4px 24px}.theme-timeline .route-card{min-width:390px}`,
    lab: `
@media(min-width:1050px){.theme-lab .site-header{position:fixed;top:0;bottom:0;left:0;width:220px;height:auto;display:flex;flex-direction:column;align-items:stretch;padding:28px 20px;border-right:1px solid var(--border)}
.theme-lab .brand{margin-bottom:48px}.theme-lab .top-nav{display:flex;flex-direction:column;align-items:stretch}.theme-lab .top-nav a{padding:13px 12px;border-radius:10px}.theme-lab .header-cta{margin-top:auto;text-align:center}.theme-lab main{margin-left:220px}}
.theme-lab .hero-grid{grid-template-columns:.85fr 1.15fr}.theme-lab .hero-media,.theme-lab .card,.theme-lab .journey-card{border-radius:14px}
.theme-lab .dashboard-grid{grid-template-columns:1.35fr .65fr .65fr;grid-template-areas:"mission evidence saved" "mission plan plan" "sharing plan plan"}.theme-lab .metric{font-family:ui-monospace,monospace}
.theme-lab .route-grid{grid-template-columns:1fr}.theme-lab .route-card{display:grid;grid-template-columns:180px 1.3fr 1fr 220px;gap:20px;align-items:start;min-height:0}.theme-lab .route-card .button{align-self:center}.theme-lab .route-card.featured{transform:none}`,
    quest: `
.theme-quest .site-header{margin:14px auto 0;width:min(1220px,calc(100% - 28px));border-radius:999px;border:2px solid var(--ink);box-shadow:0 5px 0 var(--ink)}
.theme-quest .hero-media{transform:rotate(1.5deg);border:3px solid var(--ink);box-shadow:9px 10px 0 var(--ink)}
.theme-quest .journey-card{border:2px solid var(--ink);box-shadow:5px 6px 0 var(--ink)}.theme-quest .journey-card:nth-child(2){transform:rotate(-2deg)}.theme-quest .journey-card:nth-child(3){transform:rotate(2deg)}
.theme-quest .button{border:2px solid var(--ink);box-shadow:0 4px 0 var(--ink)}.theme-quest .button:active{transform:translateY(3px);box-shadow:0 1px 0 var(--ink)}
.theme-quest .dashboard-grid{grid-template-columns:1.25fr .75fr .75fr;grid-template-areas:"mission mission saved" "mission evidence sharing" "plan plan plan"}.theme-quest .mission-card{min-height:430px;border:3px solid var(--ink);box-shadow:8px 9px 0 var(--ink)}.theme-quest .route-card:nth-child(1){transform:rotate(-1.5deg)}.theme-quest .route-card:nth-child(3){transform:rotate(1.5deg)}`,
    counselor: `
.theme-counselor .hero-grid{grid-template-columns:.82fr 1.18fr;gap:68px}.theme-counselor h1,.theme-counselor h2{font-family:var(--heading-font);font-weight:500}
.theme-counselor .hero-media{border-radius:160px 32px 160px 32px}.theme-counselor .coach-avatar{width:72px;height:72px;border-radius:50%;background:radial-gradient(circle,var(--accent),var(--primary))}
.theme-counselor .chat-bubble.ai{border-radius:4px 28px 28px 28px}.theme-counselor .chat-bubble.user{border-radius:28px 4px 28px 28px}
.theme-counselor .dashboard-grid{grid-template-columns:1fr 1fr;grid-template-areas:"mission evidence" "plan plan" "sharing saved"}.theme-counselor .mission-card{border-radius:120px 32px 32px 32px;padding-left:64px}.theme-counselor .route-grid{grid-template-columns:1fr}.theme-counselor .route-card{min-height:0;display:grid;grid-template-columns:220px 1fr 1fr;gap:24px}.theme-counselor .route-card.featured{transform:none}`,
    story: `
.theme-story .site-header{border-bottom:4px solid var(--ink)}.theme-story h1,.theme-story h2{font-family:var(--heading-font);text-transform:uppercase;letter-spacing:-.04em}
.theme-story .hero-grid{grid-template-columns:.76fr 1.24fr}.theme-story .hero-media{border-radius:0;border:4px solid var(--ink);box-shadow:12px 12px 0 var(--primary)}
.theme-story .eyebrow{border:2px solid currentColor;border-radius:0;transform:rotate(-2deg)}.theme-story .card,.theme-story .journey-card,.theme-story .route-card{border:3px solid var(--ink);border-radius:0;box-shadow:6px 7px 0 var(--ink)}
.theme-story .button{border-radius:0}.theme-story .journey-card:nth-child(2){background:var(--secondary);color:#fff}
.theme-story .dashboard-grid{grid-template-columns:1.2fr .8fr;grid-template-areas:"mission evidence" "plan saved" "plan sharing"}.theme-story .route-grid{grid-template-columns:1.1fr .8fr 1.1fr}.theme-story .route-card:nth-child(2){transform:translateY(38px)}`,
    constellation: `
.theme-constellation .site-header{background:rgba(9,11,34,.7);backdrop-filter:blur(18px);border-color:rgba(255,255,255,.12)}
.theme-constellation .hero{min-height:700px}.theme-constellation .hero-media{border:1px solid rgba(255,255,255,.18);box-shadow:0 0 80px rgba(109,93,251,.26)}
.theme-constellation .card,.theme-constellation .journey-card,.theme-constellation .route-card{background:rgba(19,22,51,.76);backdrop-filter:blur(16px);border-color:rgba(255,255,255,.13)}
.theme-constellation .brand-mark,.theme-constellation .node-dot{box-shadow:0 0 22px var(--secondary)}.theme-constellation .journey-grid{position:relative}.theme-constellation .journey-grid:before{content:"";position:absolute;left:10%;right:10%;top:50%;height:1px;background:linear-gradient(90deg,transparent,var(--secondary),transparent)}
.theme-constellation .dashboard-grid{grid-template-columns:repeat(4,1fr);grid-template-areas:"mission mission evidence saved" "plan plan plan sharing"}.theme-constellation .route-grid{display:flex;gap:0;padding:32px 60px}.theme-constellation .route-card{min-width:400px;margin-left:-36px}.theme-constellation .route-card:first-child{margin-left:0}.theme-constellation .route-card:nth-child(2){transform:translateY(34px)}`,
    clarity: `
.theme-clarity .site-header{border-bottom:1px solid var(--ink);padding-inline:4vw}.theme-clarity .brand-mark{border-radius:0;background:var(--ink)}
.theme-clarity .hero-grid{grid-template-columns:7fr 5fr;gap:40px}.theme-clarity h1{font-weight:500;letter-spacing:-.055em;max-width:950px}
.theme-clarity .hero-media,.theme-clarity .card,.theme-clarity .journey-card,.theme-clarity .route-card,.theme-clarity .button{border-radius:2px;box-shadow:none}
.theme-clarity .hero-media{border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}.theme-clarity .eyebrow{border-radius:0;background:transparent;border:1px solid var(--ink);text-transform:uppercase;letter-spacing:.11em}
.theme-clarity .journey-grid{border-top:1px solid var(--ink);padding-top:24px}.theme-clarity .dashboard-grid{grid-template-columns:1fr 1fr;grid-template-areas:"mission mission" "evidence saved" "plan plan" "sharing sharing"}.theme-clarity .card{border-width:0 0 1px 0}.theme-clarity .route-grid{grid-template-columns:1fr}.theme-clarity .route-card{display:grid;grid-template-columns:200px 1fr 1fr 180px;gap:18px;min-height:0;border-width:1px 0 0}.theme-clarity .route-card.featured{transform:none}`,
    pulse: `
.theme-pulse{background:radial-gradient(circle at 80% 8%,#39236b 0,transparent 36%),var(--bg)}.theme-pulse .site-header{background:rgba(21,16,42,.72);backdrop-filter:blur(18px);border-color:rgba(255,255,255,.14)}
.theme-pulse h1,.theme-pulse h2{font-family:var(--heading-font);letter-spacing:-.045em}.theme-pulse .hero-media{transform:rotate(2deg);border:3px solid var(--accent);box-shadow:-12px 14px 0 var(--primary)}
.theme-pulse .button.primary{color:#15102a}.theme-pulse .journey-card:nth-child(1){background:var(--primary);transform:rotate(-2deg)}.theme-pulse .journey-card:nth-child(2){background:var(--secondary);transform:translateY(20px)}.theme-pulse .journey-card:nth-child(3){color:#15102a;background:var(--accent);transform:rotate(2deg)}
.theme-pulse .route-card{background:linear-gradient(145deg,var(--surface),#382363)}.theme-pulse .dashboard-grid{grid-template-columns:repeat(3,1fr);grid-template-areas:"mission evidence saved" "mission plan sharing"}.theme-pulse .mission-card{min-height:500px;border:2px solid var(--accent)}.theme-pulse .route-grid{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding:18px}.theme-pulse .route-card{min-width:420px;scroll-snap-align:start}`
  };
  return blocks[c.slug] || "";
}

function prototypeCss(c) {
  return `:root{
  --bg:${c.color.bg};--surface:${c.color.surface};--ink:${c.color.ink};--muted:${c.color.muted};
  --primary:${c.color.primary};--secondary:${c.color.secondary};--accent:${c.color.accent};--border:${c.color.border};
  --font:${c.font};--heading-font:${c.headingFont};--radius:${c.radius};--shadow:0 18px 50px rgba(20,30,50,.12);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--font);font-size:17px;line-height:1.62;-webkit-font-smoothing:antialiased;overflow-x:hidden}
button,input,textarea{font:inherit}
a{color:inherit}
img{max-width:100%;display:block}
.skip-link{position:fixed;left:16px;top:-100px;z-index:999;padding:12px 16px;background:var(--ink);color:var(--bg);border-radius:8px}
.skip-link:focus{top:16px}
:focus-visible{outline:3px solid var(--accent);outline-offset:4px}
.site-header{position:sticky;z-index:50;top:0;min-height:78px;display:flex;align-items:center;gap:28px;padding:14px max(24px,calc((100vw - 1240px)/2));background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
.brand{display:flex;align-items:center;gap:12px;text-decoration:none;white-space:nowrap}
.brand-mark{width:36px;height:36px;border-radius:12px;background:linear-gradient(135deg,var(--primary),var(--secondary));display:block}
.brand strong,.brand small{display:block}.brand strong{font-size:17px;line-height:1.1}.brand small{font-size:11px;color:var(--muted);margin-top:4px}
.top-nav{display:flex;gap:6px;margin-left:auto}.top-nav a{padding:9px 12px;text-decoration:none;color:var(--muted);font-size:15px}.top-nav a:hover,.top-nav a[aria-current="page"]{color:var(--ink)}
.header-cta,.button{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:48px;padding:11px 20px;border:1px solid transparent;border-radius:999px;text-decoration:none;font-weight:750;cursor:pointer}
.header-cta,.button.primary{background:var(--primary);color:#fff}.button.secondary{background:var(--surface);border-color:var(--border);color:var(--ink)}
.button.ghost{background:transparent;border-color:var(--border);color:var(--ink)}.button.small{min-height:40px;padding:8px 14px;font-size:14px}
.mobile-nav{display:none}
main{min-height:calc(100vh - 78px)}
.page-shell{width:min(1240px,calc(100% - 44px));margin:0 auto;padding:48px 0 100px}
.hero{position:relative;min-height:620px;display:grid;align-items:center}
.hero-grid{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:54px}
.hero-copy{position:relative;z-index:2}
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px;background:color-mix(in srgb,var(--secondary) 18%,var(--surface));font-size:13px;font-weight:800;color:var(--ink);margin-bottom:22px}
h1,h2,h3,p{margin-top:0}h1,h2,h3{overflow-wrap:anywhere}h1,h2{font-family:var(--heading-font)}
h1{font-size:clamp(3rem,6.2vw,6.1rem);line-height:.98;letter-spacing:-.055em;margin-bottom:26px}
h2{font-size:clamp(2rem,3.8vw,3.6rem);line-height:1.08;letter-spacing:-.035em;margin-bottom:18px}
h3{font-size:20px;line-height:1.3;margin-bottom:10px}
.lead{font-size:clamp(1.08rem,1.5vw,1.3rem);line-height:1.62;color:var(--muted);max-width:690px}
.button-row{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:30px}
.trust-note{display:flex;gap:10px;align-items:flex-start;margin-top:22px;color:var(--muted);font-size:14px;max-width:620px}
.trust-note:before{content:"i";flex:0 0 22px;height:22px;border:1px solid var(--border);border-radius:50%;display:grid;place-items:center;font-weight:800}
.hero-media{position:relative;overflow:hidden;border-radius:var(--radius);box-shadow:var(--shadow);min-height:450px;background:var(--surface)}
.hero-media img{width:100%;height:100%;min-height:450px;object-fit:cover}
.proof-card{position:absolute;right:18px;bottom:18px;max-width:290px;padding:16px 18px;background:color-mix(in srgb,var(--surface) 90%,transparent);backdrop-filter:blur(12px);border:1px solid color-mix(in srgb,var(--border) 70%,transparent);border-radius:18px;box-shadow:0 10px 28px rgba(0,0,0,.12)}
.proof-card strong,.proof-card span{display:block}.proof-card span{font-size:13px;color:var(--muted);margin-top:3px}
.section{padding:92px 0}.section-head{max-width:760px;margin-bottom:38px}.section-head p{color:var(--muted);font-size:18px}
.journey-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.journey-card,.card,.route-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:26px;box-shadow:0 10px 30px rgba(20,30,50,.06)}
.step-num{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:var(--ink);color:var(--bg);font-size:14px;font-weight:850;margin-bottom:42px}
.journey-card p,.card p,.route-card p{color:var(--muted)}
.evidence-strip{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.chip{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid var(--border);border-radius:999px;font-size:13px;background:color-mix(in srgb,var(--surface) 88%,var(--secondary))}
.chip:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--secondary)}
.disclaimer{margin-top:28px;padding:18px 20px;border-left:4px solid var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--surface));font-size:14px;color:var(--muted)}
.page-head{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:34px}.page-head h1{font-size:clamp(2.6rem,5vw,5.2rem);max-width:850px;margin:0}.page-head p{max-width:520px;color:var(--muted)}
.interview-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,.65fr);gap:22px}
.interview-main,.evidence-panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:28px;min-height:610px}
.progress-row{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:28px;color:var(--muted);font-size:14px}.progress-track{height:8px;flex:1;max-width:360px;background:var(--border);border-radius:99px;overflow:hidden}.progress-fill{height:100%;width:42%;background:var(--primary);border-radius:inherit}
.coach-line{display:flex;align-items:center;gap:14px;margin-bottom:24px}.coach-avatar{width:50px;height:50px;border-radius:16px;background:linear-gradient(135deg,var(--primary),var(--secondary));box-shadow:0 8px 24px color-mix(in srgb,var(--primary) 28%,transparent)}
.coach-line small,.evidence-panel small{color:var(--muted)}
.chat-stack{display:flex;flex-direction:column;gap:14px}.chat-bubble{max-width:82%;padding:16px 18px;border-radius:20px;background:color-mix(in srgb,var(--secondary) 13%,var(--surface));border:1px solid var(--border)}
.chat-bubble.user{align-self:flex-end;background:var(--ink);color:var(--bg);border-color:var(--ink)}
.chat-bubble p{margin:0}.prompt-card{margin:32px 0 22px;padding:30px;background:color-mix(in srgb,var(--primary) 8%,var(--surface));border:1px solid var(--border);border-radius:calc(var(--radius) * .85)}
.prompt-card h2{font-size:clamp(1.7rem,3vw,2.7rem);margin:0}
.reply-options{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}.reply-chip{border:1px solid var(--border);background:var(--surface);color:var(--ink);border-radius:999px;padding:10px 14px;cursor:pointer}
.input-row{display:flex;gap:10px;align-items:flex-end;margin-top:22px}.input-row textarea{flex:1;min-height:88px;resize:vertical;border:1px solid var(--border);border-radius:16px;padding:14px;background:var(--bg);color:var(--ink)}
.evidence-item{padding:16px 0;border-bottom:1px solid var(--border)}.evidence-item:last-child{border:0}.evidence-meta{display:flex;justify-content:space-between;color:var(--muted);font-size:12px;margin-top:8px}
.dashboard-grid{display:grid;grid-template-columns:1.2fr .8fr .8fr;grid-template-areas:"mission mission evidence" "saved plan plan" "sharing plan plan";gap:20px}.mission-card{grid-area:mission}.evidence-card{grid-area:evidence}.saved-count-card{grid-area:saved}.plan-card{grid-area:plan}.sharing-card{grid-area:sharing}.metric{font-size:44px;line-height:1;font-weight:850;margin:12px 0}.metric-label{color:var(--muted);font-size:14px}
.next-card{min-height:300px;background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 45%,var(--secondary)));color:white}.next-card p{color:rgba(255,255,255,.8)}
.progress-ring{width:132px;height:132px;border-radius:50%;background:conic-gradient(var(--secondary) 0 62%,var(--border) 62%);display:grid;place-items:center;margin:24px auto}.progress-ring:after{content:"62%";display:grid;place-items:center;width:96px;height:96px;border-radius:50%;background:var(--surface);color:var(--ink);font-size:24px;font-weight:850}
.saved-list{display:grid;gap:12px}.saved-row{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid var(--border)}.saved-row:last-child{border:0}.saved-row small{color:var(--muted)}
.route-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}.route-card{display:flex;flex-direction:column;min-height:470px}.route-card.featured{border:2px solid var(--primary);transform:translateY(-8px)}
.route-type{font-size:12px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:var(--primary)}.route-score{font-size:13px;color:var(--muted);margin:7px 0 18px}.route-card .button{margin-top:auto}
.why-list{padding:0;list-style:none}.why-list li{display:flex;gap:10px;padding:8px 0;font-size:15px}.why-list li:before{content:"";width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:var(--secondary);margin-top:8px}
.source-note{font-size:12px;color:var(--muted);border-top:1px solid var(--border);padding-top:14px;margin-top:20px}
.roadmap{max-width:900px;margin:30px auto}.roadmap-node{position:relative;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px;display:grid;grid-template-columns:52px 1fr auto;gap:16px;align-items:center}
.node-dot{width:48px;height:48px;border-radius:16px;background:color-mix(in srgb,var(--primary) 18%,var(--surface));border:2px solid var(--primary);display:grid;place-items:center;font-weight:850}
.node-state{font-size:12px;color:var(--muted)}.roadmap-line{width:3px;height:38px;background:var(--border);margin:auto}.roadmap-node.active{border:2px solid var(--primary)}.roadmap-node.done .node-dot{background:var(--secondary);border-color:var(--secondary);color:white}
.branch-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0 12px 70px}.branch-row .roadmap-node{grid-template-columns:38px 1fr;padding:16px}.branch-row .node-dot{width:36px;height:36px;border-radius:11px}
.a11y-status{position:fixed;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
body.wireframe{--bg:#f4f4f4;--surface:#fff;--ink:#222;--muted:#656565;--primary:#777;--secondary:#aaa;--accent:#444;--border:#a9a9a9;background:#f4f4f4}
body.wireframe *{box-shadow:none!important;text-shadow:none!important;animation:none!important}
body.wireframe img{filter:grayscale(1);opacity:.1}
body.wireframe .hero-media:before{content:"IMAGE / HERO";position:absolute;inset:0;display:grid;place-items:center;z-index:2;font:700 18px ui-monospace;color:#444;background:repeating-linear-gradient(45deg,transparent 0 14px,rgba(0,0,0,.025) 14px 16px)}
body.wireframe .button,body.wireframe .header-cta{background:#555;color:white}body.wireframe .next-card{background:white;color:#222;border:2px solid #555}body.wireframe .next-card p{color:#656565}
${themeExtra(c)}
@media(max-width:1040px){
  .site-header{padding-inline:20px}.top-nav{display:none}.header-cta{margin-left:auto}
  .hero-grid{grid-template-columns:1fr;gap:30px}.hero{padding-top:24px}.hero-media{min-height:360px}.hero-media img{min-height:360px}
  .journey-grid,.route-grid{grid-template-columns:1fr 1fr}.route-card:last-child{grid-column:1/-1}.dashboard-grid{grid-template-columns:1fr 1fr;grid-template-areas:"mission mission" "evidence saved" "plan plan" "sharing sharing"}.interview-layout{grid-template-columns:1fr}
}
@media(max-width:680px){
  body{font-size:16px;padding-bottom:74px}.site-header{min-height:66px;padding:10px 16px}.brand small,.header-cta{display:none}.brand-mark{width:32px;height:32px}.page-shell{width:min(100% - 28px,1240px);padding:28px 0 60px}
  .mobile-nav{position:fixed;z-index:90;left:10px;right:10px;bottom:8px;display:grid;grid-template-columns:repeat(4,1fr);background:color-mix(in srgb,var(--surface) 92%,transparent);border:1px solid var(--border);border-radius:22px;padding:7px;backdrop-filter:blur(16px);box-shadow:0 14px 40px rgba(0,0,0,.2)}
  .mobile-nav a{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 3px;text-decoration:none;font-size:11px;color:var(--muted);border-radius:14px}.mobile-nav a span{font-size:19px;line-height:1}.mobile-nav a[aria-current="page"]{background:color-mix(in srgb,var(--primary) 14%,var(--surface));color:var(--ink)}
  .hero{min-height:0}.hero-grid{display:flex;flex-direction:column}.hero-copy{order:1}.hero-media{order:0;width:100%;min-height:245px}.hero-media img{min-height:245px;aspect-ratio:16/10}.proof-card{right:10px;bottom:10px;padding:11px 12px;max-width:220px}
  h1{font-size:clamp(2.75rem,14vw,4.25rem)}h2{font-size:2.25rem}.lead{font-size:1.02rem}.button{width:100%}.button-row{display:grid}
  .section{padding:62px 0}.journey-grid,.route-grid,.dashboard-grid{grid-template-columns:1fr;grid-template-areas:"mission" "evidence" "saved" "plan" "sharing"}.route-card:last-child{grid-column:auto}.journey-card:nth-child(n),.route-card.featured{transform:none!important}
  .page-head{display:block}.page-head h1{font-size:2.9rem}.interview-main,.evidence-panel{padding:18px;min-height:auto}.evidence-panel{display:none}.prompt-card{padding:21px}.prompt-card h2{font-size:1.65rem}.chat-bubble{max-width:92%}
  .input-row{position:sticky;bottom:76px;background:var(--surface);padding-top:8px}.input-row textarea{min-height:72px}.input-row .button{width:auto}
  .route-card{min-height:auto}.route-grid{gap:14px}.roadmap-node{grid-template-columns:42px 1fr;padding:16px}.roadmap-node>.button{grid-column:1/-1}.node-dot{width:40px;height:40px;border-radius:12px}.branch-row{margin-left:24px;grid-template-columns:1fr}
  .theme-compass .dashboard-grid,.theme-mirror .dashboard-grid,.theme-timeline .dashboard-grid,.theme-lab .dashboard-grid,.theme-quest .dashboard-grid,.theme-counselor .dashboard-grid,.theme-story .dashboard-grid,.theme-constellation .dashboard-grid,.theme-clarity .dashboard-grid,.theme-pulse .dashboard-grid{grid-template-columns:1fr;grid-template-areas:"mission" "evidence" "saved" "plan" "sharing"}
  .theme-timeline .route-grid,.theme-constellation .route-grid,.theme-pulse .route-grid{display:grid;overflow:visible;padding:0}.theme-timeline .route-card,.theme-constellation .route-card,.theme-pulse .route-card{min-width:0;margin:0}
  .theme-lab .route-card,.theme-counselor .route-card,.theme-clarity .route-card{display:flex;flex-direction:column}
  .theme-timeline .roadmap{display:block}.theme-timeline .roadmap-node{min-width:0}.theme-timeline .roadmap-line{width:3px;height:38px}
  .theme-timeline .hero{min-height:640px}.theme-timeline .hero-copy{padding-top:280px}.theme-timeline .hero-media{order:initial;position:absolute;inset:0}.theme-timeline .hero-media:after{background:linear-gradient(180deg,transparent 20%,var(--bg) 60%)}
  .theme-lab main{margin-left:0}.theme-story .hero-grid,.theme-counselor .hero-grid,.theme-clarity .hero-grid{grid-template-columns:1fr}.theme-story .hero-media,.theme-pulse .hero-media,.theme-quest .hero-media{transform:none;box-shadow:none}
}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
}

function prototypeJs(c) {
  const serialized = JSON.stringify({
    id: c.id, slug: c.slug, name: c.name, thaiName: c.thaiName, descriptor: c.descriptor,
    headline: c.headline, subhead: c.subhead, cta: c.cta, interaction: c.interaction
  }).replace(/</g, "\\u003c");
  return `const concept=${serialized};
const main=document.querySelector("#main");
const status=document.querySelector(".a11y-status");
const params=new URLSearchParams(location.search);
let page=params.get("page")||"landing";
if(params.get("mode")==="wireframe")document.body.classList.add("wireframe");

const disclosure=\`แนวทางเหล่านี้เป็นข้อมูลเพื่อช่วยสำรวจจากคำตอบและหลักฐานที่คุณให้ ไม่ใช่คำทำนายหรือการรับประกันการเรียนต่อ อาชีพ หรือรายได้ โปรดตรวจสอบเกณฑ์ล่าสุดและพูดคุยกับครูแนะแนวหรือผู้ใหญ่ที่ไว้ใจ\`;
const iconArrow=\`<span aria-hidden="true">→</span>\`;

function shell(content,extra=""){return \`<div class="page-shell \${extra}">\${content}</div>\`}
function landing(){
  return shell(\`
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-grid">
      <div class="hero-copy">
        <span class="eyebrow">\${concept.descriptor} · สำหรับนักเรียนไทย</span>
        <h1 id="hero-title">\${concept.headline}</h1>
        <p class="lead">\${concept.subhead}</p>
        <div class="button-row">
          <a class="button primary" href="?page=interview" data-page="interview">\${concept.cta} \${iconArrow}</a>
          <a class="button secondary" href="?page=results" data-page="results">ดูตัวอย่างเส้นทาง</a>
        </div>
        <p class="trust-note">เริ่มแบบ Guest ได้ • ข้อมูลเป็นส่วนตัว • แก้ไขสิ่งที่ AI เข้าใจได้ทุกจุด</p>
      </div>
      <figure class="hero-media">
        <img src="../assets/hero-visual.png" alt="ภาพประกอบแนวคิด \${concept.name} แสดงนักเรียนกำลังสำรวจหลายเส้นทาง">
        <figcaption class="proof-card"><strong>3 เส้นทาง ไม่ใช่ 1 คำตอบ</strong><span>Balanced · Growth · Practical</span></figcaption>
      </figure>
    </div>
  </section>
  <section class="section" aria-labelledby="how-title">
    <div class="section-head"><span class="eyebrow">Reflect · Try · Compare · Plan</span><h2 id="how-title">เริ่มจากเรื่องจริง แล้วค่อยเปิดความเป็นไปได้</h2><p>Future Me ผสานบทสนทนา ภารกิจสั้น และข้อมูลเส้นทางการศึกษา เพื่อช่วยให้คุณตัดสินใจอย่างมีข้อมูลมากขึ้น</p></div>
    <div class="journey-grid">
      <article class="journey-card"><div class="step-num">01</div><h3>เล่า</h3><p>AI ถามแบบ Socratic และ STAR จากประสบการณ์จริง ไม่รีบติดป้ายอาชีพ</p><div class="evidence-strip"><span class="chip">เรื่องที่เคยทำ</span></div></article>
      <article class="journey-card"><div class="step-num">02</div><h3>ลอง</h3><p>เลือกภารกิจ 3–5 นาที เพื่อดูพลัง ความสนใจ และวิธีแก้ปัญหาจากการลงมือทำ</p><div class="evidence-strip"><span class="chip">หลักฐานภารกิจ</span></div></article>
      <article class="journey-card"><div class="step-num">03</div><h3>วางทาง</h3><p>เปรียบเทียบ 3 กลยุทธ์ พร้อมหลักฐาน ข้อแลกเปลี่ยน สิ่งที่ยังไม่รู้ และก้าวถัดไป</p><div class="evidence-strip"><span class="chip">แก้ไขได้</span><span class="chip">มีแหล่งข้อมูล</span></div></article>
    </div>
    <div class="disclaimer" role="note">\${disclosure}</div>
  </section>\`);
}

function interview(){
  return shell(\`
  <header class="page-head"><div><span class="eyebrow">Discovery · 4 of 8</span><h1>เล่าเรื่องที่คุณเคยลงมือทำ</h1></div><p>คำถามจะปรับตามคำตอบของคุณ คุณหยุดพัก ลบ หรือแก้ไขสรุปได้ทุกเมื่อ</p></header>
  <div class="interview-layout">
    <section class="interview-main" aria-labelledby="prompt-title">
      <div class="progress-row"><span>บทสนทนา 42%</span><div class="progress-track" aria-label="ความคืบหน้า 42 เปอร์เซ็นต์"><div class="progress-fill"></div></div><button class="button ghost small" type="button">พักไว้ก่อน</button></div>
      <div class="coach-line"><span class="coach-avatar" aria-hidden="true"></span><div><strong>\${concept.name} guide</strong><small>ถามทีละเรื่อง • ไม่ตัดสิน</small></div></div>
      <div class="chat-stack" id="chat">
        <div class="chat-bubble ai"><p>เมื่อกี้คุณบอกว่าชอบทำโปสเตอร์งานโรงเรียน เพราะได้ลองหลายแบบและเห็นคนใช้จริง ฟังถูกไหม?</p></div>
        <div class="chat-bubble user"><p>ใช่ โดยเฉพาะตอนแก้จากความคิดเห็นของเพื่อน</p></div>
      </div>
      <div class="prompt-card"><span class="eyebrow">STAR · Action</span><h2 id="prompt-title">ตอนที่ความคิดเห็นของเพื่อนไม่ตรงกัน คุณทำอะไรเป็นอย่างแรก?</h2></div>
      <div class="reply-options" aria-label="คำตอบลัด"><button class="reply-chip" type="button">ขอตัวอย่างเพิ่ม</button><button class="reply-chip" type="button">ยังนึกไม่ออก</button><button class="reply-chip" type="button">ตอบด้วยเสียง</button></div>
      <div class="input-row"><label class="a11y-status" for="reply">คำตอบของคุณ</label><textarea id="reply" placeholder="เล่าตามที่เกิดขึ้นจริง ไม่ต้องตอบให้ดูดี…"></textarea><button class="button primary send-reply" type="button" aria-label="ส่งคำตอบ">ส่ง</button></div>
    </section>
    <aside class="evidence-panel" aria-labelledby="evidence-title">
      <span class="eyebrow">แก้ไขได้เสมอ</span><h2 id="evidence-title" style="font-size:2rem">สิ่งที่เราเข้าใจ</h2>
      <div class="evidence-item"><strong>ทดลองหลายทางก่อนตัดสินใจ</strong><div class="evidence-meta"><span>เรื่องที่เล่า</span><button class="button ghost small" type="button">แก้ไข</button></div></div>
      <div class="evidence-item"><strong>เปิดรับข้อเสนอแนะ</strong><div class="evidence-meta"><span>STAR: Action</span><button class="button ghost small" type="button">แก้ไข</button></div></div>
      <div class="evidence-item"><strong>ยังต้องสำรวจ: ทำงานกับข้อจำกัดเวลา</strong><div class="evidence-meta"><span>หลักฐานยังไม่พอ</span><span>รอถาม</span></div></div>
      <p class="source-note">บันทึกเหล่านี้เป็นข้อมูลส่วนตัว ผู้ปกครองหรือครูจะไม่เห็นบทสนทนา เว้นแต่คุณเลือกแชร์โดยชัดเจน</p>
    </aside>
  </div>\`);
}

const routeData=[
  {type:"Balanced Next Step",title:"UX/UI + Product Design",why:["ชอบทำไอเดียให้มองเห็นได้","ปรับงานจากความคิดเห็น","สนใจทั้งเทคโนโลยีและคน"],unknown:"ควรลองสัมภาษณ์ผู้ใช้จริง",next:"ลองภารกิจออกแบบ 20 นาที"},
  {type:"Interest Growth Route",title:"Creative Technology",why:["พลังสูงกับการทดลองหลายแบบ","สนใจเครื่องมือดิจิทัลใหม่","มีหลักฐานด้านการเล่าเรื่อง"],unknown:"ยังไม่รู้ว่าชอบเขียนโค้ดแค่ไหน",next:"ทำ interactive poster ชิ้นเล็ก"},
  {type:"Practical Access Route",title:"ปวช./ปวส. ดิจิทัลมีเดีย",why:["เรียนรู้จากการลงมือทำ","ต้องการผลงานใช้จริง","เปิดรับเส้นทางฝึกงาน"],unknown:"ต้องตรวจหลักสูตรและ DVE ในพื้นที่",next:"เยี่ยมชม Open House หรือคุยรุ่นพี่"}
];
function results(){
 const cards=routeData.map((r,i)=>\`<article class="route-card \${i===0?"featured":""}"><span class="route-type">\${r.type}</span><h2 style="font-size:2rem;margin:10px 0">\${r.title}</h2><p class="route-score">หลักฐาน \${i===0?"4":"3"} ชิ้น · ไม่ใช่คะแนนความเหมาะสม</p><ul class="why-list">\${r.why.map(x=>\`<li>\${x}</li>\`).join("")}</ul><p><strong>สิ่งที่ยังไม่รู้:</strong> \${r.unknown}</p><p><strong>ก้าวลอง:</strong> \${r.next}</p><button class="button \${i===0?"primary":"secondary"} save-route" type="button">\${i===0?"เปิดเส้นทาง":"บันทึกไว้เทียบ"}</button><p class="source-note">ตัวอย่างข้อมูล • ต้องตรวจสอบหลักสูตร/เกณฑ์ล่าสุดจากแหล่งทางการ</p></article>\`).join("");
 return shell(\`<header class="page-head"><div><span class="eyebrow">Possibilities · อัปเดตได้</span><h1>3 เส้นทางที่ควรลองสำรวจต่อ</h1></div><p>เราแยกเส้นทางตามกลยุทธ์ เพื่อให้เห็นทางเลือกและข้อแลกเปลี่ยน—not one “perfect match.”</p></header><div class="route-grid">\${cards}</div><div class="disclaimer" role="note">\${disclosure}</div>\`);
}

function dashboard(){
 return shell(\`<header class="page-head"><div><span class="eyebrow">สวัสดี มายด์</span><h1>วันนี้ลองอีกหนึ่งก้าว</h1></div><p>โปรไฟล์ของคุณเปลี่ยนได้เสมอเมื่อมีหลักฐานใหม่</p></header>
 <div class="dashboard-grid">
   <article class="card next-card mission-card"><span class="eyebrow">ภารกิจถัดไป · 12 นาที</span><h2>ออกแบบหน้าจอเช็กอินชมรม</h2><p>ลองจัดข้อมูลให้เพื่อนเข้าใจง่าย แล้วสะท้อนว่าช่วงไหนทำให้คุณมีพลัง</p><button class="button secondary" type="button">เริ่มภารกิจ \${iconArrow}</button></article>
   <article class="card evidence-card"><span class="metric-label">Evidence profile</span><div class="progress-ring" aria-label="หลักฐานครบ 62 เปอร์เซ็นต์"></div><p>เพิ่มอีก 1 ภารกิจเพื่อแยก Design กับ Creative Technology</p></article>
   <article class="card saved-count-card"><span class="metric-label">เส้นทางที่บันทึก</span><div class="metric">03</div><p>อัปเดตข้อมูลล่าสุดวันนี้</p><a href="?page=results" data-page="results">เปิดเปรียบเทียบ →</a></article>
   <article class="card plan-card"><span class="eyebrow">Roadmap 30 วัน</span><h3>สร้าง mini case study จากปัญหาในโรงเรียน</h3><div class="saved-list"><div class="saved-row"><span>สัมภาษณ์เพื่อน 2 คน<small>หลักฐานด้านการฟัง</small></span><strong>วันนี้</strong></div><div class="saved-row"><span>ร่างหน้าจอ 3 แบบ<small>ภารกิจทดลอง</small></span><strong>สัปดาห์ 1</strong></div></div></article>
   <article class="card sharing-card"><span class="eyebrow">การแชร์</span><h3>ส่วนตัวอยู่</h3><p>ยังไม่มีผู้ปกครองหรือครูเข้าถึงสรุปของคุณ</p><button class="button ghost small" type="button">จัดการสิทธิ์</button></article>
 </div>\`);
}

function roadmap(){
 const node=(state,num,title,body,action="")=>\`<article class="roadmap-node \${state}"><div class="node-dot">\${num}</div><div><span class="node-state">\${state==="done"?"ทำแล้ว":state==="active"?"กำลังลอง":"ถัดไป"}</span><h3>\${title}</h3><p>\${body}</p></div>\${action?\`<button class="button primary small" type="button">\${action}</button>\`:""}</article>\`;
 return shell(\`<header class="page-head"><div><span class="eyebrow">Editable DAG · 30-day view</span><h1>เส้นทางนี้เริ่มจากการทดลอง ไม่ใช่การผูกมัด</h1></div><p>แต่ละขั้นแสดงสิ่งที่ต้องทำก่อน คุณเปลี่ยนเป้าหมายหรือเปิดทางเลือกสำรองได้</p></header>
 <div class="roadmap" aria-label="แผนเส้นทางส่วนตัว">
 \${node("done","✓","สถานะวันนี้","ม.5 วิทย์–คณิต · สนใจงานออกแบบและเทคโนโลยี")}
 <div class="roadmap-line"></div>
 \${node("active","1","ภารกิจ 30 วัน","สร้าง mini UX case study จากปัญหาในโรงเรียน","ทำต่อ")}
 <div class="roadmap-line"></div>
 <div class="branch-row">\${node("","A","ทาง A · Portfolio","ออกแบบและทดสอบต้นแบบ 1 ชิ้น")}\${node("","B","ทาง B · Practical","ลองคอร์สดิจิทัลมีเดียและ Open House")}</div>
 <div class="roadmap-line"></div>
 \${node("","2","เตรียมเส้นทางเรียน","เปรียบเทียบหลักสูตร เกณฑ์รับสมัคร เวลา ค่าใช้จ่าย และทางเลือกอาชีวะ")}
 <div class="roadmap-line"></div>
 \${node("","3","สร้างหลักฐานเพิ่ม","โปรเจกต์ ทีม และการพูดคุยกับคนทำงานจริง")}
 <div class="roadmap-line"></div>
 \${node("","4","ทบทวนเป้าหมาย","อัปเดตเส้นทางจากประสบการณ์ใหม่—not a fixed destination")}
 </div><div class="disclaimer" role="note">\${disclosure}</div>\`);
}

const renderers={landing,interview,results,dashboard,roadmap};
function render(next){
 page=renderers[next]?next:"landing";
 main.innerHTML=renderers[page]();
 document.title=\`\${concept.name} — \${page}\`;
 document.querySelectorAll("[data-page]").forEach(a=>{a.toggleAttribute("aria-current",a.dataset.page===page)});
 bind();
 window.scrollTo({top:0,behavior:"instant"});
}
function navigate(next){
 const q=new URLSearchParams(location.search);q.set("page",next);history.pushState({page:next},"",\`?\${q}\`);render(next);
}
function bind(){
 document.querySelectorAll("[data-page]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();navigate(a.dataset.page)}));
 document.querySelectorAll(".reply-chip").forEach(b=>b.addEventListener("click",()=>{document.querySelector("#reply").value=b.textContent==="ยังนึกไม่ออก"?"ยังนึกเหตุการณ์ไม่ออก ช่วยยกตัวอย่างเปรียบเทียบได้ไหม":"";document.querySelector("#reply").focus()}));
 const send=document.querySelector(".send-reply");if(send)send.addEventListener("click",()=>{const input=document.querySelector("#reply");const text=input.value.trim()||"เราเริ่มจากถามเพื่อนแต่ละคนว่าอะไรสำคัญ แล้วทำแบบกลางที่ทุกคนลองใช้ได้";document.querySelector("#chat").insertAdjacentHTML("beforeend",\`<div class="chat-bubble user"><p>\${text.replace(/[<>]/g,"")}</p></div>\`);input.value="";status.textContent="ส่งคำตอบแล้ว และเพิ่มเป็นหลักฐานที่แก้ไขได้"});
 document.querySelectorAll(".save-route").forEach(b=>b.addEventListener("click",()=>{b.textContent="บันทึกแล้ว ✓";status.textContent="บันทึกเส้นทางแล้ว"}));
}
window.addEventListener("popstate",()=>render(new URLSearchParams(location.search).get("page")||"landing"));
render(page);
`;
}

for (const c of concepts) {
  const dir = path.join(root, c.folder);
  const assets = path.join(dir, "assets");
  const wireframes = path.join(dir, "wireframes");
  const mockups = path.join(dir, "mockups");
  const prototype = path.join(dir, "prototype");
  [assets, wireframes, mockups, prototype].forEach(ensure);
  write(path.join(dir, "concept_overview.md"), conceptOverview(c));
  write(path.join(dir, "design_system.md"), designSystem(c));
  write(path.join(dir, "sitemap.md"), conceptSitemap(c));
  write(path.join(dir, "user_flow.md"), userFlow(c));
  write(path.join(dir, "page_structure.md"), pageStructure(c));
  write(path.join(dir, "content_guide.md"), contentGuide(c));
  write(path.join(dir, "image_prompts.md"), imagePrompts(c));
  write(path.join(prototype, "README.md"), prototypeReadme(c));
  write(path.join(prototype, "index.html"), prototypeHtml(c));
  write(path.join(prototype, "styles.css"), prototypeCss(c));
  write(path.join(prototype, "app.js"), prototypeJs(c));
  const heroPath = path.join(assets, "hero-visual.png");
  if (!fs.existsSync(heroPath)) throw new Error(`Missing generated hero: ${heroPath}`);
  write(path.join(assets, "ASSET_MANIFEST.md"), `# ${c.name} Asset Manifest

| File | Purpose | Source | SHA-256 | Prompt |
|---|---|---|---|---|
| \`hero-visual.png\` | Landing hero and high-fidelity mockup visual | OpenAI built-in image generation | \`${sha256(heroPath)}\` | Full exact prompt in [image_prompts.md](../image_prompts.md) |

The generated image contains no required UI text. All consequential text remains selectable, translatable HTML in the prototype.
`);
}

const scores = [
  ["Compass Coach",9,9,8,8,9,9,9,9,6,6,8,9,9],
  ["The Mirror Interview",8,7,9,8,9,10,8,8,7,7,7,8,8],
  ["Timefold",8,7,10,9,7,8,6,6,9,9,8,10,7],
  ["PathLab",8,7,8,7,10,8,7,8,9,9,10,8,9],
  ["QuestMap",9,9,10,10,7,8,9,7,9,9,8,10,8],
  ["Nara",9,9,9,8,10,10,9,9,8,8,8,9,9],
  ["Tomorrow Stories",8,8,10,9,8,9,9,7,9,10,7,10,7],
  ["Skill Constellation",8,6,10,9,8,8,6,6,10,10,10,9,8],
  ["Clarity",9,10,7,6,10,8,10,10,4,4,9,7,10],
  ["Pulse",8,9,10,10,7,8,10,8,8,8,9,10,8]
];
const comparisonRows = scores.map(r => `| ${r.join(" | ")} |`).join("\n");
const conceptComparison = `# Concept Comparison

## Scoring method

- All values use a 1–10 scale.
- For audience, ease, appeal, trust, interview, mobile, accessibility, scalability, and suitability, **10 is strongest**.
- For **technical complexity** and **estimated development effort**, **10 means most complex/highest effort**; these two columns are costs, not benefits.
- Scores are directional design estimates, not usability-test results.

| Concept name | Target audience fit | Ease of use | Visual appeal | Gen-Z appeal | Trustworthiness | AI interview experience | Mobile usability | Accessibility | Technical complexity | Estimated development effort | Scalability | Hackathon suitability | Real-product suitability |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${comparisonRows}

## Interpretation

- **Compass Coach** has the strongest balance of clarity, trust, mobile usability, and demo readiness.
- **Nara** is the strongest emotionally supportive interview direction but needs the most careful safety positioning.
- **QuestMap**, **Timefold**, **Tomorrow Stories**, and **Pulse** deliver standout presentation moments at the cost of content or interaction complexity.
- **PathLab** and **Skill Constellation** offer the strongest long-term information model and counselor/product scale.
- **Clarity** is the most buildable and accessible institutional route.

## Concept-level risks

| Concept | Principal risk | Mitigation |
|---|---|---|
| Compass Coach | Feels familiar | Add QuestMap mission moments and PathLab evidence transparency. |
| Mirror | Session feels slow | Offer chapter save/resume and a 5-minute express path. |
| Timefold | Appears predictive | Keep alternate branches and assumptions visible at all times. |
| PathLab | Cognitive overload | Progressive disclosure and a student/counselor density toggle. |
| QuestMap | Trivializes high-stakes choice | No points/leaderboards; reward reflection and experiments only. |
| Nara | AI over-anthropomorphism | Clear boundaries, human handoff, no therapist framing. |
| Tomorrow Stories | Scenario bias | Diverse authored contexts, expert review, and replay perspectives. |
| Skill Constellation | Mobile/accessibility complexity | List/table mode as the default on small screens. |
| Clarity | Low emotional pull | Use real student stories and a warmer onboarding moment. |
| Pulse | Social comparison and privacy | Private-by-default, no likes/ranks, scoped co-op only. |
`;

const recommendedDirection = `# Recommended Direction

## Best overall concept — Compass Coach

Compass Coach is the best core direction because it explains the source-backed product model with the least friction: talk, test, compare, and plan. It supports Thai students who are genuinely uncertain, works on mobile, can be built within a hackathon, and leaves room for more sophisticated modules later.

## Best for a Hackathon presentation — QuestMap

QuestMap makes the two-phase assessment visible in a memorable way. A live demo can move from one three-minute mission to an evidence badge and then reveal three routes. It has immediate visual appeal and clearly differentiates Future Me from static RIASEC quizzes.

## Easiest to build — Clarity

Clarity uses standard forms, tables, cards, and a linear roadmap. It has the fewest custom visualization requirements, the strongest accessibility starting point, and the lowest content-animation burden.

## Most innovative — Skill Constellation

Skill Constellation reframes careers as connected skill neighborhoods rather than a list of fixed jobs. It is a strong long-term expression of transferable skills, hybrid careers, and DAG relationships, but it is not the right first MVP surface.

## Most scalable — PathLab

PathLab best exposes and operationalizes the underlying evidence, sources, rules, constraints, and recommendation versions. Its modular workspaces can grow into counselor, school, program, scholarship, and employer tools.

## Most suitable for Thai students — Compass Coach with QuestMap missions

The source material emphasizes limited counselor capacity, fragmented Thai pathway information, and the need for active trials. Compass Coach lowers anxiety and communicates in plain Thai; QuestMap makes practical evidence engaging for ม.3 students. Together they include academic, vocational, and DVE routes without treating one as inferior.

## Final hybrid recommendation

Build a product named **Future Me** with:

1. **Compass Coach shell** — landing, onboarding, AI interview, three-route results.
2. **QuestMap mission module** — short scenario trials and evidence collection.
3. **PathLab evidence drawer** — show what each inference and recommendation is based on.
4. **Timefold roadmap** — activate after route comparison, with a list fallback.
5. **Clarity accessibility rules** — semantic forms, restrained result language, print/share summaries.

## Why this combination

- **User needs:** supports “I don’t know,” real behavior, multiple routes, and a human conversation.
- **Project objectives:** visibly differentiates from static tests while preserving the documented architecture.
- **Resources/time:** core experience can be prototyped without building a full graph renderer or story CMS.
- **Technical feasibility:** rule engine + RAG + structured LLM output maps cleanly to the UI.
- **Presentation impact:** one mission can visibly change evidence and route explanation in a demo.
- **Future expansion:** evidence/source objects and DAG nodes scale to more programs, schools, internships, and languages.

## MVP demo story

\`\`\`text
ม.3 student says “ยังไม่รู้”
→ Coach asks about a real school project
→ Student completes a 3-minute planning mission
→ Evidence drawer shows “organized people and resources”
→ Three different routes appear:
   upper-secondary plan, vocational/DVE, and interest-growth option
→ Student adds one trial to a 30-day roadmap
→ Shares a transcript-free summary with a counselor
\`\`\`
`;

const implementationRoadmap = `# Implementation Roadmap

## Planning assumptions

- MVP team: Product/UX lead, UI designer, 2 frontend engineers, 2 backend/AI engineers, data/content specialist, QA/accessibility specialist, and part-time counselor/psychology/privacy advisors.
- Hackathon prototype: 3–7 days using seeded fictional data.
- Credible school pilot: approximately 12–20 weeks after research and content validation.

## Phase 1 — Research and Planning

| Task | Priority | Complexity | Dependencies | Responsible roles |
|---|---|---|---|---|
| Confirm primary launch segment (recommend ม.3 + ม.5) | P0 | Medium | None | Product, UX research, counselor advisor |
| Conduct student interviews across school types/regions | P0 | High | Recruitment, consent protocol | UX research, schools, privacy advisor |
| Interview counselors and parents | P0 | Medium | Recruitment | UX research, product |
| Validate problem statements and decision moments | P0 | Medium | Interviews | Product, research |
| Decide Future Me/FuturePath naming | P0 | Low | Stakeholder decision | Product, brand |
| Finalize MVP feature boundary | P0 | Medium | Research synthesis | Product, tech lead |
| Validate/adapt RIASEC questionnaire | P0 | High | Qualified assessment expert | Psychology advisor, data |
| Author 5–8 question interview framework | P0 | High | Research, safety rules | Conversation designer, counselor |
| Define mission rubric and bias review | P0 | High | Mission concepts | Content, assessment expert, QA |
| Create source governance and freshness policy | P0 | Medium | Data owners | Data/content, legal |
| Confirm PDPA/child-consent requirements | P0 | High | Legal counsel | Privacy/legal, security |
| Confirm AIS/NDLP/DEEP feasibility | P1 | High | Official documentation/access | Partnerships, tech lead |

## Phase 2 — UX/UI Design

| Task | Priority | Complexity | Dependencies | Responsible roles |
|---|---|---|---|---|
| Finalize information architecture | P0 | Medium | Phase 1 decisions | Product designer |
| Map student, parent, counselor flows | P0 | Medium | Consent policy | UX, privacy |
| Prototype guest onboarding and AI interview | P0 | High | Interview framework | Product designer, conversation designer |
| Design one scenario mission | P0 | High | Rubric | UX, content, frontend |
| Design three-route explanation and challenge flow | P0 | High | Recommendation schema | UX, AI/data |
| Design roadmap list and graph states | P0 | Medium | DAG schema | UI, frontend |
| Build shared accessible design system | P0 | Medium | Brand direction | UI designer, frontend, accessibility |
| Design responsive 360/768/1440 layouts | P0 | Medium | Core flows | UI designer |
| Test with 5–8 students per primary segment | P0 | High | Interactive prototype | Research, schools |
| Test privacy/share comprehension | P0 | High | Consent flow | Research, privacy |
| Remediate usability and accessibility issues | P0 | Medium | Test findings | Design, frontend |

## Phase 3 — Minimum Viable Product

| Task | Priority | Complexity | Dependencies | Responsible roles |
|---|---|---|---|---|
| Authentication and role model | P0 | Medium | Privacy architecture | Backend, security, frontend |
| Student profile and tier context | P0 | Medium | Database schema | Full stack |
| Consent, audit, export, deletion foundations | P0 | High | Legal rules | Backend, security |
| AI interview state machine | P0 | High | Prompt/evidence schema | AI, backend, frontend |
| Structured STAR evidence extraction | P0 | High | LLM and schema evaluation | AI/data |
| RIASEC assessment and rule scoring | P0 | Medium | Validated instrument | Backend, assessment expert |
| Scenario mission engine + one mission/cluster | P0 | High | Rubrics/content | Full stack, content |
| Career/curriculum source ingestion | P0 | High | Source governance | Data engineer, content |
| Hybrid retrieval and citation store | P0 | High | Ingestion | AI/data, backend |
| Constraint and five-factor rule engine | P0 | High | Product rules | Backend, data |
| Three-route recommendation API | P0 | High | Evidence + retrieval | AI/backend |
| Results, evidence drawer, source freshness | P0 | High | Recommendation API | Frontend, design |
| Personal roadmap DAG and list fallback | P0 | High | Route schema | Backend, frontend |
| Dashboard and saved items | P1 | Medium | Core data | Frontend, backend |
| Parent/counselor summary with scoped consent | P1 | High | RBAC, consent | Full stack, security |
| AIS OTP/SMS adapter | P2 | Medium | Official API access | Backend, partnerships |

## Phase 4 — Testing

| Task | Priority | Complexity | Dependencies | Responsible roles |
|---|---|---|---|---|
| Unit/integration/API contract tests | P0 | Medium | MVP | Engineers, QA |
| End-to-end core journey tests | P0 | Medium | Stable UI | QA, frontend |
| Mobile/browser/low-bandwidth testing | P0 | Medium | Deployment candidate | QA |
| WCAG 2.2 AA audit with disabled users | P0 | High | Stable flows | Accessibility specialist |
| Thai language and reading-comprehension review | P0 | Medium | Content complete | Content, students |
| Retrieval recall and citation accuracy evaluation | P0 | High | Independent test set | AI/data |
| Grounded-claim and hallucination tests | P0 | High | AI pipeline | AI QA, content reviewers |
| Bias slices by gender, region, school type, route | P0 | High | Representative test set | Data, assessment expert |
| Prompt injection and abuse testing | P0 | High | AI pipeline | Security, AI |
| Consent/RBAC/privacy penetration tests | P0 | High | Sharing features | Security/privacy |
| Counselor review of recommendation usefulness | P0 | Medium | Pilot dataset | Counselor advisors |
| Incident and safety escalation drill | P0 | High | Safety workflow | Operations, schools |

## Phase 5 — Future Development

| Task | Priority | Complexity | Dependencies | Responsible roles |
|---|---|---|---|---|
| School dashboard with privacy-preserving cohorts | P1 | High | Pilot agreements, RBAC | Product, backend, privacy |
| Teacher/counselor coaching tools | P1 | Medium | Counselor research | Product, frontend |
| Parent reports and conversation guides | P1 | Medium | Consent validation | Content, frontend |
| University/program matching | P1 | High | Verified live data | Data, partnerships |
| Scholarship recommendations | P2 | High | Data partnerships | Data, product |
| Internship and DVE matching | P1 | High | Employer/OVEC data | Partnerships, data |
| Long-term progress and changing-profile view | P1 | High | Longitudinal consent | Full stack, research |
| Multilingual support | P2 | High | Localization research | Content, frontend, AI |
| Personalized learning plans | P2 | High | Course data/evaluation | AI/data, education experts |
| Voice and read-aloud | P2 | Medium | Accessibility QA | Frontend, speech/AI |
| Skill Constellation graph | P2 | Very high | Mature taxonomy | Frontend graphics, data |

## Hackathon cut line

Build only:

1. One ม.3 guest flow.
2. Four scripted adaptive interview states.
3. One scenario mission.
4. A deterministic evidence/rule demo using seeded RAG-like citations.
5. Three route cards.
6. One editable 30-day roadmap.
7. One transcript-free counselor summary.

Everything else can be represented by architecture and validated design prototypes.
`;

write(path.join(comparisonDir, "concept_comparison.md"), conceptComparison);
write(path.join(comparisonDir, "recommended_direction.md"), recommendedDirection);
write(path.join(comparisonDir, "implementation_roadmap.md"), implementationRoadmap);

const galleryCards = concepts.map(c => `<article class="concept-card">
  <a href="${c.folder}/prototype/?page=landing">
    <img src="${c.folder}/assets/hero-visual.png" alt="">
    <div class="card-copy"><span>${String(c.id).padStart(2,"0")} · ${c.descriptor}</span><h2>${c.name}</h2><p>${c.sentence}</p><strong>เปิด Prototype →</strong></div>
  </a>
  <div class="card-links"><a href="${c.folder}/concept_overview.md">Overview</a><a href="${c.folder}/mockups/landing-page-desktop.png">Mockup</a><a href="${c.folder}/wireframes/landing-page-desktop.png">Wireframe</a></div>
</article>`).join("\n");

write(path.join(root, "index.html"), `<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Future Me — 10 Web Design Concepts</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f1efe9;color:#182033;font:16px/1.55 system-ui,"Noto Sans Thai",sans-serif}a{color:inherit}.hero{padding:96px max(24px,calc((100vw - 1240px)/2)) 70px;border-bottom:1px solid #cfcac0}.hero span{font-weight:800;color:#6757d5}.hero h1{font-size:clamp(3rem,8vw,7rem);line-height:.92;letter-spacing:-.06em;max-width:1000px;margin:16px 0 28px}.hero p{font-size:20px;color:#5d6473;max-width:820px}.notice{padding:16px 18px;background:white;border:1px solid #d5d0c6;border-radius:16px;max-width:800px}.grid{width:min(1240px,calc(100% - 40px));margin:60px auto 100px;display:grid;grid-template-columns:repeat(2,1fr);gap:28px}.concept-card{background:#fff;border:1px solid #d6d2c8;border-radius:22px;overflow:hidden}.concept-card>a{text-decoration:none}.concept-card img{width:100%;aspect-ratio:16/9;object-fit:cover}.card-copy{padding:26px}.card-copy span{font-size:12px;font-weight:800;text-transform:uppercase;color:#6a7180}.card-copy h2{font-size:38px;letter-spacing:-.04em;margin:7px 0}.card-copy p{color:#69707e}.card-links{display:flex;gap:16px;padding:16px 26px;border-top:1px solid #e1ddd5;font-size:14px}.footer{padding:40px;text-align:center;border-top:1px solid #cfcac0;color:#69707e}@media(max-width:760px){.hero{padding-top:64px}.grid{grid-template-columns:1fr}.card-copy h2{font-size:32px}}
</style></head><body>
<header class="hero"><span>Future Me · JUMP Thailand Hackathon 2026</span><h1>10 directions. One evidence-based product.</h1><p>สิบแนวคิดที่เปลี่ยนวิธีสนทนา ทดลอง เปรียบเทียบ และวางเส้นทาง โดยไม่ฟันธงอนาคตของผู้เรียน</p><p class="notice"><strong>Recommended:</strong> Compass Coach core + QuestMap missions + PathLab evidence + Timefold roadmap.</p></header>
<main class="grid">${galleryCards}</main>
<footer class="footer">Original concepts and generated assets · Open each prototype to navigate Landing, Interview, Results, Dashboard, and Roadmap.</footer>
</body></html>`);

const dataFiles = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else if (name !== ".DS_Store") dataFiles.push({ p, stat });
  }
}
walk(path.join(workspace, "Data"));
const sourceInventoryRows = dataFiles
  .sort((a,b) => a.p.localeCompare(b.p))
  .map(x => `| \`${path.relative(workspace, x.p)}\` | ${path.extname(x.p).slice(1).toUpperCase() || "file"} | ${x.stat.size.toLocaleString("en-US")} | Reviewed${path.extname(x.p)===".pdf" ? " as matching export/metadata + visual sample" : ""} |`)
  .join("\n");
write(path.join(analysisDir, "source_inventory.md"), `# Source Inventory

All ${dataFiles.length} non-system files inside \`Data/\` were inventoried. Markdown and JSONL content were read; PDF metadata/first pages were checked across the set, and system-blueprint PDF pages were visually sampled. PDF exports match their corresponding Markdown topics.

| File | Type | Bytes | Review status |
|---|---|---:|---|
${sourceInventoryRows}

## Preservation

The final QA step compares SHA-256 hashes of the original \`Data/\` files against the baseline captured before generation.
`);

const deliverablesReadme = `# Future Me Web Design Concepts

This folder contains ten complete, comparable website directions based on the \`Data/\` knowledge base.

## Start here

- [Concept gallery](index.html)
- [Knowledge-base summary](00_Project_Analysis/knowledge_base_summary.md)
- [Target users](00_Project_Analysis/target_users.md)
- [Feature requirements and product plan](00_Project_Analysis/feature_requirements.md)
- [Concept comparison](99_Final_Comparison/concept_comparison.md)
- [Recommended direction](99_Final_Comparison/recommended_direction.md)
- [Implementation roadmap](99_Final_Comparison/implementation_roadmap.md)

## View prototypes

\`\`\`bash
python3 -m http.server 8080 --directory FutureMe_Web_Design_Concepts
\`\`\`

Open \`http://localhost:8080/\`. Each concept is dependency-free and supports Landing, Interview, Results, Dashboard, Roadmap, responsive mobile, and wireframe mode.
`;
write(path.join(root, "README.md"), deliverablesReadme);

const rootReadme = `# Future Me — Web Design Concept Library

This workspace now includes a complete evidence-based design exploration for **Future Me / FuturePath AI**, a Thai student education and career-guidance web app for JUMP Thailand Hackathon 2026.

## What was analyzed

Every relevant file inside [Data](Data/) was inventoried and reviewed:

- Thai/global graduate mismatch research
- Thai basic, vocational, and higher-education curriculum notes
- Career, degree, and skill mappings
- Socratic, Motivational Interviewing, RIASEC, Laddering, and STAR research
- NDLP/DEEP ecosystem notes
- AIS Cloud and roadmap-DAG architecture
- Master system flowcharts
- PDF exports and two Qwen QLoRA JSONL files

The original \`Data/\` files were not modified. One important data-quality finding is that the train and test JSONL files are identical and contain only ten examples; they must be separated and expanded before model evaluation.

## What was created

Open [FutureMe_Web_Design_Concepts](FutureMe_Web_Design_Concepts/README.md) for:

- Shared knowledge-base summary, personas, requirements, journey, sitemap, architecture, privacy, safety, accessibility, and recommendations
- 10 meaningfully different website concepts
- A design system, sitemap, user flow, 14-page specification, content guide, and image prompts for every concept
- 10 original generated hero assets with SHA-256 manifests and exact prompts
- Responsive HTML/CSS/JavaScript prototype for every concept
- Desktop/mobile wireframes and high-fidelity mockups for six key views per concept
- Concept comparison, recommendations, and a phased implementation roadmap

## Folder organization

\`\`\`text
FutureMe_Web_Design_Concepts/
├── 00_Project_Analysis/
├── 01_Concept_01/ … 10_Concept_10/
│   ├── concept_overview.md
│   ├── design_system.md
│   ├── sitemap.md
│   ├── user_flow.md
│   ├── page_structure.md
│   ├── content_guide.md
│   ├── image_prompts.md
│   ├── assets/
│   ├── wireframes/
│   ├── mockups/
│   └── prototype/
├── 99_Final_Comparison/
└── index.html
\`\`\`

## How to view the designs

For the gallery and interactive prototypes:

\`\`\`bash
python3 -m http.server 8080 --directory FutureMe_Web_Design_Concepts
\`\`\`

Then open:

\`http://localhost:8080/\`

The prototypes have no package installation or build step. Static PNGs are available inside each concept’s \`wireframes/\` and \`mockups/\` folder.

## Recommended direction

Use **Compass Coach** as the main product shell, then combine:

- **QuestMap** for short scenario missions
- **PathLab** for evidence/source transparency
- **Timefold** for the editable roadmap
- **Clarity** for accessibility and institutional report patterns

The best standalone Hackathon presentation concept is **QuestMap**. The easiest build is **Clarity**. The most innovative is **Skill Constellation**. The most scalable is **PathLab**.

## What the development team should do next

1. Confirm ม.3 and ม.5 as the first research segments.
2. Interview students, parents, and counselors across different Thai school contexts.
3. Validate the 30-item RIASEC instrument and scenario-mission rubrics with qualified experts.
4. Choose the Future Me/FuturePath product name.
5. Build one end-to-end demo: guest interview → one mission → three explainable routes → 30-day roadmap → consented counselor summary.
6. Establish source freshness, PDPA/child-consent rules, safety escalation, and an independent AI evaluation set before a school pilot.

The existing FuturePath API/schema work elsewhere in this workspace remains separate and was not overwritten.
`;
write(path.join(workspace, "README.md"), rootReadme);

console.log(`Generated ${concepts.length} concept packages, shared analysis, comparison, gallery, and README files.`);
