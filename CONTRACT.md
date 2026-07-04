# C2C: Conflict to Currency — Locked API Contract

This file is the single source of truth for data shapes between all three services.
**Do not edit without notifying the other two engineers.**

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

### Response Body
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

### Response Body (flat list — pivot into a grid client-side if needed)
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
- `sector`: string, matches `MarketSector.name` in the DB (list should stay consistent — agree on a fixed short list of sectors up front, e.g. Banking, Energy, Manufacturing, Tech, Agriculture)

### Endpoint C — Submit New Incident (orchestration)
`POST http://localhost:8080/api/v1/incidents`

### Request Body
```json
{
  "incidentText": "Tensions escalate along the eastern border as troops mobilize.",
  "sourceRegion": "IN"
}
```

### Response Body
Same shape as one item in Endpoint A's `content` array — the enriched, persisted incident.

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

---

## 4. Sync Checkpoints

- **Python ↔ Backend:** confirm live `/api/v1/analyze` response matches this exactly before backend swaps mock → real call.
- **Backend ↔ Frontend:** confirm `/api/v1/incidents` and `/api/v1/exposure/heatmap` match this exactly before frontend swaps mock → real call.