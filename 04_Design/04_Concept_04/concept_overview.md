# PathLab — ห้องทดลองเส้นทาง

## Concept snapshot

| Item | Direction |
|---|---|
| **Concept name** | PathLab / ห้องทดลองเส้นทาง |
| **One-sentence description** | A transparent evidence lab lets students inspect how interests, strengths, constraints, and trials shape each route. |
| **Main idea** | A data-literate exploration workspace for students and counselors who want explainability. |
| **Target user group** | Analytical Thai students in ม.4–university year 1 and guidance counselors. |
| **Main user problem** | Opaque recommendation scores reduce trust and hide important constraints. |
| **Unique value proposition** | Every recommendation can be opened, inspected, challenged, and updated. |
| **Emotional experience** | Capable, informed, curious, and confident in the process. |
| **Visual direction** | Bright cobalt data lab, modular bento panels, crisp geometry, charts, and evidence tokens. |
| **Development difficulty** | High |
| **Recommended technology** | Next.js bento UI, TanStack tables, graph/chart components, FastAPI, PostgreSQL, Qdrant hybrid search, audit logs. |

## Main features

- Evidence inspector
- Decision weight sandbox
- Route comparison
- Source drawer
- Constraint checks
- Mission analytics
- Counselor notes

## Advantages

- Highest explainability
- Strong counselor utility
- Scales to more data and routes

## Disadvantages

- Potentially intimidating for younger students
- More front-end and data complexity

## Why this fits Future Me

It makes the documented rule-based + RAG architecture visible and supports evidence-backed, non-guaranteed recommendations.

## Product positioning

**Category:** Career exploration dashboard  
**Promise:** Every recommendation can be opened, inspected, challenged, and updated.  
**Primary CTA:** เข้าห้องทดลอง  
**Voice:** Clear, factual, transparent, and encouraging without hype.

## Distinct interaction model

Drag evidence tokens into a route lab, adjust transparent weights, and compare outcomes.

### Navigation structure

Persistent left rail: Overview, Evidence, Missions, Route Lab, Roadmap, Sources.

- Desktop: Dense but ordered left rail with workspace switcher and source status.
- Mobile: Bottom tabs plus a filter drawer for evidence and constraints.

### Core layouts

- **Homepage:** Product-dashboard hero with modular proof cards and a live-looking evidence workspace.
- **AI interview:** Chat sits beside a structured live extraction panel and source/evidence inspector.
- **Dashboard:** Bento analytics dashboard with evidence coverage, mission results, route comparison, and data freshness.
- **Results:** Comparison table and inspectable decision matrix with no single winner state.
- **Roadmap:** Dependency graph with filters for skills, study, portfolio, and work.

## Design guardrails

- Present routes as hypotheses for educational exploration, never guaranteed predictions.
- Keep private chat content separate from any parent/teacher summary.
- Keep official admissions facts, source dates, and assumptions distinguishable.
- Offer a list alternative to any graph, map, or highly visual interaction.
- Make “ยังไม่รู้” and “แก้ไขสิ่งที่ AI เข้าใจ” first-class actions.

