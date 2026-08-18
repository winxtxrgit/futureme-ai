"""
FutureMe AI Schemas Package.
Exports all Pydantic models required for API contracts, vector RAG, and pathway recommendations.
"""

from schemas.education_level import EducationLevel, EducationLevelInfo
from schemas.career_interest_profile import CareerInterestProfile
from schemas.learner_evidence import LearnerEvidence, StarResponse
from schemas.route_option import RouteOption
from schemas.vocational_program import VocationalProgram, VOCATIONAL_12_AREAS
from schemas.exploration_mission import ExplorationMission
from schemas.mission_result import MissionResult
from schemas.future_path_node import FuturePathNode
from schemas.source_record import SourceRecord
from schemas.api_dtos import (
    MissionRecommendRequest,
    MissionRecommendResponse,
    MissionSubmissionRequest,
    FuturePathRequest,
    FuturePathResponse,
)

__all__ = [
    "EducationLevel",
    "EducationLevelInfo",
    "CareerInterestProfile",
    "LearnerEvidence",
    "StarResponse",
    "RouteOption",
    "VocationalProgram",
    "VOCATIONAL_12_AREAS",
    "ExplorationMission",
    "MissionResult",
    "FuturePathNode",
    "SourceRecord",
    "MissionRecommendRequest",
    "MissionRecommendResponse",
    "MissionSubmissionRequest",
    "FuturePathRequest",
    "FuturePathResponse",
]
