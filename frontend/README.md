# FestivaPulseAI Frontend Application

Production-grade, mobile-responsive React web application for **FestivaPulseAI — Auspicious Celebration & Day-of-Event Resilience Suite**. Built for the **Google Cloud APAC AI Builder Cup**.

---

## 🏛 Architecture Overview

- **Core Framework:** React 18 with TypeScript 5 (Strict Mode)
- **Bundler:** Vite 5
- **Styling:** Tailwind CSS 3 with custom royal Indian celebration design tokens (Google Stitch MCP)
- **Icons:** Lucide React
- **Internationalization (i18n):** Type-safe multi-language dictionaries supporting 10 Indian and global languages (English, Tamil, Hindi, Telugu, Kannada, Malayalam, Spanish, etc.)
- **Theming:** Persistent Light and Dark modes with high-contrast WCAG 2.1 AAA accessible color palettes
- **Notifications:** Enterprise non-blocking `ToastContext` with zero blocking browser alerts
- **Error Resilience:** Top-level and modular `ErrorBoundary` catching render-time exceptions
- **Visual Intelligence:** AI Event Imagination Studio utilizing Google Vertex AI Imagen 3.0 (`imagen-3.0-generate-002`) and Nano Procedural Engine for real-time celebration decor visualization
- **Dynamic Itinerary & Menus:** Reactive multi-course banquet planner automatically matching regional cuisines (Sadya, Oota, Dawat, Thali) and timeline DAGs to selected celebration parameters

---

## 📂 Source Structure

```
frontend/
├── src/
│   ├── components/                # Modular UI components
│   │   ├── CelebrationBlueprint.tsx    # Intake, preset loaders & Google ADK Swarm Console
│   │   ├── EventPulse.tsx              # Day-of-Event field sensory dashboard
│   │   ├── RescueStudio.tsx            # HITL dual-alternative crisis remediation
│   │   ├── DecisionLedger.tsx          # Chronological audit ledger & version history
│   │   ├── ScenarioLab.tsx             # What-if stochastic stress testing sandbox
│   │   ├── FoodSufficiencyRadar.tsx    # 40/30/30 kitchen cadence & FSSAI manifest hub
│   │   ├── GroundedVenueMapExplorer.tsx# Spatial RAG radar across 8 Indian metros
│   │   ├── DynamicItineraryMenu.tsx    # Authentic regional menus & countdown checklists
│   │   ├── SvgVenueSchematic.tsx       # Dynamic HSE crowd density floorplan
│   │   ├── GenAIXRayDrawer.tsx         # Live Vertex AI prompt and token telemetry drawer
│   │   ├── QATestRunnerModal.tsx       # In-app automated test execution modal
│   │   ├── ImmersiveVenueTourModal.tsx # 4DX Sensory Digital Twin walkthrough
│   │   ├── Navbar.tsx                  # Command cockpit header and language/theme toggles
│   │   └── ErrorBoundary.tsx           # React exception boundary and recovery panel
│   ├── context/                   # React context providers
│   │   ├── ThemeContext.tsx            # Dark/light theme state & persistence
│   │   └── ToastContext.tsx            # Non-blocking notification system
│   ├── i18n/                      # Internationalization dictionaries
│   │   ├── I18nContext.tsx             # Language provider
│   │   └── locales/                    # en, ta, hi, te, kn, ml, es
│   ├── services/
│   │   └── api.ts                      # Typed client API for Cloud Run backend
│   ├── test/                      # Vitest test suites
│   │   ├── unit/                       # Component unit tests
│   │   ├── integration/                # Multi-component workflow tests
│   │   └── e2e/                        # End-to-end user journey tests
│   ├── types.ts                   # Domain TypeScript interfaces
│   ├── App.tsx                    # Main Cockpit orchestrator
│   └── main.tsx                   # Application bootstrap
├── dist/                          # Production build output
├── vite.config.ts                 # Vite bundler configuration
└── package.json                   # Dependencies and scripts
```

---

## 🛠 Available Scripts

In the `frontend` directory, you can run:

```bash
# Start local development server (http://localhost:5173)
npm run dev

# Run Vitest test suites (23 tests across 9 files)
npm test -- --run

# Run TypeScript compilation and build production distribution in dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 🧪 Testing Guidelines

FestivaPulseAI enforces a rigorous quality gate:
- All 9 test files must pass with exit code `0`.
- Tests mock network calls deterministically without relying on live backend ports.
- To execute tests:
  ```bash
  npm test -- --run
  ```

---

## 🚀 Deployment

The frontend is deployed to **Firebase Hosting**:
- Live Production URL: `https://festivapulseai.web.app`
- Backend API Proxy: Routes `/api/v1/**` to Cloud Run service `festivapulse-api` (`https://festivapulse-api-967518492968.us-central1.run.app`).
- Deploy command:
  ```bash
  firebase deploy --only hosting --project genai-apac-2026-491004
  ```

---

## 📖 Component Documentation

For comprehensive specifications of all components, props, state flows, and architectural design tokens, see [`docs/frontend_component_catalog.md`](../docs/frontend_component_catalog.md).

