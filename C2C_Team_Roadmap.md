# C2C: Conflict to Currency — 18-Hour MVP Sprint Roadmap

**Sprint window:** Hour 0 (kickoff, today) → Hour 18 (demo-ready, tomorrow)
**Core principle for zero merge conflicts:** Each engineer owns a **separate repo/service folder** (`c2c-brain`, `c2c-backbone`, `c2c-face`). Nobody touches another engineer's codebase. Integration happens only through **agreed contracts** (a fixed JSON schema and a fixed REST API spec) locked at **Hour 1**, so all three people can build against a frozen interface instead of against each other's live code.

---

## HOUR 0–1 (ALL THREE, TOGETHER): Contract Lock Meeting

Before splitting up, the team spends this hour agreeing on two documents, written down in a shared file (e.g., `CONTRACT.md` in a shared repo, not in any service repo):

1. **The Sentiment Payload Schema** — the exact JSON shape the Python service returns (field names, types, enum values for risk levels).
2. **The REST API Spec** — the exact endpoints, request/response bodies, and status codes Spring Boot exposes to React.

Once this is locked, all three tracks below run **fully in parallel** with no blocking dependencies until final integration.

**Interview Justification Summary — Contract-First Design:**
Contract-first (schema/API-first) development is the industry-standard way to decouple teams under time pressure. By freezing the interface before implementation, each engineer can build against a mock/stub of the other services (e.g., a static JSON file or a Postman mock server) instead of waiting on a working dependency. This mirrors real-world microservice practice using OpenAPI/JSON Schema as the source of truth, and it eliminates the single biggest cause of last-day integration failure: mismatched assumptions about data shape.

---

# ROADMAP 1: Python AI & Data Pipeline Engineer ("THE BRAIN")

**Repo:** `c2c-brain/` (independent Python repo, own virtualenv, own `requirements.txt`)
**Stack:** FastAPI, Pydantic, HuggingFace Transformers (FinBERT), Uvicorn

| Hour | Task | Notes |
|---|---|---|
| 1–2 | Scaffold FastAPI project (`main.py`, `/app` package, `routers/`, `services/`, `schemas/`). Set up virtualenv, `requirements.txt` (fastapi, uvicorn, pydantic, transformers, torch, python-dotenv). Init git repo. | Keep this repo 100% isolated — no shared code with Spring or React. |
| 2–3 | Define Pydantic models for the **locked contract schema** (`IncidentInput`, `SentimentMetrics`, `RiskPayload`). Add field validators (non-empty text, valid country codes, timestamp format). | This is your source of truth — Spring's DTOs will mirror this exactly. |
| 3–4 | Download and cache FinBERT (`ProsusAI/finbert`) locally. Write a small standalone script to test tokenization + inference on 3–4 sample headlines to confirm model loads and outputs (positive/negative/neutral + confidence). | Do this early — model downloads can be slow/flaky, don't discover that at Hour 10. |
| 4–5 | Build `sentiment_service.py`: wraps FinBERT in a clean function `analyze(text: str) -> SentimentResult`. Add batching support for multiple headlines in one call. | Isolate the ML logic from the API layer so it's independently testable. |
| 5–6 | Build the **data intake mechanism**: accept raw incident text + metadata (source, region, timestamp), run validation, normalize fields (e.g., uppercase country codes, ISO timestamps). | This is where malformed input gets rejected before it ever reaches the model. |
| 6–7 | Build the **risk scoring layer**: map FinBERT's raw sentiment + confidence into your domain's risk taxonomy (e.g., LOW/MEDIUM/HIGH/CRITICAL) using a documented threshold table. | Document your thresholds — this is a common interview question (why these cutoffs?). |
| 7–8 | Expose `POST /api/v1/analyze` endpoint: accepts incident JSON, returns structured `RiskPayload` matching the locked contract. Add `GET /health` for uptime checks. | `/health` is what Spring Boot will poll before making downstream calls. |
| 8–9 | Add error handling: try/except around model inference, structured error responses (422 for bad payloads, 500 with safe messages for inference failures). Add request logging. | Never let a raw stack trace leak to the API consumer. |
| 9–10 | Write unit tests (pytest) for: schema validation, sentiment mapping thresholds, and the `/analyze` endpoint via `TestClient`. Aim for the 3–4 highest-value test cases, not full coverage. | With limited time, test the risk-mapping logic hardest — it's your most "opinionated" code. |
| 10–11 | Containerize (optional but recommended): write a `Dockerfile` and `docker-compose.yml` entry so Spring Boot can call `http://brain:8000` in a shared network. Add CORS config for local dev. | If Docker is too much overhight given time, a documented `uvicorn main:app --port 8000` run command is an acceptable fallback. |
| 11–12 | Generate and export the OpenAPI spec (`/openapi.json`, auto-provided by FastAPI) and share it in `CONTRACT.md`. Do a **10-minute sync** with the Spring dev to confirm the payload shape matches exactly. | This is the one required sync point between Brain and Backbone. |
| 12–14 | Buffer + polish: add a small `/api/v1/analyze/batch` endpoint if time allows, improve response latency (model warm-up on startup instead of first-request), add `.env`-based config. | Treat this as stretch scope, not core scope. |
| 14–15 | Write `README.md`: setup instructions, sample `curl` request/response, architecture diagram (text-based is fine). | This doubles as your interview cheat-sheet. |
| 15–16 | Integration testing with the live Spring Boot service (real HTTP call, not mocks). Fix any schema drift discovered. | |
| 16–18 | Final buffer for bug fixes, demo rehearsal (be ready to run `analyze` live on a real headline in front of evaluators). | |

**Expected Deliverable:** A running FastAPI service on port 8000 exposing `POST /api/v1/analyze`, returning validated, structured sentiment/risk JSON, backed by FinBERT, with basic tests and a health check.

**Interview Justification Summary — Python/FinBERT Track:**
- **Why FastAPI over Flask/Django:** FastAPI gives native async support, automatic OpenAPI/schema generation via Pydantic, and built-in request validation — all of which matter for a microservice whose main job is to serve a strict, well-typed contract to another backend under time constraints.
- **Why FinBERT specifically:** FinBERT is pretrained on financial text (analyst reports, earnings calls), so it captures financial sentiment nuance that a general-purpose sentiment model (e.g., vanilla BERT or VADER) would miss — relevant since the domain is market exposure, not generic text sentiment.
- **Why Pydantic-first schema design:** Defining the schema before the endpoint logic enforces a single source of truth for data shape, catches malformed input at the edge (before it reaches the model), and gives the Spring Boot team a machine-readable contract (OpenAPI) instead of a verbal description.
- **Why a separate risk-mapping layer instead of returning raw model output:** Raw sentiment labels aren't directly business-actionable. A documented threshold-based mapping to a risk taxonomy makes the output consumable by non-ML engineers downstream and gives you a clear, defensible answer when asked "how did you decide HIGH vs CRITICAL?"

---

# ROADMAP 2: Spring Boot Enterprise Backend Developer ("THE BACKBONE")

**Repo:** `c2c-backbone/` (independent Maven/Gradle Spring Boot repo)
**Stack:** Spring Boot, Spring Data JPA, PostgreSQL, Spring Web

| Hour | Task | Notes |
|---|---|---|
| 1–2 | Scaffold Spring Boot project via Spring Initializr (Web, JPA, PostgreSQL Driver, Validation, Lombok). Set up `application.yml` with DB config, port 8080. Init git repo. | Keep isolated from Python/React repos. |
| 2–3 | Install/configure local PostgreSQL (or Docker container). Create the `c2c_db` database. Confirm connection with a `SELECT 1` health check via `application.yml` + `spring.jpa.show-sql`. | If Postgres setup is a bottleneck, fall back to H2 in-memory for the demo and note Postgres as the intended production DB. |
| 3–5 | Design and implement JPA entities for the **Geopolitical Knowledge Graph**: `Country`, `Region`, `IncidentEvent`, `MarketSector`, and a join entity `ExposureLink` (mapping incidents → affected sectors/countries with a weight/severity field). | This is the core intellectual property of the backend — spend real time on the relational model, not just CRUD scaffolding. |
| 5–6 | Write Spring Data JPA repositories for each entity. Add a few custom `@Query` methods (e.g., "find all exposure links for a given country ordered by severity"). | |
| 6–7 | Build the **event mapping logic**: a service layer that, given an incoming incident (region + risk payload from Python), looks up which countries/sectors are linked in the knowledge graph and computes an aggregated exposure score. | This is your "automated relational lookup" deliverable — make it a clean, testable service class, not logic buried in a controller. |
| 7–8 | Build a client (`RestTemplate` or `WebClient`) to call the Python `/api/v1/analyze` endpoint, deserializing into a DTO that mirrors the locked contract exactly. | Confirm field names against `CONTRACT.md`, not from memory. |
| 8–9 | Expose `POST /api/v1/incidents` — accepts raw incident text, calls Python for sentiment, persists the `IncidentEvent`, runs exposure mapping, returns the enriched result. | This is the core orchestration endpoint. |
| 9–10 | Expose read endpoints for the frontend: `GET /api/v1/incidents` (ticker feed, paginated, sorted by recency), `GET /api/v1/exposure/heatmap` (aggregated exposure by sector/country for the heatmap view). | Design these two response shapes carefully — React will build directly against them. |
| 10–11 | Add global exception handling (`@ControllerAdvice`) for validation errors, downstream Python service failures (timeout/5xx), and DB constraint violations — return consistent error JSON. | |
| 11–12 | Add CORS configuration to allow the React dev server origin. Write a small seed data script (`data.sql` or a `CommandLineRunner`) to populate 8–10 countries/sectors so the frontend has real data to render immediately. | Seed data is what makes the React demo look alive on day one. |
| 12–13 | Write a handful of integration tests (`@SpringBootTest` + `MockMvc`) for the incidents and heatmap endpoints, and a unit test for the exposure-mapping service logic. | |
| 13–14 | Sync with Python dev to swap the mock client for the real live call; sync with React dev to confirm the two GET response shapes match what they've been building against. | Two short sync points, not continuous pairing. |
| 14–16 | Buffer: pagination on the ticker endpoint, basic input sanitization, `/actuator/health` for ops visibility, tidy up DTO/entity separation. | |
| 16–18 | Final integration pass with live Python + live React, bug fixes, README with run instructions and sample API calls. | |

**Expected Deliverable:** A Spring Boot service on port 8080, backed by PostgreSQL, with a Geopolitical Knowledge Graph schema, an orchestration endpoint that calls the Python service and performs automated relational exposure lookups, and clean REST APIs for the frontend.

**Interview Justification Summary — Spring Boot Track:**
- **Why Spring Boot for this layer:** The backbone needs strong transactional guarantees (writing incidents + exposure links atomically), a mature ORM (JPA/Hibernate) for a genuinely relational domain (countries ↔ sectors ↔ incidents), and enterprise-grade tooling that fintech partners (banks) already trust and audit — a strategic fit for a B2B2C fintech-facing product.
- **Why a relational model (PostgreSQL) over a document store:** The Geopolitical Knowledge Graph is fundamentally a many-to-many relationship problem (incidents affect multiple sectors/countries with varying weights). A relational schema with join tables and SQL joins/aggregations is the natural fit and gives you ACID guarantees that a NoSQL store would sacrifice.
- **Why the orchestration/service layer calls Python rather than React calling Python directly:** Keeping the AI service behind the backend (rather than exposing it to the browser) centralizes auth, rate-limiting, and data persistence in one place, and means the frontend only ever needs to know about one API surface — standard backend-for-frontend (BFF) reasoning.
- **Why DTOs separate from JPA entities:** Returning entities directly over REST risks leaking internal DB structure and creates tight coupling between your schema and the frontend's expectations; DTOs let the schema evolve without breaking the contract with React.

---

# ROADMAP 3: React UI Frontend Engineer ("THE FACE")

**Repo:** `c2c-face/` (independent React repo, Vite recommended for speed)
**Stack:** React (Vite), Tailwind CSS, a charting library (Recharts or similar), Axios/fetch

| Hour | Task | Notes |
|---|---|---|
| 1–2 | Scaffold React app with Vite, install and configure Tailwind CSS. Set up folder structure (`components/`, `pages/`, `services/`, `hooks/`). Init git repo. | Isolated repo — no shared code with Python/Spring. |
| 2–3 | Build the base layout: corporate dashboard shell (sidebar nav, top bar, dark/light corporate theme via Tailwind config — pick a serious fintech palette, not default Tailwind blues). | This is where "high-fidelity corporate" impression is won or lost — invest real design time here. |
| 3–4 | Build a `mockData.js` / local JSON fixtures matching the **locked API contract** exactly (sample incidents, sample heatmap data). Build a `services/api.js` abstraction layer with functions like `getIncidents()`, `getHeatmap()` that can point at either mock data or the real Spring API via an env flag. | This is what lets you build the entire UI without waiting on a live backend. |
| 4–6 | Build the **Global Incident Ticker Feed** component: scrolling/paginated list of incidents with country flag/icon, headline, sentiment badge (color-coded by risk level), timestamp. Wire it to `getIncidents()` (mock first). | Use color semantics consistently (e.g., red=critical) — this becomes a talking point in review. |
| 6–8 | Build the **Portfolio Exposure Heatmap** component: a grid/matrix (sectors × regions) with color intensity mapped to exposure score, using your charting library. Add hover tooltips showing the underlying numbers. | Recharts' `Treemap` or a custom CSS-grid heatmap both work — pick whichever you can finish cleanly in the time box. |
| 8–9 | Add a summary stats bar at the top (e.g., total active incidents, highest-risk region, average exposure score) computed client-side from the fetched data. | Cheap to build, high visual/demo impact. |
| 9–10 | Add loading states, empty states, and error states (e.g., "backend unreachable") for both components — this matters a lot for a "production-ready" impression. | |
| 10–11 | Add basic client-side routing if there's more than one view (e.g., `/dashboard`, `/incident/:id` detail page). | Skip if time-constrained; a single-page dashboard is acceptable MVP scope. |
| 11–12 | Responsive pass: verify layout on a laptop screen and a projector-sized display (for the demo). Fix any Tailwind breakpoint issues. | Demos are often shown on a shared screen — test that resolution specifically. |
| 12–13 | Swap `services/api.js` from mock data to the **real** Spring Boot endpoints (`GET /api/v1/incidents`, `GET /api/v1/exposure/heatmap`). Handle CORS issues if they appear (coordinate with backend dev, don't just disable security). | This is the one required sync point between Face and Backbone. |
| 13–14 | Add polling or a manual refresh button so the ticker feed updates without a full page reload. | Simulates "live" data convincingly without needing WebSockets under time pressure. |
| 14–15 | Visual polish pass: consistent spacing, typography scale, subtle animations/transitions (Tailwind's built-in transition utilities are enough — don't over-engineer). | |
| 15–16 | Cross-browser/device sanity check, fix any broken states from the live-data swap. | |
| 16–18 | Buffer + demo rehearsal: know exactly which live data point you'll click on during the demo, have a fallback screenshot/mock in case of live network issues during presentation. | |

**Expected Deliverable:** A polished React + Tailwind dashboard on the dev server, rendering a live incident ticker and an interactive exposure heatmap, fully wired to the Spring Boot API with graceful loading/error states.

**Interview Justification Summary — React Frontend Track:**
- **Why building against mock fixtures first:** Building the entire UI against a locally-defined mock that matches the agreed contract means the frontend timeline is never blocked by backend progress — a critical decoupling strategy in a one-day sprint with three parallel workstreams.
- **Why Tailwind CSS over a component library like Material UI:** Tailwind gives full control over a distinctive, corporate/fintech visual identity quickly, without fighting a pre-styled component library's opinions — important when the deliverable is explicitly judged on "high-fidelity corporate" polish.
- **Why a `services/api.js` abstraction layer instead of calling `fetch` directly in components:** Centralizing all network calls behind one module means switching from mock to live data (or handling API changes) requires editing one file, not every component — a standard separation-of-concerns pattern that also makes the code easier to defend in review.
- **Why explicit loading/error/empty states rather than assuming happy-path data:** A dashboard that silently breaks or shows a blank screen when the backend is slow or down reads as unfinished; explicit states for every data-fetch outcome are a concrete, visible signal of production-readiness to evaluators.

---

## Final Integration Checklist (Hour 17–18, All Three Together)

1. Start all three services in order: PostgreSQL → Spring Boot (8080) → Python FastAPI (8000) → React dev server.
2. Run one incident end-to-end: submit via React (or Postman) → Spring persists + calls Python → Python returns sentiment → Spring computes exposure → React renders it in the ticker and heatmap.
3. Confirm each engineer can independently explain their **Interview Justification Summary** without notes — this is as much a part of the deliverable as the running code.
4. Take a recorded screen-capture backup of a successful end-to-end run, in case of live-demo network/environment issues.
