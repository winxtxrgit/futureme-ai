"""
STAR Qualitative Question Evaluator & Socratic Probing Engine.

Framework:
- STAR Behavioral Assessment (Situation, Task, Action, Result)
- Socratic Probing & Laddering Interview Technique
- Evaluates 5-8 qualitative interview questions
- Extracts strengths, learning style preferences, and qualitative behavioral signals.
"""

import re
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator


class STARQuestion(BaseModel):
    """Definition of a STAR / Socratic qualitative question."""
    question_id: int
    dimension: str  # Situation, Task, Action, Result, Socratic
    question_text_th: str
    target_skill_th: str
    applicable_tiers: List[str]  # e.g., ["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"]
    target_riasec: Optional[List[str]] = None  # e.g. ["R", "I"]


class STARResponse(BaseModel):
    """Student's qualitative response to a STAR / Socratic question."""
    question_id: int
    response_text: str = Field(..., min_length=1)
    situation_detail: Optional[str] = None
    task_detail: Optional[str] = None
    action_detail: Optional[str] = None
    result_detail: Optional[str] = None


class STAREvaluationResult(BaseModel):
    """Extracted behavioral signals, strengths, and learning style profile."""
    extracted_strengths: Dict[str, float] = Field(
        ..., description="Extracted strength tags and confidence score (0.0 to 1.0)"
    )
    top_strengths: List[str] = Field(..., description="Top 3 extracted strength tags")
    primary_learning_style: str = Field(
        ..., description="Primary learning style (hands_on_practical, visual_analytical, social_collaborative, self_directed_inquiry)"
    )
    learning_style_scores: Dict[str, float] = Field(
        ..., description="Score breakdown for each learning style"
    )
    star_completeness_score: float = Field(
        ..., ge=0.0, le=1.0, description="Overall STAR response completeness & reflection quality (0.0 to 1.0)"
    )
    action_initiative_score: float = Field(
        ..., ge=0.0, le=1.0, description="Action & personal initiative score (0.0 to 1.0)"
    )
    qualitative_summary_th: str = Field(..., description="Native Thai qualitative synthesis summary")


# Bank of Standardized Socratic / STAR Questions (5-8 selectable per student profile)
QUESTION_BANK: List[STARQuestion] = [
    STARQuestion(
        question_id=101,
        dimension="Situation",
        question_text_th="เล่าเกี่ยวกับงาน โครงการ หรือกิจกรรมกลุ่มที่คุณเคยทำแล้วเจอปัญหาหรืออุปสรรคให้ฟังหน่อย ตอนนั้นเกิดอะไรขึ้น?",
        target_skill_th="การตระหนักรู้ในปัญหาและบริบท",
        applicable_tiers=["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["R", "I", "A", "S", "E", "C"]
    ),
    STARQuestion(
        question_id=102,
        dimension="Task",
        question_text_th="ในสถานการณ์นั้น เป้าหมายหรือภารกิจที่คุณต้องทำให้สำเร็จคืออะไร และมีความสำคัญอย่างไร?",
        target_skill_th="การกำหนดเป้าหมายและความรับผิดชอบ",
        applicable_tiers=["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["R", "I", "A", "S", "E", "C"]
    ),
    STARQuestion(
        question_id=103,
        dimension="Action",
        question_text_th="คุณได้ลงมือทำอะไรบ้างเพื่อแก้ปัญหาด้วยตนเอง? คุยกับใคร ใช้เครื่องมือหรือวิธีไหนในการแก้ปัญหา?",
        target_skill_th="การลงมือทำและการแก้ปัญหาเฉพาะหน้า",
        applicable_tiers=["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["R", "I", "E"]
    ),
    STARQuestion(
        question_id=104,
        dimension="Action",
        question_text_th="เวลาเรียนรู้เรื่องใหม่หรือเครื่องมือใหม่ คุณชอบลองทำจริง ค้นหาข้อมูลวิเคราะห์ หรือพูดคุยแลกเปลี่ยนกับเพื่อนมากกว่า?",
        target_skill_th="รูปแบบการเรียนรู้และการสืบค้น",
        applicable_tiers=["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["I", "A", "S"]
    ),
    STARQuestion(
        question_id=105,
        dimension="Result",
        question_text_th="ผลลัพธ์สุดท้ายเป็นอย่างไร งานสำเร็จตามเป้าหมายไหม และคุณรู้สึกหรือเรียนรู้อะไรจากเหตุการณ์นั้น?",
        target_skill_th="การสะท้อนความคิดและการประเมินผลลัพธ์",
        applicable_tiers=["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["R", "I", "A", "S", "E", "C"]
    ),
    STARQuestion(
        question_id=106,
        dimension="Socratic",
        question_text_th="ถ้ามีโอกาสกลับไปทำกิจกรรมนั้นอีกครั้ง คุณอยากจะปรับเปลี่ยนหรือลองทำวิธีไหนเพิ่มเติม เพราะเหตุใด?",
        target_skill_th="ความคิดสร้างสรรค์และการพัฒนาต่อเนื่อง",
        applicable_tiers=["LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["I", "A", "E"]
    ),
    STARQuestion(
        question_id=107,
        dimension="Socratic",
        question_text_th="อะไรคือสิ่งที่คุณทำแล้วรู้สึกมีความสุข ลืมเวลา หรือรู้สึกว่าตนเองถนัดและทำได้ดีที่สุด?",
        target_skill_th="การค้นพบแรงจูงใจภายใน (Intrinsic Motivation)",
        applicable_tiers=["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["R", "I", "A", "S", "E", "C"]
    ),
    STARQuestion(
        question_id=108,
        dimension="Socratic",
        question_text_th="เวลาต้องทำงานร่วมกับเพื่อน คุณชอบรับบทบาทเป็นคนนำเสนอ ผู้คิดไอเดีย คนวางตารางงาน หรือคนลงมือทำชิ้นงาน?",
        target_skill_th="บทบาทในทีมและการทำงานร่วมกัน",
        applicable_tiers=["PRIMARY", "LOWER_SECONDARY", "UPPER_SECONDARY", "VOCATIONAL"],
        target_riasec=["S", "E", "C", "R"]
    ),
]


# Keyword mapping rules for Strength extraction
STRENGTH_KEYWORDS: Dict[str, List[str]] = {
    "analytical_thinking": ["วิเคราะห์", "ค้นหา", "ข้อมูล", "เหตุผล", "ทฤษฎี", "ทดลอง", "สถิติ", "โค้ด", "โปรแกรม", "สงสัย", "ตรรกะ"],
    "creative_problem_solving": ["วาด", "ออกแบบ", "ไอเดีย", "สร้างสรรค์", "ใหม่", "ดัดแปลง", "รูปภาพ", "สื่อ", "แต่ง", "จินตนาการ"],
    "leadership": ["นำ", "ชวน", "โครงการ", "ตัดสินใจ", "บริหาร", "รับผิดชอบ", "เป้าหมาย", "วางแผน", "กระตุ้น"],
    "teamwork_collaboration": ["เพื่อน", "รับฟัง", "สอน", "ช่วยเหลือ", "กลุ่ม", "พูดคุย", "สื่อสาร", "จิตอาสา", "ทีม워크", "ร่วมมือ"],
    "practical_execution": ["ซ่อม", "ลงมือทำ", "เครื่องมือ", "สร้าง", "ต่อ", "ประกอบ", "ประดิษฐ์", "อุปกรณ์", "ทดลองทำ"],
    "organization_discipline": ["ตาราง", "เอกสาร", "ระเบียบ", "ขั้นตอน", "ถูกต้อง", "บัญชี", "จัดการเวลา", "ระบบ", "มาตรฐาน"]
}

# Keyword mapping rules for Learning Style identification
LEARNING_STYLE_KEYWORDS: Dict[str, List[str]] = {
    "hands_on_practical": ["ลงมือทำ", "ทดลอง", "ซ่อม", "ต่อ", "ประกอบ", "ปฏิบัติ", "ทำจริง", "จับอุปกรณ์", "ประดิษฐ์"],
    "visual_analytical": ["อ่าน", "วิเคราะห์", "ดูรูป", "กราฟ", "ข้อมูล", "เขียนโค้ด", "ทำความเข้าใจ", "ทฤษฎี", "ตรรกะ"],
    "social_collaborative": ["พูดคุย", "แลกเปลี่ยน", "ถามเพื่อน", "ทำเป็นกลุ่ม", "เรียนกับเพื่อน", "สอน", "ปรึกษา", "ฟัง"],
    "self_directed_inquiry": ["ค้นหาเอง", "ค้น Google", "ลองผิดลองถูก", "อ่านเอง", "ศึกษาเอง", "ค้นคว้า", "อิสระ"]
}


def select_adaptive_star_questions(
    tier: str = "UPPER_SECONDARY",
    primary_riasec: str = "I",
    num_questions: int = 6
) -> List[STARQuestion]:
    """
    Selects 5 to 8 adaptive STAR / Socratic questions matching student tier and top interest.
    """
    num_q = max(5, min(8, num_questions))
    tier_upper = tier.upper()

    eligible = [q for q in QUESTION_BANK if tier_upper in q.applicable_tiers]
    matched = [q for q in eligible if q.target_riasec and primary_riasec in q.target_riasec]
    unmatched = [q for q in eligible if q not in matched]

    selected = matched + unmatched
    return selected[:num_q]


def evaluate_star_responses(
    responses: Union[List[dict], List[STARResponse]]
) -> STAREvaluationResult:
    """
    Evaluates qualitative student responses to STAR / Socratic questions.
    """
    parsed_responses: List[STARResponse] = []
    for r in responses:
        if isinstance(r, STARResponse):
            parsed_responses.append(r)
        elif isinstance(r, dict):
            parsed_responses.append(STARResponse(**r))

    combined_text = " ".join([r.response_text for r in parsed_responses]).lower()

    # 1. Score strengths
    strength_scores: Dict[str, float] = {}
    for strength_key, keywords in STRENGTH_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in combined_text)
        score = min(1.0, round(hits * 0.25 + 0.2, 2)) if hits > 0 else 0.1
        strength_scores[strength_key] = score

    sorted_strengths = sorted(strength_scores.items(), key=lambda x: x[1], reverse=True)
    top_strengths = [item[0] for item in sorted_strengths[:3]]

    # 2. Score learning styles
    learning_style_scores: Dict[str, float] = {}
    for style_key, keywords in LEARNING_STYLE_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in combined_text)
        score = min(1.0, round(hits * 0.25 + 0.25, 2)) if hits > 0 else 0.20
        learning_style_scores[style_key] = score

    sorted_styles = sorted(learning_style_scores.items(), key=lambda x: x[1], reverse=True)
    primary_learning_style = sorted_styles[0][0] if sorted_styles else "hands_on_practical"

    # 3. STAR completeness & action score
    total_length = sum(len(r.response_text) for r in parsed_responses)
    action_keywords = ["ทำ", "แก้", "สร้าง", "เขียน", "คิด", "ชวน", "ปรึกษา", "ลอง", "ทดลอง", "จัด", "ซ่อม"]
    action_hits = sum(1 for kw in action_keywords if kw in combined_text)

    action_initiative_score = min(1.0, round(0.3 + (action_hits * 0.12), 2))
    star_completeness_score = min(1.0, round(0.4 + (total_length / 400.0) * 0.6, 2))

    # 4. Native Thai Summary
    style_names_th = {
        "hands_on_practical": "การลงมือปฏิบัติจริง (Hands-on Practical)",
        "visual_analytical": "การวิเคราะห์และสืบค้นเชิงตรรกะ (Visual & Analytical)",
        "social_collaborative": "การเรียนรู้ผ่านการสื่อสารและทำงานเป็นทีม (Social & Collaborative)",
        "self_directed_inquiry": "การศึกษาค้นคว้าด้วยตนเอง (Self-directed Inquiry)"
    }
    strength_names_th = {
        "analytical_thinking": "การคิดวิเคราะห์เชิงตรรกะ",
        "creative_problem_solving": "ความคิดสร้างสรรค์และการแก้ปัญหา",
        "leadership": "ภาวะผู้นำและการริเริ่มโครงการ",
        "teamwork_collaboration": "การทำงานเป็นทีมและการสื่อสาร",
        "practical_execution": "ทักษะการลงมือทำจริงและงานช่าง",
        "organization_discipline": "ความมีระเบียบและการจัดการระบบ"
    }

    top_str_th = [strength_names_th.get(s, s) for s in top_strengths]
    summary_th = (
        f"ผู้เรียนแสดงจุดแข็งเด่นชัดในด้าน {', '.join(top_str_th)} "
        f"มีรูปแบบการเรียนรู้หลักแบบ {style_names_th.get(primary_learning_style, primary_learning_style)} "
        f"พร้อมด้วยระดับความกระตือรือร้นในการลงมือแก้ปัญหา (Action Initiative) ที่ {int(action_initiative_score * 100)}%"
    )

    return STAREvaluationResult(
        extracted_strengths=strength_scores,
        top_strengths=top_strengths,
        primary_learning_style=primary_learning_style,
        learning_style_scores=learning_style_scores,
        star_completeness_score=star_completeness_score,
        action_initiative_score=action_initiative_score,
        qualitative_summary_th=summary_th
    )


class STAREvaluator:
    """
    Class wrapper for 5-8 Adaptive Socratic / STAR Qualitative Question Evaluator.
    Evaluates student answers and returns structured behavioral feedback.
    """

    def __init__(self, question_bank: Optional[List[STARQuestion]] = None):
        self.question_bank = question_bank or QUESTION_BANK

    def evaluate_answers(self, answers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Evaluates qualitative student answers.
        Returns a dict containing: score, feedback, adaptive_questions, extracted_strengths, top_strengths, primary_learning_style, etc.
        """
        parsed_responses: List[STARResponse] = []
        for i, a in enumerate(answers):
            if isinstance(a, dict):
                text = a.get("text") or a.get("response_text") or a.get("answer") or ""
                qid = a.get("question_id") or a.get("id") or (101 + i)
                parsed_responses.append(STARResponse(question_id=qid, response_text=text))
            elif isinstance(a, STARResponse):
                parsed_responses.append(a)

        if not parsed_responses:
            eval_res = evaluate_star_responses([STARResponse(question_id=101, response_text="ยังไม่มีคำตอบ")])
        else:
            eval_res = evaluate_star_responses(parsed_responses)

        adaptive_qs = [
            q.question_text_th for q in select_adaptive_star_questions(
                tier="UPPER_SECONDARY",
                primary_riasec="I",
                num_questions=3
            )
        ]

        composite_score = round(
            (eval_res.star_completeness_score * 0.4) +
            (eval_res.action_initiative_score * 0.6),
            2
        )

        return {
            "score": composite_score,
            "feedback": eval_res.qualitative_summary_th,
            "adaptive_questions": adaptive_qs,
            "extracted_strengths": eval_res.extracted_strengths,
            "top_strengths": eval_res.top_strengths,
            "primary_learning_style": eval_res.primary_learning_style,
            "learning_style_scores": eval_res.learning_style_scores,
            "star_completeness_score": eval_res.star_completeness_score,
            "action_initiative_score": eval_res.action_initiative_score,
            "qualitative_summary_th": eval_res.qualitative_summary_th
        }

