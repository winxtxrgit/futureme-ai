"""
Education Level Schema for FutureMe AI Platform.
Supports upper primary (ป.4-ป.6), lower secondary (ม.1-ม.3),
upper secondary (ม.4-ม.6), and vocational (ปวช./ปวส.).
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class EducationLevel(str, Enum):
    P4_P6 = "p4_p6"
    M1_M3 = "m1_m3"
    M4_M6 = "m4_m6"
    VOCATIONAL = "vocational"

    @classmethod
    def normalize(cls, value: str) -> "EducationLevel":
        """Normalize Thai or informal education level string inputs into EducationLevel enum."""
        if not isinstance(value, str):
            return cls.P4_P6
        val = value.strip().lower()
        if any(k in val for k in ["ป.4", "ป.5", "ป.6", "ป4", "ป5", "ป6", "primary", "p4"]):
            return cls.P4_P6
        elif any(k in val for k in ["ม.1", "ม.2", "ม.3", "ม1", "ม2", "ม3", "lower_secondary", "m1"]):
            return cls.M1_M3
        elif any(k in val for k in ["ม.4", "ม.5", "ม.6", "ม4", "ม5", "ม6", "upper_secondary", "m4"]):
            return cls.M4_M6
        elif any(k in val for k in ["ปวช", "ปวส", "vocational", "อาชีวะ", "voc"]):
            return cls.VOCATIONAL
        
        # Exact value matching fallback
        for member in cls:
            if member.value == val:
                return member
        return cls.P4_P6


class EducationLevelInfo(BaseModel):
    level_code: EducationLevel = Field(..., description="Standardized education level code")
    name_th: str = Field(..., description="Thai display name (e.g., ประถมปลาย (ป.4-ป.6))")
    name_en: str = Field(..., description="English display name")
    focus_area: str = Field(..., description="Primary guidance focus area for this level")
    description: Optional[str] = Field(None, description="Detailed description of educational stage")
