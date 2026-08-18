# Workspace Code & Verification Architecture Analysis

**Author**: Explorer 3 (Workspace Code & Verification Architecture Explorer)  
**Date**: 2026-07-22  
**Target Working Directory**: `d:/My_server/University/3rd year/Hackathon_ais/.agents/teamwork_preview_explorer_m1_3/`

---

## 1. Executive Summary

This report presents a thorough analysis of the source code, scripts, datasets, Python environment, and project layout across `hackathon_th/`, `Data/`, and the root directory of the FuturePath AI workspace. 

While the repository contains comprehensive Thai AI research guides and prototype RAG scripts in `hackathon_th/Thai_AI_System_Research/examples/`, **production application code for the Decision Engine (R2), FastAPI endpoints & Pydantic schemas (R3), Qdrant vector database client (R3), and the formal Verification Agent script (R4) is currently missing**.

---

## 2. Workspace Inventory & Python Environment

### 2.1 Workspace Structure Overview
- `hackathon_th/`:
  - `FutureMe_AI_Brief.pdf`, `FutureMe_AI_Deck.pdf`, `jump-thailand-2026-ideas.pdf`: System pitch decks and briefs.
  - `Thai_AI_System_Research/`: 17 comprehensive research markdown chapters on Thai NLP, SLMs, RAG, vector DBs, QLoRA, evaluation, and security.
  - `Thai_AI_System_Research/examples/`: 6 prototype Python scripts (`common.py`, `document_ingestion_example.py`, `vector_search_example.py`, `rag_pipeline_example.py`, `evaluation_example.py`, `lora_training_example.py`).
- `Data/`:
  - 7 subdirectories containing 22 detailed markdown files covering statistics, Thai national curricula (Basic, Vocational, Higher Ed), career mappings, interviewing frameworks (Socratic/RIASEC/STAR), NDLP platform architecture, AIS cloud DAG algorithm, and system flowcharts.
  - No executable Python modules or test code exist within `Data/`.
- Root Directory:
  - `PROJECT.md`: System plan, milestones (M1-M4), interface contracts, and code layout guidelines.

### 2.2 Python Environment Capabilities
- **Python Version**: `3.12.3`
- **Installed Key Packages**:
  - `fastapi` (`0.136.3`), `uvicorn` (`0.46.0`), `pydantic` (`2.13.1`)
  - `torch` (`2.9.1`), `transformers` (`5.12.1`), `peft` (`0.19.1`), `accelerate` (`1.14.0`), `safetensors` (`0.8.0`)
  - `requests` (`2.32.3`), `python-dotenv` (`1.2.2`), `jsonschema` (`4.26.0`)
- **Missing Required Dependencies**:
  - `qdrant-client` (Currently ChromaDB is used in example scripts).
  - `pythainlp` (Optional fallback present in example code, but recommend explicit installation or fallback handling).

---

## 3. Detailed Component Analysis (R2, R3, R4)

### 3.1 Decision Engine & Multi-Tier Routes (R2)
* **Current Status**: ❌ Missing (0% Implementation in codebase).
* **Required Implementation**:
  1. **Multi-Tier Support**:
     - *Primary Level (ป.4-ป.6)*: Interest exploration and foundational skills.
     - *Lower Secondary (ม.1-ม.3)*: Specialization tracking, safety routes, and ม.3 track decision support (General vs. Vocational vs. Specialized).
     - *Upper Secondary & Vocational (ม.4-ม.6, ปวช.-ปวส.)*: TCAS target mapping, TPAT alignment, direct career entry.
  2. **Assessment Scorer**:
     - 30-item RIASEC questionnaire parser and scoring engine.
     - 5-8 STAR / Socratic interview qualitative question evaluator.
  3. **Decision Matrix Calculation**:
     - 5-weighted decision matrix: `Score = w1*RIASEC + w2*SkillMatch + w3*MarketDemand + w4*AcademicEligibility + w5*Preference`.
  4. **Route Alternatives Generator**:
     - Generates 3 distinct route alternatives:
       - **Route 1**: Balanced Next Step (Optimal alignment).
       - **Route 2**: Interest Growth Route (High interest, skill bridge required).
       - **Route 3**: Practical Access Route (Direct entry / high feasibility).

### 3.2 FastAPI Endpoints, Pydantic Schemas, Qdrant & Qwen3-4B (R3)
* **Current Status**: ⚠️ Partial prototype in research examples; production API & schemas missing.
* **Existing Prototypes**:
  - `hackathon_th/Thai_AI_System_Research/examples/rag_pipeline_example.py`: Minimal sentence-transformers (`BAAI/bge-m3`) + ChromaDB retrieval pipeline.
  - `hackathon_th/Thai_AI_System_Research/examples/lora_training_example.py`: QLoRA fine-tuning skeleton for `Qwen2.5-3B-Instruct` with 2 dummy items.
* **Required Implementation**:
  1. **FastAPI Web Server (`app/main.py`)**:
     - `POST /v1/missions/recommend`: Generates customized learning/career missions.
     - `POST /v1/missions/{id}/submissions`: Evaluates student submissions and adapts Socratic prompts.
     - `POST /v1/future-paths`: Computes 5-weighted decision matrix and 3 path recommendations.
     - `GET /v1/future-paths/{id}`: Retrieves stored evaluation results.
  2. **Pydantic Schemas (`schemas/`)**:
     - Strongly-typed models for Student Profile, RIASEC scores, Mission Requests/Responses, Decision Matrix, and Path Outputs.
  3. **Qdrant Vector Database Integration (`app/rag/qdrant_client.py`)**:
     - Upgrade from local ChromaDB prototype to Qdrant hybrid vector search with `BAAI/bge-m3` embeddings.
  4. **Qwen3-4B QLoRA Dataset Generator (`scripts/generate_qwen_dataset.py`)**:
     - Script to compile high-quality Thai career counseling prompt-response pairs into JSONL format for QLoRA training.

### 3.3 Verification Agent Script & Audit Suite (R4)
* **Current Status**: ⚠️ Prototype `evaluation_example.py` exists; comprehensive audit suite missing.
* **Existing Prototype**:
  - `evaluation_example.py`: Evaluates retrieval recall & refusal accuracy on 7 hardcoded travel/grant sample cases.
* **Required Implementation (`scripts/verify_system.py`)**:
  1. **Statistical Claim Audit**: Verify removal/replacement of unverified claims (52% mismatch, 65% experience, 85% dual job, WEF 44%) across all workspace data.
  2. **Vocational Curriculum Audit**: Validate full coverage of all 12 ปวช. 2567 vocational subject areas.
  3. **TCAS & TPAT Blueprint Mapping**: Check TPAT2-5 subject mappings against MyTCAS guidelines.
  4. **API Contract & Schema Validation**: Automated inspection of endpoints and Pydantic schemas.
  5. **RAG & Retrieval Evaluation**: Test precision, recall, citation accuracy, and refusal grounding.

---

## 4. Recommended Target Layout & Architecture

To satisfy `PROJECT.md` requirements and layout compliance, the workspace should be organized as follows:

```
FuturePath_AI/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entrypoint
│   ├── config.py                   # Environment settings
│   ├── api/                        # API Controllers
│   │   ├── __init__.py
│   │   ├── missions.py             # /v1/missions endpoints
│   │   └── future_paths.py         # /v1/future-paths endpoints
│   ├── decision_engine/            # R2 Decision Engine
│   │   ├── __init__.py
│   │   ├── riasec.py               # 30-item RIASEC scorer
│   │   ├── star_eval.py            # STAR/Socratic question evaluator
│   │   ├── multi_tier.py           # Multi-tier route router
│   │   ├── matrix.py               # 5-weighted decision matrix
│   │   └── route_generator.py      # 3 Route alternatives generator
│   └── rag/                        # R3 RAG Pipeline
│       ├── __init__.py
│       ├── embedder.py             # BGE-M3 embedder client
│       ├── qdrant_client.py        # Qdrant hybrid vector search client
│       └── pipeline.py             # Context builder & RAG generator
├── schemas/                        # Pydantic Schemas
│   ├── __init__.py
│   ├── student.py                  # Student Profile DTOs
│   ├── riasec.py                   # RIASEC DTOs
│   ├── mission.py                  # Mission DTOs
│   └── path.py                     # Recommendation & Route DTOs
├── scripts/                        # R4 Verification & Tooling
│   ├── verify_system.py            # Audit suite & verification agent
│   ├── generate_qwen_dataset.py    # Qwen3-4B QLoRA dataset builder
│   └── seed_qdrant.py              # Ingestion script for Qdrant
├── tests/                          # Automated Pytest Suite
│   ├── test_decision_engine.py
│   ├── test_api.py
│   └── test_verification.py
├── Data/                           # Curricula, Research & Flowcharts
└── hackathon_th/                   # Research Guides & Legacy Prototypes
```

---

## 5. Verification & Implementation Roadmap

1. **Step 1 (Schemas)**: Define complete Pydantic models in `schemas/` matching API contract in `PROJECT.md`.
2. **Step 2 (Decision Engine)**: Implement `app/decision_engine/` supporting ป.4-ม.6/ปวช., 30-item RIASEC, STAR evaluation, 5-weighted matrix, and 3 distinct output routes.
3. **Step 3 (FastAPI & Qdrant)**: Build `app/main.py`, routers, `qdrant-client` hybrid search, and dataset generator script.
4. **Step 4 (Verification Agent)**: Build `scripts/verify_system.py` to audit statistical claims, 12 ปวช. areas, TPAT mappings, API contracts, and RAG quality.
