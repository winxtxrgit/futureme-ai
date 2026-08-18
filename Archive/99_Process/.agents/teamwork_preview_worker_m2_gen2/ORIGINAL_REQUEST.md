## 2026-07-22T15:40:12Z
<USER_REQUEST>
You are Worker M2 Gen2 for Milestone 2 (R2 Decision Engine).
Your working directory is: d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m2_gen2

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your Task:
Implement the complete Multi-Tier Decision Engine in `app/decision_engine/`:
1. `riasec.py`: 30-item RIASEC career-interest assessment parser and scorer (vocational-interest signal).
2. `star_eval.py`: 5-8 adaptive Socratic/STAR qualitative question evaluator.
3. `multi_tier.py`: Multi-tier router supporting 4 education tiers:
   - Primary (ป.4-ป.6): Interest exploration & play-based discovery.
   - Lower Secondary (ม.1-ม.3): Transition choices to ม.4 general/specialized learning plans (flexible subject tags), ปวช. 12 vocational areas, and ปวช. dual-education routes with counselor-supported safety routes.
   - Upper Secondary & Vocational (ม.4-ม.6 / ปวช.-ปวส.): University faculty matching (TCAS context), certifications, 30-day action plans, and portfolio building.
4. `matrix.py`: 5-weighted recommendation decision matrix calculator:
   - Interests: 30%
   - Strengths: 20%
   - Learning style: 15%
   - Feasibility: 25%
   - Future flexibility: 10%
5. `route_generator.py`: Generates 3 returned route alternatives:
   - Route 1: Balanced Next Step
   - Route 2: Interest Growth Route
   - Route 3: Practical Access Route

Write unit tests in `tests/test_decision_engine.py`, run pytest, and deliver your handoff report to `d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_worker_m2_gen2/handoff.md`.
</USER_REQUEST>
