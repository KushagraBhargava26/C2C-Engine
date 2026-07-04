import pytest

from app.services.risk_service import RiskService


@pytest.fixture(scope="session")
def risk_service():
    return RiskService()
