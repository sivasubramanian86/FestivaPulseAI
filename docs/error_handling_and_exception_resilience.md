# FestivaPulseAI — Error, Exception Handling & Architecture Resilience Specification

## 1. Executive Overview

FestivaPulseAI operates as a mission-critical, day-of-event resilience operating system. This specification documents the end-to-end exception handling, resilience protocols, and defensive design patterns implemented across the full stack.

---

## 2. Backend Exception & Fault-Tolerance Architecture

### 2.1 Multi-Tier Exception Hierarchy
The FastAPI backend strictly enforces layered, typed exception boundaries:
- **Client Input Validation (`HTTP 422 Unprocessable Entity`)**:
  - Enforced by Pydantic v2 schemas (`EventIntakeRequest`, `IncidentSubmission`, `PulseCheckInRequest`).
  - Validates RFC-compliant email formats, positive budget numbers, and strict 100% dietary requirement sums.
- **Resource Not Found (`HTTP 404 Not Found`)**:
  - Thrown with clear, machine-readable messages when referencing nonexistent celebration IDs or missing venue identifiers.
- **Deterministic Domain Refusal (`HTTP 400 Bad Request`)**:
  - Activated whenever a scenario is mathematically or physically impossible (e.g., attempting to cram 600 guests into a 400-capacity hall with no overflow mitigation, or requesting budget cuts that exceed all uncommitted planned funds).
- **Internal Server Resilience (`HTTP 500 Catch-All`)**:
  - Global FastAPI middleware intercepts unhandled exceptions, strips internal stack traces from client responses, logs full structured context to Google Cloud Logging, and guarantees system availability.

### 2.2 Storage & Persistence Resilience
- **Atomic SQLite Disk Backing (`StorageService`)**:
  - Eliminates multi-process state isolation splits across Cloud Run container instances.
  - Every blueprint creation, venue anchoring, and decision ledger update commits atomically via SQLite `REPLACE INTO events`.
  - Hot in-memory LRU cache serves read traffic with sub-millisecond latency.
  - Safe fallback auto-hydration for active live sessions matching `^EVT-[0-9A-Fa-f]{8}$` guarantees zero disruption during container cold-starts.

### 2.3 Google Agent Development Kit (ADK) & GenAI Fallback Cascade
- **Dual-Mode Execution**:
  - Live Gemini 2.5 Flash execution is gated by `settings.is_live_gemini_enabled`.
  - When live credentials or network access are unavailable, all 5 specialist agents (`BlueprintAgent`, `SpatialCrowdAgent`, `BudgetElasticityAgent`, `FestivaFoodGuardAgent`, `TimelineCascadeAgent`) seamlessly transition to deterministic contextual synthesis with zero latency spike or user disruption.
  - Every agent wraps execution in `try / except` blocks returning structured metadata (`_meta.framework = "Google ADK"`).

---

## 3. Frontend Exception & User-Experience Resilience

### 3.1 React Error Boundary
- Root-level and component-level `ErrorBoundary` wrappers intercept render-time exceptions.
- Displays an accessible, localized recovery screen with a single-click "Reset Celebration" action rather than blanking the browser viewport.

### 3.2 Network Resilience & Safe Defaults
- **Safe API Client (`frontend/src/services/api.ts`)**:
  - Automatically resolves host origin in browser vs server-side/test environments.
  - Relative routing `/api/v1` in production proxies transparently to Cloud Run via Firebase Hosting rewrites.
- **Non-Blocking Toasts & Graceful Fallbacks**:
  - When applying grounded venues, if network connectivity drops, the client immediately applies local venue re-anchoring, updates client state, and displays an informative notification.
- **GPS Offline Degradation**:
  - Web Geolocation API timeouts (8,000ms) gracefully fall back to the regional hub default (Bengaluru Palace Grounds) with an explanatory badge.

---

## 4. Security & Compliance Verification

| Quality Gate | Tool / Standard | Result | Target Benchmark |
|---|---|---|---|
| Static Code Analysis | `ruff check backend/` | 0 errors | 0 errors |
| Code Formatting | `ruff format backend/` | Clean | 100% formatted |
| SAST Security Audit | `bandit -r backend/app -ll` | 0 issues | 0 High / Medium |
| Backend Test Coverage | `pytest --cov=backend.app` | 100.00% (1,560 / 1,560 stmts) | $\ge$ 100% |
| Backend Test Suite | `pytest` | 116 passed | 100% pass |
| Frontend Test Suite | `vitest run` | 23 passed across 9 suites | 100% pass |
| Production Dependency Audit | `npm audit --omit=dev` | 0 vulnerabilities | 0 vulnerabilities |
| Repository Size Gate | `git count-objects -v` | 7.30 MB | strictly < 10 MB |
