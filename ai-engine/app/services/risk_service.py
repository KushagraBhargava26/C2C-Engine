"""
Risk-level classifier wrapper.

Downloads the trained classifier + scaler + label encoder from the
Hugging Face repo (public repo, so no token needed) via hf_hub_download,
which caches them locally after the first download -- same "load once at
startup" pattern as SentimentService.
"""

import os
import joblib
import numpy as np
from huggingface_hub import hf_hub_download

FINBERT_REPO_ID = os.getenv("FINBERT_REPO_ID", "Lakshya-Sahu47/c2c-finbert-risk")

ARTIFACT_FILENAMES = {
    "classifier": "risk_classifier/risk_classifier.joblib",
    "scaler": "risk_classifier/feature_scaler.joblib",
    "label_encoder": "risk_classifier/label_encoder.joblib",
}


class RiskService:
    def __init__(self, repo_id: str = FINBERT_REPO_ID):
        self.classifier = self._load_artifact(repo_id, ARTIFACT_FILENAMES["classifier"])
        self.scaler = self._load_artifact(repo_id, ARTIFACT_FILENAMES["scaler"])
        self.label_encoder = self._load_artifact(repo_id, ARTIFACT_FILENAMES["label_encoder"])

    @staticmethod
    def _load_artifact(repo_id: str, filename: str):
        local_path = hf_hub_download(repo_id=repo_id, filename=filename)
        return joblib.load(local_path)

    def predict(self, embedding: np.ndarray) -> str:
        """
        Takes the 768-dim CLS embedding from SentimentService and returns
        the riskLevel string (LOW/MEDIUM/HIGH/CRITICAL).
        """
        embedding = embedding.reshape(1, -1)
        scaled = self.scaler.transform(embedding)
        encoded_pred = self.classifier.predict(scaled)
        risk_level = self.label_encoder.inverse_transform(encoded_pred)[0]
        return str(risk_level)