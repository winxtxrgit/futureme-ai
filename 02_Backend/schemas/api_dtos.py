"""
API Request and Response DTO Schemas for FutureMe AI Platform.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from schemas.education_level import EducationLevel
from schemas.career_interest_profile import CareerInterestProfile
from schemas.learner_evidence import LearnerEvidence
from schemas.route_option import RouteOption
from schemas.exploration_mission import ExplorationMission
from schemas.future_path_node import FuturePathNode


class MissionRecommendRequest(BaseModel):
    education_level: EducationLevel = Field(
        EducationLevel.M1_M3,
        description="Student education level (p4_p6, m1_m3, m4_m6, vocational)"
    )
    interests: List[str] = Field(
        default_factory=list,
        description="List of interest keywords or career domains"
    )
    riasec_scores: Optional[Dict[str, float]] = Field(
        None,
        description="Optional RIASEC scores dict"
    )
    limit: int = Field(3, ge=1, le=10, description="Maximum number of missions to return")


class MissionRecommendResponse(BaseModel):
    missions: List[ExplorationMission] = Field(..., description="Recommended exploration missions")
    total: int = Field(..., description="Total missions returned")


class MissionSubmissionRequest(BaseModel):
    student_id: str = Field(..., description="Student profile ID")
    submission_text: str = Field(..., description="Answer or submission text from student")
    star_responses: Optional[Dict[str, str]] = Field(
        None,
        description="Optional structured STAR responses (situation, task, action, result)"
    )


class FuturePathRequest(BaseModel):
    student_id: str = Field(..., description="Student profile ID")
    education_level: EducationLevel = Field(
        ...,
        description="Student education level"
    )
    career_interest_profile: CareerInterestProfile = Field(
        ...,
        description="Student career interest profile and RIASEC scores"
    )
    learner_evidences: List[LearnerEvidence] = Field(
        default_factory=list,
        description="Learner evidence collected from STAR dialogues or missions"
    )


class FuturePathResponse(BaseModel):
    path_id: str = Field(..., description="Unique decision path record ID")
    student_id: str = Field(..., description="Student profile ID")
    education_level: EducationLevel = Field(..., description="Student education level")
    decision_matrix_evaluation: Dict[str, Any] = Field(
        ...,
        description="Detailed weighted decision matrix breakdown"
    )
    routes: List[RouteOption] = Field(
        ...,
        description="3 distinct route options: Balanced Next Step, Interest Growth Route, Practical Access Route"
    )
    nodes: List[FuturePathNode] = Field(
        ...,
        description="Pathfinder DAG roadmap nodes from start to target career goal"
    )
