# 03 — พื้นฐาน RAG (RAG Fundamentals)

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026

RAG (Retrieval-Augmented Generation) = การให้โมเดลภาษา "ค้นข้อมูลก่อนตอบ" แนวคิดต้นฉบับจาก Lewis et al., 2020 (Facebook AI, arXiv 2005.11401)

## 1. องค์ประกอบหลัก

### R — Retrieval (การดึงข้อมูล)
ค้นหาเอกสาร/ข้อความที่เกี่ยวข้องกับคำถาม จากฐานความรู้ (เช่น vector database) มักใช้ semantic similarity หรือ hybrid (semantic + keyword)

### A — Augmentation (การเสริมบริบท)
นำข้อความที่ค้นได้ มา "เสริม" เข้าไปใน prompt เป็นบริบท (context) ให้โมเดล

### G — Generation (การสร้างคำตอบ)
โมเดลภาษาสร้างคำตอบโดย **อ้างอิงจากบริบทที่ให้** ไม่ใช่จากความจำล้วน

## 2. ชิ้นส่วนใน pipeline (ศัพท์ที่ต้องรู้)

| ชิ้นส่วน | ทำอะไร |
|---------|--------|
| **Document Loader** | อ่านไฟล์ (PDF/DOCX/HTML/CSV) เป็นข้อความ |
| **Text Splitting / Chunking** | ตัดเอกสารยาวเป็นชิ้นเล็ก (chunk) ให้ค้น/ใส่ context ได้ |
| **Embedding** | แปลงข้อความเป็นเวกเตอร์ตัวเลข (semantic vector) |
| **Vector Index** | โครงสร้างค้นเวกเตอร์เร็ว (เช่น HNSW) ใน vector database |
| **Retriever** | รับคำถาม → คืน chunk ที่เกี่ยวข้อง top-k |
| **Reranker** | จัดอันดับ chunk ที่ค้นได้ใหม่ให้แม่นขึ้น (cross-encoder) |
| **Prompt Construction** | ประกอบคำถาม + context + คำสั่ง เป็น prompt |
| **Context Injection** | แทรก chunk เข้าไปใน prompt |
| **Response Generation** | โมเดลตอบ |
| **Source Citation** | อ้างอิงว่าคำตอบมาจากเอกสาร/หน้าใด |

## 3. ทำไม RAG จึงเป็น "สมองที่สอง" (Second Brain)

โมเดลภาษ​าเปรียบเหมือน "สมองแรก" ที่จำความรู้ทั่วไปตอนเทรน — แต่ (ก) อัปเดตยาก (ต้องเทรนใหม่) (ข) จำผิด/แต่งได้ (hallucinate) (ค) ไม่รู้ข้อมูลลับขององค์กร

RAG เพิ่ม "สมองที่สอง" = **หน่วยความจำภายนอกที่ค้นได้** ซึ่ง:
- **อัปเดตทันที** — แค่เพิ่ม/แก้เอกสารในฐานข้อมูล ไม่ต้องเทรน
- **ตรวจสอบได้** — ให้ citation ชี้แหล่งจริง
- **แยกความรู้ออกจากโมเดล** — เปลี่ยนโมเดลได้โดยความรู้ยังอยู่

## 4. ตารางเปรียบเทียบแนวคิด

### RAG vs Fine-tuning
| | RAG | Fine-tuning |
|--|-----|-------------|
| ให้ความรู้ใหม่ | ✅ (เปลี่ยนเอกสารได้) | ⚠️ ยัดข้อเท็จจริงได้ไม่ดี |
| ปรับสไตล์/format | ⚠️ ทำผ่าน prompt ได้บ้าง | ✅ |
| ต้นทุนอัปเดต | ต่ำ | สูง (เทรนใหม่) |
| citation | ✅ | ❌ |
| **เหมาะกับ** | ความรู้เฉพาะทางที่เปลี่ยน | พฤติกรรม/รูปแบบคงที่ |

### RAG vs Keyword Search
- Keyword (BM25): จับคำตรงตัว/ชื่อเฉพาะ/เลขเอกสารได้ดี แต่พลาดคำพ้องความหมาย และภาษาไทยต้องตัดคำก่อน
- RAG (semantic): เข้าใจความหมาย จับคำถามภาษาพูดที่ไม่ตรงคำในเอกสารได้
- **ที่ดีคือรวมกัน (hybrid)** — ดู `05_...`

### RAG vs การยัดเอกสารทั้งหมดลง Prompt (long-context stuffing)
- ยัดทั้งหมด: ง่าย แต่ (ก) เกินขนาด context (ข) แพง/ช้า (ค) "lost in the middle" โมเดลมองข้อมูลกลาง prompt พลาด (ง) ไม่ scale เมื่อเอกสารเป็นพัน
- RAG: ดึงเฉพาะที่เกี่ยวข้อง → ประหยัด แม่นกว่า และ scale ได้

### Naive RAG vs Advanced RAG
| | Naive RAG | Advanced RAG |
|--|-----------|--------------|
| Retrieval | embed → top-k → ตอบ | + query rewriting, hybrid search, reranking, metadata filter |
| ก่อน retrieve | ไม่มี | pre-retrieval (rewrite/expand/route) |
| หลัง retrieve | ต่อ prompt เลย | post-retrieval (rerank, compress, dedupe) |
| คุณภาพ | พอใช้ | ดีขึ้นชัดในงานจริง |

> แนวคิด Naive/Advanced/Modular RAG อ้างอิงจาก survey ของ Gao et al., 2023 "Retrieval-Augmented Generation for LLMs: A Survey" (arXiv 2312.10997)

### Standard RAG vs Agentic RAG
- **Standard**: ค้นครั้งเดียว → ตอบ (ลำดับเดียว)
- **Agentic**: โมเดลเป็น "agent" ที่ตัดสินใจเอง เช่น จะค้นไหม/ค้นกี่รอบ/ใช้ tool อะไร/ตรวจคำตอบตัวเองแล้วค้นซ้ำ — แม่นขึ้นในคำถามซับซ้อน แต่ช้าลง/แพงขึ้น/ควบคุมยากขึ้น

### RAG vs Graph RAG
- **Vector RAG**: ค้นด้วยความคล้าย (similarity) เหมาะคำถามเชิงข้อเท็จจริงเฉพาะจุด
- **Graph RAG**: สร้าง knowledge graph (entity/ความสัมพันธ์) แล้วค้นเชิงโครงสร้าง เหมาะคำถามที่ต้องเชื่อมโยงหลาย entity/สรุปภาพรวม (เช่น "สรุปงานวิจัยทั้งกลุ่มนี้เกี่ยวข้องกันอย่างไร") — แต่สร้าง/ดูแลแพงและซับซ้อนกว่ามาก (แนวคิดจาก Microsoft GraphRAG, 2024)

## 5. เมื่อ RAG ตอบผิด — เกิดจากอะไร (เกริ่น)
retrieval ผิด, chunk ไม่ดี, embedding ไม่รองรับไทย, context ขัดแย้ง, ข้อมูลเก่า, โมเดลมั่วเกินหลักฐาน — วิเคราะห์เต็มใน `04_RAG_Pipeline_Design.md`

## 6. ข้อเสนอแนะระดับเริ่มต้น
เริ่มด้วย **Naive RAG** ให้ทำงานก่อน แล้ววัดผล (`10_...`) จากนั้นค่อยยกระดับเป็น Advanced (hybrid + rerank) เฉพาะจุดที่ตัวเลขบอกว่าจำเป็น — อย่าเริ่มด้วย Agentic/Graph RAG ทันทีเพราะซับซ้อนเกินสำหรับ prototype

> อ่านต่อ: `04_RAG_Pipeline_Design.md`
