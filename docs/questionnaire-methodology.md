# Questionnaire Methodology

[← Back to README](../READMEEN.md) · [Question bank](question-bank.md) · [Research summary](research-summary.md) · [Validation plan](validation-plan.md) · [Pilot protocol](pilot-protocol.md)

---

> **Status: `research-informed prototype`.** The instrument described here is built on a validated
> theory and borrows items from a validated scale. **It has not itself been validated.** No
> reliability coefficient, factor structure or validity estimate has been computed for this item set
> or its Thai translation, because no participant data has been collected. Every claim below is
> labelled with what supports it.

---

## 1. Assessment purpose

**What it is for.** Helping a Thai secondary or vocational student generate a *starting hypothesis*
about the kinds of activity they may be drawn to, so that they have something concrete to explore,
test and argue with. The output feeds a rule-based engine that proposes up to three study routes,
each with its reasoning shown.

**What it is not for, and must never be described as doing:**

- diagnosing a personality type
- determining, predicting or recommending a career
- predicting admission, academic performance, employment or income
- screening, selection, streaming or placement of any kind
- substituting for a qualified counsellor

The distinction matters more than usual for this audience. Adolescent vocational interests are not
yet stable: rank-order stability of interests across adolescence sits in the upper .50s and only
approaches .70 during ages 18–21.9 (Low, Yoon, Roberts & Rounds, 2005). An instrument given to a
14-year-old is measuring something that is still moving. The product's language — "explore", "a
starting guess", "not a verdict" — is a direct consequence of that finding, not marketing softness.

---

## 2. Theoretical framework

### 2.1 Holland's RIASEC model — included

**Theory.** People and work environments can both be described in terms of six types — Realistic,
Investigative, Artistic, Social, Enterprising, Conventional — and satisfaction and persistence are
better where person and environment correspond.

**Origin.** Holland, J. L. (1997). *Making Vocational Choices: A Theory of Vocational Personalities
and Work Environments* (3rd ed.). Odessa, FL: Psychological Assessment Resources. The theory first
appeared in Holland, J. L. (1959), "A theory of vocational choice", *Journal of Counseling
Psychology*, 6(1), 35–45.

**Why it is relevant here.** Interests are the best-evidenced predictor available for what this
product actually does. In Rounds and Su's (2014) review of the criterion validity of interests,
interest *congruence* correlated .36 with job performance and .42 with academic performance, while
interest-scale scores correlated .23 with academic performance; congruence correlated .30 with
students' grades and .34 with persistence in school. Persistence is the outcome closest to what a
route recommendation is really about.

**How the project uses it.** The learner's six dimension scores are compared against per-route
interest weightings by profile correlation across all six values. The hexagonal *ordering* of the
types is deliberately not used — see §11.2 for why.

### 2.2 What was considered and rejected

Full reasoning, evidence and licensing analysis is in [research-summary.md](research-summary.md).
In brief:

| Framework | Decision | Primary reason |
|---|---|---|
| Big Five / Five-Factor | **Rejected** | Predicts academic *performance*, which this product explicitly does not estimate. Would add ~20 items that change no recommendation. |
| Work values (Theory of Work Adjustment) | **Deferred, not rejected** | Methodologically justified, but `data/routes.json` has no value profiles to match against, so the answers would be collected and never used. Recommended for the next phase. |
| Career Decision Self-Efficacy | **Deferred** | Strong construct, but CDSE and CDSE-SF items are licensed commercially and cannot be reproduced. Useful only if the output branches on it, which is not built. |
| Self-Determination Theory | **Rejected as measurement, adopted as design principle** | Knowing a student is externally regulated does not change which routes fit them; it changes how the product should speak. Applied to copy, not to items. |
| MBTI and type instruments | **Rejected** | Dichotomising continuous traits produces unstable types (Pittenger, 1993; Boyle, 1995). Also licence-blocked. |
| Learning styles / VARK | **Rejected** | "There is no adequate evidence base to justify incorporating learning-styles assessments into general educational practice" (Pashler, McDaniel, Rohrer & Bjork, 2008). |

The rule applied throughout: **a construct that cannot change the product's output is not measured.**
Collecting it would cost the learner time and imply a precision the system does not have.

---

## 3. Constructs and dimensions

One construct, six dimensions, 30 interest items, 5 per dimension.

| Dimension | Definition | Items |
|---|---|---|
| **R** — Realistic | Concrete, hands-on activity with tools, machines, plants or animals | INT-R-01…05 |
| **I** — Investigative | Observing, analysing and working out how and why things happen | INT-I-01…05 |
| **A** — Artistic | Expressive, unstructured activity where the form is not fixed in advance | INT-A-01…05 |
| **S** — Social | Helping, teaching, advising and caring for people | INT-S-01…05 |
| **E** — Enterprising | Persuading, leading, organising people, commercial initiative | INT-E-01…05 |
| **C** — Conventional | Ordered, rule-following activity with records, data and procedures | INT-C-01…05 |

Five further **context questions** are collected. These are *not* a psychometric construct and are
not scored as one.

Four are practical constraints — education tier, cost sensitivity, geographic mobility,
time-to-earning — used as eligibility filters and feasibility inputs, and shown back to the learner
as their own stated answers.

The fifth, **`proud`**, is an optional free-text prompt asking the learner to describe something they
made, fixed, organised or helped with. It is not inert: it is scanned by the safeguarding keyword
rule, and it contributes to the RIASEC evidence vector through `keywordEvidence`, which counts
dimension-associated keywords. That is deliberate — it lets a learner's own words corroborate or
contradict their Likert answers — but it is **not a validated measurement procedure**. Keyword
counting is a crude signal, it is English- and Thai-keyword dependent, and it should be read as a
prompt for reflection rather than as a score. It is listed among the limitations in §12.

---

## 4. Question design methodology

### 4.1 Why the previous version was replaced

The prior instrument had **12 items, 2 per dimension**, written as self-descriptive trait statements
("I would rather fix or build something with my hands…"). Two problems:

1. **Too few items.** No published RIASEC form uses 2 items per scale. The shortest validated forms
   use 3 (18REST: α .68–.81) or 5 (O\*NET Mini-IP: α .74–.81). At 2 items per scale, dimension
   scores are dominated by item-specific noise, and every downstream route score inherits it.
2. **Wrong item format.** Interest inventories ask whether you would *like doing an activity*.
   Self-descriptive trait statements invite the answer the learner believes is correct about
   themselves, which is a different and more socially loaded judgement.

### 4.2 Inclusion criteria

An item was included only if it:

- describes **one concrete activity**, not a trait, a value or an aspiration;
- is a **single idea** — no double-barrelled items;
- names an **activity rather than an occupation**. This is deliberate: the O\*NET manual warns that
  without sufficient world-of-work knowledge, "perceptions about different careers may be unduly
  influenced by occupational stereotypes and perceived gender norms", and a ม.1 student is at or
  below the age where that knowledge can be assumed;
- is plausible for a Thai student to have encountered or imagined;
- avoids gendered framing, especially in the Social and Realistic scales where stereotype effects
  are largest;
- carries no obviously "good" answer.

### 4.3 Exclusion criteria

Rejected during writing: items requiring macroeconomic or legal knowledge (the 18REST item
"Analyze national and international economic scenarios" was simplified to bookkeeping for this
reason); items naming a specific profession; items whose Thai rendering required an English
loanword a ม.1 student would not know.

### 4.4 Sources of items

| Origin | Count | Licence position |
|---|---|---|
| Adapted from **18REST** (Ambiel et al., 2018) | 17 | Article is **CC BY 4.0**; items are printed in its Table 2. Adaptation and translation are permitted with attribution. Attribution is carried in `data/questions.json` `meta.attribution` and asserted by a test. |
| **Researcher-written** for this project | 13 | Original text, written to the criteria above. |

**Why not O\*NET Interest Profiler items.** The O\*NET Career Exploration Tools are *not* public
domain. They are offered under CC BY-ND 4.0 (verbatim redistribution only) or the O\*NET Tools
Developer License. Translating items into Thai creates a derivative work, which requires the
Developer License — and that licence obliges the developer to "validate all products incorporating
content from the Tools". A prototype with no validation data cannot meet that condition. 18REST
under CC BY 4.0 carries no such obligation. This was a licensing decision as much as a
methodological one.

**A caution about the borrowed reliability.** 18REST's published alphas (.68–.81) describe *the
Brazilian Portuguese 18-item instrument in its original samples*. They do not transfer to this
30-item adapted and translated set. They are reported here as context for why the source was chosen,
never as evidence about this instrument.

---

## 5. Question mapping

The full item-by-item table — id, both languages, origin, direction and rationale — is in
[question-bank.md](question-bank.md). It is generated from and tested against
`data/questions.json`, so it cannot silently drift from the running instrument.

---

## 6. Response scale

A **5-point scale**, anchored on liking rather than agreement:

| Value | English | ไทย |
|---|---|---|
| 1 | Strongly dislike | ไม่ชอบอย่างยิ่ง |
| 2 | Dislike | ไม่ชอบ |
| 3 | Not sure | ไม่แน่ใจ |
| 4 | Like | ชอบ |
| 5 | Strongly like | ชอบอย่างยิ่ง |

**Why liking, not agreement.** The items ask about activities. "Strongly agree" is not a coherent
response to "Repair a bicycle". This matches the O\*NET Interest Profiler Short Form, which uses
exactly this five-point like/dislike format (0 = strongly dislike … 4 = strongly like).

**Why an item-specific format matters beyond coherence.** Saris, Revilla, Krosnick and Shaeffer
(2010) compared agree/disagree scales against item-specific response options in representative
samples and found "responses to A/D rating scale questions indeed had much lower quality than
responses to comparable questions offering IS response options", advising "the use of IS scales
whenever possible". Agree/disagree formats are also the format acquiescence bias principally
attacks. Choosing like/dislike is therefore a bias mitigation, not only a wording preference.

**Why five points.** Three converging lines of evidence. The general methodological literature puts
the optimum between four and seven, with reliability and validity falling below four (Lozano,
García-Cueto & Muñiz, 2008; Preston & Colman, 2000). The one experiment I could find run
specifically on children and adolescents (Borgers, Hox & Sikkel, 2004; N = 222, ages 8–16) found
item-rest correlations rising from 0.14 at two options to about 0.40 at six, and concluded that
"offering seven or more options appears to cause a decrease in scale reliability". And O\*NET's own
stated reason for moving its Short Form from three points to five was that "with fewer items for the
Short Form, increasing the response options to five points may improve the internal consistency
reliability and accuracy of measurement" — a rationale that applies directly to a short instrument
like this one.

**This is partly a judgement call.** Borgers et al. recommended *four* options for children, which
would mean removing the midpoint. Five was chosen because our respondents skew older than their
8–16 sample and because of the midpoint argument below. All five points are labelled rather than
only the endpoints, to remove interpretive load from a young reader working in a second language;
the evidence bearing directly on full-versus-endpoint labelling could not be obtained.

The midpoint is labelled **"Not sure"** rather
than "Neutral" — for an interest item, the honest middle response from a 14-year-old is usually *"I
have never done this and do not know"*, which is a different statement from balanced indifference.
Labelling it "Not sure" describes what the response actually is.

**The evidence on midpoints is genuinely mixed, and is reported as mixed.** Borgers et al. (2004)
found no significant effect of a midpoint on internal consistency, and their apparent effect on
test–retest stability did not survive their own preferred bootstrapped analysis (0.091, 95% CI
−0.070 to 0.255). Against that, satisficing theory predicts that children are particularly tempted
to use a midpoint as a low-effort escape.

It is retained here on construct-appropriateness grounds. O\*NET made the same call for the same
reason, stating that the "Unsure" response was "essential to allow clients to avoid making a
'forced choice' between two responses that did not adequately capture their interests", and noting
that "items that repeatedly result in 'Unsure' responses could also be reviewed for revision".

That last point converts a contested design choice into a measurement instrument for our own
translation quality: **a per-item "not sure" rate is diagnostic data about the item.** An item with
an outlying rate is a translation or exposure problem, not noise. Logging it is proposed in the
[validation plan](validation-plan.md).

**The accepted cost:** a midpoint absorbs both genuine indifference and "I have never done this",
and they cannot be separated afterwards. Forcing a 14-year-old to claim a preference about an
activity they have never encountered would manufacture data rather than collect it. A four-point
forced-choice format remains a defensible alternative.

---

## 7. Scoring method

Four separated stages. The chain lives in `lib/decision-engine/`. Presentation-level arithmetic does
still appear in two components — `app/compare/page.tsx` derives display bands and a percentage — and
that is noted as a known inconsistency in §12 rather than claimed as clean separation.

```
raw answers (1..5)  →  directional correction  →  per-item 0..1  →  dimension mean  →  interpretation
```

**Step 1 — directional correction.** `applyDirection(raw, direction)` reflects reverse-keyed items
about the scale midpoint: `SCALE_MIN + SCALE_MAX − raw`. **No item in the current bank is
reverse-keyed** (§8), so this is currently an identity function on all 30 items. It exists and is
tested so that a future reversed item is scored correctly by construction.

**Step 2 — per-item normalisation.**

```
itemScore = (directedAnswer − SCALE_MIN) / (SCALE_MAX − SCALE_MIN)
          = (answer − 1) / 4          →  0.00, 0.25, 0.50, 0.75, 1.00
```

**Step 3 — dimension score.** The **mean of that dimension's answered items**:

```
dimensionScore(d) = Σ itemScore(i) / count(i)      for answered i in dimension d
```

Using the mean rather than the sum is what makes a partially completed assessment usable: a learner
who answered three R items and five S items is not thereby "more Social". Unanswered items are
**excluded from the denominator**, never counted as zero — silence is not a dislike.

**Step 4 — floor.** The engine refuses to produce routes until at least
`ceil(30 × 2/3) = 20` interest items are answered. The two-thirds ratio is a **judgement call, not
an empirical threshold**; it is set as a ratio rather than a constant so that changing the bank size
cannot silently weaken it.

**Step 5 — interpretation.** Dimension scores are used in two ways: the three highest dimensions
are surfaced as the learner's provisional profile, and the full six-value vector is compared against
each route's interest weighting.

That comparison is a **cosine similarity** between the learner's six-dimensional profile and the
route's six weights — a measure of *shape*, not of level:

```
interestFit = (p · w) / (‖p‖ ‖w‖)
```

It replaced a weighted mean, `Σ(p·w) / Σw`, which had a defect worth recording. Under a weighted
mean, a learner whose interest is concentrated in one dimension can never score above that route's
weight for that dimension. A purely Artistic learner topped out at 50 against the arts route, a
purely Social learner at 40 and a purely Enterprising learner at 30 — all below the 60 required for
an interest match, so all three were told there was insufficient evidence, while a learner whose
interests spanned two dimensions a route weighted heavily scored 70 and received recommendations.
The arithmetic was deciding which interest types were legible. Cosine similarity is also the
profile-correlation approach the cross-cultural literature prefers over assuming hexagonal
adjacency (§11.2).

Nothing is reported as a percentage, a percentile or a type.

---

## 8. Reverse scoring

**Decision: no reverse-keyed items in this instrument.** The scoring engine supports them; the bank
does not use them.

Reasons:

1. **Semantic incoherence for interest items.** A reversed interest item has to express *disliking*
   an activity ("I would avoid repairing a bicycle"), which is not the negative pole of the same
   construct — it invites a judgement about avoidance rather than about attraction. The five-point
   like/dislike scale already carries the negative direction; the *scale* is bipolar, so the *items*
   do not need to be.
2. **No published RIASEC interest inventory uses them.** Neither the O\*NET Interest Profiler nor
   18REST contains reverse-worded items.
3. **Reverse items split unidimensional scales.** In an experiment giving three versions of the
   same scale to high-school students, "Form-P was unidimensional, while other forms were
   two-dimensional", and the negation-based reverse form had the lowest reliability of the three
   (İlhan, Güler, Taşdelen Teker & Ergenekon, 2024). Weijters, Baumgartner and Schillewaert (2013)
   quantify the damage as systematic rather than random: inconsistency bias accounted for 8–9% of
   variance, and "if inconsistency bias were ignored, the fit of factor models would be rather poor,
   because the error introduced by the presence of reversed items is systematic".

4. **The damage is worse for exactly our population.** Younger and lower-reading-proficiency
   children respond less appropriately to reverse items (Marsh, 1986). Borgers et al. (2004) found
   something arguably worse than unreliability: children answered negatively worded questions
   *stably but differently* — "on more than half of the questions significant differences in
   responses between the negatively formulated and positively formulated questions were found".
   Systematic bias is harder to detect and remove than noise, because reliability statistics do not
   reveal it.

5. **The damage is worse in translation.** In the closest analogue found — TIMSS 2019 mathematics
   confidence, N = 4,515 Saudi Arabian 8th-graders, mean age 13.93, a translated instrument —
   roughly 9% of respondents agreed equally with an item and its reverse. Removing them improved
   α from .820 to .837 and CFI from .824 to .890, and a two-factor model splitting positive from
   negative items fit better than the intended single factor (Antoniou & Alghamdi, 2024).

6. **In Thai the only available reversal is the worst kind.** Thai lacks the productive
   negative-prefix morphology English uses for antonyms (un-, dis-, in-). Most reverse items would
   have to be built with the negation particle ไม่ — which is precisely the negation-based
   reversal İlhan et al. found produced the lowest reliability of the three forms they tested.

7. **The usual justification does not apply.** Reverse items are normally introduced to control
   acquiescence, which is primarily a pathology of agree/disagree formats. This instrument uses an
   item-specific like/dislike format, which is substantially less vulnerable (§6). Vigil-Colet,
   Navarro-González and Morales-Vives (2020) are explicit: "if the test administrator is not
   concerned about possible AC effects, the best option is the use of only direct items."

Acquiescence is therefore controlled by **response format and item order** rather than by item
reversal — see §8.1. Residual acquiescence is not measured, and that is stated as a limitation
in §12 rather than papered over.

### 8.1 Item order

**The six dimensions are interleaved, not presented in blocks.** Items rotate R → I → A → S → E → C
five times.

**A correction, recorded rather than quietly removed.** An earlier draft of this section attributed
two direct quotations to O\*NET claiming that mixing items "reduced the presence of a general
response bias". Independent review could not find that wording, and neither could we: the strings do
not appear in the *O\*NET Interest Profiler Manual* (2021) or in *O\*NET Interest Profiler:
Reliability, Validity, and Self-Scoring* (1999). The quotations have been withdrawn. O\*NET's own
paper Short Form in fact groups items by construct, using "horizontal color bands" so clients can
review a RIASEC category together — the opposite of what was claimed.

Interleaving is therefore kept on the general grounds below, not on a citation:

- A block of six consecutive items from the same dimension invites the learner to answer the block
  rather than each item — an initial impression carried forward is exactly the acquiescence-adjacent
  pattern that item-specific response formats are meant to reduce (§6).
- It makes a longstring careless-responding index interpretable. Identical consecutive answers across
  a blocked instrument may be perfectly genuine; across an interleaved one they are more likely to
  indicate insufficient effort.

This is a design judgement supported by reasoning, not an empirical finding. It is labelled as
such.

Interleaving has a second benefit: it makes a longstring index interpretable. Identical consecutive
answers across a blocked instrument may be perfectly genuine; across an interleaved one they are
more likely to indicate careless responding.

**Order is fixed rather than randomised**, so that a learner returning to the assessment sees a
stable sequence and the review screen matches what they answered. Randomisation is proposed in the
[validation plan](validation-plan.md) as a way to estimate order effects.

---

## 9. Interpretation

The three highest-scoring dimensions are shown as a provisional profile, and the six-value vector
drives route matching.

**No dimension is reported as high or low, and this is deliberate.** Reporting "high
Investigative" would require a norm group — a reference sample of comparable Thai students — and no
such norms exist for this instrument. Any threshold would be invented. What the product reports
instead is *relative*: which of your own six scores are highest, which is a within-person statement
that needs no norms.

The engine additionally refuses to rank routes whose totals fall within a tie margin, and refuses to
produce any routes at all when the profile is too flat to distinguish dimensions. A learner who
answers everything identically gets an explicit "not enough evidence" response, not a fabricated
preference.

**No fabricated precision.** No output states a percentage, a percentile, a match score or a
decimal. The instrument cannot support that resolution and the interface does not imply it.

---

## 10. Reliability

**No reliability coefficient has been computed for this instrument, because no data has been
collected.** Nothing in the product reports one.

For context on what would be expected, from the source literature:

| Instrument | Reported | Source |
|---|---|---|
| 18REST (18 items, Brazilian Portuguese) | α .68–.81 in development, **.59–.78 on cross-validation**; Investigative fell to .62 | Ambiel et al. (2018) |
| O\*NET IP Short Form (60 items) | α .78–.87 (M = .81) | O\*NET IP Manual (2021), Ch. 5 |
| O\*NET Mini-IP (30 items) | α .74–.81 | O\*NET IP Manual (2021), Ch. 5 |
| O\*NET IP-60, **school sample**, N = 140, **2-point scale** | α **.60–.79**; three of six scales below .70, Realistic **.60** | O\*NET IP Manual (2021), Table 1 |

That last row is the closest published condition to this product's population — school-aged
respondents — and it is the weakest result in the manual's own table, reported without comment in
the body text. It should not be over-read, though: **that sample used a 2-point rating scale**, and
§6 of this document argues at length that reliability falls away below four response points. Some of
the gap is likely a response-format artefact rather than an age effect. It is reported here because
the manual's summary text quotes only "α = .78–.87", which would give a reader a materially more
optimistic picture of how these scales behave with students than its own table supports.

**None of these figures describe this instrument.** They describe the instruments it borrows from.

---

## 11. Validity

### 11.1 What is supported

- **The theory** has substantial criterion-validity evidence (Rounds & Su, 2014).
- **Item content** is drawn from a published, peer-reviewed, openly licensed interest scale that
  included an adolescent sample (N = 241, mean age 16.32) alongside adult (N = 473) and
  undergraduate (N = 292) samples — so most of its development data was not adolescent.
- **Content validity** by construction: every item maps to exactly one declared dimension, the
  dimensions are balanced, and the mapping is enforced by a test.

### 11.2 What is not supported — and one finding that cuts against the approach

**Structural validity across cultures is not established, and the most relevant meta-analysis is
negative.** Rounds and Tracey (1996) examined 76 international correlation matrices from 18
countries and concluded that "the cross-culture structural equivalence of Holland's circular order
model was not supported". Only Iceland, Japan and Israel reached acceptable fit.

Two consequences for this project, both implemented:

1. Route matching uses **profile correlation across all six dimensions**, not hexagonal adjacency.
   Nothing in the engine assumes that Realistic sits next to Investigative.
2. No claim is made anywhere in the product or its documentation that the hexagonal structure holds
   in a Thai sample.

**The structure of the source instrument is itself contested — though not uniformly.** The O\*NET
manual's own analysis gives the Long Form a correspondence index of .40 against the hypothesised
circular structure. In fairness to the manual, the same analysis reports the Short Form at CI = .69,
above the .67 benchmark, which the manual reads as fitting the RIASEC model better than many other
measures. Against that,
an independent confirmatory factor analysis of the Short Form found "poor fit with a six-factor
structure", concluding that "modifications are needed to reach acceptable levels of scale
performance" (Warlick, Ingram, Ternes & Krieshok, 2018). The O\*NET manual cites that paper twice
for its reliability figures and does not discuss its structural finding.

**With adolescents specifically, the answer depends on the statistic.** Gupta, Tracey and Gore
(2008) found that in high-school students "nonparametric methods generally showed good model-data
fit, whereas SEM-based results indicated less support". More encouragingly, a German translation of
the IP-SF achieved better circular fit in a high-school sample (CI = .86) than in adults (CI = .64)
— but also showed the structure deteriorating in gender-specific analyses (Roemer, Lewis & Rounds,
2023).

**There is no Thai validation of any RIASEC instrument.** A targeted search — English and Thai
queries, Thai journal indexes, and university repositories — found no peer-reviewed Thai translation
or psychometric validation of the O\*NET Interest Profiler, the Self-Directed Search, the Personal
Globe Inventory, or any other RIASEC measure. Thai-language Holland-style career quizzes exist as
consumer and practitioner tools, but none publishes reliability or validity evidence. Thailand
appears in the O\*NET manual's list of countries with *client access* to the Interest Profiler; that
records access requests, not validation.

**This means: convergent, discriminant and criterion validity are all unexamined for this
instrument.** Not weak — unexamined.

---

## 12. Limitations

1. **This questionnaire has never been administered to anyone.** No item analysis, no reliability,
   no factor structure, no norms.
2. **The Thai translation has not been through a formal adaptation process.** The O\*NET manual's
   own guidance for translation is to "translate and back-translate the IP using a team of experts"
   and to "establish measurement invariance". Neither has been done here. The Thai items were
   written by a bilingual author for semantic rather than literal equivalence, and reviewed once.
   That is a first draft, not an adaptation.
3. **Self-report only.** Everything depends on accurate and honest self-description.
4. **Acquiescence bias is uncontrolled**, since there are no reverse-keyed items (§8).
5. **Social desirability is unmeasured.** Activity-based items reduce it relative to trait
   statements but do not eliminate it.
6. **Age.** The O\*NET manual recommends interest inventories for roughly age 14 and above.
   ม.1–ม.3 students are at or below that boundary. Their results should be read as "activities worth
   exploring", not as a profile.
7. **Gender-stereotype effects are expected and unmitigated.** Large gender differences in Realistic
   and Social scores are consistently reported (d ≈ 0.80–0.95). This instrument will reproduce them.
8. **Interests at this age are still moving** (Low et al., 2005).
9. **No careless-responding detection.** A learner who selects the same answer throughout is caught
   only by the flat-profile refusal, which is a blunt instrument.
10. **The route catalogue cannot serve every profile.** Matching quality is limited by what
    `data/routes.json` contains, not only by the instrument. Five of the six dimensions have a
    route that leans their way; **Conventional does not** — the highest C weight in the demo
    catalogue is 0.20, so a strongly Conventional learner has nothing well-matched to be offered.
    This is asserted by a test so it stays visible. Adding an administration, accounting or
    logistics route is the fix, and it is a route-data task rather than an assessment one.
11. **Order is fixed.** Items are interleaved across dimensions (§8.1) rather than blocked, but the
    sequence is the same for every learner, so order and context effects are uncontrolled.
    Randomisation is proposed in the [validation plan](validation-plan.md).

---

## 13. References

Verification status reflects how far the source was actually checked: **[VERIFIED]** = full text or
the relevant section was opened and read; **[PARTIAL]** = abstract or bibliographic record confirmed
at the publisher, full text not accessed; **[UNVERIFIED]** = could not be accessed.

**Theory**

- Holland, J. L. (1997). *Making Vocational Choices: A Theory of Vocational Personalities and Work
  Environments* (3rd ed.). Odessa, FL: Psychological Assessment Resources. **[PARTIAL]**
- Holland, J. L. (1959). A theory of vocational choice. *Journal of Counseling Psychology*, 6(1),
  35–45. **[PARTIAL]**

**Instruments and item sources**

- Ambiel, R. A. M., Hauck-Filho, N., Barros, L. D. O., Martins, G. H., Abrahams, L., & De Fruyt, F.
  (2018). 18REST: a short RIASEC-interest measure for large-scale educational and vocational
  assessment. *Psicologia: Reflexão e Crítica*, 31, 6.
  <https://doi.org/10.1186/s41155-018-0086-z> — CC BY 4.0. **[VERIFIED]**
- Rounds, J., Hoff, K., & Lewis, P. (Eds.) (2021). *O\*NET® Interest Profiler Manual*. National
  Center for O\*NET Development, for USDOL/ETA.
  <https://www.onetcenter.org/dl_files/IP_Manual.pdf> **[VERIFIED]**
- *O\*NET® Career Exploration Tools Content License*. USDOL/ETA.
  <https://www.onetcenter.org/license_tools.html> **[VERIFIED]**

**Structural and criterion validity**

- Rounds, J., & Tracey, T. J. (1996). Cross-cultural structural equivalence of RIASEC models and
  measures. *Journal of Counseling Psychology*, 43(3), 310–329.
  <https://doi.org/10.1037/0022-0167.43.3.310> **[PARTIAL]**
- Rounds, J., & Su, R. (2014). The nature and power of interests. *Current Directions in
  Psychological Science*, 23(2), 98–103. **[VERIFIED]**
- Warlick, C. A., Ingram, P. B., Ternes, M. S., & Krieshok, T. S. (2018). An investigation into the
  structural form of the O\*NET–Interest Profiler–Short Form. *Journal of Career Assessment*, 26(3),
  503–514.
  <https://doi.org/10.1177/1069072717714544> **[PARTIAL]**
- Gupta, S., Tracey, T. J. G., & Gore, P. A., Jr. (2008). Structural examination of RIASEC scales in
  high school students: Variation across ethnicity and method. *Journal of Vocational Behavior*,
  72(1), 1–13. <https://doi.org/10.1016/j.jvb.2007.10.013> **[PARTIAL]**
- Roemer, L., Lewis, P., & Rounds, J. (2023). The German O\*NET Interest Profiler Short Form.
  *Psychological Test Adaptation and Development*, 4(1), 156–167.
  <https://doi.org/10.1027/2698-1866/a000048> **[VERIFIED]**
- Lasselle, L., Schelfhout, S., Fonteyne, L., Kirby, G., Smith, I., & Duyck, W. (2021). An
  examination of gender imbalance in Scottish adolescents' vocational interests. *PLoS ONE*, 16(9),
  e0257723. <https://doi.org/10.1371/journal.pone.0257723> **[VERIFIED]**
- Low, K. S. D., Yoon, M., Roberts, B. W., & Rounds, J. (2005). The stability of vocational interests
  from early adolescence to middle adulthood. *Psychological Bulletin*, 131(5), 713–737. **[PARTIAL]**

**Response scales, item wording and response bias**

- Saris, W. E., Revilla, M., Krosnick, J. A., & Shaeffer, E. M. (2010). Comparing questions with
  agree/disagree response options to questions with item-specific response options. *Survey Research
  Methods*, 4(1), 61–79. **[VERIFIED]**
- Borgers, N., Hox, J., & Sikkel, D. (2004). Response effects in surveys on children and
  adolescents: the effect of number of response options, negative wording, and neutral mid-point.
  *Quality & Quantity*, 38(1), 17–33. <https://doi.org/10.1023/B:QUQU.0000013236.29205.a6>
  **[VERIFIED]**
- Lozano, L. M., García-Cueto, E., & Muñiz, J. (2008). Effect of the number of response categories
  on the reliability and validity of rating scales. *Methodology*, 4(2), 73–79.
  <https://doi.org/10.1027/1614-2241.4.2.73> **[PARTIAL]**
- Preston, C. C., & Colman, A. M. (2000). Optimal number of response categories in rating scales.
  *Acta Psychologica*, 104(1), 1–15. <https://doi.org/10.1016/S0001-6918(99)00050-5> **[VERIFIED]**
- İlhan, M., Güler, N., Taşdelen Teker, G., & Ergenekon, Ö. (2024). The effects of reverse items on
  psychometric properties and respondents' scale scores. *International Journal of Assessment Tools
  in Education*, 11(1), 20–38. <https://doi.org/10.21449/ijate.1345549> **[VERIFIED]**
- Weijters, B., Baumgartner, H., & Schillewaert, N. (2013). Reversed item bias: an integrative
  model. *Psychological Methods*, 18(3), 320–334. <https://doi.org/10.1037/a0032121> **[VERIFIED]**
- Antoniou, F., & Alghamdi, M. H. (2024). Confidence in mathematics is confounded by responses to
  reverse-coded items. *Frontiers in Psychology*, 15, 1489054.
  <https://doi.org/10.3389/fpsyg.2024.1489054> **[VERIFIED]**
- Vigil-Colet, A., Navarro-González, D., & Morales-Vives, F. (2020). To reverse or to not reverse
  Likert-type items: that is the question. *Psicothema*, 32(1), 108–114.
  <https://doi.org/10.7334/psicothema2019.286> **[VERIFIED]**
- Marsh, H. W. (1986). Negative item bias in ratings scales for preadolescent children.
  *Developmental Psychology*, 22(1), 37–49. <https://doi.org/10.1037/0012-1649.22.1.37> **[PARTIAL]**

**Translation and adaptation standards**

- Beaton, D. E., Bombardier, C., Guillemin, F., & Ferraz, M. B. (2000). Guidelines for the process
  of cross-cultural adaptation of self-report measures. *Spine*, 25(24), 3186–3191. **[VERIFIED]**
- International Test Commission (2017). *The ITC Guidelines for Translating and Adapting Tests*
  (2nd ed.). <https://www.intestcom.org/files/guideline_test_adaptation_2ed.pdf> **[VERIFIED]**

**Frameworks considered and rejected**

- Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence.
  *Psychological Science in the Public Interest*, 9(3), 105–119.
  <https://doi.org/10.1111/j.1539-6053.2009.01038.x> **[VERIFIED]**
- Pittenger, D. J. (1993). The utility of the Myers-Briggs Type Indicator. *Review of Educational
  Research*, 63(4), 467–488. **[PARTIAL]**
- Boyle, G. J. (1995). Myers-Briggs Type Indicator (MBTI): Some psychometric limitations.
  *Australian Psychologist*, 30(1), 71–74. **[PARTIAL]**
- Whiston, S. C., Li, Y., Goodrich Mitts, N., & Wright, L. (2017). Effectiveness of career choice
  interventions: A meta-analytic replication and extension. *Journal of Vocational Behavior*, 100,
  175–184. **[VERIFIED]**

**Sources sought and not found**

- No peer-reviewed Thai-language translation or validation of any RIASEC instrument was located.
  This is a reported negative finding, not an omission.

---

[← Back to README](../READMEEN.md) · [Question bank](question-bank.md) · [Validation plan](validation-plan.md)
