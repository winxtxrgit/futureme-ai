# Timefold — ไทม์ไลน์ตัวฉันในอนาคต

## Concept snapshot

| Item | Direction |
|---|---|
| **Concept name** | Timefold / ไทม์ไลน์ตัวฉันในอนาคต |
| **One-sentence description** | Students compare several believable future chapters and work backward to a useful next step. |
| **Main idea** | A future-self simulator for students motivated by seeing where choices could lead. |
| **Target user group** | Thai upper-secondary and vocational students planning TCAS, portfolios, or entry into work. |
| **Main user problem** | Education choices feel abstract because students cannot connect today’s action to later possibilities. |
| **Unique value proposition** | Preview multiple possible futures—then reverse-plan one low-risk experiment. |
| **Emotional experience** | Ambitious, energized, grounded, and in control. |
| **Visual direction** | Cinematic dark canvas, luminous timeline ribbons, miniature future scenes, and time-based chapters. |
| **Development difficulty** | High |
| **Recommended technology** | React/Next.js, graph layout engine, timeline virtualization, FastAPI roadmap generator, PostgreSQL graph records. |

## Main features

- Parallel future scenes
- Reverse planning
- TCAS milestones
- Portfolio checkpoints
- Assumption editor
- Branch comparison
- Deadline reminders

## Advantages

- Powerful presentation impact
- Makes roadmaps concrete
- Strong fit for DAG architecture

## Disadvantages

- Can feel deterministic without careful disclaimers
- Timeline visualization is complex on small screens

## Why this fits Future Me

It turns the documented Interactive Pathfinder DAG into the primary product experience while preserving multiple branches.

## Product positioning

**Category:** Future self timeline  
**Promise:** Preview multiple possible futures—then reverse-plan one low-risk experiment.  
**Primary CTA:** เปิดไทม์ไลน์ของฉัน  
**Voice:** Forward-looking, concrete, ambitious, and explicit about uncertainty.

## Distinct interaction model

Scroll or scrub through parallel future chapters, compare trade-offs, then reverse-plan.

### Navigation structure

Timeline-first navigation: Now, Try, Study, Build, Work.

- Desktop: A horizontal chapter rail with the current stage pinned.
- Mobile: A thumb-friendly scrubber for moving between timeline chapters.

### Core layouts

- **Homepage:** Immersive dark hero with the generated timeline as a cinematic background and a restrained copy panel.
- **AI interview:** The AI asks from a future-scene prompt and folds evidence back into the current chapter.
- **Dashboard:** A horizontal life-roadmap with deadlines, portfolio moments, and alternate branches.
- **Results:** Side-by-side future scenes with assumptions, evidence, and trade-offs rather than match scores.
- **Roadmap:** Horizontal DAG with zoomable years and a compact vertical version on mobile.

## Design guardrails

- Present routes as hypotheses for educational exploration, never guaranteed predictions.
- Keep private chat content separate from any parent/teacher summary.
- Keep official admissions facts, source dates, and assumptions distinguishable.
- Offer a list alternative to any graph, map, or highly visual interaction.
- Make “ยังไม่รู้” and “แก้ไขสิ่งที่ AI เข้าใจ” first-class actions.

