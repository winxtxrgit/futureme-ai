<a id="top"></a>

<p align="center">
  <strong>README:</strong> <strong>[ภาษาไทย (TH)](README.md)</strong> · <a href="README_EN.md">English (EN)</a>
</p>

<p align="center">
  <img src="03_WebApp/assets/banner/banner.png" alt="FutureMe AI — explore the next step, not one final answer" width="100%">
</p>

# FutureMe AI — ระบบแนะแนวการศึกษาและเส้นทางอาชีพสำหรับเด็กไทย

> **ผลงานเข้าประกวด:** JUMP THAILAND Innovation Hackathon 2026 (AIS Academy x NIA)  
> **Core Concept:** *“ลองเส้นทางอนาคต ก่อนตัดสินใจจริง”* — ระบบประเมินและทดลองเส้นทางอาชีพด้วยหลักฐานจริง (Evidence-Based Guidance)  
> **Core Philosophy:** **“Rules decide. AI explains.”** — ใช้เอนจินคณิตศาสตร์ที่โปร่งใสในการตัดสินใจ และใช้ AI ทำหน้าที่สัมภาษณ์และอธิบายเหตุผล

---

## 🌟 เอกสารสำคัญสำหรับกรรมการ (Submission Quick Links)

| เอกสารนำเสนอ | คำอธิบาย | ไฟล์ดาวน์โหลด / เข้าชม |
|---|---|:---:|
| **Official Pitch Deck (PDF)** | สไลด์นำเสนอฉบับทางการ 7 หน้า (16:9 Widescreen) สำหรับกรรมการ | [📄 `FutureMe_Presentation.pdf`](FutureMe_Presentation.pdf) |
| **Team Portfolio & Evidence** | เอกสารหลักฐานผลงานและความพร้อม 8 หน้า (หลักฐาน Prototype + ประวัติผู้พัฒนา) | [📄 `FutureMe_Team_Portfolio.pdf`](FutureMe_Team_Portfolio.pdf) |
| **Interactive Web App** | แอปพลิเคชัน Next.js 15.5 รันจริงพร้อม 11 หน้าจอ | [🚀 ดูวิธีเปิดแอปด้านล่าง](#-quick-start--วิธีรันแอปพลิเคชัน) |
| **Evidence & Theory Catalog** | ฐานงานวิจัย ทฤษฎีจิตวิทยา และสถิติอ้างอิง | [`01_Research/`](01_Research/) |

---

## 🧭 ปัญหาและทางแยกสำคัญ (WHAT & Problem Statement)

การศึกษาไทยกำลังเผชิญปัญหาช่องว่างขนาดใหญ่ระหว่างสิ่งที่เรียนกับความต้องการของตลาดแรงงานจริง:
* **56% ทำงานไม่ตรงสายที่เรียน:** ข้อมูลสำรวจจาก TDRI (2025)
* **27% ทำงานต่ำกว่าคุณวุฒิ:** ขาดทักษะเฉพาะทางที่ตลาดต้องการ
* **39% ทักษะจะเปลี่ยนไปใน 5 ปี:** รายงาน WEF Future of Jobs (2025)

### 📍 สองทางแยกสำคัญ (Consequential Choice Points)
1. **ทางแยก ม.3 (Choice Point 1):** สายสามัญ (ม.ปลาย) VS สายอาชีพ (ปวช.) VS ทางเลือกท้องถิ่น — เด็กต้องเลือกจากคำบอกเล่าโดยไม่เคยได้ทดลองปฏิบัติการจริง
2. **ทางแยก ม.6 / ปวช. (Choice Point 2):** มหาวิทยาลัย (TCAS) VS อาชีวะชั้นสูง (ปวส.) VS เข้าสู่ตลาดแรงงาน — เสี่ยงต่อการซิ่ว ย้ายคณะ หรือหลุดจากระบบการศึกษาเมื่อพบว่าไม่ใช่

---

## 💡 นวัตกรรมและหลักการทำงาน (HOW & Core Innovation)

> ### ⚙️ Core Principle: **“Rules decide. AI explains.”**
> FutureMe AI ไม่ใช้ AI มโนหรือแต่งเติมเส้นทางเอง (Zero Hallucination) แต่ใช้ **Deterministic Scoring Engine** ในการคำนวณความสอดคล้องทางคณิตศาสตร์ แมตช์กับ **23,257 หลักสูตรจริง** ทั่วประเทศ โดยมี AI ทำหน้าที่เป็น **Socratic Interviewer** ช่วยซักถามและอธิบายเหตุผล

```
[1. ANSWER (ประเมิน)]
  • 36-Item Holland RIASEC Questionnaire + Self-Efficacy Scale (6 มิติ)
  • Socratic Interview เจาะลึกความถนัดด้วย STAR Framework
  • Geolocation, Living Cost Index 5 ภาค และงบประมาณครอบครัว
        ⬇️
[2. TRY (ทดลองจริง)]
  • Scenario Missions ภารกิจจำลองการทำงานจริงในชีวิตประจำวัน
  • วัดผลจากพฤติกรรมการลงมือทำจริง ไม่ใช่แค่ความรู้สึก
        ⬇️
[3. REFLECT (สะท้อนผล)]
  • จับคู่ 23,257 หลักสูตรสถาบันการศึกษาจริง (16,908 ปวช./ปวส. + 6,349 ป.ตรี จาก 993 สถาบัน)
  • อธิบายเหตุผลเบื้องหลังคำแนะนำ พร้อมสร้าง 30-Day Action Roadmap
```

---

## 🔄 วงจรสะสมหลักฐานอัปเดตต่อเนื่อง (WHO & 5-Step Continuous Loop)

FutureMe ไม่ใช่แบบประเมินแบบครั้งเดียวจบ แต่คือ **ระบบนิเวศสะสมหลักฐาน (Continuous Evidence Loop)** ตลอดช่วงวัยเรียน:

| 1. REFLECT | ➔ | 2. TRY | ➔ | 3. UPDATE | ➔ | 4. COMPARE | ➔ | 5. ACT |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **ประเมินความถนัด**<br><sub>(Provisional Vector)</sub> | | **ทดลองทำจริง**<br><sub>(Scenario Mission)</sub> | | **สะท้อนผลหลังทำ**<br><sub>(Post-Mission)</sub> | | **ชั่งน้ำหนักงบประมาณ**<br><sub>(Living Cost Index)</sub> | | **ลงมือทำต่อเนื่อง**<br><sub>(30-Day Action Plan)</sub> |

```
🔄 Continuous Loop: [1. Reflect ประเมิน] ➔ [2. Try ทดลองจริง] ➔ [3. Update สะท้อนผล] ➔ [4. Compare เทียบงบ/ที่พัก] ➔ [5. Act แผน 30 วัน]
```

* **Post-Mission Reflection:** AI ทักถามทันทีหลังจบมินิภารกิจ เพื่อ Re-calibrate เวกเตอร์ความถนัดแบบไดนามิก
* **Weekly Micro Check-in:** ชวนคุยสั้น ๆ สัปดาห์ละครั้ง เพื่อติดตามความสนใจที่เปลี่ยนแปลงไป
* **Data Ownership & PDPA:** นักเรียนเป็นเจ้าของข้อมูล 100% สามารถเลือกแชร์ข้อมูลให้กับครูแนะแนวหรือผู้ปกครองผ่าน Counselor Dashboard

---

## 🏗️ สถาปัตยกรรมและกระบวนการทำงาน (Architecture & Diagrams)

### 1. แผนผังการทำงานครบวงจร (Complete System Workflow)

```mermaid
flowchart LR
    A["แหล่งข้อมูลหลักสูตรทางการ<br/>(สอศ. / ทปอ. / กสศ.)"] --> B["ฐานข้อมูล 23,257 หลักสูตร<br/>+ Living Cost 5 ภูมิภาค"]
    B --> C["แบบประเมิน RIASEC<br/>+ Scenario Missions"]
    C --> D["Deterministic Scoring Engine<br/>(Cosine Matcher + Kelley)"]
    D --> E["จัดอันดับ 0–3 เส้นทางแนะนำ<br/>+ อธิบายเหตุผลเบื้องต้น"]
    E --> F["แผนปฏิบัติการ 30 วัน<br/>(30-Day Action Plan)"]
    F --> G["โรงเรียนนำร่อง + นักเรียนจริง<br/>(Pilot Validation)"]
    G -. "Re-calibrate เวกเตอร์ & AI Prompt" .-> B
    G --> H["ระบบบริการทางการระดับประเทศ<br/>(National Rollout)"]

    I["Socratic AI Counselor<br/>(Research & Offline Prototype)"] -. "ทดสอบการซักถาม STAR" .-> E
    J["AIS Cloud Data Vault"] -. "แผนพัฒนาความปลอดภัย" .-> D
    classDef working fill:#d1fae5,stroke:#047857,color:#064e3b;
    classDef validating fill:#fef3c7,stroke:#d97706,color:#78350f;
    classDef planned fill:#fee2e2,stroke:#dc2626,color:#7f1d1d;
    class A,B,C,D,E,F working;
    class G,I validating;
    class H,J planned;
```

### 2. เส้นทางประสบการณ์ของผู้เรียน (Student Journey Flowchart)

```mermaid
flowchart TD
    A["เริ่มต้นใช้งานทันที (Guest Mode)<br/>ไม่ต้องลงทะเบียน ไม่เก็บข้อมูลส่วนตัว"] --> B["1. REFLECT: ประเมินความสนใจ<br/>แบบสอบถาม RIASEC 36 ข้อ + Self-Efficacy"]
    B --> C["คำถามบริบท 4 ข้อ + โครงสร้าง STAR Framework<br/>สามารถตรวจทานและแก้ไขคำตอบได้ตลอด"]
    C --> D["2. TRY: ภารกิจจำลองชีวิตจริง<br/>Scenario Missions 4 ขั้นตอน (12 นาที)"]
    D --> E{"ระบบตรวจสอบหลักฐาน<br/>(Deterministic Evidence Check)"}
    E -->|"หลักฐานไม่ชัดเจน/แบนราบ"| F["แจ้งว่าหลักฐานยังไม่เพียงพอ<br/>พร้อมแนะนำให้ลองสำรวจจุดที่ยังขาด"]
    F --> G["กลับไปทบทวนคำตอบหรือเปลี่ยนภารกิจ"]
    G --> B
    G --> D
    E -->|"หลักฐานครบถ้วนสมบูรณ์"| H["3. EXPLORE: 0–3 สมมติฐานเส้นทาง<br/>จับคู่จาก 23,257 หลักสูตรจริงทั่วไทย"]
    H -. "ค้นหาสถานศึกษาใกล้เคียง" .-> N["เลือกจังหวัดที่สนใจ (77 จังหวัด)<br/>คำนวณระยะทาง & ดัชนีค่าครองชีพ"]
    H --> I["4. COMPARE: เปรียบเทียบหลักสูตร<br/>ความสนใจ 50% · ภารกิจ 30% · สภาพแวดล้อม 20%"]
    I --> J["วิเคราะห์งบประมาณ ค่าเทอม ค่าหอพัก โอกาสงาน<br/>แสดงข้อมูลจริงประกอบการตัดสินใจ"]
    J --> K["5. ACT: เลือกเส้นทางเป้าหมาย<br/>สร้างแผนปฏิบัติการ 30 วัน (Reversible Plan)"]
    H -->|"เลือกเส้นทางโดยตรง"| K
    K --> L["ข้อมูลจัดเก็บปลอดภัยในเครื่อง (LocalStorage)"]
    L -. "อนาคต" .-> P["AIS Cloud Vault · Counselor Dashboard<br/>Parent Career Pass · TCAS Export"]

    classDef live fill:#10231f,stroke:#43e6bd,color:#f7f7ff;
    classDef gate fill:#211b38,stroke:#8b6cff,color:#f7f7ff;
    classDef caution fill:#2c2414,stroke:#f5c451,color:#fff7dc;
    classDef planned fill:#191c24,stroke:#808898,color:#d0d4de,stroke-dasharray:5 5;
    class A,B,C,D,H,N,I,K,L live;
    class E gate;
    class F,G,J caution;
    class P planned;
```

---

## 📱 ภาพตัวอย่างระบบ Web Application (Live Showcase)

| 1. หน้าแรก (Landing Page) | 2. แบบประเมินจิตวิทยา (Interview) |
|:---:|:---:|
| ![Landing Page](03_WebApp/Pre_Present/assets/screenshots/app/landing-desktop.png) | ![Assessment](03_WebApp/Pre_Present/assets/screenshots/app/interview-desktop.png) |

| 3. จัดอันดับเส้นทาง (Ranked Routes) | 4. เปรียบเทียบหลักสูตร (Compare) |
|:---:|:---:|
| ![Routes](03_WebApp/Pre_Present/assets/screenshots/app/routes-desktop.png) | ![Compare](03_WebApp/Pre_Present/assets/screenshots/app/compare-desktop.png) |

| 5. แผนปฏิบัติการ 30 วัน (Action Plan) | 6. ภารกิจสะสมหลักฐาน (Scenario Mission) |
|:---:|:---:|
| ![Action Plan](03_WebApp/Pre_Present/assets/screenshots/app/plan-desktop.png) | ![Missions](03_WebApp/Pre_Present/assets/screenshots/app/mission-desktop.png) |

---

## 🚦 สถานะความพร้อมของระบบ (System Readiness Matrix)

| สถานะ | องค์ประกอบ | รายละเอียดการทำงานจริง (Technical Audit) |
|:---:|---|---|
| **✅ พร้อมใช้งานใน Demo (Working Now)** | **Interactive Web Application** | ระบบ Next.js 15.5 รันจริง 11 Routes ครบวงจรตั้งแต่เริ่มจนจบแผน 30 วัน (โหมด Guest ใช้งานได้ทันที) |
| **✅ พร้อมใช้งานใน Demo (Working Now)** | **Deterministic Rule Engine** | คำนวณ Cosine Similarity + Kelley Shrinkage แมตช์ 23,257 หลักสูตรจริง (16,908 ปวช./ปวส. + 6,349 ป.ตรี จาก 993 สถาบัน) และคำนวณ Living Cost Index 5 ภาคอย่างแม่นยำ |
| **✅ พร้อมใช้งานใน Demo (Working Now)** | **Client-Side Privacy** | ข้อมูลทั้งหมดจัดเก็บใน Browser (LocalStorage) ปลอดภัย 100% ไม่เก็บข้อมูลระบุตัวตน (PII) หรือพิกัด GPS ละเอียด |
| **✅ พร้อมใช้งานใน Demo (Working Now)** | **Mascot & Socratic UI Flow** | หน้าจอจำลองการแชท (Mock/Template Dialogue) ตามกรอบ STAR Framework สำหรับนำเสนอ Flow การใช้งาน |
| **🟡 อยู่ระหว่างทดลองและวิจัย (In Validation & Research)** | **Live AI Model Testing** | การทดสอบเชื่อมต่อ Live LLM/SLM (Typhoon 2 / Qwen) กับนักเรียนจริง เพื่อวัดความแม่นยำของการถามตอบเชิงจิตวิทยาและป้องกันอาการหลอน (Hallucination) |
| **🟡 อยู่ระหว่างทดลองและวิจัย (In Validation & Research)** | **School Pilot Phase** | เตรียมนำระบบต้นแบบไปทดสอบนำร่องในโรงเรียน 3–5 แห่ง (สพฐ. และ สอศ.) ดูแลนักเรียน 1,500+ คน เพื่อ Re-calibrate น้ำหนักคะแนนตามพฤติกรรมจริง |
| **🔴 แผนพัฒนาต่อเนื่อง (Planned for Production)** | **AIS Infrastructure Integration** | การ Deploy บน AIS Cloud Data Vault ในประเทศ และการเชื่อมต่อ AIS Open API (Number Verification OTP) สำหรับยืนยันตัวตนครูแนะแนว |

---

## 🏗️ โครงสร้าง Repository (Clean Hackathon Standard)

```
winxtxrgit/futureme-ai
├── 01_Research/                 # ฐานความรู้, งานวิจัย, Evidence Catalog & ข้อมูลหลักสูตร 23,257 รายการ
│   ├── Theory_and_Standards/    # เอกสารทฤษฎีจิตวิทยา Holland RIASEC, Psychometric Review & Scoring Engine
│   ├── Geography_and_Access/    # ข้อมูลพิกัดสถาบัน, ค่าเดินทาง และ Living Cost Index 5 ภาค
│   └── Thai_AI_System_Research/ # คู่มืองานวิจัย Thai NLP, SLM, Vector Embedding & Security
├── 02_Backend/                  # FastAPI Backend, Deterministic Engine & RAG Pipelines
├── 03_WebApp/                   # Next.js 15.5 Interactive Web Application (Pre_Present)
│   ├── app/                     # หน้าเพจทั้ง 11 Routes & API Endpoints
│   ├── components/              # UI Components ตามทิศทาง GenZ Aurora
│   ├── data/                    # ฐานข้อมูลหลักสูตรและแบบสอบถาม
│   └── lib/                     # Matching Engine, Cosine Similarity & Utilities
├── 04_Design/                   # Design Systems, Wireframes, UI Concepts (GenZ Aurora Direction)
├── 05_Assets/                   # Brand Assets, รูปภาพประกอบ และ Media
├── Presentation/                # Master Presentation Deck (FutureMe_Presentation.pdf + HTML)
├── Archive/                     # จัดเก็บประวัติการพัฒนาและเอกสารบันทึกกระบวนการย้อนหลัง
├── FutureMe_Presentation.pdf    # สไลด์นำเสนอทางการ 7 หน้า (PDF 16:9 Widescreen)
├── FutureMe_Presentation.html   # สไลด์นำเสนอทางการ 7 หน้า (HTML)
├── FutureMe_Team_Portfolio.pdf  # เอกสารหลักฐานผลงาน 8 หน้า (Prototype Proof + ประวัติผู้พัฒนา)
├── FutureMe_Team_Portfolio.html # เอกสารผลงานต้นฉบับ HTML
├── README.md                    # เอกสารภาพรวมโครงการฉบับภาษาไทย (TH)
├── README_EN.md                 # เอกสารภาพรวมโครงการฉบับภาษาอังกฤษ (EN)
└── .gitignore                   # มาตรฐาน Git Ignore
```

---

## 💻 Quick Start — วิธีรันแอปพลิเคชัน

### ข้อกำหนดเบื้องต้น
* **Node.js:** เวอร์ชัน 20 ขึ้นไป
* **Package Manager:** npm

### ขั้นตอนการรัน
```bash
# 1. เข้าสู่โฟลเดอร์ Web Application
cd 03_WebApp/Pre_Present

# 2. ติดตั้ง dependencies (หากยังไม่ได้ติดตั้ง)
npm install

# 3. รันเซิร์ฟเวอร์สำหรับทดสอบ
npm run dev
```
เปิดบราวเซอร์ไปที่: **`http://localhost:3000`**

---

## ❓ คำถามที่พบบ่อย (Quick FAQ)

<details>
<summary><strong>1. สามารถทดลองใช้งานเดโมโดยไม่ต้องต่อ AI หรือ Backend ได้หรือไม่?</strong></summary>

ได้ 100% กระบวนการสำรวจทั้งหมดของผู้เรียน (ตั้งแต่ทำแบบประเมิน RIASEC 36 ข้อ, ภารกิจจำลอง Scenario Mission, ค้นหาเส้นทาง ไปจนถึงแผนปฏิบัติการ 30 วัน) รันอยู่บน Client-Side ภายในบราวเซอร์ทั้งหมดได้อย่างสมบูรณ์ โดยไม่ต้องพึ่งพาเซิร์ฟเวอร์ภายนอกหรือ API Key
</details>

<details>
<summary><strong>2. ข้อมูลสถิติอะไรที่เป็นแรงผลักดัน และ FutureMe พิสูจน์ผลลัพธ์ได้อย่างไร?</strong></summary>

จากข้อมูลสำรวจของ TDRI พบว่า **56% ของบัณฑิตไทยทำงานไม่ตรงสายที่เรียน** และ **27% ทำงานต่ำกว่าคุณวุฒิ** ขณะที่ WEF รายงานว่า **39% ของทักษะแรงงานจะเปลี่ยนไปใน 5 ปี** ตัวเลขเหล่านี้แสดงถึงความเสียหายจาก "การตัดสินใจโดยไม่มีหลักฐาน" FutureMe จึงถูกออกแบบมาเป็น **Continuous Evidence Ecosystem** เพื่อให้นักเรียนได้ทดลองทำภารกิจจริงก่อนเลือกสายการเรียน
</details>

<details>
<summary><strong>3. FutureMe การันตีการสอบติด หรือการได้งานทำ 100% หรือไม่?</strong></summary>

ไม่การันตี ผลลัพธ์เส้นทาง 0–3 ทางที่ระบบจัดอันดับให้คือ **"สมมติฐานเพื่อการสำรวจ (Exploration Hypotheses)"** ที่เปิดโอกาสให้นักเรียนนำไปศึกษาต่อยอด ไม่ใช่คำทำนายอนาคตหรือการรับประกันการรับเข้าศึกษา
</details>

<details>
<summary><strong>4. AI เป็นผู้ตัดสินใจเลือกเส้นทางให้เด็กใช่หรือไม่?</strong></summary>

**ไม่ใช่** ระบบยึดหลักปรัชญา **“Rules decide. AI explains.”** เส้นทางทั้งหมดถูกคำนวณและจัดอันดับด้วย **Deterministic Scoring Engine** (Cosine Similarity + Kelley Shrinkage) ซึ่งเป็นคณิตศาสตร์ที่โปร่งใส ตรวจสอบย้อนกลับได้ 100% โดยในเวอร์ชัน Demo ระบบใช้กฎคณิตศาสตร์ในการตัดสินใจ ส่วนการเชื่อมต่อ Live AI เพื่อซักถาม Socratic Chat กำลังอยู่ในขั้นตอนวิจัยและเตรียมทดสอบกับนักเรียนจริงใน Pilot Phase
</details>

<details>
<summary><strong>5. ระบบจับคู่หลักสูตรและสถาบันการศึกษาโดยอิงจากอะไร?</strong></summary>

ระบบแมตช์เวกเตอร์ความถนัดกับ **ฐานข้อมูล 23,257 หลักสูตรจริง** (16,908 ปวช./ปวส. + 6,349 ป.ตรี จาก 993 สถาบันทั่วไทย) ผสานกับข้อมูลพิกัดภูมิศาสตร์ 77 จังหวัด และ **Living Cost Index (ดัชนีค่าครองชีพ 5 ภูมิภาค)** เพื่อให้ผู้เรียนและผู้ปกครองมองเห็นความเป็นไปได้ทางการเงินจริง
</details>

<details>
<summary><strong>6. แบบประเมิน RIASEC ในระบบมีโครงสร้างอย่างไร?</strong></summary>

ระบบใช้ข้อคำถาม 36 ข้อ ครอบคลุม 6 มิติตามทฤษฎี Holland RIASEC เสริมด้วย **Self-Efficacy Scale (มาตรวัดความมั่นใจในสมรรถนะของตนเอง)** และการพูดคุยสะท้อนความคิดแบบ STAR Framework ทำให้วัดผลได้รอบด้านกว่าแบบทดสอบจิตวิทยาแบบดั้งเดิม
</details>

<details>
<summary><strong>7. ข้อมูลของผู้เรียนถูกจัดเก็บอย่างไร และปลอดภัยตามมาตรฐาน PDPA หรือไม่?</strong></summary>

* **ระดับ Client-Side:** ข้อมูลคำตอบและแผนการเรียนจะถูกบันทึกใน `LocalStorage` ภายในเครื่องของผู้เรียนเท่านั้น
* **โครงสร้างพื้นฐานระดับ Production:** รองรับการเชื่อมต่อกับ **AIS Cloud Data Vault** ในประเทศไทย เพื่อรับประกันเรื่อง Data Residency และใช้ **AIS Open API (Number Verification & OTP)** ในการยืนยันตัวตนครูแนะแนว โดยระบบ **ไม่เก็บพิกัด GPS ละเอียด** ของเด็กตามหลัก Privacy-by-Design & Data Minimization
</details>

<details>
<summary><strong>8. โมเดลธุรกิจและความยั่งยืนของโครงการ (Business & Sustainability Model) เป็นอย่างไร?</strong></summary>

* **B2C Freemium Model:** นักเรียนทุกคนเข้าถึงแบบประเมินและค้นหา 23,257 หลักสูตรฟรี 100% / มีระบบ Parent Career Pass (99 บ./เดือน หรือ 999 บ./ปี) สำหรับสรุปงบประมาณ 5 ปีและพอร์ตโฟลิโอ TCAS
* **B2G District License (เริ่มต้น 300,000 บ./ปี):** สิทธิ์ใช้งานระดับเขตพื้นที่/สถานศึกษา + National Interest Dashboard สำหรับ สอศ., ศธ., กสศ., อบจ. เพื่อนำ Insight ไปจัดสรรงบประมาณและทุนการศึกษา
* **B2B Institutional (เริ่มต้น 30,000 บ./ปี):** สิทธิ์ใช้งานระดับสถาบัน + Matching Portal สำหรับมหาวิทยาลัยและอาชีวะเอกชน
* **🌱 Sustainability Vision:** สร้างรายได้จากผู้ใช้งานและสถาบันตามความสามารถในการจ่าย เพื่อนำรายได้ส่วนหนึ่งมาสนับสนุนค่าใช้บริการสำหรับกลุ่มที่มีข้อจำกัดด้านงบประมาณ และเปิดโอกาสให้นักเรียนด้อยโอกาสเข้าถึงแพลตฟอร์มได้ฟรี 100%
</details>

<details>
<summary><strong>9. ผลการแนะนำสามารถตรวจสอบย้อนกลับ (Auditable) ได้หรือไม่?</strong></summary>

ได้ 100% เมื่อป้อนข้อมูลชุดเดิม ระบบจะให้ผลลัพธ์เส้นทางเหมือนเดิมเสมอ เนื่องจากเอนจินเป็นโค้ด TypeScript ที่โปร่งใส มีเกณฑ์คะแนนและเงื่อนไขการตัดเกรดที่ชัดเจน พร้อมแสดงที่มาของข้อมูล (Provenance) ในทุกหน้าจอ
</details>

<details>
<summary><strong>10. ความสดใหม่ของข้อมูล (Data Freshness) ถูกควบคุมอย่างไร?</strong></summary>

ฐานข้อมูลหลักสูตรมีการบันทึก Timestamp และแหล่งอ้างอิงจากหน่วยงานทางการ (สอศ., ทปอ., กสศ.) โดยระบบมีเงื่อนไขแจ้งเตือนความสดใหม่ (Data Freshness Warning) หากข้อมูลชุดใดมีอายุเกินเกณฑ์มาตรฐาน
</details>

<details>
<summary><strong>11. แผนการนำไปทดสอบจริงกับนักเรียน (Pilot Phase) มีขั้นตอนอย่างไร?</strong></summary>

เตรียมทดสอบนำร่องในโรงเรียน 3–5 แห่ง (ครอบคลุมทั้ง สพฐ. และ สอศ.) ดูแลนักเรียนกลุ่มแรก 1,500+ คน พร้อมเก็บข้อมูลวัดผล Re-calibration เอนจิน และรับฟังความคิดเห็นจากครูแนะแนวและผู้ปกครอง
</details>

<details>
<summary><strong>12. ตัวชี้วัดความสำเร็จของผลิตภัณฑ์ (Product Success Metrics) วัดจากอะไร?</strong></summary>

วัดจาก **คุณภาพการตัดสินใจจริงของผู้เรียน** เช่น อัตราการทำภารกิจ 30 วันสำเร็จ, ความมั่นใจที่เพิ่มขึ้นหลังทดลองทำจริง, ความสามารถในการอธิบายข้อดี-ข้อเสียของเส้นทางที่ตนเลือก และการลดอัตราการซิ่ว/เปลี่ยนสายในระยะยาว
</details>

<details>
<summary><strong>13. เอกสารและสไลด์นำเสนอทางการอยู่ที่ไหน?</strong></summary>

สามารถเข้าถึงได้โดยตรงที่:
* **Master Pitch Deck (7 หน้า):** [`FutureMe_Presentation.pdf`](FutureMe_Presentation.pdf)
* **Team Portfolio & Prototype Proof (8 หน้า):** [`FutureMe_Team_Portfolio.pdf`](FutureMe_Team_Portfolio.pdf)
* **เอกสารคลังงานวิจัย:** [`01_Research/`](01_Research/)
</details>

---

## 👥 ข้อมูลทีมผู้พัฒนา & พันธกิจ (Team & Vision)

* **ผู้พัฒนา:** นาย ธนัท จงธีรธนโชติ — นักศึกษาวิศวกรรมคอมพิวเตอร์ ชั้นปีที่ 3 สถาบันเทคโนโลยีจิตรลดา (CDTI)
* **อาจารย์ที่ปรึกษา:** ผู้ช่วยศาสตราจารย์ ดำรงค์ฤทธิ์ เศรษฐศิริโชค
* **พันธกิจ:** มุ่งพัฒนานวัตกรรมเพื่อลดปัญหาความไม่สอดคล้องทางการศึกษา (Educational Mismatch) และเปิดโอกาสให้เด็กไทยทุกคนได้ *"ลองเส้นทางอนาคต ก่อนตัดสินใจจริง"* อย่างเท่าเทียม
* **ลิขสิทธิ์:** MIT License (2026)

<p align="center"><a href="#top">⬆️ กลับสู่ด้านบน (Back to top)</a></p>
