# 09 · Source Review

[← Privacy and Data](08-privacy-and-data.md) · [Back to README](../READMEEN.md)

---

## What this document is

The team's private research folder was re-audited on **24 July 2026**: every external URL was
opened and followed, every load-bearing number was compared against the page it was supposed to
come from, and organisation home pages were replaced with links to the actual report, dataset or
product page.

That audit contradicted several things this repository said. This document records what changed
and why, so a reviewer can see the reasoning rather than a silently edited number.

The full corrected registry is in [02 · Research and Evidence](02-research-and-evidence.md#source-registry).

---

## Findings, classified

### Conflicting — the repository was wrong and has been corrected

| Repository said | Audit found | Resolution |
|---|---|---|
| "TDRI analysis of **304,378** job postings" | The report analyses **756,300** postings from 23 job sites, July 2024 – June 2025 | Figure corrected; the STEM share (42,374 postings, 5.6%) added |
| "56% / 27% of **higher-education graduates**" | TDRI's scope is people **with education above upper-secondary level** — not new graduates specifically | Scope corrected everywhere the figure appears |
| "WEF: 44% of skills will change" listed as a **misquote** of 39% | Both are real: **44%** is the 2023 report for 2023–2027; **39%** is the 2025 report for the period to 2030 | Removed from the withdrawn-claims list; both figures now stated with their report and window |
| "All **12** ปวช. 2567 subject areas" | The VEC catalogue publishes ประเภทวิชา / สาขาวิชา / สาขางาน per curriculum revision. The audit explicitly warns against embedding a count as a constant | Count removed from documentation and seed data; a test now fails if one returns |
| "NDLP's guidance component is a **static RIASEC test**" | The audit could not read NDLP's platform pages and found nothing supporting a RIASEC module | Downgraded to an unverified observation. It is no longer used as the product's justification |
| "DEEP **provides** national SSO" | No accessible documentation supports SSO availability, an API, or user numbers | Downgraded to unverified |
| "AIS Cloud … ISO 27001 / 27018" | Official pages list ISO 27001 / 27017 / 27018, CSA-STAR and dSURE Cloud 3-star | Corrected and made specific |

### Needs updating — true, but imprecise

| Item | Change |
|---|---|
| TDRI 56% / 27% | Now carries a direct URL rather than "reported by TDRI, source not recorded" |
| myTCAS | Now TCAS70, academic year 2570 |
| O\*NET | Pinned to Database 30.3 with its CC BY 4.0 licence |
| ESCO | Pinned to v1.2.1 (10 December 2025) |
| Ikigai, STAR | No verified primary source exists for either as used here. Both relabelled as design assumptions rather than cited frameworks |

### Useful additions — adopted

| Added | Why it earned its place |
|---|---|
| Thai graduate unemployment **2.0%**, Gen Z **3.8%**, national **1.0%** (NESDC Q2/2568) | It complicates the pitch in the right direction. Thai graduates are not mostly unemployed — they are employed in the wrong place. Mismatch, not joblessness, is the problem this product addresses |
| STEM graduates working outside science: **38.1%** (NSO *Social Indicators 2025*, p. 185) | A Thai, recent, page-level citation for the core claim |
| OECD PIAAC 2023: ~35% qualification mismatch, >35% field-of-study mismatch, ~11% both | Replaces a general "OECD says mismatch is high" gesture with the actual measures |
| WEF 2025: **63%** of employers name skills gaps as a barrier | Employer-side evidence, previously absent |
| The registry's four-level status vocabulary (`verified` / `conditional` / `design_assumption` / `unverified`) | Adopted directly for the route catalogue's provenance fields |
| The rule that admission data must carry a validity window | Adopted as the `freshnessThresholdDays` and per-route `lastVerified` fields |

### Already represented — no change needed

Rules decide and the model explains; multi-dimensional scores must never collapse into a single
verdict; the system must be able to say it does not know; children must be able to correct their
own data and disagree with the output; AIS Cloud residency does not deliver PDPA compliance by
itself. All of these were already in the repository, in code as well as prose.

### Future concept — kept as roadmap, not adopted as current

Qdrant hybrid retrieval with RRF fusion, BGE-M3 embeddings, a FastAPI service, PostgreSQL with
RBAC, DAG roadmap generation with topological sort, CAMARA Number Verify / OTP / SIM Swap,
Kubernetes on AIS Cloud, and QLoRA adaptation. The research folder contains detailed blueprints
for all of it. **None of it is running in this repository**, and every mention is now labelled.

### Conflicting within the research folder itself

The blueprint documents in the folder's category 07 describe AIS SIM Swap, Qdrant, PostgreSQL
RBAC and "100% data sovereignty" as though they were settled. The audit — carried out on the same
day, against the same sources — marks several of those as unverified. **Where the two disagree,
this repository follows the audit**, because the audit is the document that actually opened the
pages.

### Not relevant to this submission

Absolute file paths from another machine, artifact directories from the tooling that produced the
research, and an advisor audio recording. Five internal files the previous reference list linked
to no longer exist and their links were removed rather than left dangling.

---

## Claims quarantined — must not reappear

The audit placed sixteen claims in quarantine. These are the ones that had reached this
repository or its pitch materials:

| Claim | Why it is out |
|---|---|
| Thai overall mismatch 68.6%; overeducation 35.16%; undereducation 33.45% | Not found in the cited source. The 68.6 figure traced to a model-accuracy number in an older TDRI PDF, not a mismatch rate |
| 63–65% of Thai job postings require experience; entry-level 22% | No direct source |
| 15–20% wage penalty for mismatched work | No direct source. Not the same as the OECD/Montt finding this repository cites, which is ~25% and applies only to mismatch **combined with** overqualification |
| OECD: 6–8% annual GDP loss from mismatch | The cited pages do not support it |
| Burnout 2.5× for mismatched workers | No direct source |
| DVE graduates 85% employed in field | Not present in the VEC curriculum data cited |
| 56% of **global** workers are mismatched | Misreading of ILO: the 114 countries studied cover 56% of global employment. The mismatch finding is 935 million workers, 72% under-educated and 28% over-educated |
| สพฐ. mandates 1 guidance hour per week; counsellors carry 300–500 students | Not found in the cited curriculum documents |
| Thai universities are officially grouped into six faculty clusters | Not an official TCAS taxonomy. Retained only as an explicitly labelled internal framework |

---

## What still cannot be claimed

Eight gaps remain open, and every one of them blocks a pilot rather than a demo:

1. Programme-level TCAS entry criteria, per institution and per admission year
2. ปวช. / ปวส. provision by campus, rather than a summary of categories
3. TPQI occupational standards linked to specific Thai occupations
4. Wages, employment trends and regional data under a clear licence
5. Technical documentation and access agreements for NDLP, DEEP and AIS Playground
6. Validation of the interview instrument and the recommendation model with Thai students
7. Regulated-profession requirements — medicine, nursing, engineering, architecture, teaching
8. A children's data policy: consent and assent, retention, deletion, human review, and a route
   to appeal a recommendation

---

[← Privacy and Data](08-privacy-and-data.md) · [Back to README](../READMEEN.md)
