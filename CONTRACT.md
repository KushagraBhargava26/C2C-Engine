# C2C: Conflict to Currency — Locked API Contract

This file is the single source of truth for data shapes between all three services.
**Do not edit without notifying the other two engineers.**

*Last updated: 2026-07-04 — merged v1 (core pipeline) + v2 (Risk Map, Portfolio Exposure, Knowledge Graph, Analytics) into one document.*

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
- `riskLevel`: one of `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (derived from sentiment + confidence via documented thresholds)
- `region`: ISO country code, echoed back from the request

### Health Check
`GET http://localhost:8000/health` → `200 OK` with `{"status": "ok"}`

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
- `riskScore`: int, 0–100 — aggregated from that region's incidents (suggest: weighted average of `confidenceScore` for incidents where `riskLevel` >= MEDIUM, scaled to 0–100; exact formula is backend's call, just document it once decided)
- `riskLevel`: same fixed list as above — derived from `riskScore`, not stored separately
- `activeEvents`: int, count of incidents for that region in some rolling window (suggest: last 7 days — pick a window and document it)
- `affectedSectors`: array of strings, must be from the fixed sector list in Section 3 — do not introduce new sector names here
- `marketImpactPct`: float, can be negative — same semantics as `exposureScore` direction, just document sign convention (positive = adverse impact, or positive = market gain — pick one and note it here)
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
- **New table:** `Holding` (ticker, name, sector, region) — did not exist in the original schema. Seeded with a small fixed list (5–10 holdings) rather than a full portfolio-management feature.
- **Decision (resolved, see Section 5):** `chain` data is hand-authored/seeded for the demo, not AI-derived. Marked with `"isIllustrative": true` where applicable.

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
- **Decision (resolved, see Section 5):** graph is a small hand-authored fixed graph (10–20 nodes) served as-is, not generated from real entity/relationship extraction.

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
- `avgSentiment`: float, -1.0 to 1.0 — bucketed average, derived from `sentimentLabel`/`confidenceScore` (document the exact bucketing rule: hourly buckets, mean of signed confidence, etc.)
- `sector`: fixed list from Section 3

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
- **Backend ↔ Frontend:** confirm `/api/v1/incidents`, `/api/v1/exposure/heatmap`, `/api/v1/countries/{isoCode}`, `/api/v1/portfolio/exposure`, `/api/v1/graph`, and both `/api/v1/analytics/*` endpoints match this exactly before frontend swaps mock → real call.
- **AI engine ↔ Backend:** N/A for this sprint — graph and portfolio chain data are seeded, not AI-derived (see Decision Log).

---

## 5. Decision Log

- **Graph (`/api/v1/graph`) and Portfolio chain data (`/api/v1/portfolio/exposure`) are hand-authored/seeded for this MVP, not AI-generated.** Marked with `"isIllustrative": true` where applicable. AI engineer's scope stays unchanged (sentiment/risk only, no new entity/relationship extraction task).

---

## Changelog

- **v1:** Core pipeline — Python analysis endpoint, incident feed, exposure heatmap, incident submission.
- **v2 (2026-07-04, Varsh):** Added Country Risk Detail, Portfolio Exposure, Knowledge Graph, and Analytics endpoints for new frontend pages. One new table (`Holding`). Resolved open decisions: graph and portfolio chains are seeded, not AI-generated.                                                                
