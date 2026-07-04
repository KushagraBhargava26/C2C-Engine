# c2c-brain — Sentiment & Risk Analysis Service

The AI engine for **C2C: Conflict to Currency**. Wraps FinBERT (financial-news
sentiment) and a trained logistic-regression risk classifier behind a FastAPI
service, per the locked `CONTRACT.md`.

## What this service does

1. Takes raw incident text (e.g. a geopolitical headline).
2. Runs it through FinBERT → sentiment label (`POSITIVE`/`NEGATIVE`/`NEUTRAL`) + confidence + a 768-dim CLS embedding.
3. Feeds that embedding into a separately trained classifier → risk bucket (`LOW`/`MEDIUM`/`HIGH`/`CRITICAL`).
4. Returns both in the exact shape Spring Boot expects.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Model files

This repo does **not** ship model weights. Before running, place:

- FinBERT files (`model.safetensors`, `config.json`, `tokenizer.json`, `tokenizer_config.json`) into `app/ml_artifacts/finbert_model/`
- The trained risk-classifier files (`risk_classifier.joblib`, `feature_scaler.joblib`, `label_encoder.joblib`) into `app/ml_artifacts/risk_classifier/` — already included in this handoff.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Interactive docs at `http://localhost:8000/docs`.

## Sample request

```bash
curl -X POST http://localhost:8000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "incidentText": "Tensions escalate along the eastern border as troops mobilize.",
    "sourceRegion": "IN",
    "timestamp": "2026-07-04T10:15:00Z"
  }'
```

Sample response:

```json
{
  "sentimentLabel": "NEGATIVE",
  "confidenceScore": 0.87,
  "riskLevel": "HIGH",
  "region": "IN",
  "analyzedAt": "2026-07-04T10:15:02Z"
}
```

Health check:

```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

## Tests

```bash
pytest -v
```

## Known limitations (say these out loud in review/demo)

- Risk labels are a **market-volatility proxy** (forward 5-day realized
  volatility, quantile-bucketed), not verified ground-truth geopolitical
  risk.
- The classifier was trained on **US Nasdaq-100 company stock news** and is
  applied at inference to **geopolitical incident text** — a real domain
  shift. Treat outputs as a reasonable heuristic, not ground truth.
- Training data skews toward the Tech sector; other sectors in
  `CONTRACT.md` (Banking, Energy, Manufacturing, Agriculture) are
  underrepresented in training.
- `riskLevel` is produced by a trained classifier on FinBERT embeddings, not
  a literal "sentiment + confidence threshold table" — see
  `ARCHITECTURE.md` for the honest data flow if asked how the thresholds
  work.

## Project structure

```
c2c-brain/
├── app/
│   ├── main.py                  # FastAPI app, CORS, error handlers, model warm-up
│   ├── routers/
│   │   ├── analyze.py           # POST /api/v1/analyze
│   │   └── health.py            # GET /health
│   ├── services/
│   │   ├── sentiment_service.py # FinBERT wrapper
│   │   └── risk_service.py      # embedding -> scaler -> classifier -> label
│   ├── schemas/
│   │   └── incident.py          # Pydantic models matching CONTRACT.md
│   └── ml_artifacts/
│       ├── finbert_model/       # drop FinBERT files here
│       └── risk_classifier/     # trained .joblib files (included)
├── tests/
│   ├── conftest.py
│   └── test_analyze.py
├── requirements.txt
├── .env.example
├── README.md
└── ARCHITECTURE.md
```
