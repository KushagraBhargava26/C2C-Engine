# C2C: Conflict to Currency — Locked API Contract

This file is the single source of truth for data shapes between all three services.
**Do not edit without notifying the other two engineers.**

*Last updated: 2026-07-05 — documented sentiment-timeseries `window` param behavior (v2.5).*

---

## 1. Python (AI Brain) → Spring Boot

### Endpoint
`POST http://localhost:8000/api/v1/analyze`

### Request Body
```json
{
  "incidentText": "Tensions escalate along the eastern border as troops mobilize.",
  "sourceRegion": "IN",
  "timestamp": "2026-07-04T10:15:00Z"
}
```

### Response Body
```json
{
  "sentimentLabel": "NEGATIVE",
  "confidenceScore": 0.87,
  "riskLevel": "HIGH",
  "region": "IN",
  "analyzedAt": "2026-07-04T10:15:02Z"
}
```

**Field notes:**
- `sentimentLabel`: one of `POSITIVE`, `NEGATIVE`, `NEUTRAL` (raw FinBERT output)
- `confidenceScore`: float, 0.0–1.0
- `riskLevel`: one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. Primary path: predicted by a trained classifier (logistic regression on FinBERT's CLS embedding, labeled from historical forward realized volatility — see `ARCHITECTURE.md`). Fallback path: if the trained classifier is unavailable or errors, falls back to a rule-based sentiment+confidence threshold table so the endpoint never crashes. Both paths return the same enum values.
- `region`: ISO country code, echoed back from the request

### Health Check
`GET http://localhost:8000/health` → `200 OK` with `{"status": "ok"}`

### Batch Endpoint (optional, added post-MVP — not required for core scope)
`POST http://localhost:8000/api/v1/analyze/batch`

#### Request Body
```json
{
  "incidents": [
    { "incidentText": "Tensions escalate along the eastern border as troops mobilize.", "sourceRegion": "IN", "timestamp": "2026-07-04T10:15:00Z" },
    { "incidentText": "Trade talks conclude successfully.", "sourceRegion": "US", "timestamp": "2026-07-04T11:00:00Z" }
  ]
}
```

#### Response Body
```json
{
  "results": [
    { "sentimentLabel": "NEGATIVE", "confidenceScore": 0.87, "riskLevel": "HIGH", "region": "IN", "analyzedAt": "2026-07-04T10:15:02Z" },
    { "sentimentLabel": "POSITIVE", "confidenceScore": 0.80, "riskLevel": "LOW", "region": "US", "analyzedAt": "2026-07-04T10:15:02Z" }
  ]
}
```

**Field notes:**
- Each item in `results` has the exact same shape as the single `/analyze` response above.
- `results` is returned in the same order as `incidents` was submitted.
- 422 if `incidents` is an empty array.
- Not required for the MVP — available if the backend prefers to batch-submit multiple incidents in one call instead of calling `/analyze` per item.

---

## 2. Spring Boot (Backbone) → React (Face)

### Endpoint A — Incident Ticker Feed
`GET http://localhost:8080/api/v1/incidents?page=0&size=20`

#### Response Body
```json
{
  "content": [
    {
      "id": 101,
      "incidentText": "Tensions escalate along the eastern border as troops mobilize.",
      "region": "IN",
      "riskLevel": "HIGH",
      "confidenceScore": 0.87,
      "createdAt": "2026-07-04T10:15:02Z"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 143
}
```

### Endpoint B — Exposure Heatmap Data
`GET http://localhost:8080/api/v1/exposure/heatmap`

#### Response Body (flat list — pivot into a grid client-side if needed)
```json
{
  "data": [
    { "region": "IN", "sector": "Banking", "exposureScore": 72.5 },
    { "region": "IN", "sector": "Energy", "exposureScore": 41.0 },
    { "region": "CN", "sector": "Manufacturing", "exposureScore": 88.2 }
  ],
  "generatedAt": "2026-07-04T10:20:00Z"
}
```

**Field notes:**
- `exposureScore`: float, 0–100, aggregated from all `ExposureLink` rows for that region+sector
- `sector`: string, matches `MarketSector.name` in the DB (fixed short list — see Section 3)

### Endpoint C — Submit New Incident (orchestration)
`POST http://localhost:8080/api/v1/incidents`

#### Request Body
```json
{
  "incidentText": "Tensions escalate along the eastern border as troops mobilize.",
  "sourceRegion": "IN"
}
```

#### Response Body
Same shape as one item in Endpoint A's `content` array — the enriched, persisted incident.

### Endpoint D — Country Risk Detail
`GET http://localhost:8080/api/v1/countries/{isoCode}`

Powers the Risk Map's click-through detail panel. **No new table required** — `GROUP BY region` aggregation over existing `Incident` and `ExposureLink` data.

#### Response Body
```json
{
  "region": "IN",
  "riskScore": 42,
  "riskLevel": "MEDIUM",
  "activeEvents": 12,
  "affectedSectors": ["Tech", "Manufacturing"],
  "marketImpactPct": 2.1,
  "lastUpdated": "2026-07-04T10:20:00Z"
}
```

**Field notes:**
- `riskScore`: int, 0–100. **Decided:** average `confidenceScore` of that region's incidents with `riskLevel >= MEDIUM` over the last 7 days, scaled to 0–100.
- `riskLevel`: same fixed list as above — derived from `riskScore`, not stored separately
- `activeEvents`: int. **Decided:** count of incidents for that region in the last 7 days (same window as `riskScore` above).
- `affectedSectors`: array of strings, must be from the fixed sector list in Section 3 — do not introduce new sector names here
- `marketImpactPct`: float, can be negative. **Decided:** positive = market gain (e.g. `+2.1` means a 2.1% favorable market move); negative = adverse impact. Frontend should color positive values green/favorable and negative values red/adverse.
- 404 if `isoCode` has no incidents on record — use the standard error shape below

### Endpoint E — Portfolio Exposure
`GET http://localhost:8080/api/v1/portfolio/exposure`

Powers the Portfolio Exposure page — the causal-chain "wow" feature.

#### Response Body
```json
{
  "totalExposureUsd": 2460000000000,
  "holdings": [
    {
      "ticker": "RELIANCE",
      "name": "Reliance Industries",
      "sector": "Energy",
      "region": "IN",
      "exposurePct": 18.0,
      "chain": [
        { "node": "Red Sea shipping disruption", "type": "EVENT" },
        { "node": "Oil price +8%", "type": "MARKET_SIGNAL" },
        { "node": "Shipping costs -3%", "type": "MARKET_SIGNAL" },
        { "node": "Reliance Industries", "type": "HOLDING", "impactPct": 18.0 }
      ]
    }
  ],
  "generatedAt": "2026-07-04T10:20:00Z"
}
```

**Field notes:**
- `sector`: fixed list from Section 3, same as everywhere else
- `region`: ISO alpha-2, same as everywhere else
- `exposurePct`: float, 0–100, this holding's share of total portfolio risk exposure (not the same as portfolio weight/allocation — document which one backend means if this gets confusing later)
- `chain`: ordered array telling the causal story from event to holding. `type` is one of `EVENT`, `MARKET_SIGNAL`, `HOLDING`. Only the last node carries `impactPct`.
- `totalExposureUsd`: currently a fixed illustrative constant (`2,460,000,000,000`) in `PortfolioService`, not summed from `Holding` rows or a real portfolio valuation — consistent with the `isIllustrative` treatment of `chain` data below.
- **New table:** `Holding` (ticker, name, sector, region) — did not exist in the original schema. Seeded with a small fixed list (5–10 holdings) rather than a full portfolio-management feature.
- **Decision (resolved, see Section 5):** `chain` data is hand-authored/seeded for the demo, not AI-derived. Marked with `"isIllustrative": true` where applicable. Current implementation uses one generic 3-node chain template ("Regional geopolitical incident" → "Commodity price shift" → "Sector-wide cost impact") applied identically to every holding, rather than a distinct story per holding as shown in this doc's example. Functionally contract-compliant; flagged here as a demo-polish item, not a shape issue.

### Endpoint F — Knowledge Graph
`GET http://localhost:8080/api/v1/graph`

Powers the Knowledge Graph page.

#### Response Body
```json
{
  "nodes": [
    { "id": "n1", "label": "Russia", "type": "COUNTRY" },
    { "id": "n2", "label": "EU Sanctions", "type": "EVENT" },
    { "id": "n3", "label": "Oil", "type": "COMMODITY" },
    { "id": "n4", "label": "Reliance", "type": "HOLDING" }
  ],
  "edges": [
    { "source": "n1", "target": "n2", "relation": "SANCTIONED_BY" },
    { "source": "n2", "target": "n3", "relation": "IMPACTS" },
    { "source": "n3", "target": "n4", "relation": "IMPACTS" }
  ],
  "generatedAt": "2026-07-04T10:20:00Z"
}
```

**Field notes:**
- `node.type`: one of `COUNTRY`, `EVENT`, `COMMODITY`, `SECTOR`, `HOLDING` (open list — add types here as needed, but document each addition)
- `edge.relation`: free-ish string but keep a documented vocabulary (see Section 3) so the frontend can style edges consistently by relation type
- **Decision (resolved, see Section 5):** graph is a small hand-authored fixed graph (10–20 nodes) served as-is, not generated from real entity/relationship extraction. Current implementation ships 6 nodes / 5 edges — within the spirit of "small," on the low end of the originally suggested range; no action needed unless the demo wants a denser graph.
- **Source of truth for this graph: `GraphService.java` (backend) — nodes/edges are hardcoded inline in Java (`List.of(...)`), not read from any separate data file.** A `graph_data.json` was independently generated by the AI engineer's notebook but is NOT used by this endpoint and does not match this contract's node `type` casing or edge `relation` vocabulary — do not wire it in without fixing it first. Confirmed compliant as of 2026-07-05: `GraphService.java` uses only documented node types (`COUNTRY`/`EVENT`/`COMMODITY`/`HOLDING`/`SECTOR`) and documented relations (`SANCTIONED_BY`/`IMPACTS`/`ALLIED_WITH`).

### Endpoint G — Analytics
`GET http://localhost:8080/api/v1/analytics/sentiment-timeseries?window=24h`
`GET http://localhost:8080/api/v1/analytics/sector-impact`

Powers the Analytics page charts. **No new table required** — both are aggregation queries over existing `Incident` and `ExposureLink` data.

#### Response Body — sentiment-timeseries
```json
{
  "window": "24h",
  "points": [
    { "timestamp": "2026-07-04T00:00:00Z", "avgSentiment": -0.12 },
    { "timestamp": "2026-07-04T01:00:00Z", "avgSentiment": -0.35 }
  ]
}
```

#### Response Body — sector-impact
```json
{
  "sectors": [
    { "sector": "Energy", "avgExposureScore": 61.4, "incidentCount": 18 },
    { "sector": "Banking", "avgExposureScore": 58.2, "incidentCount": 9 }
  ]
}
```

**Field notes:**
- `avgSentiment`: float, -1.0 to 1.0. **Decided:** hourly buckets over a 24h window. `IncidentEvent` doesn't store a raw sentiment value, so this is derived per incident: `riskLevel >= MEDIUM` → `-confidenceScore` (negative signal), `riskLevel == LOW` → `+confidenceScore * 0.3` (mild positive signal) — then averaged per hour bucket. This is a documented approximation, not a stored/real sentiment score.
- `sector`: fixed list from Section 3
- **`window` query param:** `AnalyticsController.getSentimentTimeseries()` currently takes no request parameters — the `?window=24h` in the URL above is accepted by Spring (unrecognized params are silently ignored) but has no effect. The response is always a fixed 24h/hourly-bucketed window regardless of what value (or no value) is passed. This is a documented simplification, not a bug: if the frontend ever needs a variable window (e.g. a 7-day toggle), `AnalyticsService.getSentimentTimeseries()` needs a `window` parameter added and the controller needs a corresponding `@RequestParam`.

### Endpoint H — Incident Volume
`GET http://localhost:8080/api/v1/analytics/incident-volume`

Powers the Incident Volume bar chart (last 7 days, one bar per day).

#### Response Body
```json
{
  "days": [
    { "day": "2026-06-28", "count": 14 },
    { "day": "2026-06-29", "count": 18 },
    { "day": "2026-07-04", "count": 23 }
  ]
}
```

**Field notes:**
- `day`: ISO date string (`YYYY-MM-DD`), not a pretty label — frontend formats for display
- `count`: number of `IncidentEvent` rows whose `createdAt` date falls on that day (i.e., incidents created that day, not "active" or ongoing incidents)
- Window: fixed at last 7 days, no query params
- No grouping by region/sector/risk level — flat daily count only, by design (breakdowns are covered by Sector Impact and the Heatmap/Risk Map separately)
- No new table required — aggregation over existing `IncidentEvent` data

### Error Shape (all endpoints)
```json
{
  "timestamp": "2026-07-04T10:20:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "incidentText must not be blank"
}
```

---

## 3. Agreed Fixed Value Lists

**Risk levels:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
**Sectors (fixed list — do not add without team agreement):** `Banking`, `Energy`, `Manufacturing`, `Tech`, `Agriculture`
**Region codes:** ISO 3166-1 alpha-2 (e.g., `IN`, `US`, `CN`)
**Graph node types:** `COUNTRY`, `EVENT`, `COMMODITY`, `SECTOR`, `HOLDING`
**Graph edge relations (starter vocabulary — extend as needed, document additions here):** `SANCTIONED_BY`, `IMPACTS`, `EXPORTS_TO`, `ALLIED_WITH`, `CONFLICTS_WITH`
**Chain node types (Portfolio Exposure):** `EVENT`, `MARKET_SIGNAL`, `HOLDING`

---

## 4. Sync Checkpoints

- **Python ↔ Backend:** confirm live `/api/v1/analyze` response matches this exactly before backend swaps mock → real call.
- **Backend ↔ Frontend:** confirm `/api/v1/incidents`, `/api/v1/exposure/heatmap`, `/api/v1/countries/{isoCode}`, `/api/v1/portfolio/exposure`, `/api/v1/graph`, and all three `/api/v1/analytics/*` endpoints (sentiment-timeseries, sector-impact, incident-volume) match this exactly before frontend swaps mock → real call.
- **AI engine ↔ Backend:** N/A for this sprint — graph and portfolio chain data are seeded, not AI-derived (see Decision Log).

---

## 5. Decision Log

- **Graph (`/api/v1/graph`) and Portfolio chain data (`/api/v1/portfolio/exposure`) are hand-authored/seeded for this MVP, not AI-generated.** Marked with `"isIllustrative": true` where applicable. AI engineer's scope stays unchanged (sentiment/risk only, no new entity/relationship extraction task).

---

## Changelog

- **v1:** Core pipeline — Python analysis endpoint, incident feed, exposure heatmap, incident submission.
- **v2 (2026-07-04, Varsh):** Added Country Risk Detail, Portfolio Exposure, Knowledge Graph, and Analytics endpoints for new frontend pages. One new table (`Holding`). Resolved open decisions: graph and portfolio chains are seeded, not AI-generated.
- **v2.1 (2026-07-04):** Added optional `POST /api/v1/analyze/batch` endpoint on the Python (AI Brain) service. Not required for MVP — available if backend wants to batch-submit incidents instead of calling `/analyze` per item.
- **v2.2 (2026-07-05):** Added `GET /api/v1/analytics/incident-volume` (Endpoint H) on the Spring Boot (Backbone) service. Powers the Incident Volume bar chart (last 7 days, daily counts). No new table required — aggregates existing `IncidentEvent` data.
- **v2.3 (2026-07-05):** Clarified `riskLevel` field note in Section 1 — it's produced by a trained classifier (primary path) with a rule-based threshold fallback, not a threshold table alone. No shape change, documentation-only fix to match `ARCHITECTURE.md` and the training notebook.
- **v2.4 (2026-07-05):** Backfilled previously-open decisions from backend's implementation: `riskScore` formula, `activeEvents` window (7 days), and `avgSentiment` bucketing rule are now documented as decided. Decided `marketImpactPct` sign convention: positive = market gain, negative = adverse impact. Clarified that `/api/v1/graph` is sourced from the backend's hand-authored `GraphService`, not the AI engineer's notebook-exported `graph_data.json` (which does not match this contract's casing/vocabulary).
- **v2.5 (2026-07-05):** Documentation-only fixes from a code review of `AnalyticsController.java` and `PortfolioService.java`: (1) noted that the `?window=` query param on `sentiment-timeseries` is currently accepted but ignored — response is always a fixed 24h/hourly window; (2) noted `totalExposureUsd` on Portfolio Exposure is a fixed illustrative constant, not derived from holdings; (3) noted the Portfolio Exposure `chain` currently uses one generic template for all holdings rather than a distinct chain per holding; (4) noted the Knowledge Graph ships 6 nodes/5 edges, on the low end of the originally suggested 10–20 range. No response shapes changed — all four are demo-polish/precision notes, not contract violations.