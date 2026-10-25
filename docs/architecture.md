# FestivaPulseAI — Architecture Specification & Data Flow

## 1. System Topology & Hexagonal Architecture

```
[ FRONTEND CLIENT : React 18 + Vite + TypeScript + Tailwind CSS ]
  │
  ├── UI Modules:
  │     ├── 1. Celebration Blueprint (Natural-language brief intake with live error banner)
  │     ├── 2. Event Pulse (Attendance slider, Category Food Radar, SVG Venue Map)
  │     ├── 3. Rescue Studio (3-way comparative recovery alternatives, HSE refusal gate)
  │     ├── 4. Decision Ledger (Immutable append-only audit trail)
  │     ├── 5. Scenario Lab (Reversible What-If sandbox)
  │     ├── 6. GenAI X-Ray Drawer (Live prompt, JSON schema, latency, diff tag)
  │     └── 7. In-App QA Test Runner Modal (Live automated assertion evidence)
  │
  └── REST API Client (`frontend/src/services/api.ts`)
         │
         ▼ HTTP POST / GET (/api/v1/...)
[ BACKEND ORCHESTRATOR : FastAPI + Python 3.11+ ]
  │
  ├── Security & Input Validation:
  │     ├── Pydantic v2 schemas (`backend/app/models/`)
  │     ├── Bounds: Guests 10-10,000, Budget ₹1k-₹50Cr, RFC Email regex
  │     └── CORS restriction, rate limits, XSS prevention
  │
  ├── Deterministic Pure Python Domain Engine (`backend/app/core/engine.py`):
  │     ├── calculate_budget_ledger() -> Zero double-counting between spent & committed
  │     ├── rebalance_budget_pareto() -> Prunes elastic decor, protects anchor food/access
  │     ├── calculate_food_sufficiency() -> Category shortfall without silent diet pooling
  │     ├── generate_fssai_surplus_manifest() -> Hot >=63°C, Cold <=5°C, CO2e metric
  │     ├── propagate_timeline_delay() -> DAG dependency shift & 22:00 sound curfew alert
  │     └── validate_proposal_feasibility() -> HSE fire capacity & budget refusal gates
  │
  ├── Persistence & Audit Layer (`backend/app/services/storage_service.py`):
  │     ├── In-Memory State & SQLite adapter boundary
  │     └── Atomic plan versioning & immutable Decision Ledger records
  │
  └── Gemini 2.5 Flash Orchestrator (`backend/app/services/gemini_service.py`):
        ├── BlueprintPlannerModule -> Natural brief to constraint-aware plan
        ├── RescueStudioTriageModule -> 3-way comparative strategies
        ├── Structured Output Enforcement via response_schema
        └── Telemetry Tracer -> Profiling latency ms, token estimate, and diff badge
```

---

## 2. Architectural Invariants

1. **AI Proposes; Deterministic Engine Verifies:**
   Gemini is never used for arithmetic. Money, meal counts, capacity limits, and timeline minutes are calculated by deterministic Python functions.
2. **Recovery via Comparison:**
   When reality changes, the system generates up to 3 distinct alternatives (Lowest Cost, Best Experience, Lowest Disruption), never a generic chatbot answer.
3. **The "Not Feasible" Gate:**
   The system must explicitly refuse impossible or unsafe operations (e.g. attendance exceeding authorized venue fire limits).
4. **Human in the Loop:**
   Every state mutation requires explicit user preview and approval before being applied to the master plan.
5. **Zero-Waste FSSAI Compliance:**
   Food surplus recovery adheres to the FSSAI temperature audit framework and partners with recognized NGOs.
