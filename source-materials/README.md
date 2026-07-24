# Source Materials

[← Back to README](../README.md)

---

This repository publishes **rewritten English summaries** of the project's research base. The
original source materials are not included here. This document records what exists, what was
published, and why the rest stayed private.

## What the research base contains

Seven categories of Thai-language research documents, assembled before design work began:

| Category | Contents | Published as |
|---|---|---|
| **01** Graduate unemployment and mismatch | Thai statistics (NSO, NESDC, TDRI, MHESI) and global statistics (OECD, ILO, WEF) | [02 · Research §1](../docs/02-research-and-evidence.md) |
| **02** Thai national curricula | Basic education (สพฐ.), vocational ปวช. 2567, higher education and TCAS | [02 · Research §2](../docs/02-research-and-evidence.md) |
| **03** Career, degree and skills mapping | Five career clusters mapped to tracks, faculties and skills | [02 · Research §3](../docs/02-research-and-evidence.md) |
| **04** Qualitative interviewing research | Socratic, Motivational Interviewing, RIASEC, Ikigai, Laddering, STAR | [02 · Research §4](../docs/02-research-and-evidence.md), [04 · AI System](../docs/04-ai-system.md) |
| **05** NDLP / Ministry of Education | NDLP platform architecture, DEEP SSO and ecosystem integration | [02 · Research §5](../docs/02-research-and-evidence.md), [05 · Architecture](../docs/05-system-architecture.md) |
| **06** AIS Cloud and infrastructure | Cloud architecture, CAMARA Open APIs, roadmap DAG algorithm | [02 · Research §6](../docs/02-research-and-evidence.md), [05 · Architecture](../docs/05-system-architecture.md) |
| **07** System blueprints and flowcharts | Master operations flowchart, six sub-system flowcharts, implementation plan | [05 · Architecture](../docs/05-system-architecture.md) |

Alongside these: a design library of eleven web concepts with wireframes, mockups and
prototypes, and a FastAPI backend with the decision engine, schemas and RAG pipeline.

## What was published

- **Rewritten English summaries** of all seven categories, in [`docs/`](../docs/)
- **Six Aurora mockups**, resized and optimised, in [`assets/screenshots/`](../assets/screenshots/)
- **Two original SVG assets** created for this repository — the banner and the decision-matrix diagram

## What stayed private, and why

| Excluded | Reason |
|---|---|
| Raw Thai research documents and their PDF exports | Unpublished team research; summarised rather than reproduced |
| Advisor audio recording | A private recording of an identifiable person, shared for team use only |
| Internal agent and workflow notes | Working process artefacts with no value to a reader |
| Pitch deck and brief PDFs | Competition materials, not yet public |
| QLoRA training and test datasets | Known to be defective — identical files, ten examples each. Publishing them would invite misuse. The defect is documented in [04 · AI System](../docs/04-ai-system.md). |
| Remaining ten design concepts | Superseded by the Aurora direction; the comparison is summarised in [03 · User Experience](../docs/03-user-experience.md) |

No personal data, credentials, API keys or student information appear anywhere in this
repository — none were present in the source materials either.

## Citation

Statistical claims in the published documents cite their primary sources inline. Where a figure
could not be traced to a primary source, it was removed rather than softened; the four removed
claims are listed in [02 · Research §1](../docs/02-research-and-evidence.md).

If you need access to the underlying research for review, evaluation, or academic purposes,
please [open an issue](https://github.com/winxtxrgit/futureme-ai/issues).

---

[← Back to README](../README.md)
