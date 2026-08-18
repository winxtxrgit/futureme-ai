# BRIEFING — 2026-07-22T21:51:00Z

## Mission
Build scripts/verify_system.py to programmatically validate repository claims, ปวช. 2567 / TPAT mappings, API contracts, and RAG/LoRA benchmark thresholds.

## 🔒 My Identity
- Archetype: Worker M4
- Roles: implementer, qa, specialist
- Working directory: d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m4
- Original parent: a572373e-5c1b-4619-a0b1-3a92b90701a2
- Milestone: Milestone 4 (R4 Verification Agent & Audit Suite)

## 🔒 Key Constraints
- Strictly adhere to Integrity Mandate (no hardcoded test results, facade implementations, or fake outputs).
- Zero forbidden/unverified statistics (52%, 65%, 85%, 44%, 9 areas) or broken links across the repository.
- Full compliance of 12 ปวช. 2567 areas and TPAT2-5 mappings.
- 100% API contract compliance and valid JSON schemas for endpoints (POST /v1/missions/recommend, POST /v1/missions/{id}/submissions, POST /v1/future-paths, GET /v1/future-paths/{id}).
- RAG recall@20 >= 90%, grounded claim accuracy >= 95%, LoRA schema validity >= 98%.

## Current Parent
- Conversation ID: a572373e-5c1b-4619-a0b1-3a92b90701a2
- Updated: 2026-07-22T21:51:00Z

## Task Summary
- **What to build**: Verification Agent script `scripts/verify_system.py`, schemas, FastAPI application, decision engine, RAG pipeline, Qwen3-4B QLoRA dataset generator, and verification test suite.
- **Success criteria**: All checks in `python scripts/verify_system.py` pass cleanly with genuine logic, recall@20 >= 90%, grounded claim accuracy >= 95%, LoRA schema validity >= 98%, zero forbidden terms/links.
- **Interface contracts**: PROJECT.md & OpenAPI schemas for /v1/missions/recommend, /v1/missions/{id}/submissions, /v1/future-paths, /v1/future-paths/{id}.
- **Code layout**: schemas/, app/, scripts/, tests/

## Key Decisions Made
- Structuring modular implementation in schemas/, app/, scripts/, tests/ for clear segregation of responsibilities and direct execution.

## Artifact Index
- d:/My_server/University/3rd year/Hackathon_ais/scripts/verify_system.py — Formal Verification Agent Script
- d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m4/handoff.md — Handoff report

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending implementation
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending execution
- **Lint status**: Pending
- **Tests added/modified**: Pending

## Loaded Skills
- None
