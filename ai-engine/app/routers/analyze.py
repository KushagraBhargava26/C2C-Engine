import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

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


# --- Batch endpoint (roadmap Hour 12-14 stretch goal) ---------------------
# analyze_batch() on the service layer already existed as a simple loop;
# this just exposes it over HTTP, reusing the exact same per-item logic
# (and per-item error handling) as the single /analyze endpoint above.


class BatchIncidentInput(BaseModel):
    incidents: List[IncidentInput]


class BatchRiskPayload(BaseModel):
    results: List[RiskPayload]


@router.post("/analyze/batch", response_model=BatchRiskPayload)
def analyze_batch(payload: BatchIncidentInput, request: Request):
    sentiment_service = request.app.state.sentiment_service
    risk_service = request.app.state.risk_service

    if not payload.incidents:
        raise HTTPException(
            status_code=422,
            detail="incidents must contain at least one item.",
        )

    texts = [incident.incidentText for incident in payload.incidents]

    try:
        sentiment_results = sentiment_service.analyze_batch(texts)
    except Exception:
        logger.exception("FinBERT batch inference failed")
        raise HTTPException(
            status_code=500,
            detail="Sentiment analysis failed. Please try again.",
        )

    results = []
    for incident, sentiment_result in zip(payload.incidents, sentiment_results):
        try:
            risk_level = risk_service.predict(sentiment_result.embedding)
        except Exception:
            logger.exception("Risk classification failed")
            raise HTTPException(
                status_code=500,
                detail="Risk classification failed. Please try again.",
            )

        results.append(
            RiskPayload(
                sentimentLabel=sentiment_result.label,
                confidenceScore=round(sentiment_result.confidence, 4),
                riskLevel=risk_level,
                region=incident.sourceRegion,
                analyzedAt=datetime.now(timezone.utc),
            )
        )

    return BatchRiskPayload(results=results)
