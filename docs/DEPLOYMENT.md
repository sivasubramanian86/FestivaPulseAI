# Deployment Architecture & Operational Runbook — FestivaPulseAI

FestivaPulseAI is designed for production deployment across **Google Cloud Platform (GCP)** and **Firebase**, delivering sub-second global responses, high availability, and least-privilege IAM security.

---

## 1. Production Topology

- **Frontend Application:** Deployed to **Firebase Hosting** with global CDN caching, SSL termination, and SPA rewrite rules.
  - Live URL: `https://festivapulseai.web.app` (Backup: `https://festivapulseai.firebaseapp.com`)
- **Backend API & Swarm Engine:** Deployed to **Google Cloud Run (Fully Managed Serverless)** in region `asia-south1` (or `us-central1`).
  - Container runtime: Python 3.12-slim with Uvicorn ASGI server.
  - Auto-scaling: 0 to 10 instances with sub-second cold starts.
- **AI Runtimes:**
  - **Vertex AI Gemini 2.5 Flash:** Agentic swarm orchestration and constraint planning.
  - **Vertex AI Imagen 3.0:** High-resolution venue transformation and decor visual synthesis.
- **Persistence & Telemetry:**
  - **Local Persistence:** Atomic SQLite repository adapter with cross-process file locks.
  - **Cloud Firestore:** Real-time celebration document store and immutable decision ledger.
  - **Cloud Pub/Sub:** High-throughput streaming bus for live attendance pulse and telemetry.

---

## 2. Environment Variables & Secret Configuration

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Server-only | Google GenAI API Key (or Vertex AI ADC via Service Account). Never sent to browser. |
| `GEMINI_MODEL` | Server-only | Target model identifier (`gemini-2.5-flash`). |
| `IMAGEN_MODEL` | Server-only | Target image synthesis model (`imagen-3.0-generate-002`). |
| `GCP_PROJECT_ID` | Server-only | Target Google Cloud project identifier (`genai-apac-2026-491004`). |
| `GCP_REGION` | Server-only | Google Cloud deployment region (`asia-south1` or `us-central1`). |
| `CORS_ORIGINS` | Server-only | Comma-delimited list of verified client origins (rejects wildcards with credentials). |
| `DEMO_MODE` | Server-only | Flag enabling graceful deterministic fallbacks if cloud credentials are absent (`False` in prod). |

---

## 3. Deployment Commands

### Frontend Deployment (Firebase Hosting)
```bash
# Build optimized production bundle
npm --prefix frontend run build

# Deploy to Firebase Hosting
npx firebase-tools deploy --only hosting
```

### Backend Deployment (Google Cloud Run)
```bash
# Build and deploy container directly to Cloud Run
gcloud run deploy festivapulse-backend \
  --source ./backend \
  --region asia-south1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "DEMO_MODE=False,GCP_PROJECT_ID=genai-apac-2026-491004,GCP_REGION=asia-south1"
```

---

## 4. Health Checks & Monitoring

- **Liveness & Readiness Endpoint:** `GET /api/v1/health`
  - Returns `{"status": "healthy", "service": "FestivaPulseAI", "version": "1.0.0"}`
- **Security Headers Injected by Middleware:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; sandbox` (API JSON responses)
  - `Permissions-Policy: geolocation=(self), camera=(), microphone=()`
