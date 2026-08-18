## 2026-07-22T14:48:55Z

You are Worker M4 for Milestone 4 (R4 Verification Agent & Audit Suite).
Your working directory is: d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m4

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
Build `scripts/verify_system.py` — the formal automated Verification Agent script that programmatically validates:
1. Zero forbidden/unverified statistics (52%, 65%, 85%, 44%, 9 areas) or broken links across the entire workspace repository.
2. Full compliance of all 12 ปวช. 2567 areas and TPAT2-5 mappings.
3. 100% API contract compliance and valid JSON schemas for endpoints (`POST /v1/missions/recommend`, `POST /v1/missions/{id}/submissions`, `POST /v1/future-paths`, `GET /v1/future-paths/{id}`).
4. RAG recall@20 >= 90%, grounded claim accuracy >= 95%, and LoRA schema validity >= 98%.

Run `python scripts/verify_system.py`, ensure all tests pass cleanly, and deliver your handoff report to `d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m4/handoff.md`.
