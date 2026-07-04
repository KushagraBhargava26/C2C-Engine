# Architecture — c2c-brain

## Data flow

```
                POST /api/v1/analyze
                        │
                        ▼
            ┌───────────────────────┐
            │   IncidentInput        │  Pydantic validation:
            │   (schemas/incident.py)│  non-empty text, ISO alpha-2 region,
            └───────────┬───────────┘  timestamp normalized to UTC
                        │
                        ▼
            ┌───────────────────────┐
            │  SentimentService       │  FinBERT forward pass
            │  (services/            │  → sentimentLabel (from model's own
            │   sentiment_service.py)│    id2label — not hardcoded)
            └───────────┬───────────┘  → confidenceScore (softmax prob)
                        │              → 768-dim CLS embedding
                        ▼
            ┌───────────────────────┐
            │  RiskService            │  StandardScaler.transform()
            │  (services/             │  → LogisticRegression.predict()
            │   risk_service.py)      │  → LabelEncoder.inverse_transform()
            └───────────┬───────────┘  → riskLevel
                        │
                        ▼
            ┌───────────────────────┐
            │   RiskPayload           │  Matches CONTRACT.md exactly
            └───────────────────────┘
```

## Why two separate models instead of one

FinBERT is a general financial-sentiment classifier — it was never trained
to predict market-volatility risk buckets. Rather than hand-writing a
sentiment→risk threshold table (fragile, hard to justify), the risk bucket
comes from a **second model** trained specifically for that task: a
logistic regression on FinBERT's own CLS embeddings, with labels
derived from actual forward realized volatility on historical Nasdaq-100
news (see `README.md` → Known limitations). This is a more defensible
"why HIGH vs CRITICAL" answer than an arbitrary cutoff table, at the cost
of a documented domain-shift caveat (trained on stock news, applied to
geopolitical incidents).

## Why FinBERT (`ProsusAI/finbert`)

Pretrained on financial text (analyst reports, earnings calls), so it
captures financial sentiment nuance a general-purpose sentiment model
(vanilla BERT, VADER) would miss — relevant since the domain is market
exposure, not generic text sentiment.

## Why FastAPI + Pydantic-first schema design

- Native async, automatic OpenAPI generation, built-in request validation —
  useful for a microservice whose main job is serving a strict, well-typed
  contract to Spring Boot.
- Defining `IncidentInput` / `RiskPayload` before endpoint logic makes the
  schema the single source of truth; Spring's DTOs mirror it exactly
  rather than a verbal description.

## Model lifecycle

Both models load once at process startup (`app/main.py`'s `lifespan`
context manager) and are held in `app.state`, not re-loaded per request.
This is the "model warm-up on startup instead of first request" stretch
goal from the roadmap — it avoids a slow, demo-visible first call.

## Error handling

- `422` — Pydantic validation failures (bad payload shape), body shaped
  per `CONTRACT.md`'s Error Shape.
- `500` — model inference failures, with a generic safe message; the real
  exception is logged server-side, never returned to the caller.

## What's intentionally out of scope for this service (see CONTRACT.md Decision Log)

- Entity/relationship extraction for the Knowledge Graph — that graph is
  hand-authored/seeded by the backend, not produced by this service.
- Portfolio causal chains — also seeded, not AI-derived, for this MVP.

If either of those scope decisions changes, this document and
`CONTRACT.md` both need updating together.
