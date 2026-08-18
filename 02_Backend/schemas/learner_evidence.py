"""
Learner Evidence Schema for FutureMe AI Platform.
Stores qualitative STAR interview responses, project evidence, and behavioral indicators.
"""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class StarResponse(BaseModel):
    situation: str = Field("", description="Situation context (S)")
    task: str = Field("", description="Task or challenge faced (T)")
    action: str = Field("", description="Action taken by the student (A)")
    result: str = Field("", description="Outcome or result achieved (R)")


class LearnerEvidence(BaseModel):
    evidence_id: str = Field(..., description="Unique evidence record ID")
    student_id: str = Field(..., description="Student profile ID")
    star_responses: Dict[str, str] = Field(
        default_factory=dict,
        description="STAR method breakdown dict (situation, task, action, result)"
    )
    behavioral_traits: List[str] = Field(
        default_factory=list,
        description="Extracted behavioral traits (e.g. ['Problem Solving', 'Leadership'])"
    )
    evidence_type: str = Field(
        "socratic_dialogue",
        description="Source of evidence: 'socratic_dialogue', 'scenario_mission', 'portfolio_project', 'academic_record'"
    )
    verified_skills: List[str] = Field(
        default_factory=list,
        description="Skills verified through evidence analysis"
    )
    confidence_score: float = Field(
        0.8,
        description="Confidence level of evidence assessment (0.0 to 1.0)"
    )
    timestamp: str = Field(
        default_factory=lambda: datetime.utcnow().isoformat(),
        description="ISO UTC timestamp of recorded evidence"
    )
