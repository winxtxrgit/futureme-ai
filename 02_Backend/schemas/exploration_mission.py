"""
Exploration Mission Schema for FutureMe AI Platform.
Provides scenario-based discovery missions for students across education levels.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from schemas.education_level import EducationLevel


class ExplorationMission(BaseModel):
    mission_id: str = Field(..., description="Unique mission identifier")
    title: str = Field(..., description="Mission title (e.g. 'ภารกิจลองเป็น นักออกแบบ UX/UI 1 วัน')")
    description: str = Field(..., description="Overview and context of the exploration mission")
    education_level: EducationLevel = Field(
        EducationLevel.M1_M3,
        description="Target education level (p4_p6, m1_m3, m4_m6, vocational)"
    )
    target_field: str = Field(..., description="Career field or domain explored")
    difficulty: str = Field("beginner", description="Difficulty level ('beginner', 'intermediate', 'advanced')")
    star_prompt: str = Field(..., description="STAR prompt or situation scenario question given to student")
    scenarios: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Interactive step scenarios or decision choices"
    )
    action_items: List[str] = Field(
        default_factory=list,
        description="Key action steps for student to complete"
    )
    estimated_minutes: int = Field(20, description="Estimated completion time in minutes")
