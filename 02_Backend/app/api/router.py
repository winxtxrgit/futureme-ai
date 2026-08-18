import uuid
from typing import Dict, List
from fastapi import APIRouter, HTTPException, status

from schemas.models import (
    EducationLevel,
    ExplorationMission,
    MissionRecommendRequest,
    MissionRecommendResponse,
    MissionSubmissionRequest,
    MissionSubmissionResponse,
    MissionResult,
    FuturePathRequest,
    FuturePathResponse,
    FuturePathNode,
)
from app.decision_engine import (
    RIASECScorer,
    STAREvaluator,
    MultiTierRouter,
    DecisionMatrixCalculator,
    RouteGenerator,
)

router = APIRouter(prefix="/v1", tags=["FuturePath API"])

# In-memory storage for future path nodes
future_paths_db: Dict[str, FuturePathNode] = {}

# Services initialization
riasec_scorer = RIASECScorer()
star_evaluator = STAREvaluator()
multi_tier_router = MultiTierRouter()
matrix_calculator = DecisionMatrixCalculator()
route_generator = RouteGenerator()


@router.post("/missions/recommend", response_model=MissionRecommendResponse)
def recommend_missions(payload: MissionRecommendRequest):
    """
    Accepts user education level & interests, returns recommended exploration missions.
    """
    missions = [
        ExplorationMission(
            mission_id="mission_01_tech",
            title="สำรวจเส้นทางปัญญาประดิษฐ์และซอฟต์แวร์แห่งอนาคต",
            description="ทดลองออกแบบแนวคิดแอปพลิเคชันเพื่อแก้ปัญหาการเรียนและพัฒนาทักษะดิจิทัล",
            target_grade_level=payload.education_level,
            difficulty="Medium",
            questions=[
                {"id": 1, "question": "หากคุณสามารถสร้างแอปพลิเคชันได้ 1 แอป แอปนั้นจะทำอะไรและช่วยใคร?"},
                {"id": 2, "question": "อธิบายขั้นตอนที่คุณจะใช้ในการทดลองสร้างแอปพลิเคชันนั้น?"}
            ]
        ),
        ExplorationMission(
            mission_id="mission_02_vocational",
            title="สำรวจ 12 กลุ่มสาขาอาชีวศึกษา (ปวช. 2567) และทวิภาคี",
            description="ทำความเข้าใจเส้นทางเรียนสายอาชีพ โอกาสทำงานจริง และการเรียนระบบทวิภาคี (DVE)",
            target_grade_level=payload.education_level,
            difficulty="Easy",
            questions=[
                {"id": 1, "question": "ใน 12 กลุ่มสาขา ปวช. คุณสนใจกลุ่มสาขาใดมากที่สุดเพราะเหตุใด?"},
                {"id": 2, "question": "คุณคิดว่าการเรียนระบบทวิภาคี (เรียนคู่ฝึกงาน) เหมาะกับคุณอย่างไร?"}
            ]
        ),
        ExplorationMission(
            mission_id="mission_03_tcas",
            title="วางแผนเส้นทาง TCAS และเตรียมสอบ TPAT1-5",
            description="ค้นหาคณะอุดมศึกษาที่ใช่ และเตรียมความพร้อมสำหรับการสอบ TPAT / A-Level",
            target_grade_level=payload.education_level,
            difficulty="Hard",
            questions=[
                {"id": 1, "question": "คณะในฝันของคุณอยู่ในกลุ่มสาขาใด และต้องใช้คะแนน TPAT ใดบ้าง?"},
                {"id": 2, "question": "คุณมีแผน 30 วันอย่างไรในการเตรียม Portfolio หรือคะแนนสอบ?"}
            ]
        )
    ]
    
    limited_missions = missions[:payload.limit]
    return MissionRecommendResponse(
        missions=limited_missions,
        total=len(limited_missions)
    )


@router.post("/missions/{id}/submissions", response_model=MissionSubmissionResponse)
def submit_mission(id: str, payload: MissionSubmissionRequest):
    """
    Accepts student mission answers, returns evaluation & adaptive next questions.
    """
    eval_res = star_evaluator.evaluate_answers(payload.answers)
    
    result = MissionResult(
        submission_id=f"sub_{uuid.uuid4().hex[:8]}",
        mission_id=id,
        score=eval_res["score"],
        feedback=eval_res["feedback"],
        recommended_next_step="ต่อยอดด้วยการประเมิน FuturePath Decision Engine เพื่อวางเส้นทาง 3 รูปแบบ"
    )
    
    return MissionSubmissionResponse(
        result=result,
        adaptive_questions=eval_res["adaptive_questions"]
    )


@router.post("/future-paths", response_model=FuturePathResponse)
def create_future_path(payload: FuturePathRequest):
    """
    Accepts full student profile, returns 3 route alternatives (Balanced Next Step, Interest Growth Route, Practical Access Route).
    """
    # 1. RIASEC Scorer
    top_codes = riasec_scorer.get_top_codes(payload.interest_profile.riasec_scores)
    
    # 2. STAR Evaluator
    star_res = star_evaluator.evaluate_answers(payload.evidence.star_responses)
    
    # 3. Multi-tier Router
    tier_info = multi_tier_router.route(
        level=payload.education_level,
        riasec_top=top_codes,
        interests=payload.interest_profile.interest_tags
    )
    
    # 4. Decision Matrix Calculator (5 weights)
    matrix_res = matrix_calculator.calculate_matrix(
        profile=payload.interest_profile,
        evidence=payload.evidence,
        star_score=star_res["score"]
    )
    
    # 5. Route Generator (3 routes)
    routes = route_generator.generate_routes(
        level=payload.education_level,
        profile=payload.interest_profile,
        evidence=payload.evidence,
        matrix_result=matrix_res,
        tier_info=tier_info
    )
    
    path_id = f"path_{uuid.uuid4().hex[:8]}"
    node = FuturePathNode(
        path_id=path_id,
        profile=payload.interest_profile,
        evidence=payload.evidence,
        evaluation_matrix=matrix_res["itemized_scores"],
        route_options=routes
    )
    
    future_paths_db[path_id] = node
    return FuturePathResponse(path_node=node)


@router.get("/future-paths/{id}", response_model=FuturePathNode)
def get_future_path(id: str):
    """
    Retrieves stored decision matrix evaluation & route details.
    """
    if id not in future_paths_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"FuturePath node with ID '{id}' not found."
        )
    return future_paths_db[id]
