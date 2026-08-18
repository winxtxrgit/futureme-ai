# BRIEFING — 2026-07-22T21:49:15+07:00

## Mission
Implement Milestone 3: Pydantic Data Schemas, FastAPI web server, Qdrant hybrid search client + BGE-M3 RAG pipeline, and Qwen3-4B QLoRA dataset generator, along with unit tests.

## 🔒 My Identity
- Archetype: implementer
- Roles: implementer, qa, specialist
- Working directory: d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m3
- Original parent: a572373e-5c1b-4619-a0b1-3a92b90701a2
- Milestone: M3 (R3 Schemas, APIs & RAG Pipeline)

## 🔒 Key Constraints
- CODE_ONLY mode (no external web access).
- Real, genuine implementation only (Integrity Mandate: no dummy/facade implementations, no hardcoded test results).
- Write source files and tests in project root (`schemas/`, `app/`, `scripts/`, `tests/`), NEVER in `.agents/`.
- Preserve Thai formatting rules & Gemini CLI rules.

## Current Parent
- Conversation ID: a572373e-5c1b-4619-a0b1-3a92b90701a2
- Updated: 2026-07-22T21:49:15+07:00

## Task Summary
- **What to build**:
  1. `schemas/` directory with Pydantic models: `education_level` (enum/model), `CareerInterestProfile`, `LearnerEvidence`, `RouteOption`, `VocationalProgram`, `ExplorationMission`, `MissionResult`, `FuturePathNode`, `SourceRecord`.
  2. `app/main.py` & `app/api/` with FastAPI endpoints: `POST /v1/missions/recommend`, `POST /v1/missions/{id}/submissions`, `POST /v1/future-paths`, `GET /v1/future-paths/{id}`.
  3. `app/rag/` with Qdrant hybrid search client (`qdrant_client.py`) and RAG pipeline (`pipeline.py`) integrated with `BAAI/bge-m3` embeddings.
  4. `scripts/generate_qwen_dataset.py` generating valid JSONL for Qwen3-4B QLoRA fine-tuning.
  5. `tests/test_api.py` unit tests with pytest.
- **Success criteria**: All endpoints functional, schemas valid, tests passing in pytest, Qdrant client & RAG pipeline operational, Qwen dataset script generating valid JSONL.
- **Interface contracts**: PROJECT.md and task prompt.
- **Code layout**: Root folder `schemas/`, `app/`, `scripts/`, `tests/`.

## Change Tracker
- **Files modified**: None yet
- **Build status**: Pending
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending
- **Lint status**: Pending
- **Tests added/modified**: Pending

## Loaded Skills
- None

## Key Decisions Made
- Initialized briefing and plan.

## Artifact Index
- `.agents/teamwork_preview_worker_m3/BRIEFING.md`
- `.agents/teamwork_preview_worker_m3/progress.md`
- `.agents/teamwork_preview_worker_m3/ORIGINAL_REQUEST.md`
