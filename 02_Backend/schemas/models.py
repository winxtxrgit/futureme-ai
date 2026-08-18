from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class EducationLevel(str, Enum):
    PRIMARY = "PRIMARY"              # ป.4-ป.6
    LOWER_SECONDARY = "LOWER_SECONDARY"  # ม.1-ม.3
    UPPER_SECONDARY = "UPPER_SECONDARY"  # ม.4-ม.6
    VOCATIONAL = "VOCATIONAL"        # ปวช./ปวส.


class CareerInterestProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")

    riasec_scores: Dict[str, float] = Field(
        default_factory=lambda: {"R": 0.0, "I": 0.0, "A": 0.0, "S": 0.0, "E": 0.0, "C": 0.0},
        description="Scores for Realistic, Investigative, Artistic, Social, Enterprising, Conventional"
    )
    interest_tags: List[str] = Field(default_factory=list)
    preferred_fields: List[str] = Field(default_factory=list)


class LearnerEvidence(BaseModel):
    model_config = ConfigDict(extra="ignore")

    academic_strengths: List[str] = Field(default_factory=list)
    star_responses: List[Dict[str, Any]] = Field(default_factory=list)
    practical_experience: List[str] = Field(default_factory=list)


class RouteOption(BaseModel):
    model_config = ConfigDict(extra="ignore")

    route_id: str
    name: str  # Balanced Next Step, Interest Growth Route, Practical Access Route
    description: str
    suitability_score: float = Field(..., ge=0.0, le=1.0)
    subject_tags: List[str] = Field(default_factory=list)
    action_items: List[str] = Field(default_factory=list)
    target_institutions: List[str] = Field(default_factory=list)


class VocationalProgram(BaseModel):
    model_config = ConfigDict(extra="ignore")

    program_id: str
    area_name: str
    description: str
    dual_education_available: bool = True


class ExplorationMission(BaseModel):
    model_config = ConfigDict(extra="ignore")

    mission_id: str
    title: str
    description: str
    target_grade_level: EducationLevel
    difficulty: str
    questions: List[Dict[str, Any]] = Field(default_factory=list)


class MissionResult(BaseModel):
    model_config = ConfigDict(extra="ignore")

    submission_id: str
    mission_id: str
    score: float = Field(..., ge=0.0, le=1.0)
    feedback: str
    recommended_next_step: str


class FuturePathNode(BaseModel):
    model_config = ConfigDict(extra="ignore")

    path_id: str
    profile: CareerInterestProfile
    evidence: LearnerEvidence
    evaluation_matrix: Dict[str, float]
    route_options: List[RouteOption]


class SourceRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    document_id: str
    title: str
    url: str
    citation: str
    relevance_score: float = Field(..., ge=0.0, le=1.0)


# Request and Response Models for API endpoints

class MissionRecommendRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    education_level: EducationLevel
    interests: List[str] = Field(default_factory=list)
    limit: int = 5


class MissionRecommendResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    missions: List[ExplorationMission]
    total: int


class MissionSubmissionRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    mission_id: str
    answers: List[Dict[str, Any]]
    student_id: Optional[str] = "student_default"


class MissionSubmissionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    result: MissionResult
    adaptive_questions: List[str] = Field(default_factory=list)


class FuturePathRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    education_level: EducationLevel
    interest_profile: CareerInterestProfile
    evidence: LearnerEvidence


class FuturePathResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    path_node: FuturePathNode
