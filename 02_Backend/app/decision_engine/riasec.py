"""
RIASEC Career Interest Assessment Parser and Scorer.

Provides a 30-item RIASEC vocational-interest assessment framework:
- 6 Holland Personality / Vocational Interest dimensions:
  - R: Realistic (นักปฏิบัติ / จับต้องได้)
  - I: Investigative (นักวิเคราะห์ / ค้นหาความจริง)
  - A: Artistic (นักสร้างสรรค์ / อิสระ)
  - S: Social (นักช่วยเหลือ / สื่อสาร)
  - E: Enterprising (นักโน้มน้าว / ผู้นำ)
  - C: Conventional (นักจัดการ / เป็นระบบ)
- 30 standardized assessment items (5 items per dimension).
- Response parser & scoring engine computing raw scores, normalized scores,
  Holland codes (e.g., 'RIA'), and percentage breakdowns.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator


class RIASECItem(BaseModel):
    """Definition of a RIASEC assessment item."""
    item_id: int
    code: str
    dimension: str  # R, I, A, S, E, C
    statement_th: str
    category_th: str


class RIASECResponse(BaseModel):
    """User response to a single RIASEC assessment item."""
    item_id: int
    score: float = Field(..., ge=1.0, le=5.0, description="Likert score between 1.0 and 5.0")

    @field_validator("score")
    def validate_score_range(cls, v: float) -> float:
        if v < 1.0 or v > 5.0:
            raise ValueError("RIASEC item score must be between 1.0 and 5.0")
        return float(v)


class RIASECScoreResult(BaseModel):
    """Comprehensive score summary from RIASEC assessment."""
    raw_scores: Dict[str, float] = Field(..., description="Raw score sum per dimension (range 5-25)")
    normalized_scores: Dict[str, float] = Field(..., description="Normalized score 0.0 - 1.0 per dimension")
    dimension_percentages: Dict[str, float] = Field(..., description="Percentage contribution per dimension")
    primary_code: str = Field(..., description="Top 1 RIASEC dimension code (e.g. 'I')")
    holland_code: str = Field(..., description="Top 3 RIASEC dimension code (e.g. 'ISA')")
    sorted_dimensions: List[str] = Field(..., description="All 6 dimensions sorted by score descending")


# Default 30-item RIASEC Assessment Questionnaire (5 items per dimension)
DEFAULT_RIASEC_ITEMS: List[RIASECItem] = [
    # --- Realistic (R) ---
    RIASECItem(
        item_id=1,
        code="R1",
        dimension="R",
        statement_th="ชอบลงมือซ่อมแซม อุปกรณ์ ชิ้นส่วนสิ่งของ หรือเครื่องมือต่างๆ ด้วยตนเอง",
        category_th="ทักษะการซ่อมบำรุงและเครื่องมือ"
    ),
    RIASECItem(
        item_id=2,
        code="R2",
        dimension="R",
        statement_th="สนใจการทำงานกลางแจ้ง งานช่าง หรืองานประดิษฐ์ที่ต้องใช้แรงและทักษะมือ",
        category_th="งานช่างและการปฏิบัติจริง"
    ),
    RIASECItem(
        item_id=3,
        code="R3",
        dimension="R",
        statement_th="ชอบการประเดิดหรือต่อประกอบโมเดล ชิ้นส่วนฮาร์ดแวร์ หรือหุ่นยนต์",
        category_th="การต่อประกอบและกลไก"
    ),
    RIASECItem(
        item_id=4,
        code="R4",
        dimension="R",
        statement_th="รู้สึกผ่อนคลายเมื่อได้ทำงานกับวัตถุ อุปกรณ์ หรือเครื่องจักรที่จับต้องได้",
        category_th="อุปกรณ์และเครื่องจักร"
    ),
    RIASECItem(
        item_id=5,
        code="R5",
        dimension="R",
        statement_th="ชอบแก้ปัญหาด้วยการลงมือทดลองทำจริงมากกว่าการพูดคุยทฤษฎี",
        category_th="การทดลองปฏิบัติจริง"
    ),

    # --- Investigative (I) ---
    RIASECItem(
        item_id=6,
        code="I1",
        dimension="I",
        statement_th="ชอบค้นหาสาเหตุ เหตุผล และการทำงานของสิ่งต่างๆ อย่างลึกซึ้ง",
        category_th="การสืบค้นและค้นหาความจริง"
    ),
    RIASECItem(
        item_id=7,
        code="I2",
        dimension="I",
        statement_th="สนุกกับการแก้โจทย์คณิตศาสตร์ วิทยาศาสตร์ หรือปริศนาที่ซับซ้อน",
        category_th="การแก้โจทย์เชิงตรรกะ"
    ),
    RIASECItem(
        item_id=8,
        code="I3",
        dimension="I",
        statement_th="ชอบวิเคราะห์ข้อมูล สถิติ หรืออ่านงานวิจัยเพื่อทำความเข้าใจปรากฏการณ์",
        category_th="การวิเคราะห์ข้อมูลและงานวิจัย"
    ),
    RIASECItem(
        item_id=9,
        code="I4",
        dimension="I",
        statement_th="สนใจเรียนรู้เทคโนโลยีใหม่ๆ โค้ดโปรแกรม หรือทฤษฎีทางวิทยาศาสตร์",
        category_th="เทคโนโลยีและวิทยาการ"
    ),
    RIASECItem(
        item_id=10,
        code="I5",
        dimension="I",
        statement_th="ชอบตั้งคำถามและหาข้อสรุปจากหลักฐานและข้อมูลที่รวบรวมได้",
        category_th="การคิดเชิงหลักฐาน"
    ),

    # --- Artistic (A) ---
    RIASECItem(
        item_id=11,
        code="A1",
        dimension="A",
        statement_th="ชอบสร้างสรรค์ผลงานศิลปะ วาดภาพ ออกแบบ หรือตกแต่งสิ่งต่างๆ",
        category_th="ศิลปะและการออกแบบ"
    ),
    RIASECItem(
        item_id=12,
        code="A2",
        dimension="A",
        statement_th="ชอบแสดงออกทางความรู้สึกผ่านการเขียน แต่งเพลง แต่งเรื่อง หรือสื่อมัลติมีเดีย",
        category_th="การแต่งเรื่องและสื่อสร้างสรรค์"
    ),
    RIASECItem(
        item_id=13,
        code="A3",
        dimension="A",
        statement_th="ชอบความอิสระในการทำงาน ไม่ชอบทำตามกฎเกณฑ์หรือแบบแผนที่ตายตัวเกินไป",
        category_th="อิสระความคิดและนวัตกรรม"
    ),
    RIASECItem(
        item_id=14,
        code="A4",
        dimension="A",
        statement_th="สนใจเรื่องสุนทรียภาพ ดีไซน์ UI/UX การตัดต่อวิดีโอ หรือการถ่ายภาพ",
        category_th="สุนทรียภาพและสื่อดิจิทัล"
    ),
    RIASECItem(
        item_id=15,
        code="A5",
        dimension="A",
        statement_th="ชอบคิดค้นไอเดียใหม่ๆ ที่แตกต่างและไม่ซ้ำใครเพื่อแก้ปัญหา",
        category_th="ความคิดสร้างสรรค์นอกกรอบ"
    ),

    # --- Social (S) ---
    RIASECItem(
        item_id=16,
        code="S1",
        dimension="S",
        statement_th="ชอบพูดคุย รับฟัง และช่วยเหลือผู้อื่นเมื่อพวกเขามีปัญหาหรือความทุกข์",
        category_th="การช่วยเหลือและรับฟัง"
    ),
    RIASECItem(
        item_id=17,
        code="S2",
        dimension="S",
        statement_th="สนุกกับการสอน อธิบายความรู้ หรือแนะนำแนวทางให้เพื่อนๆ เข้าใจ",
        category_th="การถ่ายทอดและความรู้"
    ),
    RIASECItem(
        item_id=18,
        code="S3",
        dimension="S",
        statement_th="ชอบทำกิจกรรมจิตอาสา ทำงานเป็นทีม หรือสร้างความสัมพันธ์ในกลุ่ม",
        category_th="งานจิตอาสาและสังคม"
    ),
    RIASECItem(
        item_id=19,
        code="S4",
        dimension="S",
        statement_th="สนใจสุขภาพ ความเป็นอยู่ และการพัฒนาคุณภาพชีวิตของผู้คนในชุมชน",
        category_th="การดูแลและพัฒนาคุณภาพชีวิต"
    ),
    RIASECItem(
        item_id=20,
        code="S5",
        dimension="S",
        statement_th="รู้สึกมีความสุขเมื่อได้เห็นผู้อื่นเติบโต มีความรู้ หรือมีความสุขมากขึ้น",
        category_th="การส่งเสริมและพัฒนาบุคคล"
    ),

    # --- Enterprising (E) ---
    RIASECItem(
        item_id=21,
        code="E1",
        dimension="E",
        statement_th="ชอบเป็นผู้นำ ริเริ่มโครงการ หรือชวนเพื่อนๆ ทำกิจกรรมใหม่ๆ",
        category_th="ภาวะผู้นำและการริเริ่ม"
    ),
    RIASECItem(
        item_id=22,
        code="E2",
        dimension="E",
        statement_th="กล้าพูด โน้มน้าวใจ นำเสนอไอเดีย หรือเจรจาต่อรองให้ผู้อื่นคล้อยตาม",
        category_th="การโน้มน้าวและการสื่อสาร"
    ),
    RIASECItem(
        item_id=23,
        code="E3",
        dimension="E",
        statement_th="สนใจเรื่องธุรกิจ การค้าขาย การทำการตลาด หรือการวางแผนกำไร",
        category_th="ธุรกิจและการตลาด"
    ),
    RIASECItem(
        item_id=24,
        code="E4",
        dimension="E",
        statement_th="ชอบการแข่งขัน การตั้งเป้าหมายที่ท้าทาย และการสร้างผลงานที่โดดเด่น",
        category_th="เป้าหมายและการแข่งขัน"
    ),
    RIASECItem(
        item_id=25,
        code="E5",
        dimension="E",
        statement_th="กล้าตัดสินใจในสถานการณ์ที่ต้องรับความเสี่ยงเพื่อผลลัพธ์ที่ดีกว่า",
        category_th="การตัดสินใจและความเสี่ยง"
    ),

    # --- Conventional (C) ---
    RIASECItem(
        item_id=26,
        code="C1",
        dimension="C",
        statement_th="ชอบความเป็นระเบียบ การจัดเก็บข้อมูล ตารางเวลา และเอกสารให้เป็นระบบ",
        category_th="การจัดระเบียบและระบบเอกสาร"
    ),
    RIASECItem(
        item_id=27,
        code="C2",
        dimension="C",
        statement_th="รู้สึกสบายใจเมื่อได้ทำงานที่มีขั้นตอน คู่มือ หรือแผนงานชัดเจน",
        category_th="กระบวนการและขั้นตอนมาตรฐาน"
    ),
    RIASECItem(
        item_id=28,
        code="C3",
        dimension="C",
        statement_th="ใส่ใจรายละเอียด ตรวจสอบความถูกต้องของตัวเลข ข้อมูล หรือตัวอักษร",
        category_th="ความถูกต้องและความละเอียด"
    ),
    RIASECItem(
        item_id=29,
        code="C4",
        dimension="C",
        statement_th="ชอบการบริหารจัดการเวลา การทำตารางบันทึกรายรับ-รายจ่าย หรือบัญชี",
        category_th="การจัดการเวลาและบัญชี"
    ),
    RIASECItem(
        item_id=30,
        code="C5",
        dimension="C",
        statement_th="ชอบรักษากฎเกณฑ์ มาตรฐาน และทำให้งานสำเร็จตามกรอบเวลาอย่างเคร่งครัด",
        category_th="วินัยและมาตรฐานงาน"
    ),
]

_ITEM_MAP: Dict[int, RIASECItem] = {item.item_id: item for item in DEFAULT_RIASEC_ITEMS}


def get_default_riasec_items() -> List[RIASECItem]:
    """Returns the standardized 30-item RIASEC assessment questionnaire."""
    return list(DEFAULT_RIASEC_ITEMS)


def parse_riasec_responses(responses: List[Union[dict, RIASECResponse]]) -> List[RIASECResponse]:
    """
    Parses and validates a list of raw responses into structured RIASECResponse objects.
    """
    parsed: List[RIASECResponse] = []
    for resp in responses:
        if isinstance(resp, RIASECResponse):
            parsed.append(resp)
        elif isinstance(resp, dict):
            parsed.append(RIASECResponse(**resp))
        else:
            raise ValueError(f"Unsupported response format: {type(resp)}")
    return parsed


def score_riasec(responses: Union[List[dict], List[RIASECResponse]]) -> RIASECScoreResult:
    """
    Scores a 30-item RIASEC assessment response set.
    """
    parsed_responses = parse_riasec_responses(responses)
    
    dimensions = ["R", "I", "A", "S", "E", "C"]
    raw_sums: Dict[str, float] = {d: 0.0 for d in dimensions}
    counts: Dict[str, int] = {d: 0 for d in dimensions}

    for resp in parsed_responses:
        item = _ITEM_MAP.get(resp.item_id)
        if not item:
            continue
        raw_sums[item.dimension] += resp.score
        counts[item.dimension] += 1

    raw_scores: Dict[str, float] = {}
    normalized_scores: Dict[str, float] = {}
    
    for d in dimensions:
        count = counts[d]
        if count == 0:
            raw_scores[d] = 0.0
            normalized_scores[d] = 0.0
        else:
            raw = raw_sums[d]
            raw_scores[d] = round(raw, 2)
            min_possible = count * 1.0
            max_possible = count * 5.0
            range_val = max_possible - min_possible
            norm = (raw - min_possible) / range_val if range_val > 0 else 0.0
            normalized_scores[d] = round(max(0.0, min(1.0, norm)), 4)

    total_raw = sum(raw_scores.values())
    dimension_percentages: Dict[str, float] = {}
    for d in dimensions:
        pct = (raw_scores[d] / total_raw * 100.0) if total_raw > 0 else 16.67
        dimension_percentages[d] = round(pct, 2)

    sorted_dims = sorted(
        dimensions,
        key=lambda d: (normalized_scores[d], raw_scores[d], -ord(d)),
        reverse=True
    )

    primary_code = sorted_dims[0] if sorted_dims else "R"
    holland_code = "".join(sorted_dims[:3]) if len(sorted_dims) >= 3 else primary_code

    return RIASECScoreResult(
        raw_scores=raw_scores,
        normalized_scores=normalized_scores,
        dimension_percentages=dimension_percentages,
        primary_code=primary_code,
        holland_code=holland_code,
        sorted_dimensions=sorted_dims
    )


class RIASECScorer:
    """
    Class wrapper for 30-item RIASEC Assessment & Scoring Engine.
    Provides object-oriented access to score_responses and get_top_codes.
    """

    def __init__(self, items: Optional[List[RIASECItem]] = None):
        self.items = items or DEFAULT_RIASEC_ITEMS
        self._item_map = {item.item_id: item for item in self.items}

    def score_responses(
        self, responses: Union[List[dict], List[RIASECResponse], Dict[Any, float]]
    ) -> Dict[str, float]:
        """
        Scores responses and returns normalized scores (0.0 to 1.0) for R, I, A, S, E, C.
        
        Supports input formats:
        - Dict of item_id -> Likert score (e.g. {1: 5.0, 2: 4.0})
        - List of response dicts or RIASECResponse objects
        - Pre-computed dimension scores dict (e.g. {"R": 1.0, "I": 0.8})
        """
        dims = ["R", "I", "A", "S", "E", "C"]
        
        if isinstance(responses, dict):
            # Check if dict contains dimension keys (e.g. "R", "I")
            if any(k in dims for k in responses.keys()):
                return {d: max(0.0, min(1.0, float(responses.get(d, 0.0)))) for d in dims}
            # Otherwise assume item_id -> score mapping
            formatted = [{"item_id": int(k), "score": float(v)} for k, v in responses.items()]
            res = score_riasec(formatted)
            return res.normalized_scores
        else:
            res = score_riasec(responses)
            return res.normalized_scores

    def get_top_codes(self, scores: Dict[str, float], n: int = 3) -> List[str]:
        """
        Returns top `n` Holland code dimension letters sorted by score descending.
        """
        sorted_dims = sorted(
            ["R", "I", "A", "S", "E", "C"],
            key=lambda d: (scores.get(d, 0.0), -ord(d)),
            reverse=True
        )
        return sorted_dims[:n]

