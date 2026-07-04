"""
Pydantic models for the /api/v1/analyze contract.
Field names and types must match CONTRACT.md Section 1 EXACTLY —
this is the source of truth Spring Boot's DTOs mirror.
"""
import re
from datetime import datetime, timezone
from enum import Enum

from pydantic import BaseModel, Field, field_validator


# --- Fixed value lists (CONTRACT.md Section 3) ---

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SentimentLabel(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"


# --- Request ---

_ISO_ALPHA2 = re.compile(r"^[A-Z]{2}$")


class IncidentInput(BaseModel):
    incidentText: str = Field(..., min_length=1, max_length=2000)
    sourceRegion: str = Field(..., description="ISO 3166-1 alpha-2 country code")
    timestamp: datetime

    @field_validator("incidentText")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("incidentText must not be blank")
        return v.strip()

    @field_validator("sourceRegion")
    @classmethod
    def valid_iso_alpha2(cls, v: str) -> str:
        v = v.strip().upper()
        if not _ISO_ALPHA2.match(v):
            raise ValueError(
                f"sourceRegion must be a 2-letter ISO 3166-1 alpha-2 code, got '{v}'"
            )
        return v

    @field_validator("timestamp")
    @classmethod
    def has_timezone(cls, v: datetime) -> datetime:
        # Accept naive timestamps but normalize to UTC so downstream
        # comparisons are never ambiguous.
        if v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v


# --- Response ---

class RiskPayload(BaseModel):
    sentimentLabel: SentimentLabel
    confidenceScore: float = Field(..., ge=0.0, le=1.0)
    riskLevel: RiskLevel
    region: str
    analyzedAt: datetime

    model_config = {
        "json_schema_extra": {
            "example": {
                "sentimentLabel": "NEGATIVE",
                "confidenceScore": 0.87,
                "riskLevel": "HIGH",
                "region": "IN",
                "analyzedAt": "2026-07-04T10:15:02Z",
            }
        }
    }


# --- Error shape (CONTRACT.md, all endpoints) ---

class ErrorResponse(BaseModel):
    timestamp: datetime
    status: int
    error: str
    message: str
