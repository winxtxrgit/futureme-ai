# แผนภาพสถาปัตยกรรม RAG (RAG Architecture)

> วันที่ตรวจสอบ: 21 กรกฎาคม 2026 · Mermaid syntax (render ได้บน GitHub/mkdocs/mermaid.live)

## 1. ภาพรวม 2 เฟส: Indexing (offline) + Query (online)

```mermaid
flowchart TB
    subgraph INDEX["🗂️ Indexing (offline / batch)"]
        direction LR
        D1[เอกสาร<br/>PDF/DOCX/scan] --> D2[Loader / OCR]
        D2 --> D3[Clean + Normalize ไทย]
        D3 --> D4[Chunking + Overlap]
        D4 --> D5[Metadata Extraction]
        D5 --> D6[Embedding Model]
        D6 --> VDB[(Vector Database)]
        D5 --> OBJ[(Object Storage<br/>ไฟล์ต้นฉบับ)]
    end

    subgraph QUERY["💬 Query (online / realtime)"]
        direction TB
        Q1[คำถามภาษาไทย] --> Q2[Query Processing<br/>normalize + rewrite]
        Q2 --> Q3[Embed คำถาม]
        Q3 --> Q4[Hybrid Retrieval<br/>semantic + BM25]
        Q4 -->|top-N| Q5[Reranker]
        Q5 -->|top-k| Q6[Prompt Builder<br/>+ citation ids]
        Q6 --> Q7[Small Language Model]
        Q7 --> Q8[Citation + Guardrail]
        Q8 --> Q9[คำตอบ + แหล่งอ้างอิง]
    end

    VDB -. ค้น .-> Q4
    Q4 -. ไม่พบ/คะแนนต่ำ .-> NA[ตอบ: ไม่พบข้อมูลในเอกสาร]
```

## 2. รายละเอียดฝั่ง Query (พร้อมการตัดสินใจ)

```mermaid
flowchart TD
    U[ผู้ใช้] --> AUTH{Auth + สิทธิ์<br/>access_level}
    AUTH -->|ไม่ผ่าน| X[ปฏิเสธ]
    AUTH -->|ผ่าน| P[Query Processing]
    P --> R[Retriever + metadata filter]
    R --> C{พบ chunk<br/>ที่คะแนน >= threshold?}
    C -->|ไม่| NA[ตอบ: ไม่พบข้อมูล]
    C -->|ใช่| RR[Reranker]
    RR --> PB[Prompt Builder]
    PB --> LLM[SLM temp ต่ำ]
    LLM --> G{คำตอบมี<br/>หลักฐานรองรับ?}
    G -->|ไม่| NA
    G -->|ใช่| ANS[คำตอบ + citation]
    ANS --> LOG[Log + Eval]
    LOG --> U
```

> อ้างอิงแนวคิด: `03_RAG_Fundamentals.md`, `04_RAG_Pipeline_Design.md`, `13_Recommended_System_Architecture.md`
