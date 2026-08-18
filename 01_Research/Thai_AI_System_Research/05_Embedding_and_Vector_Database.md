# 05 — Embedding และ Vector Database

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026
> ⚠️ ตัวเลข benchmark และคุณสมบัติเปลี่ยนได้ ยืนยันกับ Model Card / docs ทางการก่อนใช้

## ส่วนที่ 1: Embedding

### 1.1 แนวคิดการค้น
- **Dense Retrieval** — แปลงข้อความเป็นเวกเตอร์หนา (dense) แล้วค้นด้วยความคล้าย เข้าใจความหมาย (semantic)
- **Sparse Retrieval** — เวกเตอร์เบาบางจากคำ เช่น **BM25** (จับคำตรงตัว/ชื่อเฉพาะ/เลขเอกสาร)
- **Hybrid Search** — รวม dense + sparse ให้ได้ทั้งความหมายและคำตรงตัว **แนะนำมากสำหรับภาษาไทย**
- **Reranking** — ใช้ cross-encoder อ่านคู่ (คำถาม, chunk) แล้วให้คะแนนละเอียด จัดอันดับ top-N ใหม่ (แม่นกว่า bi-encoder แต่ช้ากว่า จึงใช้กับผลที่ค้นมาแล้วเท่านั้น)

### 1.2 การวัดความคล้าย (Similarity)
| วิธี | สูตรย่อ | หมายเหตุ |
|------|---------|----------|
| **Cosine Similarity** | มุมระหว่างเวกเตอร์ | นิยมสุด, ไม่สนขนาดเวกเตอร์ |
| **Dot Product** | ผลคูณจุด | เร็ว; ถ้า normalize แล้ว = cosine |
| **Euclidean (L2)** | ระยะทางตรง | ใช้ได้ แต่ RAG นิยม cosine/dot |

> ต้องเลือก metric ให้ **ตรงกับที่ embedding model แนะนำ** (เช่น e5/BGE แนะนำ cosine) และตั้งค่าใน vector DB ให้ตรง

### 1.3 Embedding Model สำหรับไทย (เปรียบเทียบ)

| Model | มิติ (dim) | Context | ไทย | ฟีเจอร์ | License | เหมาะกับกรณีใด | ข้อจำกัด |
|-------|-----------|---------|-----|---------|---------|----------------|----------|
| **BGE-M3** (BAAI) | 1024 | 8192 | ดีมาก (100+ ภาษา) | dense+sparse+multi-vector(ColBERT) ในตัว | MIT | hybrid RAG ไทย, เอกสารยาว | โมเดลใหญ่กว่า e5-base, ช้ากว่า |
| **multilingual-e5-large** | 1024 | 512 | ดี (100 ภาษา) | dense, ต้องใส่ prefix `query:`/`passage:` | MIT | dense retrieval ทั่วไป | context สั้น (512), ต้องใส่ prefix |
| **multilingual-e5-base/small** | 768/384 | 512 | พอใช้–ดี | dense, เบา | MIT | เครื่องเล็ก/เร็ว | คุณภาพต่ำกว่า large |
| **BGE-reranker-v2-m3** (reranker) | - | 8192 | ดี | cross-encoder rerank | Apache-2.0 (ตรวจสอบ) | rerank หลัง retrieve | ต้องรันเพิ่ม, latency |
| **Thai-specific (เช่น จาก PyThaiNLP/มหาวิทยาลัย)** | แล้วแต่ | แล้วแต่ | เจาะไทย | dense | ตรวจสอบ | โดเมนไทยเฉพาะ | ต้องตรวจ maintenance/benchmark |

> ข้อเท็จจริง: BGE-M3 รองรับ dense + sparse + multi-vector ในโมเดลเดียว 100+ ภาษา context 8192 และทำ SOTA บน MIRACL/MKQA; multilingual-e5 ต้องใส่ prefix `query:`/`passage:` (อ้างอิงใน `16_...`)

> **ข้อเสนอแนะ:** เริ่มด้วย **BGE-M3** สำหรับ RAG ไทย เพราะได้ hybrid + context ยาวในโมเดลเดียว หากทรัพยากรจำกัดมากใช้ `multilingual-e5-base`; เพิ่ม **BGE-reranker-v2-m3** เมื่อ precision ยังไม่พอ — แต่ **ต้องวัดผลกับเอกสารจริง** (ดู `10_...`)

### 1.4 Metadata Filtering
กรองผลค้นด้วย metadata (เช่น `year >= 2023`, `department = HR`, `access_level`) ทำได้ทั้งก่อน/หลัง similarity ช่วยความแม่น + บังคับสิทธิ์ (ดู `11_...`)

## ส่วนที่ 2: Vector Database

### 2.1 เปรียบเทียบ (≥5 ตัว + pgvector)

| DB | รูปแบบ | ติดตั้ง/ใช้งาน | Hybrid/Metadata | Scale | ต้นทุน | เหมาะกับกรณีใด | ข้อจำกัด |
|----|--------|---------------|-----------------|-------|--------|----------------|----------|
| **FAISS** (Meta) | ไลบรารี (in-process) | `pip install faiss-cpu` | ไม่มี metadata/hybrid ในตัว | ล้าน–พันล้าน (in-mem) | ฟรี | prototype, งานวิจัย, ค้นเร็วในหน่วยความจำ | ไม่ใช่ DB (ไม่มี persistence/CRUD/filter สำเร็จรูป) |
| **Chroma** | embedded/server | `pip install chromadb` | metadata ได้, hybrid จำกัด | เล็ก–กลาง | ฟรี (โอเพนซอร์ส) | prototype ถึงระบบเล็ก, เริ่มง่ายสุด | ไม่เหมาะ scale ใหญ่มาก |
| **Qdrant** | server (Rust) | Docker/บริการ cloud | ✅ hybrid + payload filter ดี | กลาง–ใหญ่ | โอเพนซอร์ส + cloud | **ดีฟอลต์ RAG ที่กรอง metadata + latency ต่ำ** | ต้องดูแล server/ops |
| **Milvus** (Zilliz) | server แบบ distributed | Docker/K8s/Zilliz cloud | ✅ | ใหญ่–พันล้าน | โอเพนซอร์ส + cloud | enterprise scale ใหญ่มาก | ซับซ้อนในการ operate |
| **Weaviate** | server | Docker/cloud | ✅ hybrid + vectorizer module | กลาง–ใหญ่ | โอเพนซอร์ส + cloud | hybrid ในตัว, knowledge graph | resource สูงกว่าเมื่อ scale |
| **pgvector** (Postgres ext.) | ส่วนขยายของ Postgres | `CREATE EXTENSION vector` | ✅ (SQL filter/JOIN + full-text) | เล็ก–กลาง (โต) | ฟรี (ถ้ามี Postgres อยู่) | **ทีมที่ใช้ Postgres อยู่แล้ว** | ต้องจูน index (HNSW/IVFFlat), ไม่ใช่ specialized vector engine |

> ข้อเท็จจริง (อ้างอิงใน `16_...`): แหล่งเปรียบเทียบ 2025–2026 สรุปทำนอง — Qdrant เด่นด้าน filtered RAG latency ต่ำ, Weaviate เด่น hybrid ในตัว, Milvus/Zilliz เด่น billion-scale, Chroma เด่น prototyping, pgvector เด่นเมื่อใช้ Postgres อยู่แล้ว (เป็นแนวโน้มทั่วไป ไม่ใช่ผลวัดมาตรฐานเดียวกัน)

### 2.2 ข้อเสนอแนะการเลือก (ตามระยะ)
- **Prototype / เรียนรู้:** Chroma หรือ FAISS (local, ไม่ต้องตั้ง server)
- **ทีมวิจัย/มหาวิทยาลัย ระบบเล็ก-กลาง:** Qdrant (self-host) หรือ pgvector (ถ้ามี Postgres)
- **Production ต้องการ filter + scale + hybrid:** Qdrant หรือ Weaviate; ถ้าใหญ่มาก → Milvus
- **มี Postgres เป็นแกนอยู่แล้ว:** pgvector ลดชิ้นส่วนที่ต้องดูแล

### 2.3 หมายเหตุการตั้งค่า
- เลือก index: **HNSW** (แม่น/เร็ว, กิน RAM) vs **IVF** (ประหยัด, ต้อง train) — ส่วนใหญ่เริ่มด้วย HNSW
- เก็บ metadata: `source`, `page`, `section`, `date`, `access_level`, `doc_id`, `chunk_id`
- ตั้ง distance metric ให้ตรงกับ embedding (cosine/dot)

> อ่านต่อ: `06_Thai_Document_Processing.md`
