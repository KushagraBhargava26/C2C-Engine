"""
Maps a FinBERT CLS embedding to a risk bucket using YOUR trained pipeline:
    768-dim embedding -> StandardScaler -> LogisticRegression -> LabelEncoder

This is NOT a simple sentiment+confidence threshold table (CONTRACT.md's
field note is a simplification for readers outside the AI track). The real
mapping is a classifier trained on forward 5-day realized-volatility proxy
labels — see ml_artifacts/risk_classifier/README.md for the honest
limitations (proxy labels, domain shift from stock news to geopolitical
incident text, Tech-sector skew in training data). Surface those limitations
if asked in review/demo — don't overstate this as verified ground-truth risk.
"""
from pathlib import Path

import joblib
import numpy as np

ARTIFACT_DIR = Path(__file__).resolve().parent.parent / "ml_artifacts" / "risk_classifier"


class RiskService:
    def __init__(self, artifact_dir: Path = ARTIFACT_DIR):
        scaler_path = artifact_dir / "feature_scaler.joblib"
        classifier_path = artifact_dir / "risk_classifier.joblib"
        encoder_path = artifact_dir / "label_encoder.joblib"

        for p in (scaler_path, classifier_path, encoder_path):
            if not p.exists():
                raise FileNotFoundError(f"Missing risk-classifier artifact: {p}")

        self.scaler = joblib.load(scaler_path)
        self.classifier = joblib.load(classifier_path)
        self.label_encoder = joblib.load(encoder_path)

    def predict(self, embedding: "list[float]") -> str:
        """embedding: 768-dim FinBERT CLS vector -> 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'"""
        x = np.asarray(embedding, dtype=np.float64).reshape(1, -1)
        x_scaled = self.scaler.transform(x)
        class_idx = self.classifier.predict(x_scaled)[0]
        label = self.label_encoder.inverse_transform([class_idx])[0]
        return str(label)
