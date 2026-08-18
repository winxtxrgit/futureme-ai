import json
import os
from typing import Dict, List, Any


def generate_qwen_qlora_dataset(output_path: str = "data/qwen_qlora_dataset.jsonl") -> str:
    """
    Generates Qwen3-4B QLoRA instruction dataset in valid JSONL format.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    dataset_samples = [
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "นักเรียนจบ ม.3 สนใจสายคอมพิวเตอร์และอยากฝึกงานจริง มีทางเลือกการเรียนต่ออย่างไรบ้าง?",
            "output": "สำหรับผู้สำเร็จการศึกษาชั้น ม.3 ที่สนใจด้านคอมพิวเตอร์และต้องการฝึกปฏิบัติงานจริง สามารถเลือกศึกษาต่อในระดับประกาศนียบัตรวิชาชีพ (ปวช.) 2567 กลุ่มสาขาวิชาดิจิทัลและไอที หรือกลุ่มสาขาอุตสาหกรรม (สาขาเมคคาทรอนิกส์/อิเล็กทรอนิกส์) ในรูปแบบการศึกษาระบบทวิภาคี (Dual Vocational Education - DVE) ซึ่งเป็นการเรียนร่วมกันระหว่างวิทยาลัยอาชีวศึกษากับสถานประกอบการ ได้ฝึกงานจริง ได้รับเบี้ยเลี้ยง และมีโอกาสได้รับการบรรจุเข้าทำงานทันทีหลังสำเร็จการศึกษา"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "สอบ TPAT2 เหมาะสำหรับผู้ที่ต้องการเข้าศึกษาในคณะใด และเน้นวัดความถนัดด้านใด?",
            "output": "คะแนน TPAT2 (ความถนัดศิลปกรรมศาสตร์) ตามกรอบ MyTCAS เหมาะสำหรับผู้ที่ต้องการเข้าศึกษาในกลุ่มสาขาศิลปกรรม สถาปัตยกรรม และการออกแบบ เช่น คณะศิลปกรรมศาสตร์, ดุริยางคศิลป์, นาฏศิลป์, ดิจิทัลอาร์ต/แอนิเมชัน และการออกแบบนิเทศศิลป์ โดยเน้นวัดความถนัดและความรู้เชิงสร้างสรรค์ทางศิลปะ"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "อธิบายกลุ่มสาขาวิชาหลัก ปวช. 2567 ทั้ง 12 กลุ่มสาขาตามประกาศ สอศ.",
            "output": "หลักสูตร ปวช. พ.ศ. 2567 โดย สอศ. แบ่งออกเป็น 12 กลุ่มสาขาวิชาหลัก ได้แก่: 1. อุตสาหกรรม 2. บริหารธุรกิจ 3. คหกรรม 4. ท่องเที่ยว 5. สุขภาพและความงาม 6. โลจิสติกส์ 7. อาหาร 8. ศิลปกรรมและเศรษฐกิจครีเอทีฟ 9. เกษตรกรรมและประมง 10. แฟชั่นและสิ่งทอ 11. ดิจิทัลและไอที และ 12. เอ็นเตอร์เทนเมนต์"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "วิเคราะห์ผลการประเมิน RIASEC แบบ R-I-A (Realistic, Investigative, Artistic) และเสนอ 3 เส้นทางแนะนำ",
            "output": "ผู้ที่มีผล RIASEC เด่นในกลุ่ม R-I-A มีจุดแข็งด้านการคิดวิเคราะห์ ชอบการลงมือปฏิบัติจริง และมีความคิดสร้างสรรค์ ขอเสนอ 3 เส้นทางแนะนำ: 1. Balanced Next Step: สาขาวิศวกรรมซอฟต์แวร์หรือการออกแบบเกม 2. Interest Growth Route: สาขาดิจิทัลอาร์ต 3D และแอนิเมชัน 3. Practical Access Route: ปวช. กลุ่มดิจิทัลและไอที / ศิลปกรรมและเศรษฐกิจครีเอทีฟ ระบบทวิภาคี"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "อธิบายเกณฑ์การให้น้ำหนัก Decision Matrix 5 ด้านของ FuturePath",
            "output": "Decision Matrix ของ FuturePath ใช้การคำนวณถ่วงน้ำหนัก 5 ด้านรวม 100%: 1. ความสนใจ (Interests) 30% 2. ความถนัด/จุดแข็ง (Strengths) 20% 3. รูปแบบการเรียนรู้ (Learning Style) 15% 4. ความเป็นไปได้และโอกาสสำเร็จ (Feasibility) 25% 5. ความยืดหยุ่นในอนาคต (Future Flexibility) 10%"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "การประเมินคำตอบเชิงคุณภาพด้วยวิธี STAR (Situation, Task, Action, Result) มีหลักการอย่างไร?",
            "output": "การประเมินด้วยวิธี STAR จะวิเคราะห์คำตอบของผู้เรียน 4 ส่วน: Situation (สถานการณ์หรือโจทย์ที่เจอ), Task (เป้าหมายหรือหน้าที่รับผิดชอบ), Action (กระบวนการลงมือแก้ปัญหาจริง), Result (ผลลัพธ์และบทเรียนที่ได้รับ) เพื่อประเมินสมรรถนะจริงและสร้างคำถามปรับเปลี่ยนตามบริบท (Adaptive Questions)"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "TPAT3 และ TPAT5 แตกต่างกันอย่างไร และใช้ยื่นคณะใดบ้าง?",
            "output": "TPAT3 วัดความถนัดวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์ ใช้สำหรับการยื่นเข้าคณะวิศวกรรมศาสตร์ วิทยาศาสตร์ และเทคโนโลยีสารสนเทศ ส่วน TPAT5 วัดความถนัดทางวิชาชีพครู ใช้สำหรับการยื่นเข้าคณะครูศาสตร์และศึกษาศาสตร์"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "ข้อมูลอัตราการเปลี่ยนแปลงทักษะแรงงานตามรายงาน WEF 2025 เป็นอย่างไร?",
            "output": "รายงาน WEF Future of Jobs Report 2025 ระบุว่า ทักษะหลักของแรงงานทั่วโลกคาดว่าจะเกิดการเปลี่ยนแปลง 39% ในช่วงปี 2025–2030"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "สายการเรียน ม.ปลาย สำหรับผู้สนใจวิทยาศาสตร์สุขภาพ ต้องเตรียมสอบคะแนนอะไรบ้าง?",
            "output": "สำหรับผู้สนใจกลุ่มวิทยาศาสตร์สุขภาพ (แพทยศาสตร์ ทันตแพทยศาสตร์ เภสัชศาสตร์ สัตวแพทยศาสตร์) จะเน้นคะแนน TPAT1 (กสพท) ร่วมกับคะแนน A-Level วิชาชีววิทยา เคมี ฟิสิกส์ คณิตศาสตร์ 1 และภาษาอังกฤษ"
        },
        {
            "instruction": "คุณคือ AI ผู้เชี่ยวชาญด้านระบบการศึกษาไทยและแนะแนวอาชีพ (FuturePath AI)",
            "input": "ระบบแนะแนวของ FuturePath ให้บริการแก่นักเรียนระดับใดบ้าง?",
            "output": "FuturePath รองรับผู้เรียน 4 ระดับ: 1. ประถมศึกษาตอนปลาย (ป.4-ป.6) 2. มัธยมศึกษาตอนต้น (ม.1-ม.3) 3. มัธยมศึกษาตอนปลาย (ม.4-ม.6) 4. สายอาชีวศึกษา (ปวช./ปวส.)"
        }
    ]

    # Write out as JSONL
    with open(output_path, "w", encoding="utf-8") as f:
        for item in dataset_samples:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")

    return output_path


def validate_dataset_schema(file_path: str) -> float:
    """
    Validates JSONL dataset lines against Qwen3-4B QLoRA instruction schema.
    Returns valid schema percentage (0.0 - 1.0).
    Target: >= 0.98 (98%)
    """
    if not os.path.exists(file_path):
        return 0.0

    valid_lines = 0
    total_lines = 0

    required_keys = {"instruction", "input", "output"}

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line_str = line.strip()
            if not line_str:
                continue
            total_lines += 1
            try:
                data = json.loads(line_str)
                if isinstance(data, dict):
                    if required_keys.issubset(data.keys()):
                        # Check non-empty text strings
                        if all(isinstance(data[k], str) and len(data[k].strip()) > 0 for k in required_keys):
                            valid_lines += 1
            except Exception:
                pass

    if total_lines == 0:
        return 0.0

    ratio = valid_lines / total_lines
    return round(ratio, 4)


if __name__ == "__main__":
    path = generate_qwen_qlora_dataset()
    val = validate_dataset_schema(path)
    print(f"Generated Qwen QLoRA dataset: {path}")
    print(f"Schema Validity: {val * 100:.2f}%")
