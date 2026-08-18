# Concept 11 — Aurora

## Concept snapshot

| Field | Direction |
|---|---|
| **Concept name** | **Aurora — ลองหลายอนาคต แล้วเลือกก้าวถัดไป** |
| **One-sentence description** | A dark-first, Thai-first discovery experience that combines a trustworthy AI coach, short real-world missions, and an editable future-self roadmap in one modern Gen-Z interface. |
| **Main idea** | Keep the clear Compass Coach flow, add QuestMap-style experiments and one emotionally memorable Timefold future-self moment, then express the whole journey through a restrained Aurora glass-bento visual system. |
| **Target user group** | Thai secondary and early-university students, especially ม.3–ม.6 learners who feel uncertain, pressured, or curious about several routes. Secondary audiences are counselors, teachers, and parents viewing consent-scoped summaries. |
| **Main user problem** | Students are asked to choose a study or career direction before they have enough language, evidence, or low-risk opportunities to understand what fits them. |
| **Unique value proposition** | “Don’t ask an app to predict you. Talk, try, and compare three explainable possibilities before choosing one small next step.” |
| **Emotional experience** | Curious rather than tested; energized rather than pressured; seen without being judged; hopeful without being promised an outcome. |
| **Visual direction** | Near-black canvas, controlled violet–magenta–coral aurora light, mint active states, premium glass bento cards, authentic Thai-student imagery, generous space, light grain, and minimal 3D spark accents. |
| **Main features** | Adaptive AI interview, editable evidence drawer, interest assessment, short missions, strengths analysis, three-route results, education-path comparison, future-self preview, 30-day roadmap, private dashboard, saved paths, consented human summary, human handoff. |
| **Development difficulty** | **Medium–high (8/10).** Standard page structures are feasible; custom aurora effects, evidence states, roadmap branches, accessibility in two themes, and high-quality content require extra QA. |
| **Recommended technology** | MVP: semantic HTML, modern CSS, and vanilla JavaScript as demonstrated here. Product: Next.js/TypeScript, design tokens, PostgreSQL, object storage, structured recommendation services, RAG over verified Thai pathway sources, and an auditable AI orchestration layer. |

## Product positioning

Aurora is a **private career-discovery workspace**, not a personality labeler, public community, or entertainment feed. It is the most presentation-ready expression of the recommended hybrid product direction:

- **Compass Coach:** calm, progressive guidance and explainable next steps.
- **QuestMap:** short missions that turn curiosity into behavioral evidence.
- **Timefold:** a shareable “future self” moment and an editable branching roadmap.
- **Pulse:** modern Gen-Z energy, applied as a visual language rather than social mechanics.
- **Clarity:** consent, accessibility, source transparency, and print-friendly human summaries.

## Primary experience

```text
เริ่มแบบ Guest
→ เล่าเรื่องจริงให้ AI coach
→ ตรวจและแก้สิ่งที่ระบบเข้าใจ
→ ทำภารกิจสั้นหนึ่งชิ้น
→ เห็น strengths / interests ที่มีหลักฐาน
→ เปรียบเทียบ 3 route strategies
→ เปิด future-self preview โดยระบุสมมติฐาน
→ เลือกการทดลอง 30 วัน
→ บันทึกหรือแชร์สรุปที่ไม่รวมบทสนทนา
```

## Navigation and interaction model

- Desktop: persistent glass header with **ค้นหาตัวตน / เส้นทาง / Roadmap / ของฉัน**.
- Mobile: four-tab bottom navigation; one primary action per screen; no horizontal content hidden behind swipe alone.
- Interview: one Socratic or STAR prompt at a time with a live, editable evidence drawer.
- Results: three strategies—Balanced, Interest Growth, and Practical Access—rather than one ranked “perfect match.”
- Roadmap: node-and-branch view with a linear list fallback and explicit dependencies.
- Future-self card: a motivating scenario built from stated assumptions, never a prediction.

## Advantages

- Distinctive enough for a Hackathon stage while retaining institutional trust.
- Strong fit for Thai students who use mobile-first products but still need serious guidance.
- Turns the project’s evidence model into visible, understandable UI.
- Three-route framing reduces deterministic or prestige-biased recommendations.
- Missions create a compelling live demo and improve evidence quality.
- Dark and light themes support context, preference, and accessibility.

## Disadvantages and mitigations

| Risk | Mitigation |
|---|---|
| Neon/glass styling could reduce readability. | Gradient is decorative only; body text always sits on opaque AA-tested surfaces. |
| A future-self visual can look predictive. | Show scenario assumptions, alternate branches, uncertainty, and “not a prediction” copy next to the preview. |
| Mission mechanics could feel like a game score. | Reward reflection and evidence; never use points, streak pressure, ranks, likes, or leaderboards. |
| AI coach may be over-trusted. | Explain boundaries, allow correction/deletion, cite sources, and provide teacher/counselor handoff. |
| Dark-first screens may be tiring in classrooms. | Offer a full light theme, avoid pure-white glare, and remember user preference. |
| Premium visuals increase implementation effort. | Build tokenized components first; treat mesh, grain, and motion as progressive enhancement. |

## Why Aurora fits Future Me

The source-backed product needs students to reflect, act, compare, and plan—not receive a fixed answer. Aurora makes that sequence emotionally attractive without changing its safety model. The AI interview collects stories, the mission adds observable evidence, the results expose reasons and unknowns, and the roadmap turns a recommendation into a reversible experiment. This balance makes Aurora suitable for both a memorable prototype and a credible product direction.

## Non-negotiable product boundaries

1. Recommendations are educational guidance based on user-provided information and verified sources, **not guaranteed predictions**.
2. No likes, follower counts, public feed, student ranking, competitive leaderboard, or hidden suitability score.
3. Student data is private by default. Sharing is explicit, scoped, revocable, time-limited, and excludes raw interview transcripts by default.
4. Users can inspect, correct, delete, export, or challenge every inferred evidence item.
5. Crisis, abuse, discrimination, and high-stakes mental-health disclosures route to an age-appropriate human-support protocol; the coach never impersonates a therapist.
6. Academic, vocational, DVE, portfolio, and direct skill-building routes are presented without prestige hierarchy.

