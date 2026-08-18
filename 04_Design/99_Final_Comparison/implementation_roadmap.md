# Implementation Roadmap

## Planning assumptions

- MVP team: Product/UX lead, UI designer, 2 frontend engineers, 2 backend/AI engineers, data/content specialist, QA/accessibility specialist, and part-time counselor/psychology/privacy advisors.
- Hackathon prototype: 3–7 days using seeded fictional data.
- Credible school pilot: approximately 12–20 weeks after research and content validation.
- Selected direction: **Aurora**, with visual effects treated as progressive enhancement and the Compass Coach/Clarity interaction foundation retained underneath both dark and light themes.

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
| Tokenize Aurora dark/light themes and opaque readability surfaces | P0 | Medium | Brand direction | UI designer, frontend, accessibility |
| Define future-self scenario, assumptions, alternate branch, and export boundaries | P0 | High | Recommendation/safety schema | Product designer, content, privacy |
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
| Conditional future-self preview with non-prediction guardrails | P1 | Medium | Roadmap + validated route schema | Frontend, AI/backend, content |
| Dashboard and saved items | P1 | Medium | Core data | Frontend, backend |
| Parent/counselor summary with scoped consent | P1 | High | RBAC, consent | Full stack, security |
| AIS OTP/SMS adapter | P2 | Medium | Official API access | Backend, partnerships |

## Phase 4 — Testing

| Task | Priority | Complexity | Dependencies | Responsible roles |
|---|---|---|---|---|
| Unit/integration/API contract tests | P0 | Medium | MVP | Engineers, QA |
| End-to-end core journey tests | P0 | Medium | Stable UI | QA, frontend |
| Mobile/browser/low-bandwidth testing | P0 | Medium | Deployment candidate | QA |
| Dark/light contrast, transparency, zoom, and reduced-motion regression tests | P0 | Medium | Aurora component library | QA, accessibility, frontend |
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
8. Aurora dark-first presentation with a working light-mode toggle; keep mesh, grain, and motion nonessential.

Everything else can be represented by architecture and validated design prototypes.
