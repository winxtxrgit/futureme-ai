"""
Future Path Node Schema for FutureMe AI Platform.
Represents individual nodes in the interactive Pathfinder DAG roadmap.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class FuturePathNode(BaseModel):
    node_id: str = Field(..., description="Unique node ID (e.g. 'node_start', 'milestone_1')")
    title: str = Field(..., description="Node title (e.g. 'พัฒนาทักษะ Python & Data Science')")
    node_type: str = Field(
        ...,
        description="Node type: 'start', 'milestone_1', 'milestone_2', 'milestone_3', 'milestone_4', or 'career_goal'"
    )
    description: str = Field(..., description="Detailed breakdown of tasks or goals for this node")
    status: str = Field("pending", description="Status: 'completed', 'in_progress', or 'pending'")
    prerequisites: List[str] = Field(
        default_factory=list,
        description="List of precursor node_ids required before starting this node"
    )
    action_plan: List[str] = Field(
        default_factory=list,
        description="Specific 30-day action steps or learning resources"
    )
    resource_links: List[str] = Field(
        default_factory=list,
        description="Free course links, books, or documentation references"
    )
