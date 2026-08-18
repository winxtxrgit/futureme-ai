# Pilot Study Protocol

[← Back to README](../READMEEN.md) · [Methodology](questionnaire-methodology.md) · [Validation plan](validation-plan.md) · [Question bank](question-bank.md)

---

> **Status: written before any data was collected.** That is the point of it. An
> analysis plan decided after seeing the results is not a test of a hypothesis,
> it is a description of a sample — and the difference is what separates a
> citable finding from an anecdote. Every statistic this study will report is
> named below, with its decision rule, before there is anything to report.
>
> If this protocol is revised after data collection begins, the revision must be
> recorded in §10 with a date and a reason. Silent revision would make the
> pre-registration worthless.

---

## 1. Research question

**Does the FutureMe interest instrument measure six distinguishable interest
dimensions reliably enough to support exploratory use with Thai secondary and
vocational students?**

Three sub-questions, each with a pre-committed analysis:

| # | Question | Analysis | §  |
|---|---|---|---|
| Q1 | Are the six scales internally consistent? | Cronbach's α and ω with bootstrap CIs | §6.2 |
| Q2 | Does any item fail to belong to its scale? | Corrected item–total correlations | §6.3 |
| Q3 | Is Holland's circular order recoverable in a Thai sample? | Randomisation test of order relations | §6.4 |

**Q3 is the one that matters most and the one most likely to fail.** Rounds and
Tracey (1996) could not support cross-cultural structural equivalence of the
circular order across 76 international matrices, and no Thai RIASEC validation
exists at all. A negative result here would be consistent with the literature
and **will be reported** (§8).

---

## 2. What this study cannot answer

Stated up front so no reader has to infer it:

- **Not convergent validity.** No second interest measure is administered, so
  nothing here shows the instrument measures the same thing as an established one.
- **Not criterion validity.** No outcome is followed up. Nothing here predicts
  what a student will study, enrol in, or persist at.
- **Not measurement invariance.** Until it is tested, **scores may not be
  compared between education tiers, languages or genders**, and this study does
  not test it.
- **Not norms.** No reference distribution is produced, so no score may be
  described as high or low.
- **Not test–retest reliability.** A single administration cannot estimate it.

A successful result licenses exactly one claim: that the scales hold together
well enough for the product's stated exploratory purpose in this sample.

---

## 3. Design

Single-administration cross-sectional pilot. No experimental manipulation, no
control group — neither is meaningful for an item analysis.

**Item order is fixed and interleaved** for every participant (§8.1 of the
[methodology](questionnaire-methodology.md)). Randomising order between
participants would let order effects be estimated, but it would also break the
resume-where-you-stopped behaviour the product relies on. Order effects are
therefore a known uncontrolled factor, listed in §9.

---

## 4. Participants

**Target: n = 250, minimum n = 200.** Below 200 the item statistics are too
unstable for the CIs to be informative; the analysis script prints a warning
below that figure rather than letting a reader miss it.

**Stratification.** Recruit to approximate balance on:

| Stratum | Levels | Why |
|---|---|---|
| Education tier | ม.1–ม.3 · ม.4–ม.6 · ปวช./ปวส. | The tiers differ in world-of-work exposure, which the age-floor literature says affects interest responding |
| Language | Thai · English | The Thai form is a first draft; a language difference in item behaviour is the thing most likely to show up |
| Gender | as self-described, optional | Large gender differences in Realistic and Social are expected (d ≈ 0.8–0.95); the sample must be able to show them rather than hide them behind an unbalanced draw |

**Inclusion:** currently enrolled at one of the three tiers. **Exclusion:** none
on ability or language proficiency — excluding students who find the items hard
would remove exactly the evidence the study needs.

**Ages 13 and under are reported separately.** The O\*NET manual recommends
roughly 14 as a floor for interest inventories, because reliable interest
responding needs some prior knowledge of work. Pooling below-floor respondents
into the headline figures would hide the effect the floor exists to describe.

---

## 5. Procedure

1. **Consent before anything else.** Information sheet and consent form in Thai;
   parental or guardian consent plus student assent for under-18s. See §7.
2. Participants complete the assessment on their own device or a provided one, in
   whichever language they choose.
3. **The learner sees their normal result.** The product is not degraded for the
   study — withholding the routes would change the incentive to answer honestly.
4. At the end, the participant is shown `/research`, reads what would be shared,
   and decides. Consent is a separate checkbox from the export action.
5. The exported file is handed to the facilitator. Nothing is transmitted by the
   application at any point.
6. **Cognitive debriefing on a subsample of 10–12.** Structured interview on what
   each item was understood to mean and why that response was chosen (Beaton
   stage V). This is the highest-value component per unit of effort and is not
   optional.

**Estimated burden:** 5–7 minutes for the interest items, under 15 minutes for
the full flow.

---

## 6. Pre-registered analysis plan

Run by `scripts/analyse.ts` over the directory of exports. All arithmetic is in
`lib/research/`, verified against hand-computed reference values in
`tests/unit/psychometrics.test.ts`, and the whole chain is verified to recover a
known circumplex from simulated data in `tests/unit/pipeline-recovery.test.ts`.

### 6.1 Data quality, decided before looking

Careless-responding indices per participant: longstring, intra-individual
response variability, even–odd consistency across the six subscales, and median
seconds per item.

- **Response-time floor is calibrated on this sample**, at the 5th percentile of
  observed median item time, and the resulting value is reported. A borrowed
  2 s/item constant is not used: its own source calls it an educated guess.
- **Flagged participants are not silently dropped.** Every analysis is reported
  twice, with and without them, and the two are compared. If a conclusion depends
  on which set is used, that dependence is the finding.
- A flag is not evidence of carelessness in this population. In a translated
  instrument given to 13-year-olds, it may indicate reading difficulty.

### 6.2 Reliability (Q1)

Per scale: Cronbach's α with a 2000-resample percentile bootstrap CI, and
McDonald's ω from a single-factor model. Both reported; neither called "the"
reliability.

**Interpretation committed in advance.** At 5 items per dimension this
instrument is the length of the O\*NET Mini-IP, so **α ≈ .70–.81 is the expected
range, not .85**. The relevant comparisons are Mini-IP α .70–.81, 18REST
α .68–.81 developmental and **.59–.78 on cross-validation**, and the O\*NET
school-aged sample at **α .60–.79**. A scale landing at .65 is a result to
report and revise, not a failure to hide.

### 6.3 Item analysis (Q2)

Per item: mean, SD, response distribution, corrected item–total correlation, and
the per-item **"not sure" rate**.

- Items with corrected r < .30 are flagged for revision.
- **An outlying "not sure" rate is treated as a translation or exposure problem**,
  not as noise. This is the diagnostic the midpoint was retained to provide, and
  it is the main quantitative check on the Thai translation.
- Decision rule: an item is revised, not deleted, unless its corrected r < .15 in
  both languages. Deleting items to raise α inflates the statistic without
  improving the instrument.

### 6.4 Structure (Q3)

Randomisation test of hypothesised order relations on the 6×6 scale
intercorrelation matrix (Hubert & Arabie 1987; Tracey & Rounds 1993, 1996):

- 72 order predictions from the circular order R-I-A-S-E-C.
- CI = (met − violated) / 72. **Ties count in the denominator**; a predicted
  inequality that comes back equal has not been supported.
- Exact p from all 720 relabellings — enumerated, not sampled, so the p-value
  carries no simulation error.
- Reported alongside mean r at each circular distance, because that is what makes
  a failure diagnosable: a circumplex usually fails because one band is out of
  order, which the CI alone will not show.

**Benchmark, not a threshold.** Tracey and Rounds (1993) report a meta-analytic
CI of .63 across RIASEC measures. There is no value at which this statistic
"passes", and none will be invented.

### 6.5 Exploratory, labelled as such

Anything not listed above — subgroup comparisons, language differences, factor
analyses — is exploratory, will be labelled exploratory in the report, and no
p-value from it will be presented as confirmatory.

---

## 7. Ethics and data protection

**None of this exists yet, and no data may be collected until all of it does.**

| Requirement | Status |
|---|---|
| Institutional ethics approval | ☐ Not obtained |
| Parental/guardian consent, under-18s | ☐ Not obtained |
| Student assent, separate from parental consent | ☐ Not obtained |
| PDPA data-protection assessment | ☐ Not done |
| Stated retention and deletion policy | ☐ Not written |
| Route for a participant to withdraw their data | ☐ Not built |

**What the architecture already does right.** Nothing is transmitted; the
product has no server-side store; the export excludes free text, names and
school; the participant identifier is random per browser and is not linked to the
guest session, so two exports cannot be joined into a fuller picture of one
person. The guest-only design exists partly so that no data about a minor can be
collected by accident.

**What the architecture cannot do.** It cannot obtain consent, and it cannot
verify that consent was obtained. The consent checkbox on `/research` records an
intention on one device; it is not a substitute for the process above.

---

## 8. Reporting commitments

1. **The result is published whichever way it comes out.** A CI below the
   benchmark, or a scale under α .70, goes into
   [validation-plan.md](validation-plan.md) and the methodology document with the
   same prominence as a favourable result would get.
2. **If Q3 fails**, the correct response is to reduce what the product claims,
   not to re-specify the analysis until it passes. The instrument would remain
   usable as a structured reflection prompt while ceasing to be described as
   measuring RIASEC dimensions.
3. **The exact n, the dropped-case count and the thresholds used** are reported
   with every statistic. A coefficient without its n is not checkable.
4. **The dataset and the analysis code are published together.** The pipeline is
   dependency-free and seeded, so a third party can reproduce every number from
   the same files.

---

## 9. Known uncontrolled factors

- **Item order is fixed**, so order and context effects are not estimable.
- **Acquiescence is not measured.** There are no reverse-keyed items — a decision
  argued from evidence in §8 of the methodology — and no separate acquiescence
  index, so response style is uncontrolled.
- **Social desirability is not measured.** Activity-based items reduce it relative
  to trait statements; they do not remove it.
- **Self-selection.** Participants who complete an optional export are unlikely to
  be a random subset of those who took the assessment. Completion and export
  rates are reported so the reader can judge the bias.
- **Device and setting** are uncontrolled; response times from a shared classroom
  device are not comparable with a personal phone.
- **The Thai form is a first draft** (see [validation-plan.md §2](validation-plan.md)).
  Any language difference found here confounds translation quality with genuine
  measurement differences and cannot separate them.

---

## 10. Protocol revisions

| Date | Change | Reason |
|---|---|---|
| 2026-07-30 | Initial version, written before any data collection | — |

---

## 11. How to reproduce the analysis

```bash
# Verify the pipeline against hand-computed values and a known structure
npm test

# Self-test: generate a dataset with an exact circumplex and check it is recovered
node scripts/simulate-pilot.ts /tmp/sim --n 300 --seed 7
node scripts/analyse.ts /tmp/sim --min-seconds 1.5

# Real pilot
node scripts/analyse.ts ./pilot-exports --out docs/pilot-report.md --min-seconds <calibrated>
```

The simulated run is a check on the code, not on the instrument. Simulated
respondents have no interests, and no number from that run may be cited as
evidence about the questionnaire.

---

## 12. References

Full citations with verification status are in
[questionnaire-methodology.md §13](questionnaire-methodology.md#13-references).
Methods used directly by this protocol:

- Hubert, L., & Arabie, P. (1987). Evaluating order hypotheses within proximity
  matrices. *Psychological Bulletin*, 102(1), 172–178. **[PARTIAL]**
- Tracey, T. J., & Rounds, J. B. (1993). Evaluating Holland's and Gati's
  vocational-interest models: A structural meta-analysis. *Psychological
  Bulletin*, 113(2), 229–246. <https://doi.org/10.1037/0033-2909.113.2.229>
  **[PARTIAL]**
- Rounds, J., & Tracey, T. J. (1996). Cross-cultural structural equivalence of
  RIASEC models and measures. *Journal of Counseling Psychology*, 43(3),
  310–329. <https://doi.org/10.1037/0022-0167.43.3.310> **[PARTIAL]**
- Meade, A. W., & Craig, S. B. (2012). Identifying careless responses in survey
  data. *Psychological Methods*, 17(3), 437–455.
  <https://doi.org/10.1037/a0028085> **[VERIFIED]**
- Curran, P. G. (2016). Methods for the detection of carelessly invalid responses
  in survey data. *Journal of Experimental Social Psychology*, 66, 4–19.
  <https://doi.org/10.1016/j.jesp.2015.07.006> **[VERIFIED]**
- Huang, J. L., Curran, P. G., Keeney, J., Poposki, E. M., & DeShon, R. P.
  (2012). Detecting and deterring insufficient effort responding to surveys.
  *Journal of Business and Psychology*, 27(1), 99–114.
  <https://doi.org/10.1007/s10869-011-9231-8> **[VERIFIED]**
- Beaton, D. E., Bombardier, C., Guillemin, F., & Ferraz, M. B. (2000).
  Guidelines for the process of cross-cultural adaptation of self-report
  measures. *Spine*, 25(24), 3186–3191. **[VERIFIED]**

---

[← Back to README](../READMEEN.md) · [Validation plan](validation-plan.md) · [Methodology](questionnaire-methodology.md)
