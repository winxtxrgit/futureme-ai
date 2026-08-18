"""
Route Option Schema for FutureMe AI Platform.
Represents pathway alternatives (Balanced Next Step, Interest Growth Route, Practical Access Route).
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RouteOption(BaseModel):
    route_id: str = Field(..., description="Unique route identifier")
    route_type: str = Field(
        ...,
        description="Type of route: 'Balanced Next Step', 'Interest Growth Route', or 'Practical Access Route'"
    )
    title: str = Field(..., description="Display title of the pathway option")
    description: str = Field(..., description="Detailed description and rationale for this route")
    suitability_score: float = Field(
        ...,
        description="Weighted decision score for this route (0.0 to 100.0)"
    )
    target_curriculum: str = Field(
        ...,
        description="Recommended curriculum/track (e.g. 'วิทย์-คอมพิวเตอร์', 'อาชีวะ ปวช. เทคโนโลยีสารสนเทศ')"
    )
    key_milestones: List[str] = Field(
        default_factory=list,
        description="Main steps or milestones along this path"
    )
    total_duration_months: int = Field(
        36,
        description="Estimated duration in months to achieve target stage"
    )
    recommended_actions: List[str] = Field(
        default_factory=list,
        description="Immediate 30-day action plan items"
    )
    pros: List[str] = Field(
        default_factory=list,
        description="Advantages and strengths of this route"
    )
    cons: List[str] = Field(
        default_factory=list,
        description="Trade-offs or challenges to consider"
    )
