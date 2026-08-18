# คู่มือการใช้งานและเอกสารอ้างอิงระบบ FuturePath AI (Comprehensive User & Technical Manual)

> **เวทีการแข่งขัน:** JUMP THAILAND Hackathon 2026 (AIS Academy x NIA)
> **เวอร์ชันระบบ:** 2.0.0 (Multi-Tier & Verified Claims Compliant Edition)
> **วันที่อัปเดตล่าสุด:** 22 กรกฎาคม 2026

---

## 📌 1. ภาพรวมระบบ (System Overview)

**FuturePath AI** คือ แพลตฟอร์มแนะแนวเส้นทางอนาคตและการศึกษาไทยยุคใหม่ที่ขับเคลื่อนด้วยปัญญาประดิษฐ์ (AI-Powered Educational & Career Pathway Platform) ออกแบบมาเพื่อช่วยเหลือผู้เรียนในการค้นหาความสนใจ ทักษะ และจุดแข็งที่แท้จริง พร้อมวางแผนเส้นทางเรียนต่อและการทำงานอย่างเป็นระบบ

```
                   ระบบนิเวศการแนะแนว FuturePath AI
                                │
 ┌──────────────────────────────┼──────────────────────────────┐
 │                              │                              │
 ▼                              ▼                              ▼
[สำหรับนักเรียน (Student)]    [สำหรับผู้ปกครอง (Parent)]     [สำหรับครูแนะแนว (Counselor)]
- แบบประเมิน RIASEC 30 ข้อ   - ดูสรุปความสนใจลูก/หลาน        - แดชบอร์ดสถิติภาพรวมชั้นเรียน
- AI Socratic Interview      - ติดตามแผนทดลอง 30 วัน         - ตัวช่วยตั้งคำถามโค้ชรายบุคคล
- Scenario Missions Sandbox  - คุ้มครองความปลอดภัย PDPA     - ป้องกันเด็กหลุดออกจากระบบ
- Interactive Roadmap (DAG)
```

---

## 🎒 2. คู่มือสำหรับนักเรียน (Student User Guide)

### ขั้นตอนที่ 1: การยืนยันตัวตนและการเข้าสู่ระบบ (Authentication & Identity)
1. เข้าสู่หน้าเว็บ FuturePath AI บนมือถือหรือคอมพิวเตอร์
2. เลือกเข้าสู่ระบบ:
   * **ผู้ใช้เบอร์ AIS:** ระบบจะยืนยันตัวตนไร้รหัสผ่านโดยอัตโนมัติผ่าน **AIS Number Verify API (CAMARA Standard)**
   * **ผู้ใช้เครือข่ายอื่น:** กรอกเบอร์โทรศัพท์เพื่อรับรหัสผ่านครั้งเดียวผ่าน **AIS OTP API**
3. อ่านและกดยินยอมเงื่อนไขการคัดกรองข้อมูลส่วนบุคคลตามกฎหมาย PDPA

### ขั้นตอนที่ 2: การประเมินค้นหาตัวตน 2 เฟส (Sequential 2-Phase Assessment)
1. **แบบประเมินความสนใจทางอาชีพ RIASEC (30 ข้อ):** ทำแบบสำรวจสั้น ๆ เพื่อวัดระดับความชอบใน 6 ด้าน (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
2. **สัมภาษณ์เชิงสนทนากับ AI (Phase 1 - Socratic Chat 5-10 นาที):**
   * ตอบคำถามปลายเปิดกับ AI โค้ชแนะแนว ที่จะชวนตกผลึกเหตุการณ์ในอดีต (STAR Methodology: Situation, Task, Action, Result)
   * AI จะปรับระดับคำถามตามระดับชั้น (ป.4-ป.6, ม.1-ม.3, ม.4-ม.6, ปวช./ปวส.)
3. **ทำภารกิจจำลองสถานการณ์จริง (Phase 2 - Scenario Missions 3-5 นาที):**
   * ทดลองลงมือปฏิบัติภารกิจสั้น ๆ ตามเส้นทางที่สนใจ (เช่น แก้ปัญหาการออกแบบ, โค้ดดิ้ง, หรือการบริหาร) เพื่อรวบรวมหลักฐานพฤติกรรมจริง

### ขั้นตอนที่ 3: การดูผลประเมินและแผนที่เส้นทาง (Interactive Pathfinder Roadmap)
1. ระบบจะประมวลผลค่าน้ำหนัก 5 มิติ (ความสนใจ 30%, จุดแข็ง 20%, สไตล์การเรียนรู้ 15%, ข้อจำกัด/งบประมาณ 25%, ความยืดหยุ่นในอนาคต 10%)
2. เสนอทางเลือก 3 เส้นทางหลัก:
   * ⚖️ **Balanced Next Step:** ทางเลือกที่สมดุลที่สุดในทุกมิติ
   * 🌟 **Interest Growth Route:** ทางเลือกที่เน้นการเติบโตตามความสนใจสูงสุด
   * 🛠️ **Practical Access Route:** ทางเลือกที่เน้นการเข้าถึงได้จริงและข้อจำกัดต่ำสุด
3. **ใช้งาน Interactive Roadmap (สไตล์ roadmap.sh):**
   * คลิกดู Node เส้นทางทีละก้าว (สถานะปัจจุบัน ➔ ทักษะที่ต้องฝึก ➔ สายการเรียน ม.ปลาย/อาชีวะ ➔ เกณฑ์ TCAS/มหาลัย ➔ พอร์ตโฟลิโอ ➔ เป้าหมายอาชีพ)
   * กดเช็กอิน (Check-in) เมื่อทำภารกิจหรือเรียนจบแต่ละก้าวเพื่อบันทึกความก้าวหน้า

---

## 👨‍👩‍👧 3. คู่มือสำหรับผู้ปกครอง (Parent User Guide)

1. **การเชื่อมโยงบัญชีลูก/หลาน:** ลงทะเบียนด้วยเบอร์โทรศัพท์ที่ผูกกับบัญชีนักเรียน
2. **การใช้งาน Parent Summary View:**
   * ดูสรุปความสนใจหลักและบุคลิกภาพทางอาชีพของลูก/หลาน
   * ดูเส้นทางเรียนต่อ 3 ทางเลือกที่ระบบแนะนำ พร้อมเหตุผลและทางเลือกสายอาชีพในอนาคต
   * ติดตามแผนทดลองลงมือทำจริง 30 วัน (30-Day Action Plan)
3. **นโยบายคุ้มครองความปลอดภัย (PDPA & Privacy):**
   * ผู้ปกครองจะเห็นเฉพาะผลสรุปภาพรวมและแผน 30 วันเท่านั้น
   * **ไม่สามารถเข้าดูข้อความสนทนาส่วนตัว (Chat Transcript)** ระหว่างเด็กกับ AI ได้ เว้นแต่เด็กจะกด Consent อนุญาตแชร์ด้วยตนเอง

---

## 🏫 4. คู่มือสำหรับครูแนะแนว (Counselor User Guide)

1. **การเข้าใช้งาน Counselor Dashboard:** ลงทะเบียนด้วยสิทธิ์ครูแนะแนวเพื่อเข้าดูภาพรวมนักเรียนในความดูแล
2. **ฟีเจอร์เด่นบน Dashboard:**
   * **Class Progress Overview:** ดูสถิติสัดส่วนความสนใจของนักเรียนทั้งห้องเรียน/ระดับชั้น
   * **Early Warning Indicator:** ระบบแจ้งเตือนกลุ่มนักเรียนที่มีระดับความลังเลใจสูง หรือเสี่ยงหลุดออกจากระบบการศึกษา
   * **Guidance Prompt Assistant:** ระบบแนะนำชุดคำถามสำหรับครูนำไปใช้ในการโค้ชและพูดคุยรายบุคคล (One-on-One Counseling)
3. **การเข้าถึงข้อมูลตามสิทธิ์:** ครูจะเห็นข้อมูลสรุปเชิงสถิติและระดับความลังเลใจ แต่นิติกรรมข้อความแชตส่วนตัวของเด็กจะถูกปกป้องตามนโยบาย PDPA

---

## 💻 5. คู่มือทางเทคนิคสำหรับนักพัฒนา (Developer & Technical Guide)

### 5.1 โครงสร้างคลังข้อมูลและสถาปัตยกรรม (Codebase Structure)
```
Hackathon_ais/
├── README.md · PROJECT.md · ORIGINAL_REQUEST.md   # เอกสาร meta ของโปรเจกต์
├── app/                        # FastAPI Application Core
│   ├── main.py                 # FastAPI entrypoint
│   ├── api/router.py           # API routes (/v1/...)
│   ├── decision_engine/        # RIASEC, decision matrix, multi-tier, route generator, STAR eval
│   │   └── riasec.py · matrix.py · multi_tier.py · route_generator.py · star_eval.py
│   └── rag/                    # Qdrant hybrid search & RAG pipeline
│       └── pipeline.py · qdrant_client.py
├── schemas/                    # Pydantic schemas (profiles, routes, missions, DTOs)
├── Data/                       # Knowledge Base 7 หมวดหมู่ (Verified Sources) + QLoRA dataset
│   ├── 01_Graduate_Unemployment_and_Mismatch_Stats/
│   ├── 02_Thai_National_Curricula/                    (12 กลุ่มสาขา ปวช. 2567 / TCAS)
│   ├── 03_Career_Degree_and_Skills_Mapping/           (5 กลุ่มอาชีพหลัก)
│   ├── 04_Qualitative_Deep_Interviewing_Research/     (Socratic / STAR / RIASEC)
│   ├── 05_NDLP_Ministry_of_Education/                 (NDLP / DEEP Ecosystem)
│   ├── 06_AIS_Cloud_and_Infrastructure/               (AIS Cloud / DAG Algorithm)
│   └── 07_System_Blueprints_and_Flowcharts/           (Blueprints & Flowcharts)
├── scripts/                    # verify_system.py · generate_qwen_dataset.py · convert_data_to_pdf.py
├── tests/                      # Pytest suite (api · decision_engine · rag)
├── docs/                       # คู่มือ, Brief/Deck, งานวิจัย Thai_AI_System_Research
└── assets/                     # Advice_from_the_teacher.m4a · Ais_technology.jpg
```

### 5.2 คำสั่งการติดตั้งและการรันระบบ (Commands)

#### 1. การรัน Unit Tests & API Integration Tests:
```bash
pytest
```

#### 2. การรัน Verification Agent Audit (ตรวจสอบความถูกต้องและเบนช์มาร์ก):
```bash
python scripts/verify_system.py
```

#### 3. การเปิดใช้งาน FastAPI Development Server:
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 🔌 6. รายการ API Endpoints หลัก (API Reference)

| HTTP Method | Endpoint Path | คำอธิบายหน้าที่ |
| :--- | :--- | :--- |
| `POST` | `/v1/future-paths` | คำนวณค่าน้ำหนัก 5 มิติ และสร้างทางเลือกแนะนำ 3 เส้นทางพร้อม Dynamic Roadmap |
| `GET` | `/v1/future-paths/{id}` | ดึงข้อมูลแผนที่เส้นทางอนาคต (Roadmap DAG) ตาม ID |
| `POST` | `/v1/missions/recommend` | แนะนำภารกิจลองทำจริง (Scenario Missions) ตามความสนใจของเด็ก |
| `POST` | `/v1/missions/{id}/submissions` | ส่งผลการปฏิบัติภารกิจเพื่อบันทึกหลักฐานพฤติกรรมจริง (Learner Evidence) |

---

## ☁️ 7. โครงสร้างการติดตั้งบน AIS Cloud (AIS Cloud Deployment)

ระบบถูกออกแบบให้รันบน **AIS Cloud Powered by OCI (THAI Hyperscale Cloud)** เพื่อความมั่นคงปลอดภัยตามมาตรฐาน PDPA:

```
[Users / Clients] ── HTTPS ──► [AIS Cloud Load Balancer]
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
  [FastAPI Docker Container]                    [Qdrant Vector DB Pod]
  - App Logic / Decision Engine                 - Thai Careers & Curricula
  - Socratic AI Prompt Flow                     - Hybrid Dense/Sparse Search
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      ▼
                      [PostgreSQL Database Pod]
                      - Data Sovereignty (Thailand 100%)
                      - Micro-segmentation Firewall (VMware NSX)
```
