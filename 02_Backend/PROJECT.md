# FuturePath AI Project Plan

## Architecture & System Overview
FuturePath AI is a multi-tier career & educational pathway recommendation platform supporting upper primary (ป.4-ป.6), lower secondary (ม.1-ม.3), upper secondary (ม.4-ม.6), and vocational students (ปวช./ปวส.), built with FastAPI, Next.js, Qdrant, PostgreSQL, BGE-M3, and a fine-tuned Qwen3-4B model.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Data & Claim Refactor (R1) | Refactor all 13 items across Data/, blueprints, summaries, flowcharts, links | None | DONE |
| M2 | Product Design & Decision Engine (R2) | Multi-tier decision engine (ป.4-ป.6, ม.1-ม.3 specialization & safety routes, ม.4-ม.6/ปวช.-ปวส., 30-item RIASEC, 5-8 STAR questions, 5-weighted decision matrix, 3 route alternatives) | M1 | DONE |
| M3 | Data Schemas, APIs & RAG Pipeline (R3) | Pydantic data schemas, FastAPI endpoints, Qdrant hybrid search with BGE-M3, Qwen3-4B QLoRA dataset | M2 | DONE |
| M4 | Verification Agent & Audit Suite (R4) | Programmatic audit script validating statistical claims, 12 ปวช. areas, TPAT mappings, API contracts, RAG metrics | M1, M2, M3 | DONE |

## Interface Contracts & Schemas
- `POST /v1/missions/recommend`: Accepts user education level & interests, returns recommended exploration missions.
- `POST /v1/missions/{id}/submissions`: Accepts student mission answers, returns evaluation & adaptive next questions.
- `POST /v1/future-paths`: Accepts full student profile, returns 3 route alternatives (Balanced Next Step, Interest Growth Route, Practical Access Route).
- `GET /v1/future-paths/{id}`: Retrieves stored decision matrix evaluation & route details.

## Code Layout
- `Data/`: Reference datasets, curricula, blueprints, research, system flowcharts.
- `app/` or `backend/`: FastAPI backend implementation, routers, decision engine, Qdrant vector search client.
- `schemas/`: Pydantic schemas and JSON schemas for all models.
- `scripts/`: Verification agent script, benchmark runners, datasets generator.

## Acceptance Criteria Checklist
- [x] No unverified 52% mismatch, 65% blanket experience, 85% dual job, or WEF 44% claims.
- [x] All 12 ปวช. 2567 vocational subject areas correctly represented.
- [x] TPAT2-5 test mappings match official MyTCAS blueprint.
- [x] Zero broken `file:///d:/...` links across all documentation and data files.
- [x] Recommendation engine outputs 3 distinct routes (Balanced, Interest Growth, Practical Access).
- [x] Supports ม.3 transition choices alongside ป.4-ป.6 exploration and ม.ปลาย/ปวช. TCAS/career context.
- [x] API endpoints for mission recommendation, submission, and future-paths fully functional with valid JSON schemas.
- [x] Verification Agent script passes all programmatic content and contract checks.
