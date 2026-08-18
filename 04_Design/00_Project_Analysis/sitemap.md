# Shared Sitemap and Information Architecture

```text
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
```

## Information-architecture rules

- “Discovery” describes the process; “Results” is avoided in primary navigation because profiles can change.
- Career and education routes are peers, not a hierarchy where university is automatically preferred.
- Sources and uncertainty live beside the claim they support, not only in a footer.
- Private conversation and shareable summary are separate data objects.
- Graph roadmaps always have a linear accessible-list alternative.
- Saved items retain source date and show a freshness warning when underlying criteria change.

