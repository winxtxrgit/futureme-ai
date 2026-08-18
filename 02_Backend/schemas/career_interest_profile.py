"""
Career Interest Profile Schema for FutureMe AI Platform.
Represents RIASEC scores (Realistic, Investigative, Artistic, Social, Enterprising, Conventional)
and student interest preferences.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class CareerInterestProfile(BaseModel):
    riasec_scores: Dict[str, float] = Field(
        default_factory=lambda: {
            "R": 0.0,
            "I": 0.0,
            "A": 0.0,
            "S": 0.0,
            "E": 0.0,
            "C": 0.0,
        },
        description="RIASEC interest scores normalized between 0.0 and 1.0 (or raw scale)"
    )
    top_interests: List[str] = Field(
        default_factory=list,
        description="Top interest categories/topics (e.g. ['Software', 'Creative Design', 'Robotics'])"
    )
    target_fields: List[str] = Field(
        default_factory=list,
        description="Preferred career fields or subjects"
    )
    primary_traits: List[str] = Field(
        default_factory=list,
        description="Key personality traits identified from assessment/dialogue"
    )
    skill_highlights: List[str] = Field(
        default_factory=list,
        description="Self-reported or verified skills"
    )
    preferred_learning_style: Optional[str] = Field(
        None,
        description="Preferred learning style (e.g., 'Hands-on / Practical', 'Academic / Theoretical')"
    )
    notes: Optional[str] = Field(
        None,
        description="Additional context or counselor notes"
    )

    @field_validator("riasec_scores")
    @classmethod
    def validate_riasec_keys(cls, v: Dict[str, float]) -> Dict[str, float]:
        standard_keys = {"R", "I", "A", "S", "E", "C"}
        full_names = {
            "realistic": "R",
            "investigative": "I",
            "artistic": "A",
            "social": "S",
            "enterprising": "E",
            "conventional": "C",
        }
        res = {"R": 0.0, "I": 0.0, "A": 0.0, "S": 0.0, "E": 0.0, "C": 0.0}
        for key, score in v.items():
            k_upper = key.upper()
            if k_upper in standard_keys:
                res[k_upper] = float(score)
            elif key.lower() in full_names:
                res[full_names[key.lower()]] = float(score)
        return res
