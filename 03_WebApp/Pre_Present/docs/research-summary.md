# Research Summary

[← Back to README](../READMEEN.md) · [Methodology](questionnaire-methodology.md) · [Question bank](question-bank.md) · [Validation plan](validation-plan.md)

---

What was investigated before the assessment was designed, what the evidence actually said, and what
was done about it. **Rejected frameworks are recorded here with their reasons**, because the
decision not to measure something is as much a design decision as the decision to measure it.

Verification status: **[VERIFIED]** the source was opened and the relevant content read;
**[PARTIAL]** bibliographic record confirmed at the publisher, full text not accessed;
**[UNVERIFIED]** could not be accessed — reported but not relied on.

---

## 1. Decisions at a glance

| Framework | Evidence quality | Reusable items? | Decision | Reason |
|---|---|---|---|---|
| Holland RIASEC interests | Strong — multiple meta-analyses | **Yes** — 18REST is CC BY 4.0 | **Included** | Best-evidenced predictor for education/career exploration; already drives the engine |
| Work values (TWA / O\*NET) | Moderate–strong | Yes — O\*NET, public domain | **Deferred** | No value profiles exist on the routes to match against; would be collected and unused |
| Career Decision Self-Efficacy | Strong construct | **No** — CDSE licensed commercially | **Deferred** | Items cannot be reproduced; useful only if output branches on it, which is not built |
| Big Five / FFM | Strong, but for the wrong outcome | Yes — IPIP is public domain | **Rejected** | Predicts academic performance, which this product does not estimate |
| Self-Determination Theory | Strong theory, thin adolescent instrumentation | Partial | **Rejected as measurement; adopted as design principle** | Changes how to speak to a learner, not which routes fit |
| MBTI / type instruments | Poor | No — licence-blocked | **Rejected** | Unstable classification from dichotomising continuous traits |
| Learning styles / VARK | Poor — repeatedly falsified | No — trademarked | **Rejected** | No adequate evidence base; also irrelevant to route matching |

The rule applied throughout: **a construct that cannot change the product's output is not measured.**

---

## 2. Included: Holland RIASEC

| | |
|---|---|
| **Theory** | Holland, J. L. (1997). *Making Vocational Choices* (3rd ed.). PAR. **[PARTIAL]** |
| **Key evidence** | Rounds & Su (2014): interest congruence correlates .36 with job performance and .42 with academic performance (interest-scale scores .23), .30 with student grades and **.34 with persistence in school**. **[VERIFIED]** |
| **Adolescent evidence** | Stability across adolescence is only upper-.50s, reaching ~.70 at 18–21.9 (Low et al., 2005). **[PARTIAL]** |
| **Use in project** | Six dimension scores matched against route interest weightings by profile correlation |
| **Decision** | **Included**, expanded from 12 items to 30 |

### The finding that constrained the design

**Rounds & Tracey (1996)** examined 76 international correlation matrices from 18 countries and
concluded that "the cross-culture structural equivalence of Holland's circular order model was not
supported"; only Iceland, Japan and Israel reached acceptable fit. **[PARTIAL]**

This is the most important citation in the project and it *cuts against* the tool being built on.
Two changes followed directly:

1. Route matching uses **profile correlation across all six dimensions**, never hexagonal adjacency.
2. No claim is made anywhere that the hexagon holds in a Thai sample.

### Three things weaker than they look

- **The source instrument's own structure is contested.** The O\*NET manual's analysis gives its
  Long Form a correspondence index of **.40** against the hypothesised circular structure. An
  independent CFA of the Short Form found "poor fit with a six-factor structure" and concluded
  "modifications are needed" (Warlick et al., 2018) — a paper the O\*NET manual cites twice for its
  reliability figures without discussing its structural finding. In fairness, the same manual
  analysis reports the Short Form more favourably at CI = .69, above its .67 benchmark. **[PARTIAL]**
- **School-sample reliability is much worse than the headline.** The manual's summary reports
  α .78–.87 for the Short Form. Its Table 1 also contains a school sample (N = 140) with
  α **.60–.79** — three of six scales below .70, Realistic at .60 — reported without comment. It is
  the closest published condition to this product's population, though that sample used a **2-point**
  rating scale, so some of the gap is likely a response-format artefact rather than an age effect.
  **[VERIFIED]**
- **There is no Thai validation of any RIASEC instrument.** A targeted search across English and
  Thai queries, Thai journal indexes and university repositories found none. Thai-language Holland
  quizzes exist as consumer tools but publish no psychometric evidence. Thailand appears in the
  O\*NET manual's list of countries with *client access* — that records access requests, not
  validation. **This is a reported negative finding.**

### Licensing — why 18REST rather than O\*NET items

| Source | Licence | Consequence |
|---|---|---|
| **18REST** (Ambiel et al., 2018) | **CC BY 4.0**, items printed in Table 2 | Adaptation, translation and commercial use permitted with attribution. **Chosen.** |
| O\*NET Interest Profiler | CC BY-ND 4.0 *or* O\*NET Tools Developer License | Translating creates a derivative → Developer License → obliges the developer to "validate all products incorporating content from the Tools". A prototype with no data cannot meet that. **Not used.** |
| RIASEC Markers | Non-commercial only | Excluded. |

A trap worth recording: the O\*NET tool pages carry a CC BY 4.0 footer. That licenses **the web
page's descriptive content**, not the instrument. **[VERIFIED]**

---

## 3. Deferred: work values, and career decision self-efficacy

Neither is rejected on evidence. Both are held back because the product cannot yet act on them.

**Work values (Theory of Work Adjustment).** Rounds (1990) found work-value correspondence predicted
satisfaction *after* controlling for interest congruence, and values clarification carried an effect
size of 0.522 in Whiston et al.'s (2017) meta-analysis — higher than world-of-work information at
0.253. **[PARTIAL]** for Rounds (1990), **[VERIFIED]** for Whiston et al. The O\*NET Work Importance Locator is public domain, and a six-value
ranking would take about a minute.

**It is deferred because `data/routes.json` has no value profiles.** Collecting six value rankings
and matching them against nothing would be exactly the decorative measurement this project is trying
to avoid. Adding occupational value profiles to the route catalogue is the prerequisite, and is the
single highest-value next step for the assessment.

**Career Decision Self-Efficacy.** The outcome career interventions most reliably move (ES = 0.446,
the largest in Whiston et al., 2017). **[VERIFIED]** But CDSE and CDSE-SF items are copyright
Betz & Taylor, licensed through Mind Garden at US$2.75 per administration. **[VERIFIED]** They
cannot be reproduced. Original items in the SCCT format could be written, but are only worth
collecting if the output branches on them — more scaffolding and fewer simultaneous options for a
low-confidence learner. That branching is not built, so the items are not asked.

---

## 4. Rejected, with reasons

**Big Five / Five-Factor Model.** The public-domain option is genuinely good — IPIP carries an
explicit grant for "any purpose, commercial or non-commercial" **[VERIFIED]**. Rejected anyway
because the evidence points at academic *performance* (Poropat, 2009), which this product explicitly
does not estimate; because interests already predict life outcomes over and above Big Five (Stoll et
al., 2017); and because returning trait labels to a 14-year-old with no route consequence is cost
without benefit. **[PARTIAL]** *(Note for anyone revisiting this: BFI-2-XS is not a public-domain
alternative — BFI-2 items are licensed non-commercial only.)*

**Self-Determination Theory.** The best-fitting instrument, the CDMAS, was validated on 834 college
students with mean age 18 — the top edge of this product's range. **[VERIFIED]** More decisively:
knowing a student is externally regulated because their parents are pushing does not change which
routes fit them. It changes how the product should talk to them. Guay et al. (2003) found autonomy
support predicts lower career indecision **[PARTIAL]**, so the finding is adopted as **copy
guidance** — present options rather than verdicts, give reasons, never say "your career is X" —
at zero item cost. Family pressure is a live factor in the Thai context, which makes this the more
useful form of the finding.

**MBTI and type instruments.** Pittenger (1993, 2005) and Boyle (1995) document the core problem:
forcing continuous distributions through four binary cuts means scores near the midpoint flip
between administrations, producing an unstable type from stable traits. **[PARTIAL]** Also
licence-blocked. *(The widely circulated "~50% get a different type in five weeks" figure could not
be verified in the original and is deliberately not used anywhere in this project.)*

**Learning styles / VARK.** Pashler, McDaniel, Rohrer and Bjork (2008) concluded: "there is no
adequate evidence base to justify incorporating learning-styles assessments into general educational
practice", describing current use as a "wasteful use of limited resources". **[VERIFIED]** Newton
and Salvi (2020) found belief in matching remains at 95.4% among pre-service teachers **[PARTIAL]**
— which matters practically: Thai teachers and parents may *expect* this feature, so a short
non-condescending explanation is more useful than shipping it. It also fails the project's own test:
even if learning styles were real, they would inform how to *teach*, not which route to explore.

---

## 5. Does combining constructs beat interests alone?

**Honest answer: nobody has directly tested it.**

Supportive but indirect: Rounds (1990) on incremental validity of values over interest congruence
(adults, job satisfaction — not adolescent exploration); Whiston et al. (2017) found self-report
inventories (0.445) and values clarification (0.522) each outperformed computer-guided intervention
(0.103), but coded them as separate present/absent components rather than testing the combination.

Against: Whiston et al.'s overall homogeneity test was non-significant, and the authors warn their
moderator analyses "should be interpreted very cautiously and tentatively". And the overall career
intervention effect has been stable at ~0.30–0.35 across three decades of meta-analyses **despite
the field steadily adding constructs** — which is itself evidence that construct count is not the
active ingredient. **[VERIFIED]**

**What this project may claim:** adding a brief work-values ranking would be justified on
incremental-validity and values-clarification grounds. It may **not** be claimed to improve
exploration outcomes over interests alone. That claim is kept out of the product and its materials.

---

## 6. A finding about the delivery format, not the constructs

Whiston et al. (2017) report **computer-guided intervention as the weakest format measured**
(ES = 0.103, k = 4) against counsellor support at 0.825. **[VERIFIED]** No amount of additional
measurement fixes that; it is a property of the delivery channel.

What the evidence says does work — Brown and Ryan Krane's critical ingredients — is written
exercises, individualised interpretation, world-of-work information, modelling, and **building
support for the decision**. **[PARTIAL]** Three of those the product already does. The fourth is
the interesting one: for a Thai student, family support for the decision is plausibly decisive, and
a feature that helps a learner *explain their reasoning to a parent* would likely outperform any
additional scale. That is recorded here as the strongest product-level implication of this research
round, outside the scope of the assessment itself.

---

## 7. Sources

Full citations with verification status are in
[questionnaire-methodology.md §13](questionnaire-methodology.md#13-references). Key sources for the
decisions above:

- Ambiel et al. (2018), 18REST — <https://doi.org/10.1186/s41155-018-0086-z> **[VERIFIED]**
- Rounds, Hoff & Lewis (Eds.) (2021), *O\*NET Interest Profiler Manual* **[VERIFIED]**
- O\*NET Career Exploration Tools Content License — <https://www.onetcenter.org/license_tools.html> **[VERIFIED]**
- Rounds & Tracey (1996) — <https://doi.org/10.1037/0022-0167.43.3.310> **[PARTIAL]**
- Rounds & Su (2014), *Current Directions in Psychological Science*, 23(2), 98–103 **[VERIFIED]**
- Warlick et al. (2018) — <https://doi.org/10.1177/1069072717714544> **[PARTIAL]**
- Whiston et al. (2017), *Journal of Vocational Behavior*, 100, 175–184 **[VERIFIED]**
- Pashler et al. (2008) — <https://doi.org/10.1111/j.1539-6053.2009.01038.x> **[VERIFIED]**

---

[← Back to README](../READMEEN.md) · [Methodology](questionnaire-methodology.md) · [Validation plan](validation-plan.md)
