"""
Wraps FinBERT (ProsusAI/finbert) inference behind a clean function.
Isolated from the API layer so it's independently testable and so the
risk_service can reuse the same embeddings without importing FastAPI code.

ASSUMPTION: model checkpoint is ProsusAI/finbert (per roadmap). This module
reads label order from the model's own config.id2label rather than hardcoding
index->label, so it will still be correct even if a different finetuned
checkpoint is dropped into ml_artifacts/finbert_model/ with a different label order.
"""
from dataclasses import dataclass
from pathlib import Path

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL_DIR = Path(__file__).resolve().parent.parent / "ml_artifacts" / "finbert_model"


@dataclass
class SentimentResult:
    label: str            # "POSITIVE" | "NEGATIVE" | "NEUTRAL"
    confidence: float     # 0.0-1.0, softmax prob of the winning class
    embedding: "list[float]"  # 768-dim CLS embedding, fed to risk_service


class SentimentService:
    """Loads FinBERT once at startup (see main.py lifespan) and serves
    inference calls. Do not instantiate per-request — model load is slow."""

    def __init__(self, model_dir: Path = MODEL_DIR):
        if not model_dir.exists() or not any(model_dir.iterdir()):
            raise FileNotFoundError(
                f"FinBERT model files not found in {model_dir}. "
                "Copy model.safetensors, config.json, tokenizer.json, "
                "tokenizer_config.json into this folder."
            )
        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_dir, output_hidden_states=True
        )
        self.model.eval()
        # id2label comes from the checkpoint's own config — don't hardcode.
        self.id2label = {
            int(k): v.upper() for k, v in self.model.config.id2label.items()
        }

    @torch.no_grad()
    def analyze(self, text: str) -> SentimentResult:
        inputs = self.tokenizer(
            text, return_tensors="pt", truncation=True, max_length=512
        )
        outputs = self.model(**inputs)

        probs = torch.softmax(outputs.logits, dim=-1)[0]
        top_idx = int(torch.argmax(probs).item())
        label = self.id2label.get(top_idx, "NEUTRAL")
        confidence = float(probs[top_idx].item())

        # CLS token embedding from the last hidden layer — this is the
        # 768-dim feature vector the risk_classifier.joblib was trained on.
        last_hidden = outputs.hidden_states[-1]
        cls_embedding = last_hidden[0, 0, :].tolist()

        return SentimentResult(
            label=label, confidence=confidence, embedding=cls_embedding
        )

    def analyze_batch(self, texts: "list[str]") -> "list[SentimentResult]":
        # Simple loop for now; batch tensor inference is a stretch-goal
        # optimization (roadmap hour 12-14) if latency becomes an issue.
        return [self.analyze(t) for t in texts]
