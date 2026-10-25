## FestivaPulseAI Pull Request

### 1. Description of Changes
<!-- Provide a clear summary of what this PR accomplishes. -->

### 2. Category
- [ ] Agentic Swarm & ADK Logic (`backend/app/agents/`)
- [ ] Deterministic Domain Engine (`backend/app/core/engine.py`)
- [ ] API Endpoints & Routes (`backend/app/routers/`)
- [ ] Frontend React Cockpit (`frontend/src/`)
- [ ] Test Suite & Coverage (`backend/tests/`, `frontend/src/test/`)
- [ ] Documentation & Hygiene (`README.md`, `docs/`)

### 3. Non-Negotiable Quality Checklist
- [ ] **Deterministic Math Invariant:** No generative AI used to calculate financial ledgers, portions, or timeline minutes.
- [ ] **Repository Size Invariant:** Repository size strictly under 10 MB (`scripts/verify_repo_size.ps1` PASS).
- [ ] **Backend Tests:** Pytest suite passes with $\ge 85\%$ coverage (`pytest backend/tests --cov=backend.app`).
- [ ] **Frontend Tests:** Vitest component tests pass (`npm test` in `frontend/`).
- [ ] **Frontend Production Build:** `npm run build` succeeds with zero TypeScript errors.
- [ ] **No Secrets:** Verified zero committed API keys or GCP credentials.
- [ ] **Human-in-the-Loop:** Actions requiring authorization route through the Decision Ledger.
