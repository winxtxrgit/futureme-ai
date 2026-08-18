"""
Source Record Schema for FutureMe AI Platform.
Represents knowledge base documents, curriculum chunks, and research references retrieved via RAG.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SourceRecord(BaseModel):
    source_id: str = Field(..., description="Unique source chunk ID")
    title: str = Field(..., description="Document or curriculum section title")
    source_type: str = Field(
        ...,
        description="Source type: 'curriculum', 'vocational', 'research', 'tcas_blueprint'"
    )
    chunk_content: str = Field(..., description="Text content of the retrieved chunk")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata dictionary (education_level, vocational_area, tags, etc.)"
    )
    vector: Optional[List[float]] = Field(
        None,
        description="Dense vector embedding representation (1024-dim for BGE-M3)"
    )
    relevance_score: Optional[float] = Field(
        None,
        description="Hybrid retrieval similarity score (0.0 to 1.0)"
    )
    page_number: Optional[int] = Field(None, description="Source page number if applicable")
    file_path: Optional[str] = Field(None, description="Original source file path")
