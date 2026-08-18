"""
Route Generator & Multi-Tier Decision Engine Pipeline Runner.

Generates 3 returned route alternatives:
- Route 1: Balanced Next Step (สมดุลวิชาการและการเติบโต)
- Route 2: Interest Growth Route (มุ่งเน้นการเจริญเติบโตตามความสนใจเฉพาะทาง)
- Route 3: Practical Access Route (เน้นการปฏิบัติงานจริงและโอกาสเข้าถึงอาชีพทันที)
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

from schemas.models import RouteOption, EducationLevel, CareerInterestProfile, LearnerEvidence
from app.decision_engine.riasec import RIASECScoreResult, score_riasec
from app.decision_engine.star_eval import STAREvaluationResult, evaluate_star_responses
from app.decision_engine.multi_tier import TierRoutingResult, route_tier_pathways
from app.decision_engine.matrix import MatrixScoreBreakdown, calculate_decision_matrix


class RouteAlternative(BaseModel):
    """Detailed Route Alternative representation."""
    route_id: str
    route_type: str  # "balanced", "interest_growth", "practical_access"
    name_th: str
    name_en: str
    description_th: str
    suitability_score: float = Field(..., ge=0.0, le=1.0)
    subject_tags: List[str]
    action_items_30_days: List[str]
    target_institutions_th: List[str]


class DecisionEngineResponse(BaseModel):
    """Unified full response from Multi-Tier Decision Engine."""
    education_tier: str
    primary_riasec_code: str
    holland_code: str
    top_strengths: List[str]
    primary_learning_style: str
    composite_matrix_score: float
    matrix_breakdown: MatrixScoreBreakdown
    routes: List[RouteOption]


class RouteGenerator:
    """Generates 3 distinct route alternatives based on decision engine evaluation."""

    def generate_routes(
        self,
        level: EducationLevel,
        profile: CareerInterestProfile,
        evidence: LearnerEvidence,
        matrix_result: Dict[str, Any],
        tier_info: Dict[str, Any]
    ) -> List[RouteOption]:
        """
        Generates 3 returned route alternatives:
        - Route 1: Balanced Next Step
        - Route 2: Interest Growth Route
        - Route 3: Practical Access Route
        """
        comp = matrix_result.get("composite_score", 0.80)
        if comp > 1.0:
            comp = comp / 100.0

        top_interests = profile.preferred_fields or profile.interest_tags or ["เทคโนโลยีสารสนเทศ", "นวัตกรรม"]
        primary_interest = top_interests[0] if top_interests else "เทคโนโลยี"

        # Route 1: Balanced Next Step
        route_1 = RouteOption(
            route_id="route_balanced_01",
            name="Balanced Next Step",
            description=f"เส้นทางสมดุลที่ผสมผสานความสนใจในด้าน {primary_interest} เข้ากับความถนัดทางวิชาการและโอกาสการทำงานในอนาคต",
            suitability_score=round(min(comp + 0.05, 0.98), 2),
            subject_tags=[primary_interest, "วิชาการเข้มข้น", "ประเมินสมรรถนะรอบด้าน"],
            action_items=[
                "พัฒนาทักษะวิชาการหลักและเข้าร่วมกิจกรรมเสริมสร้างพอร์ตโฟลิโอ",
                "ทดลองทำมินิโปรเจกต์ประยุกต์ใช้ความรู้ในชีวิตจริง",
                "ปรึกษาครูแนะแนวเพื่อเตรียมแผนการศึกษาต่อตาม TCAS / ปวช."
            ],
            target_institutions=["มหาวิทยาลัยชั้นนำ / วิทยาลัยอาชีวศึกษามาตรฐานสูง"]
        )

        # Route 2: Interest Growth Route
        route_2 = RouteOption(
            route_id="route_interest_02",
            name="Interest Growth Route",
            description=f"เส้นทางมุ่งเน้นการเติบโตตามความสนใจเฉพาะทาง (Passion-driven) มุ่งเน้นการพัฒนาทักษะเชิงลึกในสาขา {primary_interest}",
            suitability_score=round(min(comp, 0.95), 2),
            subject_tags=[primary_interest, "นวัตกรรมสร้างสรรค์", "ทักษะเฉพาะทาง"],
            action_items=[
                "เข้าร่วมชมรม ค่ายอัจฉริยภาพ หรือการแข่งขันระดับเยาวชน",
                "เก็บสะสมผลงานชิ้นเอก (Key Artifacts) สำหรับ Portfolio",
                "สร้างเครือข่ายเรียนรู้กับรุ่นพี่และผู้เชี่ยวชาญในสายงาน"
            ],
            target_institutions=["สถาบันเฉพาะทางและคณะนวัตกรรม"]
        )

        # Route 3: Practical Access Route
        route_3 = RouteOption(
            route_id="route_practical_03",
            name="Practical Access Route",
            description="เส้นทางเน้นการเข้าถึงง่าย การปฏิบัติงานจริง และโอกาสการทำงานทันทีหลังสำเร็จการศึกษา (ความเสี่ยงต่ำ-ผลตอบแทนมั่นคง)",
            suitability_score=round(min(comp - 0.03, 0.90), 2),
            subject_tags=["ทวิภาคี (DVE)", "ฝึกทักษะอาชีพ", "ใบรับรองสมรรถนะ"],
            action_items=[
                "เลือกเรียนหลักสูตรทวิภาคีร่วมกับสถานประกอบการเพื่อรับทุนและเบี้ยเลี้ยง",
                "สอบวัดระดับมาตรฐานฝีมือแรงงานหรือประกาศนียบัตรวิชาชีพ",
                "เตรียมพร้อมเข้าสู่ตลาดแรงงานหรือต่อยอดระดับสูง"
            ],
            target_institutions=["วิทยาลัยเทคนิค / สถานประกอบการความร่วมมือ"]
        )

        return [route_1, route_2, route_3]


def generate_routes(
    level: EducationLevel,
    profile: CareerInterestProfile,
    evidence: LearnerEvidence,
    matrix_result: Dict[str, Any],
    tier_info: Dict[str, Any]
) -> List[RouteOption]:
    """Standalone function helper for generating 3 route alternatives."""
    gen = RouteGenerator()
    return gen.generate_routes(level, profile, evidence, matrix_result, tier_info)


def run_decision_engine(
    grade_level: str,
    riasec_responses: List[Dict[str, Any]],
    star_responses: List[Dict[str, Any]]
) -> DecisionEngineResponse:
    """
    Runs the complete Multi-Tier Decision Engine pipeline from raw inputs to 3 generated routes.
    """
    # 1. RIASEC Scorer
    riasec_res: RIASECScoreResult = score_riasec(riasec_responses)
    
    # 2. STAR Qualitative Evaluator
    star_res: STAREvaluationResult = evaluate_star_responses(star_responses)
    
    # 3. Multi-tier Router
    tier_res: TierRoutingResult = route_tier_pathways(
        grade_level=grade_level,
        primary_riasec=riasec_res.primary_code
    )
    
    # 4. Decision Matrix Calculator
    first_candidate = tier_res.candidate_pathways[0] if tier_res.candidate_pathways else None
    if first_candidate:
        matrix_breakdown = calculate_decision_matrix(
            candidate=first_candidate,
            riasec_result=riasec_res,
            star_result=star_res
        )
    else:
        matrix_breakdown = MatrixScoreBreakdown(
            pathway_id="default",
            pathway_title_th="Default Pathway",
            interest_score=80.0,
            strength_score=75.0,
            learning_style_score=85.0,
            feasibility_score=80.0,
            future_flexibility_score=70.0,
            total_composite_score=79.0,
            explanation_th={}
        )
    
    # 5. Route Generator
    level_enum = EducationLevel.UPPER_SECONDARY
    if "PRIMARY" in tier_res.tier.value:
        level_enum = EducationLevel.PRIMARY
    elif "LOWER" in tier_res.tier.value:
        level_enum = EducationLevel.LOWER_SECONDARY
    elif "VOCATIONAL" in tier_res.tier.value:
        level_enum = EducationLevel.VOCATIONAL
        
    profile = CareerInterestProfile(
        riasec_scores=riasec_res.normalized_scores,
        interest_tags=star_res.top_strengths,
        preferred_fields=[first_candidate.title_th] if first_candidate else []
    )
    evidence = LearnerEvidence(
        academic_strengths=star_res.top_strengths,
        star_responses=star_responses,
        practical_experience=[star_res.primary_learning_style]
    )
    
    routes = generate_routes(
        level=level_enum,
        profile=profile,
        evidence=evidence,
        matrix_result={"composite_score": matrix_breakdown.total_composite_score},
        tier_info={"tier": tier_res.tier.value}
    )

    return DecisionEngineResponse(
        education_tier=tier_res.tier.value,
        primary_riasec_code=riasec_res.primary_code,
        holland_code=riasec_res.holland_code,
        top_strengths=star_res.top_strengths,
        primary_learning_style=star_res.primary_learning_style,
        composite_matrix_score=matrix_breakdown.total_composite_score,
        matrix_breakdown=matrix_breakdown,
        routes=routes
    )
