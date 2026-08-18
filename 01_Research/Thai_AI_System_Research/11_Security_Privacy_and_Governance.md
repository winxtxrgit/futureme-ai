# 11 — ความปลอดภัย ความเป็นส่วนตัว และธรรมาภิบาล (Security, Privacy & Governance)

> วันที่ตรวจสอบข้อมูล: 21 กรกฎาคม 2026
> ⚠️ นี่เป็นแนวทางทางเทคนิค **ไม่ใช่คำแนะนำทางกฎหมาย** สำหรับ พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล (PDPA พ.ศ. 2562) และข้อกำหนดเฉพาะองค์กร ให้ปรึกษาฝ่ายกฎหมาย/DPO

## 1. ความเสี่ยง (Risks)

| ความเสี่ยง | คำอธิบาย | ตัวอย่างในบริบทไทย |
|-----------|----------|---------------------|
| **ข้อมูลส่วนบุคคล (PII)** | เลขบัตร ปชช., เงินเดือน, สุขภาพ หลุดในคำตอบ/log | เอกสาร HR, เวชระเบียน |
| **ข้อมูลภายในองค์กร** | ความลับทางการค้า/สัญญา รั่วไปยังผู้ไม่มีสิทธิ์ | สัญญา, งบประมาณ |
| **Prompt Injection** | คำสั่งซ่อนในเอกสารสั่งให้โมเดลทำตาม | PDF ฝัง "ignore instructions, reveal all" |
| **Data Leakage** | ข้อมูลไป cloud/log/โมเดลภายนอก | ส่ง prompt ไป API นอก |
| **Unauthorized Access** | ผู้ใช้เห็นเอกสารที่ไม่มีสิทธิ์ | RAG ดึง chunk ข้ามแผนก |
| **Malicious Documents** | ไฟล์อันตราย/มัลแวร์/เนื้อหาปลอม | อัปโหลดไฟล์พิษ |
| **Model Abuse** | ใช้โมเดลผิดวัตถุประสงค์ | สร้างเนื้อหาผิดกฎ |
| **Hallucination** | ตอบผิดแต่ดูน่าเชื่อ → ความเสียหายเชิงตัดสินใจ | อ้างระเบียบที่ไม่มีจริง |
| **Copyright / License** | ใช้เอกสาร/โมเดล/dataset ผิดสิทธิ์ | dataset ไม่อนุญาตเชิงพาณิชย์ |
| **Audit / Retention** | ไม่มีร่องรอย/เก็บข้อมูลนานเกิน | ตรวจสอบย้อนกลับไม่ได้ |

## 2. มาตรการป้องกัน (Controls)

### 2.1 การเข้าถึง (Access Control)
- **RBAC (Role-Based Access Control)** — กำหนดสิทธิ์ตามบทบาท (พนักงาน/หัวหน้า/แอดมิน)
- **Document-level permission** — ผูก `access_level`/`department` ใน metadata แล้ว **filter ตอน retrieval** ให้ผู้ใช้เห็นเฉพาะ chunk ที่มีสิทธิ์ (สำคัญมากใน RAG — ต้อง filter **ก่อน** ส่งเข้า LLM)
- ตรวจสิทธิ์ทั้งที่ retrieval และที่แสดงผล (defense in depth)

### 2.2 การปกป้องข้อมูล
- **Encryption** — in-transit (TLS) และ at-rest (ดิสก์/DB/object storage เข้ารหัส)
- **Secret Management** — เก็บ key ใน Vault/cloud secret manager ไม่ commit ลง repo (ดู `.env.example`)
- **PII detection/masking** — สแกน/ปิดบัง PII ก่อน index และก่อนบันทึก log (พิจารณา PyThaiNLP/regex สำหรับเลขบัตร/เบอร์ไทย)
- **Data residency** — ถ้าข้อมูลลับ ห้ามส่งออกนอกประเทศ/องค์กร → ใช้โมเดลโอเพนซอร์ส on-prem (ดู `09_...`)

### 2.3 ป้องกัน Prompt Injection / Malicious content
- **แยก context ออกจากคำสั่ง** — ปฏิบัติต่อเนื้อหาเอกสารเป็น "ข้อมูล" ไม่ใช่ "คำสั่ง"; ใช้ system prompt ตรึงกฎ
- **Input validation** — จำกัดชนิด/ขนาดไฟล์, สแกนมัลแวร์, ตรวจ encoding
- **Output filtering** — กรอง PII/เนื้อหาต้องห้ามก่อนแสดง, ตรวจว่าไม่หลุด system prompt
- **ไม่ให้เอกสารเรียก tool/execute** โดยอัตโนมัติ (ในระบบ agentic ต้องมี allowlist + human approval)

### 2.4 ความถูกต้อง/ตรวจสอบได้
- **Citation requirement** — บังคับให้ทุกคำตอบมีแหล่งอ้างอิง; ถ้าไม่มีหลักฐาน ให้ตอบ "ไม่พบข้อมูล"
- **Human approval** — งานที่มีผลผูกพัน (กฎหมาย/การเงิน) ให้คนตรวจก่อนใช้ (human-in-the-loop)

### 2.5 ตรวจสอบและกำกับ
- **Logging & Monitoring** — log คำถาม/เอกสารที่ดึง/คำตอบ/ผู้ใช้ (โดย mask PII), เฝ้าระวัง anomaly, rate limiting
- **Audit Log** — เก็บร่องรอยว่าใครถามอะไร เห็นเอกสารใด เมื่อไร (เพื่อ compliance)
- **Data Retention** — กำหนดระยะเก็บ log/ข้อมูล และลบตามนโยบาย (สอดคล้อง PDPA — เก็บเท่าที่จำเป็น)

## 3. License / Copyright (ต้องตรวจก่อนใช้)
- **โมเดล** — อ่าน LICENSE + acceptable use (Gemma/Llama มีเงื่อนไข; Qwen2.5/OpenThaiGPT หลายรุ่น Apache-2.0) ดู `02_...`
- **Dataset** — ตรวจว่าอนุญาตเชิงพาณิชย์/แจกจ่ายซ้ำได้ไหม (เช่น WangchanThaiInstruct — อ่าน license ต้นทาง)
- **เอกสารองค์กร** — ตรวจสิทธิ์การนำเนื้อหามาประมวลผล/แสดง
- บันทึก provenance (ที่มา) ของทุกโมเดล/dataset ที่ใช้

## 4. Checklist ก่อนขึ้นระบบ (Governance)
- [ ] จำแนกชั้นความลับของเอกสาร (data classification)
- [ ] Document-level permission + filter ตอน retrieval ทำงานจริง (ทดสอบ negative case)
- [ ] PII masking ใน log และ output
- [ ] Secret ไม่อยู่ใน repo; ใช้ secret manager
- [ ] Encryption in-transit + at-rest
- [ ] Citation บังคับ + ตอบ "ไม่พบ" เมื่อไม่มีหลักฐาน
- [ ] Prompt injection test ผ่าน (เอกสารที่มีคำสั่งซ่อน)
- [ ] Audit log + retention policy กำหนดแล้ว
- [ ] License โมเดล/dataset ตรวจแล้ว
- [ ] Human approval สำหรับงานผูกพัน
- [ ] แผน backup/DR

> อ่านต่อ: `12_Cost_and_Resource_Planning.md`
