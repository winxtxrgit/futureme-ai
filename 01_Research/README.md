# 01_Research — คลังงานวิจัย สถิติอ้างอิง และฐานข้อมูลหลักสูตร

> **สถานะ:** แหล่งความจริงเชิงประจักษ์ (Evidence-Based Research) ของโครงการ FutureMe AI

---

## 🧭 สารบัญและโครงสร้างภายใน

| โฟลเดอร์ / ไฟล์ | คำอธิบายและเนื้อหาสำคัญ |
|---|---|
| [Theory_and_Standards/](Theory_and_Standards/) | **[NEW] ทฤษฎีจิตวิทยาและการประเมิน:** Holland RIASEC (6 มิติ), Self-Efficacy Scale, STAR Framework, Psychometric Fact-Check Review, Multi-Layer Scoring Framework และ Academic References |
| [Geography_and_Access/](Geography_and_Access/) | **ข้อมูลพิกัดและค่าเดินทาง:** พิกัดสถาบัน (Lat/Long), แผนการรับนักเรียน, การคำนวณระยะทาง (Geo-Distance) และดัชนีค่าครองชีพ 5 ภูมิภาค (Living Cost Index) |
| [Recommendation_Engine/](Recommendation_Engine/) | **เอนจินการจัดอันดับ:** อัลกอริทึม Cosine Similarity + Kelley Shrinkage, เมทริกซ์ 12 สาขาอาชีพ และฐานข้อมูล 23,257 หลักสูตรจริง |
| [Adaptive_Questionnaire/](Adaptive_Questionnaire/) | **แบบประเมินแบบปรับตัว:** สเปกข้อสอบ CAT (Computerized Adaptive Testing), กฎการแตกกิ่ง (Branching Rules), Stopping Rules และคลังคำถาม 90 ข้อ |
| [Data/](Data/) | **ข้อมูลสถิติ 7 หมวด:** สถิติการว่างงาน/mismatch จาก TDRI, หลักสูตรการศึกษาไทย, Career-Skills Mapping, รายงานสัมภาษณ์เชิงลึก, เอกสาร NDLP (ศธ.) และ AIS Cloud Infrastructure |
| [Thai_AI_System_Research/](Thai_AI_System_Research/) | **คู่มืองานวิจัยระบบ AI ไทย 18 บท:** Thai NLP, SLM fine-tuning, RAG Architecture, Vector Embedding, LoRA/QLoRA, Evaluation Metrics และ Security |
| [Source_Documents/](Source_Documents/) | เอกสารตั้งต้นและ Concept Brief ของโปรเจกต์ |
| [Evidence_Catalog.md](Evidence_Catalog.md) | บัญชีรายการหลักฐานและการตรวจสอบความถูกต้องของสถิติและตัวเลขอ้างอิงทั้งหมด |

---

## 🎯 จุดเด่นของงานวิจัยใน FutureMe AI
1. **Zero Hallucination with Real Data:** ใช้ข้อมูลหลักสูตรการศึกษาจริงจาก สอศ., ทปอ. และ กสศ. รวม **23,257 หลักสูตร** (16,908 ปวช./ปวส. + 6,349 ป.ตรี จาก 993 สถาบัน)
2. **Psychometric Rigor:** ยึดตามทฤษฎี RIASEC ของ John L. Holland ร่วมกับทฤษฎีการรับรู้ความสามารถตนเอง (Self-Efficacy) ของ Albert Bandura
3. **Hyper-Localized Cost Model:** คำนวณความคุ้มค่าและโอกาสทางการเงินตามดัชนีค่าครองชีพจริง 5 ภูมิภาคในประเทศไทย
