# 01 · Project Overview

[← Back to README](../READMEEN.md) · [Next: Research →](02-research-and-evidence.md)

---

## What FutureMe AI is

FutureMe AI is a career and study guidance assistant for Thai students. It replaces the
one-shot multiple-choice aptitude test with a short conversation, a hands-on mini task, and
three concrete routes the student can compare — each one showing the evidence behind it.

The product is being built for the **JUMP Thailand Hackathon 2026** (AIS Academy × NIA), under
the theme *AI for the Future of Thai Education*.

> **Naming note.** Research documents and the product UI use **FutureMe**. The backend engine,
> API tag and schema layer use **FuturePath**. This repository treats *FutureMe AI* as the
> product name and *FuturePath* as the internal decision engine.

---

## The problem in one line

Thai students choose a study track years before anyone helps them understand what that track
leads to — and the cost of that gap shows up after graduation.

Per TDRI's 2025 analysis, **56% of Thai higher-education graduates work outside their field of
study** and **27% work below their qualification level**. Globally, OECD places field mismatch at
roughly 35–40%, with a 15–20% wage penalty attached to it.

The full evidence base, with sources and the claims we deliberately excluded, is in
[02 · Research and Evidence](02-research-and-evidence.md).

---

## Why existing tools do not close the gap

| What students have today | What is missing |
|---|---|
| Static RIASEC questionnaires (including the one inside the Ministry's NDLP platform) | No follow-up, no probing, no adaptation to the answer |
| Multiple-choice interest tests | Students answer with what sounds acceptable, not what is true |
| University open days and marketing | Shows the destination, never the steps between here and there |
| A counsellor shared across hundreds of students | No time for individual depth; rural and small schools have less access still |

The recurring failure is the same: a student is asked to *state* a preference they have never
had a chance to *test*.

---

## The approach

FutureMe AI collects two independent kinds of evidence before it recommends anything.

```mermaid
flowchart LR
    A["Phase 1<br/>Socratic interview"] --> C["Combined<br/>evidence profile"]
    B["Phase 2<br/>Scenario mission"] --> C
    C --> D["Three routes<br/>with reasons"]
    D --> E["30-day plan<br/>+ roadmap"]
```

**Phase 1 — what the student says.** An adaptive Socratic conversation (5–10 minutes) using
Motivational Interviewing to lower defensiveness, Laddering to reach underlying values, and
STAR to anchor claims in things the student has actually done. It produces a RIASEC interest
profile plus extracted strengths and learning-style signals.

**Phase 2 — what the student does.** A short scenario mission (3–5 minutes) in the direction
the interview pointed toward. A student who says they like design gets a small design problem.
Doing beats declaring, and the mission result is scored as separate evidence.

**Then: three routes, not one answer.** Every recommendation ships with the reasons it was
made, the evidence supporting it, and an explicit statement of what the system still does not
know.

---

## Who it is for

| Tier | Grades | What the product is trying to help with |
|---|---|---|
| Primary | ป.4 – ป.6 | Early, playful exposure to what jobs exist at all |
| Lower secondary | ม.1 – ม.3 | The ม.4 fork: general track vs. vocational vs. dual education |
| Upper secondary | ม.4 – ม.6 | Faculty choice, TCAS strategy, TPAT preparation, portfolio |
| Vocational | ปวช. – ปวส. | Continuing to ปวส./bachelor's, or entering work directly |

Two secondary audiences read the output, under student consent: **parents** see an interest
summary and the 30-day plan; **counsellors** additionally see class-level patterns and
suggested coaching questions. Neither ever sees the raw chat transcript.

---

## What makes it different

**Three routes, never one.** The engine always returns a Balanced Next Step, an Interest Growth
route, and a Practical Access route. A single ranked answer would imply a confidence the
system does not have.

**Evidence you can inspect.** Each route lists what supports it, what would change it, and what
is still unverified — including a reversible "small step you can take first."

**Vocational routes treated as first class.** All 12 ปวช. 2567 subject areas and the dual
vocational education (DVE) track are modelled with the same weight as university paths.

**Privacy that a school can actually accept.** Role-based access, consent-gated sharing, and
chat transcripts that stay with the student by default.

---

## Honest scope

This is hackathon-stage work with a real research base and a working backend engine, not a
deployed product. Specifically:

- The RIASEC instrument and mission rubrics **have not been validated** by qualified assessment experts.
- **No student pilot has run.** Every effectiveness claim in this repository is a design goal, not a measured result.
- NDLP/DEEP integration is a **future possibility**, dependent on official API documentation and partnership approval.
- AIS Cloud is the **intended deployment target**, described from published specifications. Nothing is deployed there yet.

See [07 · Roadmap](07-roadmap.md) for how each of these is meant to be closed.

---

[← Back to README](../READMEEN.md) · [Next: Research →](02-research-and-evidence.md)
