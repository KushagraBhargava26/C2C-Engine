import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request

from app.schemas.incident import IncidentInput, RiskPayload

logger = logging.getLogger("c2c_brain")

router = APIRouter(prefix="/api/v1", tags=["analyze"])


@router.post("/analyze", response_model=RiskPayload)
def analyze(payload: IncidentInput, request: Request):
    sentiment_service = request.app.state.sentiment_service
    risk_service = request.app.state.risk_service

    try:
        result = sentiment_service.analyze(payload.incidentText)
    except Exception:
        logger.exception("FinBERT inference failed")
        raise HTTPException(
            status_code=500,
            detail="Sentiment analysis failed. Please try again.",
        )

    try:
        risk_level = risk_service.predict(result.embedding)
    except Exception:
        logger.exception("Risk classification failed")
        raise HTTPException(
            status_code=500,
            detail="Risk classification failed. Please try again.",
        )

    return RiskPayload(
        sentimentLabel=result.label,
        confidenceScore=round(result.confidence, 4),
        riskLevel=risk_level,
        region=payload.sourceRegion,
        analyzedAt=datetime.now(timezone.utc),
    )
