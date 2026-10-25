# Security Policy & Governance — FestivaPulseAI

FestivaPulseAI adheres to enterprise DevSecOps principles, the **Google Secure AI Framework (SAIF)**, and zero-trust IAM boundaries. FestivaPulseAI is designed to plan celebrations and absorb live-venue shocks while safeguarding sensitive event data, organizer credentials, and operational safety boundaries.

---

## 1. Supported Versions

| Version | Supported | Status |
| :--- | :--- | :--- |
| `1.0.x` | Yes | Active Production / Hackathon Release |
| `< 1.0.0` | No | Prototype / Experimental |

---

## 2. Reporting a Vulnerability

We take the security and privacy of organizers, vendors, and guests seriously. If you discover a security vulnerability or prompt injection risk in FestivaPulseAI:

1. **Do not create a public GitHub Issue.**
2. Email full vulnerability details, reproduction steps, and impact assessment to:
   - **`security@festivapulse.org`** or submit a private report via **GitHub Security Advisories**.
3. Include:
   - Attack vector description (e.g., prompt injection, SSRF, broken object-level authorization).
   - Component affected (`backend/app/agents/`, `core/engine.py`, API endpoints, or React cockpit).
   - Expected vs observed behavior.
   - Proof of concept (PoC) payload or trace.
4. **Response SLA:**
   - Initial acknowledgement: < 24 hours.
   - Triage and severity assignment: < 48 hours.
   - Patch release: < 7 business days for High/Critical issues.

---

## 3. Google Secure AI Framework (SAIF) Alignment

FestivaPulseAI implements the 6 core pillars of Google SAIF:

### Core SAIF Invariants
1. **Deterministic Financial & Life-Safety Failsafe:**
   - GenAI is strictly prohibited from mutating financial ledger totals, crowd safety limits, or timeline clocks.
   - All financial balance math ($Balance = Allocated - Committed$) and HSE occupancy limits ($Occupancy \le MaxCapacity$) run in deterministic pure Python.
2. **Model Armor & Untrusted Content Sanitization:**
   - Vendor quotes, voice memos, and OCR transcripts are treated as **untrusted data**.
   - Input payloads pass through prompt injection filtering before dispatch to Gemini 2.5 Flash.
3. **Structured Schema Output Enforcement:**
   - All Vertex AI Gemini 2.5 Flash calls use `response_mime_type="application/json"` and Pydantic schemas. Unparseable, freeform model output is immediately rejected and caught by schema validation.
4. **Least-Privilege Cloud IAM:**
   - Service accounts running Google Cloud Run containers have strictly scoped IAM roles:
     - `roles/aiplatform.user` (Vertex AI inference only; no model deletion/training rights).
     - `roles/datastore.user` (Firestore tenant-isolated read/write).
     - `roles/secretmanager.secretAccessor` (Runtime retrieval of authorized keys).
5. **No Adversarial Autonomous Action:**
   - All high-impact operations (rescinding vendor contracts, shifting budgets > ₹10,000, calling emergency services) require 1-click explicit human confirmation in the Decision Ledger.

---

## 4. API Key & Secret Management

- **Zero Hardcoded Secrets:** Under no circumstances are Google Cloud Service Account JSON keys or API keys committed to source control.
- **Environment Isolation:** Local development uses `.env` files explicitly excluded via `.gitignore`.
- **Secret Manager:** Production deployments on Google Cloud Run mount secrets via Google Cloud Secret Manager (`FESTIVA_GEMINI_API_KEY`).
- **Automated Scanning:** Pre-commit hooks and GitHub Actions run `trivy` and `bandit` scans on every push.

---

## 5. Food Safety & Regulatory Compliance (FSSAI)

- Surplus food donations are legally governed under the Food Safety and Standards Authority of India (FSSAI) *Save Food, Share Food* initiative.
- The system enforces thermal holding criteria:
  - Hot foods must be maintained at **$\ge 63^\circ\text{C}$**.
  - Cold/chilled foods must be maintained at **$\le 5^\circ\text{C}$**.
- Food held in the ambient danger zone ($5^\circ\text{C} - 63^\circ\text{C}$) for more than 120 minutes is marked as **Compost Only / Unsafe for Human Ingestion**.
