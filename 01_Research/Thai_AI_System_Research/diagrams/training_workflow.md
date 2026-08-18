# แผนภาพกระบวนการ LoRA / QLoRA (Training Workflow)

> วันที่ตรวจสอบ: 21 กรกฎาคม 2026 · Mermaid syntax

## 1. ขั้นตอน QLoRA ตั้งแต่ข้อมูลจนถึง inference

```mermaid
flowchart TD
    A[เตรียม Instruction Dataset ไทย<br/>ตรวจ license] --> B[แบ่ง train / validation]
    B --> C[โหลดโมเดลฐาน 4-bit NF4<br/>double quant - bitsandbytes]
    C --> D[ใส่ LoRA adapter<br/>target: q,k,v,o proj]
    D --> E[ตั้งค่า: rank, alpha, dropout, lr]
    E --> F[เทรน SFT<br/>trl SFTTrainer + paged optimizer]
    F --> G{วัดกับ validation<br/>overfit? forgetting?}
    G -->|แย่ลง| H[ปรับ hyperparams / data]
    H --> F
    G -->|ผ่านเกณฑ์| I[บันทึก adapter ~MB]
    I --> J{Deploy แบบไหน?}
    J -->|ยืดหยุ่น| K[โหลด base + adapter runtime]
    J -->|ง่าย/เร็ว| L[Merge adapter เข้า base FP16]
    K --> M[Inference vLLM / transformers]
    L --> M
    M --> N[ประเมินเทียบ baseline ก่อนใช้จริง]
```

## 2. ตำแหน่งของ Fine-tuning ในภาพรวมระบบ

```mermaid
flowchart LR
    subgraph DECIDE["ตัดสินใจจากผลประเมิน (10_)"]
        Q{RAG อย่างเดียวพอไหม?}
    end
    Q -->|พอ| RAGONLY[ใช้ RAG + Prompt เท่านั้น]
    Q -->|ไม่พอ:<br/>สไตล์/format/ศัพท์เฉพาะ| FT[QLoRA fine-tune]
    FT --> COMBINE[ใช้ RAG + LoRA adapter ร่วมกัน]
    RAGONLY --> PROD[ขึ้นระบบ]
    COMBINE --> PROD
```

> อ้างอิงแนวคิด: `07_LoRA_and_QLoRA.md`, `14_Implementation_Roadmap.md`
