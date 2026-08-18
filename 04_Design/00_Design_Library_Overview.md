# Future Me — Web Design Concept Library

This workspace now includes a complete evidence-based design exploration for **Future Me / FuturePath AI**, a Thai student education and career-guidance web app for JUMP Thailand Hackathon 2026.

## What was analyzed

Every relevant file inside [Data](../01_Research/Data/) was inventoried and reviewed:

- Thai/global graduate mismatch research
- Thai basic, vocational, and higher-education curriculum notes
- Career, degree, and skill mappings
- Socratic, Motivational Interviewing, RIASEC, Laddering, and STAR research
- NDLP/DEEP ecosystem notes
- AIS Cloud and roadmap-DAG architecture
- Master system flowcharts
- PDF exports and two Qwen QLoRA JSONL files

The original `Data/` files were not modified. One important data-quality finding is that the train and test JSONL files are identical and contain only ten examples; they must be separated and expanded before model evaluation.

## What was created

Open [FutureMe_Web_Design_Concepts](README.md) for:

- Shared knowledge-base summary, personas, requirements, journey, sitemap, architecture, privacy, safety, accessibility, and recommendations
- 11 meaningfully different website concepts, including the brief-driven **Aurora** direction
- A design system, sitemap, user flow, 14-page specification, content guide, and image prompts for every concept
- 11 original generated hero assets with SHA-256 manifests and full prompts; Aurora also includes six traceable generative UI art-direction references
- Responsive HTML/CSS/JavaScript prototype for every concept
- Desktop/mobile wireframes and high-fidelity mockups for six key views per concept
- Concept comparison, recommendations, and a phased implementation roadmap

## Folder organization

```text
FutureMe_Web_Design_Concepts/
├── 00_Project_Analysis/
├── 01_Concept_01/ … 11_Concept_11/
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
```

## How to view the designs

For the gallery and interactive prototypes:

```bash
python3 -m http.server 8080 --directory FutureMe_Web_Design_Concepts
```

Then open:

`http://localhost:8080/`

The prototypes have no package installation or build step. Static PNGs are available inside each concept’s `wireframes/` and `mockups/` folder.

## Recommended direction

Use **Aurora** as the overall product and Hackathon direction. It combines:

- **Compass Coach** for the trustworthy conversation shell
- **QuestMap** for short evidence missions
- **PathLab** for evidence/source transparency
- **Timefold** for the conditional future-self moment and editable roadmap
- **Clarity** for accessibility and institutional report patterns

The easiest build remains **Clarity**. The most innovative standalone information model is **Skill Constellation**. The most scalable institutional direction is **PathLab**. When time is limited, simplify Aurora’s effects before reducing recommendation transparency, consent, safety, or accessibility.

## What the development team should do next

1. Confirm ม.3 and ม.5 as the first research segments.
2. Interview students, parents, and counselors across different Thai school contexts.
3. Validate the 30-item RIASEC instrument and scenario-mission rubrics with qualified experts.
4. Choose the Future Me/FuturePath product name.
5. Build one end-to-end demo: guest interview → one mission → three explainable routes → 30-day roadmap → consented counselor summary.
6. Establish source freshness, PDPA/child-consent rules, safety escalation, and an independent AI evaluation set before a school pilot.

The existing FuturePath API/schema work elsewhere in this workspace remains separate and was not overwritten.
