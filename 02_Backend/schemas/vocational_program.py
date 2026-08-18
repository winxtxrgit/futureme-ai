"""
Vocational Program Schema for FutureMe AI Platform.
Covers all 12 Vocational Subject Areas (สาขาวิชา 12 กลุ่ม ปวช. พ.ศ. 2567).
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

# 12 Standardized Vocational Subject Areas (ปวช. 2567)
VOCATIONAL_12_AREAS = [
    "อุตสาหกรรม",
    "บริหารธุรกิจ",  # พาณิชยการ/บริหารธุรกิจ
    "ศิลปกรรม",
    "คหกรรม",
    "เกษตรกรรม",
    "ประมง",
    "ท่องเที่ยว",
    "อุตสาหกรรมสิ่งทอ",
    "อุตสาหกรรมสารสนเทศและการสื่อสาร",
    "ดุริยางคศิลป์และนาฏศิลป์",
    "เทคโนโลยีสารสนเทศ",
    "ทัศนศิลป์",
]


class VocationalProgram(BaseModel):
    program_id: str = Field(..., description="Program identifier code (e.g. 'VOC-ICT-01')")
    program_name: str = Field(..., description="Program name in Thai (e.g. 'สาขาวิชาเทคโนโลยีสารสนเทศ')")
    vocational_level: str = Field("ปวช.", description="Level: 'ปวช.' or 'ปวส.'")
    subject_area: str = Field(
        ...,
        description="One of the 12 vocational areas (e.g. 'เทคโนโลยีสารสนเทศ', 'อุตสาหกรรม')"
    )
    dual_education_partner: Optional[str] = Field(
        None,
        description="Enterprise partner for Dual Vocational Education (ระบบทวิภาคี) if available"
    )
    curriculum_description: str = Field(..., description="Overview of core curriculum and practical training")
    key_skills: List[str] = Field(
        default_factory=list,
        description="Core practical skills acquired"
    )
    career_prospects: List[str] = Field(
        default_factory=list,
        description="Entry-level job roles and career advancement opportunities"
    )
