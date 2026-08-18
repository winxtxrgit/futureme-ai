"""
5-Weighted Recommendation Decision Matrix Calculator.

Weight Distribution:
- Interests: 30% (weight = 0.30)
- Strengths: 20% (weight = 0.20)
- Learning style: 15% (weight = 0.15)
- Feasibility: 25% (weight = 0.25)
- Future flexibility: 10% (weight = 0.10)

Calculates individual component scores (0.0 to 100.0) and composite weighted total.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, field_validator

from app.decision_engine.riasec import RIASECScoreResult
from app.decision_engine.star_eval import STAREvaluationResult
from app.decision_engine.multi_tier import CandidatePathway


# Weight Constants
WEIGHT_INTERESTS: float = 0.30
WEIGHT_STRENGTHS: float = 0.20
WEIGHT_LEARNING_STYLE: float = 0.15
WEIGHT_FEASIBILITY: float = 0.25
WEIGHT_FUTURE_FLEXIBILITY: float = 0.10


class FeasibilityContext(BaseModel):
    """Contextual factors for feasibility evaluation."""
    academic_gpa_score: float = Field(0.80, ge=0.0, le=1.0, description="Academic GPA readiness score (0.0 to 1.0)")
    financial_access_score: float = Field(0.85, ge=0.0, le=1.0, description="Financial & tuition affordability (0.0 to 1.0)")
    geographical_access_score: float = Field(0.90, ge=0.0, le=1.0, description="Local school/institution access (0.0 to 1.0)")


class FlexibilityContext(BaseModel):
    """Contextual factors for future flexibility evaluation."""
    cross_industry_versatility: float = Field(0.80, ge=0.0, le=1.0, description="Applicability across multiple industries (0.0 to 1.0)")
    further_education_openness: float = Field(0.85, ge=0.0, le=1.0, description="Options for further higher studies (0.0 to 1.0)")


class MatrixScoreBreakdown(BaseModel):
    """5-weighted score breakdown for a single candidate pathway option."""
    pathway_id: str
    pathway_title_th: str
    
    # 5 Weighted Component Scores (0.0 to 100.0 scale)
    interest_score: float = Field(..., ge=0.0, le=100.0, description="Interest match score (Weight 30%)")
    strength_score: float = Field(..., ge=0.0, le=100.0, description="Strength match score (Weight 20%)")
    learning_style_score: float = Field(..., ge=0.0, le=100.0, description="Learning style fit score (Weight 15%)")
    feasibility_score: float = Field(..., ge=0.0, le=100.0, description="Feasibility score (Weight 25%)")
    future_flexibility_score: float = Field(..., ge=0.0, le=100.0, description="Future flexibility score (Weight 10%)")
    
    # Total Composite Score
    total_composite_score: float = Field(..., ge=0.0, le=100.0, description="Weighted composite score out of 100.0")

    # Detailed Explanations
    component_weights: Dict[str, float] = Field(
        default_factory=lambda: {
            "interests": WEIGHT_INTERESTS,
            "strengths": WEIGHT_STRENGTHS,
            "learning_style": WEIGHT_LEARNING_STYLE,
            "feasibility": WEIGHT_FEASIBILITY,
            "future_flexibility": WEIGHT_FUTURE_FLEXIBILITY
        }
    )
    explanation_th: Dict[str, str] = Field(..., description="Native Thai explanations per component")


def calculate_decision_matrix(
    candidate: CandidatePathway,
    riasec_result: RIASECScoreResult,
    star_result: STAREvaluationResult,
    feasibility_context: Optional[FeasibilityContext] = None,
    flexibility_context: Optional[FlexibilityContext] = None
) -> MatrixScoreBreakdown:
    """
    Calculates the 5-weighted decision matrix score for a candidate pathway.

    Formula:
    Composite = (Interests * 0.30) + (Strengths * 0.20) + (Learning Style * 0.15) + (Feasibility * 0.25) + (Future Flexibility * 0.10)
    """
    feas_ctx = feasibility_context or FeasibilityContext()
    flex_ctx = flexibility_context or FlexibilityContext()

    # 1. Interests Score (30% Weight)
    affinities = candidate.riasec_affinity or ["I"]
    riasec_norm = riasec_result.normalized_scores
    matched_interest_norms = [riasec_norm.get(dim, 0.5) for dim in affinities]
    avg_interest_norm = sum(matched_interest_norms) / len(matched_interest_norms) if matched_interest_norms else 0.5
    
    if riasec_result.primary_code in affinities:
        avg_interest_norm = min(1.0, avg_interest_norm + 0.15)
        
    interest_score = round(avg_interest_norm * 100.0, 2)

    # 2. Strengths Score (20% Weight)
    req_strengths = candidate.required_strengths or ["analytical_thinking"]
    extracted_str = star_result.extracted_strengths
    matched_str_scores = [extracted_str.get(s, 0.3) for s in req_strengths]
    avg_str_norm = sum(matched_str_scores) / len(matched_str_scores) if matched_str_scores else 0.4
    
    avg_str_norm = min(1.0, avg_str_norm + (star_result.action_initiative_score * 0.10))
    strength_score = round(avg_str_norm * 100.0, 2)

    # 3. Learning Style Score (15% Weight)
    fit_styles = candidate.learning_style_fit or ["hands_on_practical"]
    style_scores = star_result.learning_style_scores
    matched_style_scores = [style_scores.get(st, 0.4) for st in fit_styles]
    avg_style_norm = sum(matched_style_scores) / len(matched_style_scores) if matched_style_scores else 0.5
    
    if star_result.primary_learning_style in fit_styles:
        avg_style_norm = min(1.0, avg_style_norm + 0.15)
        
    learning_style_score = round(avg_style_norm * 100.0, 2)

    # 4. Feasibility Score (25% Weight)
    base_feasibility = (
        feas_ctx.academic_gpa_score * 0.40 +
        feas_ctx.financial_access_score * 0.35 +
        feas_ctx.geographical_access_score * 0.25
    )
    if candidate.is_safety_net or candidate.is_dve_dual_education:
        base_feasibility = min(1.0, base_feasibility + 0.12)
        
    feasibility_score = round(base_feasibility * 100.0, 2)

    # 5. Future Flexibility Score (10% Weight)
    base_flexibility = (
        flex_ctx.cross_industry_versatility * 0.60 +
        flex_ctx.further_education_openness * 0.40
    )
    future_flexibility_score = round(base_flexibility * 100.0, 2)

    # 6. Total Composite Score Calculation
    total_composite = (
        (interest_score * WEIGHT_INTERESTS) +
        (strength_score * WEIGHT_STRENGTHS) +
        (learning_style_score * WEIGHT_LEARNING_STYLE) +
        (feasibility_score * WEIGHT_FEASIBILITY) +
        (future_flexibility_score * WEIGHT_FUTURE_FLEXIBILITY)
    )
    total_composite_score = round(total_composite, 2)

    explanations_th = {
        "interests": f"สอดคล้องกับความสนใจ RIASEC ({riasec_result.holland_code}) คิดเป็น {interest_score}%",
        "strengths": f"สอดคล้องกับจุดแข็งพฤติกรรม ({', '.join(star_result.top_strengths[:2])}) คิดเป็น {strength_score}%",
        "learning_style": f"สอดคล้องกับรูปแบบการเรียนรู้หลัก ({star_result.primary_learning_style}) คิดเป็น {learning_style_score}%",
        "feasibility": f"ความเป็นไปได้ด้านเกรด งบประมาณ และสถานที่ คิดเป็น {feasibility_score}%",
        "future_flexibility": f"ความยืดหยุ่นในการต่อยอดอาชีพและศึกษาต่อ คิดเป็น {future_flexibility_score}%"
    }

    return MatrixScoreBreakdown(
        pathway_id=candidate.pathway_id,
        pathway_title_th=candidate.title_th,
        interest_score=interest_score,
        strength_score=strength_score,
        learning_style_score=learning_style_score,
        feasibility_score=feasibility_score,
        future_flexibility_score=future_flexibility_score,
        total_composite_score=total_composite_score,
        explanation_th=explanations_th
    )


class DecisionMatrixCalculator:
    """
    5-Weighted Recommendation Decision Matrix Calculator Class.
    
    Weights:
    - Interests: 30% (0.30)
    - Strengths: 20% (0.20)
    - Learning style: 15% (0.15)
    - Feasibility: 25% (0.25)
    - Future flexibility: 10% (0.10)
    Total = 100% (1.00)
    """

    WEIGHTS: Dict[str, float] = {
        "interests": WEIGHT_INTERESTS,
        "strengths": WEIGHT_STRENGTHS,
        "learning_style": WEIGHT_LEARNING_STYLE,
        "feasibility": WEIGHT_FEASIBILITY,
        "future_flexibility": WEIGHT_FUTURE_FLEXIBILITY
    }

    def calculate_matrix(
        self,
        profile: Union[Dict[str, Any], Any],
        evidence: Union[Dict[str, Any], Any],
        star_score: float = 0.85,
        feasibility_context: Optional[FeasibilityContext] = None,
        flexibility_context: Optional[FlexibilityContext] = None
    ) -> Dict[str, Any]:
        """
        Calculates 5-weighted component scores and composite recommendation score.
        """
        p_dict = profile if isinstance(profile, dict) else (getattr(profile, "model_dump", lambda: profile.__dict__)())
        e_dict = evidence if isinstance(evidence, dict) else (getattr(evidence, "model_dump", lambda: evidence.__dict__)())

        riasec_scores = p_dict.get("riasec_scores", {})
        riasec_vals = list(riasec_scores.values()) if riasec_scores else [0.7]
        avg_interest = (sum(riasec_vals) / len(riasec_vals)) if riasec_vals else 0.7
        interest_comp = min(100.0, max(0.0, (avg_interest + 0.1) * 100.0 if avg_interest <= 1.0 else avg_interest))

        strengths_count = len(e_dict.get("academic_strengths", []))
        strength_comp = min(100.0, (star_score * 0.7 + min(0.3, strengths_count * 0.1)) * 100.0)

        learning_comp = 85.0

        feas_ctx = feasibility_context or FeasibilityContext()
        feasibility_comp = (
            feas_ctx.academic_gpa_score * 0.40 +
            feas_ctx.financial_access_score * 0.35 +
            feas_ctx.geographical_access_score * 0.25
        ) * 100.0

        flex_ctx = flexibility_context or FlexibilityContext()
        flexibility_comp = (
            flex_ctx.cross_industry_versatility * 0.60 +
            flex_ctx.further_education_openness * 0.40
        ) * 100.0

        itemized_scores = {
            "interests": round(interest_comp, 2),
            "strengths": round(strength_comp, 2),
            "learning_style": round(learning_comp, 2),
            "feasibility": round(feasibility_comp, 2),
            "future_flexibility": round(flexibility_comp, 2)
        }

        composite_score = round(
            (
                itemized_scores["interests"] * self.WEIGHTS["interests"] +
                itemized_scores["strengths"] * self.WEIGHTS["strengths"] +
                itemized_scores["learning_style"] * self.WEIGHTS["learning_style"] +
                itemized_scores["feasibility"] * self.WEIGHTS["feasibility"] +
                itemized_scores["future_flexibility"] * self.WEIGHTS["future_flexibility"]
            ) / 100.0,
            2
        )

        return {
            "composite_score": composite_score,
            "itemized_scores": itemized_scores,
            "weights": self.WEIGHTS,
            "explanations_th": {
                "interests": f"ความสนใจสอดคล้องกับคะแนน RIASEC ({itemized_scores['interests']}%)",
                "strengths": f"จุดแข็งทางวิชาการและพฤติกรรม ({itemized_scores['strengths']}%)",
                "learning_style": f"รูปแบบการเรียนรู้เน้นปฏิบัติ ({itemized_scores['learning_style']}%)",
                "feasibility": f"ความเป็นไปได้ทางวิชาการและทุนทรัพย์ ({itemized_scores['feasibility']}%)",
                "future_flexibility": f"ความยืดหยุ่นและการเติบโตในอนาคต ({itemized_scores['future_flexibility']}%)"
            }
        }

