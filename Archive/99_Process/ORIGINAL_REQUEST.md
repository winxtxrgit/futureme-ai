# Original User Request

## Initial Request — 2026-07-22T14:34:46Z

<USER_REQUEST>
FuturePath AI: A multi-tier career & educational pathway recommendation platform supporting upper primary (ป.4-ป.6), lower secondary (ม.1-ม.3), upper secondary (ม.4-ม.6), and vocational students (ปวช./ปวส.), built with FastAPI, Next.js, Qdrant, PostgreSQL, BGE-M3, and a fine-tuned Qwen3-4B model.

Working directory: d:/My_server/University/3rd year/Hackathon_ais
Integrity mode: development

## Requirements

### R1. Comprehensive Data & Claim Correction Refactor
Correct all statistical claims, references, and citations across all dataset files in `Data/`, master blueprints, summaries, and flowcharts according to verified sources:
1. **Higher-Ed Mismatch:** Replace 52% claim with *"TDRI reported in 2025 that 56% of people who completed higher education worked outside their field, while 27% worked below their qualification level."* (Do not call this "52% of Thai children").
2. **Experience Barrier:** Replace 65% claim with *"TDRI’s Q2 2025 analysis of 304,378 online vacancies found that experience requirements are a major entry barrier in several STEM fields, but the rate varies by occupation."*
3. **Dual Vocational Job Rate:** Remove unverified "85%" claim. Describe dual education as cooperation between a college and workplace, combining institutional study with workplace practice.
4. **ปวช. Subject Areas:** Replace "9 subject areas" with the **12 top-level areas in the ปวช. 2567 curriculum**: (1) Industry, (2) Business, (3) Home economics, (4) Tourism, (5) Health and beauty, (6) Logistics, (7) Food, (8) Art and creative economy, (9) Agriculture and fisheries, (10) Fashion and textiles, (11) Digital and IT, (12) Entertainment.
5. **Skill Shift Rate:** Replace "44%" claim with **WEF 2025 result: 39% of existing skill sets are expected to change or become outdated during 2025–2030**.
6. **TPAT Mappings:** Correct TPAT test mapping: TPAT2 for arts, TPAT3 for science/technology/engineering, TPAT4 for architecture, TPAT5 for education.
7. **University Groups:** Label 6 university groups as an internal FuturePath grouping (not an official TCAS classification).
8. **Portfolio Rounds:** Replace blanket statements with *"Selection methods vary by program and may include portfolio review, interviews, practical tests or other assessments."*
9. **Science-Math Requirements:** Remove blanket mandatory rules; present recommended preparation separately from official program eligibility.
10. **AIS Cloud PDPA:** Replace with *"AIS Cloud supports in-country data residency and relevant security certifications. Compliance also requires consent, access control, minimization, retention and processor governance in the application."*
11. **NDLP/DEEP Integration:** Replace with *"NDLP/DEEP integration is a future possibility subject to official API documentation, technical access and partnership approval."*
12. **AI Guidance Guarantee:** Replace with *"The system aims to support better-informed decisions. Its effect must be evaluated through student and counselor feedback."*
13. **Link Integrity:** Fix all `file:///d:/...` links with valid workspace-relative links (`file:///...` or relative markdown paths). Remove references to missing files.

### R2. Multi-Tier Product Design & Decision Engine (including ม.3 Specialization)
Support student pathways across 4 education tiers:
- **Upper Primary (ป.4-ป.6):** Early interest exploration & play-based discovery.
- **Lower Secondary (ม.1-ม.3):** Transition choices to ม.4 general/specialized learning plans (via flexible subject tags), ปวช. 12 vocational areas, and ปวช. dual-education routes, with counselor-supported safety routes.
- **Upper Secondary & Vocational (ม.4-ม.6 / ปวช.-ปวส.):** University faculty matching (TCAS context), certifications, 30-day action plans, and portfolio building.

Implement the 30-item RIASEC career-interest assessment (presented as a vocational-interest signal), 5-8 adaptive Socratic/STAR questions, 5-weighted recommendation decision matrix (Interests 30%, Strengths 20%, Learning style 15%, Feasibility 25%, Future flexibility 10%), and 3 returned route alternatives (Balanced Next Step, Interest Growth Route, Practical Access Route).

### R3. Data Schemas, APIs & RAG Knowledge Pipeline
Implement data schemas (`education_level`, `CareerInterestProfile`, `LearnerEvidence`, `RouteOption`, `VocationalProgram`, `ExplorationMission`, `MissionResult`, `FuturePathNode`, `SourceRecord`), endpoints (`POST /v1/missions/recommend`, `POST /v1/missions/{id}/submissions`, `POST /v1/future-paths`, `GET /v1/future-paths/{id}`), Qdrant hybrid search with BGE-M3, and a Qwen3-4B QLoRA dataset.

### R4. Verification Agent & Automated Audit Suite
Create a dedicated Verification Agent / Audit Script that programmatically validates:
1. Zero forbidden/unverified statistics or broken links across the entire repository.
2. Full compliance of all 12 ปวช. 2567 areas and TPAT2-5 mappings.
3. 100% API contract compliance and valid JSON schemas for endpoints.
4. RAG recall@20 >= 90%, grounded claim accuracy >= 95%, and LoRA schema validity >= 98%.

## Acceptance Criteria

### Content Integrity
- [ ] No occurrences of unverified 52% mismatch, 65% blanket experience, 85% dual job, or WEF 44% claims.
- [ ] All 12 ปวช. 2567 vocational subject areas correctly represented.
- [ ] TPAT2-5 test mappings match official MyTCAS blueprint.
- [ ] Zero broken `file:///d:/...` links across all documentation and data files.

### Decision Engine & APIs
- [ ] Recommendation engine outputs 3 distinct routes (Balanced, Interest Growth, Practical Access) for student profiles.
- [ ] Supports ม.3 transition choices alongside ป.4-ป.6 exploration and ม.ปลาย/ปวช. TCAS/career context.
- [ ] API endpoints for mission recommendation, submission, and future-paths are fully functional with valid JSON schemas.
- [ ] Verification Agent script passes all programmatic content and contract checks.
</USER_REQUEST>
