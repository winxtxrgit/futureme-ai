"""
Mission Result Schema for FutureMe AI Platform.
Stores student submission evaluation, feedback, score, and adaptive follow-up questions.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class MissionResult(BaseModel):
    result_id: str = Field(..., description="Unique result identifier")
    mission_id: str = Field(..., description="ID of the submitted mission")
    student_id: str = Field(..., description="Student ID")
    submission_text: str = Field(..., description="Student's raw submission or answer text")
    evaluation_score: float = Field(
        ...,
        description="STAR evaluation score (0.0 to 100.0 or 0.0 to 1.0)"
    )
    feedback: str = Field(
        ...,
        description="Constructive Socratic feedback detailing strengths and growth areas"
    )
    adaptive_next_questions: List[str] = Field(
        default_factory=list,
        description="Adaptive follow-up questions tailored to student response"
    )
    verified_skills: List[str] = Field(
        default_factory=list,
        description="Skills demonstrated in submission"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="ISO UTC timestamp of evaluation"
    )
