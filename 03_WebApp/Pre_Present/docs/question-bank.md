# Question Bank

[← Back to README](../READMEEN.md) · [Methodology](questionnaire-methodology.md) · [Research summary](research-summary.md) · [Validation plan](validation-plan.md)

---

Every item that a learner sees, with its construct, its origin and the reason it is in the
instrument. This file is the human-readable counterpart of [`data/questions.json`](../data/questions.json).

`tests/unit/question-bank.test.ts` parses this document and fails the build if it disagrees with
the JSON on item ids, item text in either language, or scoring direction. The table below is
therefore a description of the running instrument, not an aspiration for it.

## What this instrument measures

**Construct:** Holland RIASEC vocational interests

**Structure:** 30 interest items, 5 per dimension, across the six RIASEC dimensions.

**Theory:** Holland's theory of vocational personalities and work environments (Holland, 1997).

**Response scale:** 1 = Strongly dislike · 2 = Dislike · 3 = Not sure · 4 = Like · 5 = Strongly like

**Scoring:** every item is positively keyed. A dimension score is the mean of its answered items,
each rescaled to 0–1 by `(answer − 1) / 4`. Unanswered items are excluded from the mean rather
than counted as zero. See [Methodology §7](questionnaire-methodology.md#7-scoring-method).

**Item provenance.** 17 of 30 items are adapted from 18REST; 13 were written for this project. The `Origin` column below states which is which for every item.

**Attribution.** Some items adapted from Ambiel, R. A. M., Hauck-Filho, N., Barros, L. D. O., Martins, G. H., Abrahams, L., & De Fruyt, F. (2018). 18REST: a short RIASEC-interest measure. Psicologia: Reflexao e Critica, 31, 6. https://doi.org/10.1186/s41155-018-0086-z — licensed CC BY 4.0.

---

## R — Realistic

*Preference for concrete, hands-on activity with tools, machines, plants or animals.*

| ID | English | ไทย | Origin | Direction |
|---|---|---|---|---|
| INT-R-01 | Repair a bicycle or a motorbike engine. | ซ่อมจักรยานหรือเครื่องยนต์มอเตอร์ไซค์ | Adapted (18REST) | positive |
| INT-R-02 | Operate a machine that makes or cuts parts. | ควบคุมเครื่องจักรที่ใช้ผลิตหรือตัดชิ้นส่วน | Adapted (18REST) | positive |
| INT-R-03 | Build something from wood or metal. | สร้างของบางอย่างจากไม้หรือโลหะ | Researcher-written | positive |
| INT-R-04 | Install or fix electrical wiring in a building. | ติดตั้งหรือซ่อมระบบไฟฟ้าในอาคาร | Researcher-written | positive |
| INT-R-05 | Grow plants or look after animals on a farm. | ปลูกพืชหรือดูแลสัตว์ในฟาร์ม | Researcher-written | positive |

<details><summary>Why each item is here</summary>

- **INT-R-01** — Everyday Thai mechanical repair, familiar from ปวช. contexts and ordinary life; anchors R without needing occupational knowledge.
- **INT-R-02** — Production-machine operation, the industrial end of R and directly relevant to vocational routes.
- **INT-R-03** — Fabrication from raw material. Chosen over a workshop-specific verb so it reads for both school and vocational students.
- **INT-R-04** — Electrical installation, a high-enrolment ปวช. trade area; broadens R beyond mechanical work.
- **INT-R-05** — Agricultural R. Included because farming is a live route for many Thai students and would otherwise be absent from the scale.

</details>

## I — Investigative

*Preference for observing, analysing and working out how and why things happen.*

| ID | English | ไทย | Origin | Direction |
|---|---|---|---|---|
| INT-I-01 | Read articles or books about scientific discoveries. | อ่านบทความหรือหนังสือเกี่ยวกับการค้นพบทางวิทยาศาสตร์ | Adapted (18REST) | positive |
| INT-I-02 | Run an experiment in a laboratory. | ทำการทดลองในห้องปฏิบัติการ | Adapted (18REST) | positive |
| INT-I-03 | Work out why a natural event such as an earthquake happens. | หาคำอธิบายว่าปรากฏการณ์ธรรมชาติอย่างแผ่นดินไหวเกิดขึ้นได้อย่างไร | Adapted (18REST) | positive |
| INT-I-04 | Study a set of numbers to find a pattern in them. | วิเคราะห์ชุดตัวเลขเพื่อหารูปแบบที่ซ่อนอยู่ | Researcher-written | positive |
| INT-I-05 | Take a device apart to understand how it works. | แกะอุปกรณ์ออกดูเพื่อทำความเข้าใจว่ามันทำงานอย่างไร | Researcher-written | positive |

<details><summary>Why each item is here</summary>

- **INT-I-01** — Reading scientific material — the low-effort end of I, so the scale is not defined only by laboratory access.
- **INT-I-02** — Laboratory experimentation, the prototypical I activity.
- **INT-I-03** — Causal explanation of a natural event. Earthquake chosen over a Thailand-specific hazard to avoid regional familiarity effects.
- **INT-I-04** — Quantitative pattern-finding, distinguishing analytical I from purely scientific I.
- **INT-I-05** — Disassembly to understand mechanism. Deliberately close to the R/I boundary — the hexagon predicts adjacency, and an item there is informative rather than a defect.

</details>

## A — Artistic

*Preference for expressive, unstructured activity where the form is not fixed in advance.*

| ID | English | ไทย | Origin | Direction |
|---|---|---|---|---|
| INT-A-01 | Design the set or the costumes for a stage show. | ออกแบบฉากหรือเครื่องแต่งกายสำหรับการแสดงบนเวที | Adapted (18REST) | positive |
| INT-A-02 | Perform music, dance or drama in front of an audience. | แสดงดนตรี เต้น หรือละครต่อหน้าผู้ชม | Adapted (18REST) | positive |
| INT-A-03 | Sing or play music together with a group. | ร้องเพลงหรือเล่นดนตรีรวมวง | Adapted (18REST) | positive |
| INT-A-04 | Draw, paint, or design graphics for a poster. | วาดรูป ระบายสี หรือออกแบบกราฟิกสำหรับโปสเตอร์ | Researcher-written | positive |
| INT-A-05 | Write a story, a song, or a script. | เขียนเรื่องสั้น เพลง หรือบทละคร | Researcher-written | positive |

<details><summary>Why each item is here</summary>

- **INT-A-01** — Design for performance, taken from the 18REST A scale.
- **INT-A-02** — Live performance across three modes, so the item is not limited to students with music training.
- **INT-A-03** — Group music-making, common in Thai school activity.
- **INT-A-04** — Visual and graphic design — the most commonly encountered A activity for this age group.
- **INT-A-05** — Written and compositional creativity, so A is not exclusively visual or performing.

</details>

## S — Social

*Preference for helping, teaching, advising and caring for other people.*

| ID | English | ไทย | Origin | Direction |
|---|---|---|---|---|
| INT-S-01 | Volunteer for a community project in your neighbourhood. | เป็นอาสาสมัครในโครงการของชุมชนละแวกบ้าน | Adapted (18REST) | positive |
| INT-S-02 | Give people advice about staying healthy. | ให้คำแนะนำเรื่องการดูแลสุขภาพแก่คนอื่น | Adapted (18REST) | positive |
| INT-S-03 | Help a classmate who is struggling with schoolwork. | ช่วยเพื่อนร่วมชั้นที่กำลังมีปัญหากับการเรียน | Adapted (18REST) | positive |
| INT-S-04 | Look after young children or elderly people. | ดูแลเด็กเล็กหรือผู้สูงอายุ | Researcher-written | positive |
| INT-S-05 | Listen to someone talk through a problem they are having. | รับฟังคนที่กำลังเล่าปัญหาของเขาให้ฟัง | Researcher-written | positive |

<details><summary>Why each item is here</summary>

- **INT-S-01** — Community volunteering, a routine part of Thai school life.
- **INT-S-02** — Health advice-giving, the S activity closest to care professions.
- **INT-S-03** — Peer tutoring — the most familiar helping behaviour available to a secondary student.
- **INT-S-04** — Care for children or elders. Written without gendered framing, since caregiving items are a known source of gender-stereotype bias.
- **INT-S-05** — Listening and emotional support, distinguishing S from merely instructing.

</details>

## E — Enterprising

*Preference for persuading, leading, organising people and taking commercial initiative.*

| ID | English | ไทย | Origin | Direction |
|---|---|---|---|---|
| INT-E-01 | Plan how a small business could grow. | วางแผนว่าธุรกิจเล็ก ๆ จะเติบโตได้อย่างไร | Adapted (18REST) | positive |
| INT-E-02 | Lead a team and keep its work on schedule. | นำทีมและดูแลให้งานเสร็จตามกำหนด | Adapted (18REST) | positive |
| INT-E-03 | Persuade a customer to buy a product. | โน้มน้าวลูกค้าให้ตัดสินใจซื้อสินค้า | Adapted (18REST) | positive |
| INT-E-04 | Start and run a club or a small shop. | เริ่มต้นและบริหารชมรมหรือร้านเล็ก ๆ | Researcher-written | positive |
| INT-E-05 | Speak to a group to convince them of your idea. | พูดต่อหน้ากลุ่มคนเพื่อโน้มน้าวให้เห็นด้วยกับความคิดของคุณ | Researcher-written | positive |

<details><summary>Why each item is here</summary>

- **INT-E-01** — Business growth planning, the strategic end of E.
- **INT-E-02** — Team leadership and scheduling. Kept separate from persuasion, which is a different E facet.
- **INT-E-03** — Sales persuasion, the commercial core of E.
- **INT-E-04** — Founding and running something small — the most realistic entrepreneurial act for a student.
- **INT-E-05** — Public advocacy of an idea, separating persuasion from formal authority.

</details>

## C — Conventional

*Preference for ordered, rule-following activity with records, data and procedures.*

| ID | English | ไทย | Origin | Direction |
|---|---|---|---|---|
| INT-C-01 | Check that a set of rules or standards is being followed. | ตรวจสอบว่ามีการทำตามกฎหรือมาตรฐานที่กำหนดไว้หรือไม่ | Adapted (18REST) | positive |
| INT-C-02 | Keep accounts and track money coming in and going out. | ทำบัญชีและติดตามรายรับรายจ่าย | Adapted (18REST) | positive |
| INT-C-03 | Organise and store records so they can be found easily. | จัดระเบียบและจัดเก็บเอกสารให้ค้นหาได้ง่าย | Adapted (18REST) | positive |
| INT-C-04 | Enter information into a spreadsheet accurately. | กรอกข้อมูลลงในตารางคำนวณอย่างถูกต้องแม่นยำ | Researcher-written | positive |
| INT-C-05 | Follow a written procedure exactly, step by step. | ทำงานตามขั้นตอนที่เขียนไว้อย่างเคร่งครัดทีละขั้น | Researcher-written | positive |

<details><summary>Why each item is here</summary>

- **INT-C-01** — Compliance checking against rules or standards.
- **INT-C-02** — Bookkeeping. Simplified from the 18REST economics item, which assumed macroeconomic knowledge a ม.1 student will not have.
- **INT-C-03** — Records organisation and retrieval, the classic C activity.
- **INT-C-04** — Accurate data entry, the detail-orientation facet of C.
- **INT-C-05** — Procedure-following. Included because C is defined partly by comfort with prescribed structure rather than only by clerical tasks.

</details>

---

## Context questions

These are not psychometric items and are not scored as a construct. They are practical
constraints used by the decision engine as eligibility filters and as feasibility inputs, and
they are reported to the learner as their own answers rather than as a measured trait.

| ID | English | ไทย | Used for |
|---|---|---|---|
| `tier` | Where are you right now? | ตอนนี้คุณอยู่ระดับชั้นไหน | Selects which routes are applicable to the learner's current education level. |
| `cost` | How much does cost matter in your decision? | ค่าใช้จ่ายมีผลกับการตัดสินใจของคุณมากแค่ไหน | Feasibility scoring; a route the learner cannot afford is not offered as a recommendation. |
| `mobility` | Could you study away from your home province? | คุณย้ายไปเรียนต่างจังหวัดได้ไหม | Feasibility scoring against routes that require relocation. |
| `horizon` | How soon do you want to be earning? | คุณอยากเริ่มมีรายได้เร็วแค่ไหน | Matches the learner's time-to-earning preference against each route's. |
| `proud` | Describe one thing you made, fixed, organised, or helped with that you were proud of. | เล่าสักเรื่องที่คุณเคยทำ ซ่อม จัดการ หรือช่วยเหลือแล้วรู้สึกภูมิใจ | Optional free text. Scanned for evidence keywords only, and screened by the safety rule. |

---

[← Back to README](../READMEEN.md) · [Methodology](questionnaire-methodology.md)
