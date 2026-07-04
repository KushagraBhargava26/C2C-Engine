"""
Core test cases per roadmap hour 9-10: schema validation, risk-mapping
behavior, and the /analyze endpoint via TestClient.
Not full coverage by design — these are the highest-value cases.
"""
import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.incident import IncidentInput


# --- Schema validation ---

def test_incident_input_rejects_blank_text():
    with pytest.raises(ValidationError):
        IncidentInput(incidentText="   ", sourceRegion="IN", timestamp="2026-07-04T10:15:00Z")


def test_incident_input_rejects_bad_region_code():
    with pytest.raises(ValidationError):
        IncidentInput(incidentText="Something happened", sourceRegion="India", timestamp="2026-07-04T10:15:00Z")


def test_incident_input_uppercases_region():
    incident = IncidentInput(incidentText="Something happened", sourceRegion="in", timestamp="2026-07-04T10:15:00Z")
    assert incident.sourceRegion == "IN"


# --- Risk-mapping thresholds (the most "opinionated" code — test hardest) ---

def test_risk_service_returns_valid_bucket(risk_service):
    # A neutral all-zero embedding should still return one of the 4 valid buckets.
    embedding = [0.0] * 768
    result = risk_service.predict(embedding)
    assert result in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}


# --- /analyze endpoint (real model, real HTTP call via TestClient) ---

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_analyze_endpoint_happy_path(client):
    response = client.post(
        "/api/v1/analyze",
        json={
            "incidentText": "Tensions escalate along the eastern border as troops mobilize.",
            "sourceRegion": "IN",
            "timestamp": "2026-07-04T10:15:00Z",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["sentimentLabel"] in {"POSITIVE", "NEGATIVE", "NEUTRAL"}
    assert body["riskLevel"] in {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
    assert body["region"] == "IN"
    assert 0.0 <= body["confidenceScore"] <= 1.0


def test_analyze_endpoint_rejects_blank_text(client):
    response = client.post(
        "/api/v1/analyze",
        json={"incidentText": "   ", "sourceRegion": "IN", "timestamp": "2026-07-04T10:15:00Z"},
    )
    assert response.status_code == 422
    body = response.json()
    assert body["status"] == 422
    assert "message" in body


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
