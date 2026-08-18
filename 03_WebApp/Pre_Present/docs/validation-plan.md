# Validation Plan

[← Back to README](../READMEEN.md) · [Methodology](questionnaire-methodology.md) · [Question bank](question-bank.md) · [Research summary](research-summary.md)

---

> **This instrument has never been administered to anyone.** Nothing in this document reports a
> result. It sets out what would have to be done before any psychometric claim could be made, and
> records honestly which steps have and have not been performed.
>
> **What is now built.** The analysis pipeline exists and its arithmetic is verified: item
> statistics, α and ω with bootstrap confidence intervals, and the randomisation test of Holland's
> circular order, in `lib/research/`. It is checked against hand-computed reference values and
> against simulated data with an exactly known circumplex, which it recovers at CI = 1.000. The
> application can also capture response-process data and export an anonymous per-participant file.
>
> So the gap is no longer capability — it is **participants and ethics approval**. The
> pre-registered analysis plan is in [pilot-protocol.md](pilot-protocol.md).

---

## 1. What is currently claimed, and what is not

| Claim | Status |
|---|---|
| The underlying theory is validated | **Supported** — Holland's RIASEC has substantial evidence |
| Items are drawn from a validated scale | **Supported** — 17 of 30 adapted from 18REST, 13 written for this project |
| Items map cleanly to one construct each | **Supported** — by construction, enforced by tests |
| *This item set* is reliable | **Not established.** No data |
| *This item set* has the expected factor structure | **Not established.** No data |
| The Thai version is equivalent to the English | **Not established.** No data |
| Scores can be compared between learners | **Not established.** No norms exist |
| Scores predict anything | **Not established.** No criterion study |

The correct description of the instrument is **"research-informed prototype"**. It is not a
validated test, and the phrase "scientifically validated" must not be used about it.

---

## 2. Translation adaptation — what has and has not been done

Measured against Beaton, Bombardier, Guillemin & Ferraz (2000) and the ITC Guidelines for
Translating and Adapting Tests (2nd ed., 2017).

| Required step | Standard | Done? |
|---|---|---|
| ≥2 independent forward translations by native Thai speakers | Beaton I | ☐ **No** — one bilingual author |
| One informed + one naive translator | Beaton I | ☐ **No** |
| Written translator reports with rationale | Beaton I | ☐ **No** |
| Formal synthesis to a reconciled version, with a recording observer | Beaton II | ☐ **No** |
| ≥2 blind back-translations by native English speakers | Beaton III | ☐ **No** |
| Expert committee: methodologist + career expert + linguist + all translators | Beaton IV | ☐ **No** |
| Explicit semantic / idiomatic / experiential / conceptual equivalence review | Beaton IV | ☐ **No** |
| **Experiential equivalence** — do Thai students actually encounter these activities? | Beaton IV | ☐ **No** — highest-risk gap |
| Thai reading level verified at ≤ ม.2 by independent readers | Beaton IV | ☐ **No** |
| Response-scale labels translated **and separately validated** | ITC TD-4 | ◐ Translated, not validated |
| Cognitive debriefing with 30–40 Thai students | Beaton V | ☐ **No** |
| Pilot data → item analysis and reliability | ITC TD-5 | ☐ **No data** — pipeline built and verified |
| Measurement invariance against the source version | ITC C-2 | ☐ **No** |
| Documentation of every translation decision | ITC Doc-1 | ◐ Partial — rationale in [question-bank.md](question-bank.md) |

**What was actually done:** a single bilingual author wrote the Thai items for semantic rather than
literal equivalence, with a documented rationale per item and one review pass. That is a first
draft, not an adaptation.

**Note on back-translation.** ITC guideline TD-2 is unusually blunt that back-translation designs
"rarely would provide sufficient evidence to validate a translated and adapted test", because in
their narrowest form "no review of the target language version of the test is ever done". If a
future protocol skips back-translation in favour of double-forward-translation and reconciliation,
that is a defensible choice supported by ITC — not a shortcut — and should be documented as such.

**Highest-value first three steps** if resources are limited: (1) two independent forward
translations plus reconciliation; (2) cognitive debriefing with even 8–12 students; (3) the
experiential-equivalence review, which matters more here than for most instruments because several
activities may simply not exist in a Thai student's frame of reference.

---

## 3. Validation pipeline

```
cognitive debriefing → pilot (item analysis) → internal consistency
      → factor structure → revision → larger sample → invariance → criterion validity
```

### Stage 1 — Cognitive debriefing (n ≈ 30–40)

Administer the Thai form, then interview each student about **what they thought each item meant and
why they chose that response** — both item meaning and response meaning, per Beaton V.

Purpose: catch items that are misread, activities that are unfamiliar, and response labels that do
not carry the intended gradation. This stage explicitly does not address reliability or validity.

Expected output: item revisions, before any statistics are computed.

### Stage 2 — Pilot and item analysis (n ≈ 200–300)

Run by `node scripts/analyse.ts <dir>`. The full pre-registered plan, including the decision rules
committed before data collection, is in [pilot-protocol.md §6](pilot-protocol.md).

Minimum useful sample for stable item statistics at 30 items. Stratify by education tier
(ม.1–ม.3, ม.4–ม.6, ปวช./ปวส.) and by gender, since large gender differences are expected in R and S.

Compute per item:

- **Item–total correlation** (corrected). Flag items below .30.
- **Response distribution.** Flag floor/ceiling effects.
- **Per-item "not sure" rate.** An outlier here is a translation or exposure problem, not noise —
  this is the diagnostic the midpoint was retained to provide (see
  [methodology §6](questionnaire-methodology.md#6-response-scale)).
- **Missing / skipped rate**, which this product can measure because skipping is permitted.

### Stage 3 — Internal consistency

Report **McDonald's ω** as the primary statistic and Cronbach's α alongside it for comparability
with the RIASEC literature. α assumes tau-equivalence, which a six-scale interest inventory is
unlikely to satisfy.

Benchmarks from comparable instruments — **targets, not expectations**:

| Comparable | Items/scale | Reported α |
|---|---|---|
| 18REST | 3 | .68–.81 (dev); .59–.78 (cross-validation) |
| O\*NET Mini-IP (3-point) | 5 | .70–.75 |
| O\*NET Mini-IP (5-point, N = 575) | 5 | .74–.81 |
| O\*NET IP Short Form | 10 | .78–.87 |
| O\*NET IP-60, **school sample** | 10 | **.60–.79** |

At 5 items per dimension this instrument sits at the Mini-IP's length, so **α around .70–.81 is the
realistic expectation, not .85** — and the lower end of that range is the more likely one, since the
Mini-IP's better figures come from its 5-point form in a single sample. Note also that .70 is explicitly a rule of thumb — the O\*NET
manual itself calls it "a heuristic".

### Stage 4 — Factor structure

- **EFA** on a first sample, then **CFA** on an independent one. Never both on the same data.
- Test the six-factor model, and separately test circular structure using randomisation tests with
  a correspondence index rather than assuming the hexagon.
- **Expect this to be difficult.** The hexagon was not supported cross-culturally (Rounds & Tracey,
  1996), the O\*NET Long Form itself reaches only CI = .40, and an independent CFA found poor
  six-factor fit for the Short Form. A negative result here would be consistent with the literature
  and must be published in these docs rather than quietly dropped.

### Stage 5 — Revision, then re-pilot

Item revision on the basis of stages 2–4, then repeat. One pass is not validation.

### Stage 6 — Measurement invariance

Configural → metric → scalar invariance across education tier and gender, and against the English
form for bilingual respondents. **Until scalar invariance holds, scores must not be compared across
groups** (ITC SSI-2). This is why the product reports within-person relative standing rather than
between-person comparison.

### Stage 7 — Criterion and convergent validity

- **Convergent:** correlate against another interest measure administered to the same students.
- **Criterion:** the honest criterion for this product is not job performance but **exploration
  behaviour** — did the learner investigate a route, talk to someone about it, or change their
  stated plan? A longitudinal follow-up at 6–12 months on enrolment or persistence would be
  stronger, and correspondingly harder.
- **Test–retest** over 2–4 weeks. Interpret against the finding that adolescent interest stability
  is genuinely only upper-.50s — a modest retest correlation may reflect the construct rather than
  the instrument.

---

## 4. Careless responding

**Implemented** in `lib/research/careless.ts` and reported by `scripts/analyse.ts`: longstring,
intra-individual response variability, even–odd consistency across the six subscales, and median
seconds per item. Thresholds are supplied by the caller and echoed back in the report rather than
hidden in the code.

The product itself still detects only the extreme case, refusing to produce routes when the profile
is too flat to distinguish dimensions. The indices above are for the analyst, not the learner.

Design positions taken, each following a published recommendation rather than this project's
preference:

- **Log per-item response time, always**, even if unused initially. Calibrate any floor on the
  observed distribution and report the percentile used — the widely cited "2 seconds per item"
  threshold is described in its own source as an educated guess, not a validated constant, and is
  likely too aggressive for a 13-year-old reading a translation on a phone.
- **Longstring** — interpretable here precisely because the dimensions are interleaved.
- **Even–odd consistency** across the six scales, which are unidimensional by design.
- **Intra-individual response variability**, which catches the opposite failure.
- **One instructed-attention item** at roughly the two-thirds point — and no more than one. Treat
  failure as a soft flag, never a sole exclusion: in a translated instrument given to 13-year-olds,
  failure may indicate reading difficulty rather than carelessness.
- **Flag and warn rather than silently discard.** O\*NET's own precedent is to tell a client who
  disliked everything that "your results may not reflect your interests". For a career-exploration
  product, offering a retake is better UX and better measurement than dropping the learner.
- **Report cleaned and uncleaned results.** Some good data is always removed by cleaning.

---

## 5. Order effects

Item order is currently **fixed and interleaved**. Randomising order between participants during the
pilot would allow order effects to be estimated. If they prove negligible, fixed order should be
kept — it is better for a learner who returns to a partly finished assessment.

---

## 6. What would change in the product

If validation happened and succeeded:

- Reliability could be reported per scale, with confidence intervals.
- Norms from a Thai sample could support statements like "higher than most students in your tier" —
  which the product currently cannot and does not say.
- The `demoNotice` badge and the honesty language on the landing page could be revised to describe
  what was actually established.

If validation happened and **failed** — a real possibility given the structural literature — the
correct response is to reduce what the product claims, not to hide the result. The instrument would
remain usable as a structured self-reflection prompt while ceasing to be described as measuring
RIASEC dimensions.

---

## 7. Ethics prerequisites

Before any data collection with minors: institutional ethics approval; parental consent plus student
assent; a data protection assessment under PDPA; a stated retention and deletion policy; and a route
for a student to challenge or withdraw their data. None of these exist yet. The product's current
guest-only, browser-local design exists partly so that no such data is collected by accident.

---

[← Back to README](../READMEEN.md) · [Methodology](questionnaire-methodology.md) · [Research summary](research-summary.md)
