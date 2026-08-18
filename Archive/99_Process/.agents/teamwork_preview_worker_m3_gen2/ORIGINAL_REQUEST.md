## 2026-07-22T15:40:12Z
<USER_REQUEST>
You are Worker M3 Gen2 for Milestone 3 (R3 Schemas, APIs & RAG Pipeline).
Your working directory is: d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m3_gen2

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
Build the complete data schemas, FastAPI web server, Qdrant hybrid search client, and Qwen3-4B QLoRA dataset generator:
1. `schemas/`: Implement Pydantic models for:
   - `education_level`
   - `CareerInterestProfile`
   - `LearnerEvidence`
   - `RouteOption`
   - `VocationalProgram`
   - `ExplorationMission`
   - `MissionResult`
   - `FuturePathNode`
   - `SourceRecord`
2. `app/main.py` & `app/api/`: Implement FastAPI endpoints:
   - `POST /v1/missions/recommend`
   - `POST /v1/missions/{id}/submissions`
   - `POST /v1/future-paths`
   - `GET /v1/future-paths/{id}`
3. `app/rag/`: Implement Qdrant hybrid search client (`qdrant_client.py`) and RAG pipeline (`pipeline.py`) integrated with `BAAI/bge-m3` embeddings.
4. `scripts/generate_qwen_dataset.py`: Implement Qwen3-4B QLoRA dataset generator producing valid JSONL format.

Write unit tests in `tests/test_api.py`, run pytest, and deliver your handoff report to `d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m3_gen2/handoff.md`.
</USER_REQUEST>
