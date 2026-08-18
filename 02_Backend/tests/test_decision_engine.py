import pytest
from app.decision_engine import (
    RIASECScorer,
    STAREvaluator,
    MultiTierRouter,
    DecisionMatrixCalculator,
    RouteGenerator,
    score_riasec,
    get_default_riasec_items,
    evaluate_star_responses,
    select_adaptive_star_questions,
    detect_tier,
    route_tier_pathways,
    calculate_decision_matrix,
    generate_routes,
    run_decision_engine,
    EducationTier,
    WEIGHT_INTERESTS,
    WEIGHT_STRENGTHS,
    WEIGHT_LEARNING_STYLE,
    WEIGHT_FEASIBILITY,
    WEIGHT_FUTURE_FLEXIBILITY,
)
from schemas.models import EducationLevel, CareerInterestProfile, LearnerEvidence


def test_riasec_scoring():
    scorer = RIASECScorer()
    answers = {i: 5 for i in range(1, 6)}  # High R (items 1-5)
    scores = scorer.score_responses(answers)
    assert scores["R"] == 1.0
    top_codes = scorer.get_top_codes(scores)
    assert top_codes[0] == "R"


def test_riasec_30_items_and_standalone_scoring():
    items = get_default_riasec_items()
    assert len(items) == 30
    
    # 5 items per dimension
    dim_counts = {}
    for item in items:
        dim_counts[item.dimension] = dim_counts.get(item.dimension, 0) + 1
    assert dim_counts == {"R": 5, "I": 5, "A": 5, "S": 5, "E": 5, "C": 5}

    responses = [{"item_id": i, "score": 4.0} for i in range(1, 31)]
    result = score_riasec(responses)
    assert result.primary_code in ["R", "I", "A", "S", "E", "C"]
    assert len(result.holland_code) == 3
    assert len(result.sorted_dimensions) == 6


def test_star_evaluation():
    evaluator = STAREvaluator()
    answers = [
        {
            "text": "เมื่อตอนเรียน ม.3 เจอปัญหาการจัดเก็บข้อมูลงานกลุ่ม ต้องวางแผนและลงมือเขียนโปรแกรมระบบจัดการเอกสาร ผลลัพธ์ทำให้งานเสร็จเร็วขึ้นและได้คะแนนเต็ม"
        }
    ]
    res = evaluator.evaluate_answers(answers)
    assert res["score"] > 0.6
    assert "feedback" in res
    assert len(res["adaptive_questions"]) > 0


def test_star_adaptive_question_selection():
    qs = select_adaptive_star_questions(tier="LOWER_SECONDARY", primary_riasec="I", num_questions=6)
    assert 5 <= len(qs) <= 8
    
    responses = [
        {"question_id": q.question_id, "response_text": "ลงมือทำโปรเจกต์และวิเคราะห์ข้อมูลกับเพื่อน"}
        for q in qs
    ]
    eval_res = evaluate_star_responses(responses)
    assert eval_res.primary_learning_style in [
        "hands_on_practical", "visual_analytical", "social_collaborative", "self_directed_inquiry"
    ]
    assert len(eval_res.top_strengths) <= 3


def test_multi_tier_router_12_areas_and_tpats():
    router = MultiTierRouter()
    
    # Verify 12 areas
    assert len(router.VOCATIONAL_12_AREAS) == 12
    assert "อุตสาหกรรม" in router.VOCATIONAL_12_AREAS
    assert "เอ็นเตอร์เทนเมนต์" in router.VOCATIONAL_12_AREAS

    # Verify TPAT Mappings
    assert "TPAT2" in router.TPAT_MAPPINGS
    assert "ศิลปกรรม" in router.TPAT_MAPPINGS["TPAT2"]["name"]
    assert "TPAT3" in router.TPAT_MAPPINGS
    assert "TPAT4" in router.TPAT_MAPPINGS
    assert "TPAT5" in router.TPAT_MAPPINGS

    res = router.route(EducationLevel.LOWER_SECONDARY, ["R", "I"], ["ดิจิทัล"])
    assert "vocational_areas_12" in res
    assert "counselor_safety_route" in res


def test_multi_tier_all_4_tiers():
    # Primary tier
    assert detect_tier("ป.5") == EducationTier.PRIMARY
    p_res = route_tier_pathways(grade_level="ป.5", primary_riasec="I")
    assert p_res.tier == EducationTier.PRIMARY
    assert len(p_res.candidate_pathways) >= 2

    # Lower secondary tier
    assert detect_tier("ม.3") == EducationTier.LOWER_SECONDARY
    l_res = route_tier_pathways(grade_level="ม.3", primary_riasec="R")
    assert l_res.tier == EducationTier.LOWER_SECONDARY
    assert any(p.is_safety_net for p in l_res.candidate_pathways)
    assert any(p.is_dve_dual_education for p in l_res.candidate_pathways)

    # Upper secondary tier
    assert detect_tier("ม.6") == EducationTier.UPPER_SECONDARY
    u_res = route_tier_pathways(grade_level="ม.6", primary_riasec="I")
    assert u_res.tier == EducationTier.UPPER_SECONDARY

    # Vocational tier
    assert detect_tier("ปวช.3") == EducationTier.VOCATIONAL
    v_res = route_tier_pathways(grade_level="ปวช.3", primary_riasec="R")
    assert v_res.tier == EducationTier.VOCATIONAL


def test_decision_matrix_calculator():
    calc = DecisionMatrixCalculator()
    profile = CareerInterestProfile(
        riasec_scores={"R": 0.9, "I": 0.8, "A": 0.4, "S": 0.3, "E": 0.5, "C": 0.6},
        interest_tags=["ดิจิทัล", "ซอฟต์แวร์"],
        preferred_fields=["วิศวกรรมคอมพิวเตอร์"]
    )
    evidence = LearnerEvidence(
        academic_strengths=["คณิตศาสตร์", "คอมพิวเตอร์"],
        star_responses=[{"text": "ลงมือทำโปรเจกต์ซอฟต์แวร์แก้ปัญหาสำเร็จ"}],
        practical_experience=["สร้างเว็บสโมสร"]
    )
    
    res = calc.calculate_matrix(profile, evidence, star_score=0.85)
    assert sum(calc.WEIGHTS.values()) == 1.0
    assert "composite_score" in res
    assert res["composite_score"] > 0.7


def test_matrix_weight_breakdown():
    total_weights = (
        WEIGHT_INTERESTS +
        WEIGHT_STRENGTHS +
        WEIGHT_LEARNING_STYLE +
        WEIGHT_FEASIBILITY +
        WEIGHT_FUTURE_FLEXIBILITY
    )
    assert round(total_weights, 2) == 1.00
    assert WEIGHT_INTERESTS == 0.30
    assert WEIGHT_STRENGTHS == 0.20
    assert WEIGHT_LEARNING_STYLE == 0.15
    assert WEIGHT_FEASIBILITY == 0.25
    assert WEIGHT_FUTURE_FLEXIBILITY == 0.10


def test_route_generator_3_routes():
    gen = RouteGenerator()
    profile = CareerInterestProfile(interest_tags=["ดิจิทัล"])
    evidence = LearnerEvidence(academic_strengths=["ไอที"])
    matrix_res = {"composite_score": 0.85}
    tier_info = {}

    routes = gen.generate_routes(EducationLevel.LOWER_SECONDARY, profile, evidence, matrix_res, tier_info)
    assert len(routes) == 3
    route_names = [r.name for r in routes]
    assert "Balanced Next Step" in route_names
    assert "Interest Growth Route" in route_names
    assert "Practical Access Route" in route_names


def test_end_to_end_decision_engine_pipeline():
    riasec_responses = [{"item_id": i, "score": 4.0} for i in range(1, 31)]
    star_responses = [
        {"question_id": 101, "response_text": "ลงมือทำโปรเจกต์เขียนระบบจัดการข้อมูลร่วมกับเพื่อนในโรงเรียน"}
    ]
    
    response = run_decision_engine(
        grade_level="ม.3",
        riasec_responses=riasec_responses,
        star_responses=star_responses
    )

    assert response.education_tier == "LOWER_SECONDARY"
    assert response.primary_riasec_code in ["R", "I", "A", "S", "E", "C"]
    assert len(response.routes) == 3
    assert response.composite_matrix_score > 0.0
