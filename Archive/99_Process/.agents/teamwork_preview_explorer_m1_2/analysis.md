# Analysis Report: Milestone M1 (R1 Refactor Items 7-13)

**Author:** Explorer 2  
**Date:** 2026-07-22  
**Workspace:** `d:/My_server/University/3rd year/Hackathon_ais`  
**Target Scope:** R1 Refactor Items 7-13 (`Data/04`, `Data/05`, `Data/06`, `Data/07`, `Data/README.md`, `Data/REFERENCES.md`, and repository-wide)

---

## Executive Summary

A comprehensive, repository-wide investigation was conducted for Milestone M1 (R1 Refactor Items 7-13). All target files in `Data/` subdirectories (`04_Qualitative_Deep_Interviewing_Research`, `05_NDLP_Ministry_of_Education`, `06_AIS_Cloud_and_Infrastructure`, `07_System_Blueprints_and_Flowcharts`), `Data/README.md`, `Data/REFERENCES.md`, `hackathon_th/`, and root files were scanned and evaluated.

Exact file paths, line numbers, current text snippets, and required replacement/refactoring specifications have been cataloged for all 7 items.

---

## Itemized Investigation Findings & Replacement Catalog

### Item 7: 6 University Groups (Internal FuturePath Grouping Labeling)
- **Requirement:** Label the 6 university groups as an internal FuturePath grouping taxonomy rather than an official TCAS/ทปอ./กระทรวง อว. classification.
- **Identified Locations & Line Catalog:**
  1. **`Data/02_Thai_National_Curricula/03_Higher_Education_Curriculum.md`**
     - **Line 8:** `## 1. การจัดกลุ่มสาขาวิชาในระดับอุดมศึกษา (6 คณะ/สาขาหลัก)`
       - *Action:* Clarify heading to indicate internal FuturePath grouping.
     - **Line 10:** `ทปอ. และ กระทรวง อว. จัดหมวดหมู่สาขาวิชาในระดับปริญญาตรีออกเป็น 6 กลุ่มใหญ่ เพื่อระบบคัดเลือก TCAS:`
       - *Action:* Replace assertion with: `"เพื่อการวิเคราะห์และจับคู่เส้นทางเรียนต่อ ระบบ FuturePath ได้จัดหมวดหมู่สาขาวิชาอุดมศึกษาออกเป็น 6 กลุ่มหลัก (การจัดกลุ่มภายในของ FuturePath ไม่ใช่การจัดหมวดหมู่อย่างเป็นทางการของ TCAS):"`
     - **Line 13:** `6 กลุ่มสาขาวิชาอุดมศึกษา`
       - *Action:* Replace with `6 กลุ่มสาขาวิชาอุดมศึกษา (กรอบการจัดกลุ่มภายในของ FuturePath)`
  2. **`Data/02_Thai_National_Curricula/SUMMARY.md`**
     - **Line 15:** `├── เลือก สายสามัญ (ม.ปลาย) ➔ ม.4-ม.6 (วิทย์-คณิต / ศิลป์-คำนวณ / ศิลป์-ภาษา) ➔ TCAS 4 รอบ ➔ มหาวิทยาลัย (6 กลุ่มคณะ)`
       - *Action:* Replace `(6 กลุ่มคณะ)` with `(6 กลุ่มคณะ - การจัดกลุ่มภายใน FuturePath)`
     - **Line 23:** `... และมหาวิทยาลัย (6 กลุ่มคณะ TCAS) ไปสร้างเป็น Vector Knowledge Base ...`
       - *Action:* Replace `(6 กลุ่มคณะ TCAS)` with `(6 กลุ่มคณะ - กรอบจัดกลุ่มของ FuturePath)`
  3. **`Data/README.md`**
     - **Line 22:** `│ ├── 03_Higher_Education_Curriculum.md (หลักสูตรอุดมศึกษา TCAS 6 กลุ่มสาขาวิชา)`
       - *Action:* Replace with `│ ├── 03_Higher_Education_Curriculum.md (หลักสูตรอุดมศึกษา - การจัด 6 กลุ่มสาขาวิชาของ FuturePath)`
  4. **`Data/REFERENCES.md`**
     - **Line 31:** `* **ที่ประชุมอธิการบดีแห่งประเทศไทย (ทปอ. / myTCAS):** ... และเกณฑ์คัดเลือก 6 กลุ่มคณะในระดับอุดมศึกษา`
       - *Action:* Correct text to remove claim that 6 groups is an official TCAS classification, clarifying it as internal FuturePath taxonomy.

---

### Item 8: Portfolio Rounds Blanket Statements
- **Requirement:** Replace blanket statements regarding Portfolio rounds (e.g. claims that Portfolio round is without written exams / open without condition) with nuanced criteria statements.
- **Identified Locations & Line Catalog:**
  1. **`Data/02_Thai_National_Curricula/03_Higher_Education_Curriculum.md`**
     - **Line 54:** `1. **รอบที่ 1 Portfolio:** พิจารณาแฟ้มสะสมงาน ผลงาน กิจกรรม ไม่สอบข้อเขียน`
       - *Action:* Replace `"ไม่สอบข้อเขียน"` blanket claim with mandatory wording:
       - *Replacement:* `1. **รอบที่ 1 Portfolio:** พิจารณาแฟ้มสะสมงาน ผลงาน กิจกรรม (วิธีการคัดเลือกแตกต่างกันไปตามหลักสูตร และอาจรวมถึงการตรวจแฟ้มสะสมงาน การสัมภาษณ์ การทดสอบภาคปฏิบัติ หรือการประเมินอื่น ๆ / Selection methods vary by program and may include portfolio review, interviews, practical tests or other assessments)`

---

### Item 9: Science-Math Requirements Blanket Mandatory Rules
- **Requirement:** Remove or nuance rigid mandatory claims that Science-Math track (วิทย์-คณิต) is strictly required for all STEM/Healthcare programs, acknowledging program variations and alternative eligibility rules.
- **Identified Locations & Line Catalog:**
  1. **`Data/03_Career_Degree_and_Skills_Mapping/03_Healthcare_and_Wellness_Careers.md`**
     - **Line 9:** `* **ม.ปลาย:** สายวิทยาศาสตร์–คณิตศาสตร์ เท่านั้น`
       - *Action:* Replace `"สายวิทยาศาสตร์–คณิตศาสตร์ เท่านั้น"` with `"สายวิทยาศาสตร์–คณิตศาสตร์ (หรือผู้เรียนสายอื่นที่มีหน่วยกิตวิชาคำนวณ/วิทยาศาสตร์ และคะแนนสอบตามเกณฑ์ที่หลักสูตรกำหนด)"`
  2. **`Data/03_Career_Degree_and_Skills_Mapping/SUMMARY.md`**
     - **Line 17:** `| **3. Healthcare & Wellness** | วิทย์-คณิต เท่านั้น | แพทยศาสตร์ / พยาบาลศาสตร์ / สหเวชศาสตร์ | ...`
       - *Action:* Replace `"วิทย์-คณิต เท่านั้น"` with `"วิทย์-คณิต (หรือเทียบเท่าตามเกณฑ์ TCAS/กสพท)"`

---

### Item 10: AIS Cloud PDPA Claim
- **Requirement:** Refactor overstated AIS Cloud PDPA claims. State clearly that AIS Cloud provides in-country data residency and security certifications, while full PDPA compliance requires application-level controls (consent, RBAC, minimization, retention, governance).
- **Identified Locations & Line Catalog:**
  1. **`Data/06_AIS_Cloud_and_Infrastructure/SUMMARY.md`**
     - **Line 7:** `AIS Cloud มอบโครงสร้างพื้นฐานระดับ **THAI Hyperscale Cloud (Powered by OCI)** และ **Enterprise Cloud (VMware NSX)** ที่จัดเก็บและประมวลผลข้อมูลในประเทศไทย 100% ตอบโจทย์ทั้งเรื่องความเร็ว ความปลอดภัย และกฎหมาย PDPA สำหรับการรองรับเยาวชนและนักเรียนทั่วประเทศ`
       - *Action:* Replace blanket PDPA statement with exact required text: `"AIS Cloud รองรับการจัดเก็บข้อมูลในประเทศ (In-country Data Residency) และมาตรฐานความปลอดภัยที่เกี่ยวข้อง ทั้งนี้ การปฏิบัติตาม PDPA อย่างสมบูรณ์ยังต้องอาศัยการจัดการความยินยอม การควบคุมสิทธิ์ การย่อสัดส่วนข้อมูล การกำหนดระยะเวลาจัดเก็บ และการกำกับดูแลผู้ประมวลผลข้อมูลในระดับแอปพลิเคชัน (AIS Cloud supports in-country data residency and relevant security certifications. Compliance also requires consent, access control, minimization, retention and processor governance in the application.)"`
     - **Line 13:** `1. **100% Data Sovereignty & PDPA Compliance:** ข้อมูลเด็ก ผลการประเมิน และสถิติของโรงเรียนทั้งหมดจะถูกจัดเก็บใน Data Center ของ AIS ในประเทศไทย สอดคล้องตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคลอย่างสมบูรณ์`
       - *Action:* Replace title & text to remove `"สอดคล้องตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคลอย่างสมบูรณ์"` and clarify infrastructure vs application-level PDPA responsibilities.
  2. **`Data/06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md`**
     - **Line 29:** `* **100% Data Sovereignty:** ฐานข้อมูลและเซิร์ฟเวอร์จัดเก็บอยู่ภายในประเทศไทย 100% ตอบโจทย์ข้อบังคับด้านกฎหมายความปลอดภัยข้อมูล และ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)`
       - *Action:* Update line to reflect in-country data residency and security certifications while noting application-level compliance requirements.

---

### Item 11: NDLP/DEEP Integration Claim
- **Requirement:** Refactor claims of active integration/partnership with NDLP/DEEP to specify that integration is a future architectural possibility subject to official APIs, technical access, and partnership approval.
- **Identified Locations & Line Catalog:**
  1. **`Data/05_NDLP_Ministry_of_Education/SUMMARY.md`**
     - **Line 22:** `1. **ใช้เป็นข้อเสนอแนะเชิงนโยบาย (Government Partnership & Scale):** ในสไลด์ Business Model / Future Roadmap สามารถนำเสนอได้ว่า FutureMe AI สามารถปลั๊กอิน (Plug-in) เข้ากับระบบ **DEEP SSO** และ **NDLP** ของกระทรวงศึกษาธิการได้ทันที ...`
       - *Action:* Replace claim with required statement: `"การเชื่อมต่อกับระบบ NDLP/DEEP เป็นความเป็นไปได้ในอนาคต ซึ่งขึ้นอยู่กับเอกสาร API สิทธิ์การเข้าถึงทางเทคนิค และการอนุมัติความร่วมมืออย่างเป็นทางการ (NDLP/DEEP integration is a future possibility subject to official API documentation, technical access and partnership approval.)"`
  2. **`Data/07_System_Blueprints_and_Flowcharts/implementation_plan.md`**
     - **Line 22:** `* เชื่อมต่อและเสริมจุดแข็งของแพลตฟอร์มกระทรวงศึกษาธิการ ([NDLP](...) และ [DEEP SSO](...)) เพื่อเพิ่มความแม่นยำในการแนะแนว (Precision Recommendation)`
       - *Action:* Rephrase to indicate proposed future integration architecture subject to official approval and API availability.

---

### Item 12: AI Guidance Guarantee Claim
- **Requirement:** Replace absolute precision / performance guarantee claims with realistic evaluation statements.
- **Identified Locations & Line Catalog:**
  1. **`Data/04_Qualitative_Deep_Interviewing_Research/SUMMARY.md`**
     - **Line 7:** `... จะช่วยให้ AI สกัดความสนใจที่ซ่อนอยู่ (Latent Preferences) และทักษะจริงจากพฤติกรรมในอดีต (Past Actions) ออกมาได้อย่างแม่นยำ`
       - *Action:* Replace absolute accuracy assertion with required statement: `"ระบบมีเป้าหมายเพื่อช่วยสนับสนุนการตัดสินใจที่มีข้อมูลรอบด้าน โดยผลสัมฤทธิ์ต้องได้รับการประเมินจากข้อคิดเห็นของนักเรียนและครูแนะแนว (The system aims to support better-informed decisions. Its effect must be evaluated through student and counselor feedback.)"`
  2. **`Data/07_System_Blueprints_and_Flowcharts/implementation_plan.md`**
     - **Line 22:** `... เพื่อเพิ่มความแม่นยำในการแนะแนว (Precision Recommendation)`
       - *Action:* Replace absolute wording with required system goal disclaimer.

---

### Item 13: Link Integrity Scan & File Path Catalog
- **Requirement:** Scan all files for `file:///d:/...` absolute links and broken file references across the repository. Replace all absolute links with valid workspace-relative markdown paths.
- **Target Verification Result:** All 12 referenced target files exist on disk.
- **Identified Locations & Line Catalog (17 absolute links across 3 files):**

1. **`Data/07_System_Blueprints_and_Flowcharts/detailed_system_flowcharts.md`**
   - **Line 4:**
     - `[Advice_from_the_teacher.m4a](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Advice_from_the_teacher.m4a)` -> `[Advice_from_the_teacher.m4a](../../Advice_from_the_teacher.m4a)`
     - `[Data/](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/README.md)` -> `[Data/](../README.md)`
     - `[AIS Cloud](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md)` -> `[AIS Cloud](../06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md)`
     - `[Roadmap DAG](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/06_AIS_Cloud_and_Infrastructure/02_Interactive_Roadmap_DAG_Algorithm.md)` -> `[Roadmap DAG](../06_AIS_Cloud_and_Infrastructure/02_Interactive_Roadmap_DAG_Algorithm.md)`

2. **`Data/07_System_Blueprints_and_Flowcharts/implementation_plan.md`**
   - **Line 5:**
     - `[Advice_from_the_teacher.m4a](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Advice_from_the_teacher.m4a)` -> `[Advice_from_the_teacher.m4a](../../Advice_from_the_teacher.m4a)`
     - `[Data/](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/README.md)` -> `[Data/](../README.md)`
     - `[AIS Cloud](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md)` -> `[AIS Cloud](../06_AIS_Cloud_and_Infrastructure/01_AIS_Cloud_Architecture_and_Deployment.md)`
     - `[Detailed Flowcharts](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/07_System_Blueprints_and_Flowcharts/detailed_system_flowcharts.md)` -> `[Detailed Flowcharts](detailed_system_flowcharts.md)`
   - **Line 11:**
     - `[Advice_from_the_teacher.m4a](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Advice_from_the_teacher.m4a)` -> `[Advice_from_the_teacher.m4a](../../Advice_from_the_teacher.m4a)`
     - `[FutureMe_AI_Brief.pdf](file:///d:/My_server/University/3rd%20year/Hackathon_ais/hackathon_th/FutureMe_AI_Brief.pdf)` -> `[FutureMe_AI_Brief.pdf](../../hackathon_th/FutureMe_AI_Brief.pdf)`
   - **Line 22:**
     - `[NDLP](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/05_NDLP_Ministry_of_Education/01_NDLP_Platform_Architecture.md)` -> `[NDLP](../05_NDLP_Ministry_of_Education/01_NDLP_Platform_Architecture.md)`
     - `[DEEP SSO](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/05_NDLP_Ministry_of_Education/02_DEEP_and_Ecosystem_Integration.md)` -> `[DEEP SSO](../05_NDLP_Ministry_of_Education/02_DEEP_and_Ecosystem_Integration.md)`
   - **Line 53:**
     - `[detailed_system_flowcharts.md](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/07_System_Blueprints_and_Flowcharts/detailed_system_flowcharts.md)` -> `[detailed_system_flowcharts.md](detailed_system_flowcharts.md)`
   - **Line 110:**
     - `[`Data/`](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/README.md)` -> `[`Data/`](../README.md)`
   - **Line 112:**
     - `[detailed_system_flowcharts.md](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Data/07_System_Blueprints_and_Flowcharts/detailed_system_flowcharts.md)` -> `[detailed_system_flowcharts.md](detailed_system_flowcharts.md)`

3. **`Data/REFERENCES.md`**
   - **Line 62:** `[FutureMe_AI_Brief.pdf](file:///d:/My_server/University/3rd%20year/Hackathon_ais/hackathon_th/FutureMe_AI_Brief.pdf)` -> `[FutureMe_AI_Brief.pdf](../hackathon_th/FutureMe_AI_Brief.pdf)`
   - **Line 63:** `[FutureMe_AI_Deck.pdf](file:///d:/My_server/University/3rd%20year/Hackathon_ais/hackathon_th/FutureMe_AI_Deck.pdf)` -> `[FutureMe_AI_Deck.pdf](../hackathon_th/FutureMe_AI_Deck.pdf)`
   - **Line 64:** `[jump-thailand-2026-ideas.html](file:///d:/My_server/University/3rd%20year/Hackathon_ais/hackathon_th/jump-thailand-2026-ideas.html)` -> `[jump-thailand-2026-ideas.html](../hackathon_th/jump-thailand-2026-ideas.html)`
   - **Line 65:** `[Ais_technology.jpg](file:///d:/My_server/University/3rd%20year/Hackathon_ais/Ais_technology.jpg)` -> `[Ais_technology.jpg](../Ais_technology.jpg)`
   - **Line 66:** `[Thai_AI_System_Research/README.md](file:///d:/My_server/University/3rd%20year/Hackathon_ais/hackathon_th/Thai_AI_System_Research/README.md)` -> `[Thai_AI_System_Research/README.md](../hackathon_th/Thai_AI_System_Research/README.md)`

---

## Verification Method

Implementers can independently verify the catalog and future edits using PowerShell commands:
1. **Link Verification Command:**
   ```powershell
   powershell -Command "Get-ChildItem -Recurse -File -Exclude '*.zip','*.pdf','*.m4a','*.jpg' | Select-String -Pattern 'file:///d:'"
   ```
   *Expected result after refactor:* 0 matches.

2. **Item 7-12 Keywords Verification:**
   ```powershell
   powershell -Command "Select-String -Path 'Data/02_Thai_National_Curricula/03_Higher_Education_Curriculum.md' -Pattern '6 กลุ่ม|รอบที่ 1 Portfolio'"
   ```

---
