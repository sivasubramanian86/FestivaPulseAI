# Contributing to FestivaPulseAI

Thank you for your interest in contributing to **FestivaPulseAI**! We welcome improvements, bug fixes, and innovations from developers worldwide.

---

## 1. Development Principles

When contributing code to FestivaPulseAI, adhere to our core engineering invariants:

1. **Deterministic Arithmetic:**
   - Financial balances, tray food portions, fire capacity headcount limits, and timeline delays are computed exclusively by pure Python functions in `backend/app/core/engine.py`.
   - Generative AI is prohibited from computing mathematical balances directly.
2. **Lean Repository Size (< 10 MB):**
   - Under no circumstances should binary media files (MP4, PNG, JPG, WAV) or heavy node modules be committed to git.
   - Run `pwsh scripts/verify_repo_size.ps1` before submitting any PR.
3. **Structured Multi-Agent Contracts:**
   - Agents in `backend/app/agents/` must extend `FestivaAgent` from `backend/app/agents/base.py`.
   - Tool calling must be routed via `mcp_tools.py`.
4. **Test Pyramid Enforcement:**
   - Every domain change must include corresponding unit tests in `backend/tests/`.
   - Every UI change must pass `npm test` and `npm run build` in `frontend/`.

---

## 2. Setting Up Your Local Environment

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Google Cloud SDK (`gcloud`) or Gemini API Key (`GEMINI_API_KEY`)

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/sivasubramanian86/FestivaPulseAI.git
cd FestivaPulseAI

# Create virtual environment and install dependencies
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run backend tests with coverage
pytest backend/tests --cov=backend.app
```

### Frontend Setup
```bash
cd frontend
npm install
npm test
npm run build
```

---

## 3. Git Workflow & Conventional Commits

We follow the **Conventional Commits** specification:

- `feat(agents)`: Add a new ADK agent or tool capability
- `fix(engine)`: Correct an arithmetic or boundary condition in the core engine
- `docs(readme)`: Update architectural diagrams or documentation
- `test(e2e)`: Add new integration or end-to-end test cases
- `chore(ci)`: Update GitHub Actions workflows or linting rules

### Pre-PR Quality Checklist
Before opening a pull request, run:
```bash
# Backend checks
pytest backend/tests -v
ruff check backend/
mypy backend/app/

# Frontend checks
cd frontend
npm test
npm run build

# Repository size verification
pwsh scripts/verify_repo_size.ps1
```
