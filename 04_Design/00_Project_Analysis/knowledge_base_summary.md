# Future Me Knowledge-Base Summary

## Executive summary

Future Me (also called FuturePath AI in several source files) is an evidence-informed Thai education and career exploration web app for learners from upper primary through vocational and upper-secondary education. Its strongest product idea is a **sequential two-phase discovery process**:

1. a 5–10 minute adaptive AI conversation using Socratic questioning, Motivational Interviewing, RIASEC, Laddering, and STAR;
2. a 3–5 minute scenario mission that collects evidence from what the learner actually does.

The system then combines rule-based eligibility and constraint checks with a Thai curriculum/career knowledge base to present **several explainable routes**, not a guaranteed prediction. Each route can become a dynamic roadmap of skills, study options, TCAS context, portfolio work, and early career steps.

## What was inspected

The review covered all relevant files inside `Data/`: 26 Markdown knowledge documents, 26 matching PDF exports, two JSONL datasets, the reference index, the folder README, and the system blueprints. The PDF titles, page counts, first-page content, and blueprint pages were inspected; the PDFs are presentation exports of the Markdown material, and the Mermaid diagrams are more usable in the Markdown sources because the PDF export shows them as code blocks.

The knowledge base contains no standalone raster images, native design files, user-interview transcripts, questionnaires, personas, or presentation decks inside `Data/`. Some files reference assets and briefs outside `Data/`; these were treated as referenced-but-out-of-scope because the task specifically defined `Data/` as the knowledge base.

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

1. `qwen_qlora_dataset.jsonl` and `test_qwen_qlora.jsonl` are byte-for-byte identical (the same SHA-256) and contain only ten examples. This creates train/test leakage and cannot support a credible evaluation.
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

