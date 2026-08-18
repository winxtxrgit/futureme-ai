# Aurora Sitemap

## Primary information architecture

```text
Future Me — Aurora
├── Public
│   ├── Landing
│   ├── How it works
│   ├── Example three-route result
│   ├── Privacy, AI boundaries, and safety
│   ├── About sources and methodology
│   └── Sign up / Log in
├── Discover
│   ├── Onboarding
│   │   ├── Education stage and decision
│   │   ├── Constraints and access needs
│   │   └── Consent / guest mode
│   ├── AI interview
│   │   ├── Socratic reflection
│   │   ├── STAR evidence probes
│   │   ├── Editable evidence drawer
│   │   └── Pause / delete / human handoff
│   ├── Interest assessment
│   ├── Missions
│   │   ├── Choose a short mission
│   │   ├── Submit artifact or reflection
│   │   └── Review evidence
│   └── Skills and strengths analysis
├── Paths
│   ├── Career recommendation results
│   │   ├── Balanced Next Step
│   │   ├── Interest Growth
│   │   ├── Practical Access
│   │   └── Evidence / uncertainty / sources
│   ├── Education paths
│   │   ├── Upper secondary
│   │   ├── Vocational / DVE
│   │   ├── Higher education / TCAS
│   │   └── Courses and independent learning
│   ├── Compare
│   └── Saved careers / programs
├── Roadmap
│   ├── Future-self preview
│   ├── 30-day experiment
│   ├── Milestones and dependencies
│   ├── Alternate branch
│   └── Progress and reflections
├── My space
│   ├── Dashboard
│   ├── Evidence history
│   ├── Saved items
│   ├── Progress tracking
│   ├── Profile and accessibility
│   └── Privacy center
│       ├── Consent
│       ├── Sharing and access log
│       ├── Export
│       └── Delete
└── Human support
    ├── Student-controlled teacher/counselor summary
    ├── Parent summary
    ├── Request a conversation
    └── Revoke access
```

## Global navigation

| Surface | Items | Rationale |
|---|---|---|
| Desktop header | ค้นหาตัวตน, เส้นทาง, Roadmap, ของฉัน | Matches the learner’s mental model and keeps the action sequence visible. |
| Mobile bottom bar | หน้าแรก, ค้นหา, เส้นทาง, ของฉัน | Four stable targets; roadmap is reached from Paths/Dashboard and becomes a tab when active. |
| Context actions | Privacy status, theme, help/human handoff, save and exit | Trust controls remain available without crowding primary navigation. |

## URL model for the prototype

```text
prototype/?page=landing
prototype/?page=interview
prototype/?page=results
prototype/?page=dashboard
prototype/?page=roadmap
prototype/?page=landing&mode=wireframe
```

The product implementation should use stable route IDs and preserve the current step when a learner resumes.

