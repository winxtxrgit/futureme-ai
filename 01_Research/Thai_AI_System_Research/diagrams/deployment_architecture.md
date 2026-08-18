# แผนภาพ Deployment (ผู้ใช้ → โมเดล → ฐานข้อมูล)

> วันที่ตรวจสอบ: 21 กรกฎาคม 2026 · Mermaid syntax

## 1. Deployment ระดับ Production (คุมข้อมูลในองค์กร)

```mermaid
flowchart TB
    USER[👤 ผู้ใช้ / เบราว์เซอร์] --> WAF[Ingress / WAF]
    WAF --> FE[Web App<br/>React/Streamlit]
    FE --> API[Backend API<br/>FastAPI - หลาย replica]
    API --> AUTHN[Auth Service<br/>Keycloak / OIDC + RBAC]
    API --> ORCH[RAG Orchestrator]

    ORCH --> RETR[Retriever + Reranker service]
    RETR --> VDB[(Vector DB<br/>Qdrant / Milvus)]
    ORCH --> LLM[Model Serving<br/>vLLM / TGI on GPU pool]
    ORCH --> META[(PostgreSQL<br/>metadata / user / log)]
    RETR --> OBJ[(Object Storage<br/>S3 / MinIO เอกสารต้นฉบับ)]

    subgraph OPS["🔧 Platform / Ops"]
        SEC[Secret Manager<br/>Vault]
        MON[Monitoring<br/>Prometheus + Grafana + LLM tracing]
        LOGS[Central Logging<br/>Loki / ELK]
        CICD[CI/CD<br/>GitHub Actions]
        BK[Backup / DR]
    end

    API -.-> MON
    LLM -.-> MON
    VDB -.-> BK
    META -.-> BK
    OBJ -.-> BK
    API -.-> SEC
    LLM -.-> SEC
```

## 2. เปรียบเทียบระดับ Deployment (Prototype → Production)

```mermaid
flowchart LR
    subgraph P["🟢 Prototype"]
        p1[Streamlit] --> p2[FastAPI]
        p2 --> p3[Ollama SLM]
        p2 --> p4[(Chroma local)]
    end
    subgraph U["🟡 มหาวิทยาลัย / ทีมวิจัย"]
        u1[Web] --> u2[FastAPI]
        u2 --> u3[vLLM 1 GPU]
        u2 --> u4[(Qdrant)]
        u2 --> u5[(Postgres)]
    end
    subgraph PR["🔴 Production องค์กร"]
        r1[React] --> r2[API autoscale]
        r2 --> r3[vLLM GPU pool]
        r2 --> r4[(Qdrant/Milvus cluster)]
        r2 --> r5[(Postgres HA)]
        r2 --> r6[(S3/MinIO)]
    end
    P --> U --> PR
```

> อ้างอิงแนวคิด: `09_AI_Ready_Infrastructure.md`, `13_Recommended_System_Architecture.md`
