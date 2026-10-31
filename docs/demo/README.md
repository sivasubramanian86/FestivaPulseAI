# FestivaPulseAI — Official Hackathon Demo Video & Audio System

> **Google Cloud APAC AI Builder Cup 2026**  
> *Category: Autonomous Celebration & Event Resilience Operating System*

---

## 1. Demo Video Specifications

| Metric | Specification |
|---|---|
| **Video Resolution** | 1920 x 1080 (Full HD, 16:9 widescreen) |
| **Video Encoding** | H.264 / AVC (`libx264`, High Profile, CRF 18, `yuv420p`) |
| **Frame Rate** | 60 fps (Playwright Headless Chromium) |
| **Audio Voiceover** | Gemini Live Native Audio (`Kore` female voice) on Vertex AI + Neural TTS fallback |
| **Audio Format** | AAC Stereo, 192 kbps, 48 kHz |
| **Total Duration** | 241.83 seconds (~4 minutes 2 seconds) |
| **Target Platforms** | YouTube, Devpost, LinkedIn, Google Cloud Showcase |
| **Artifact Paths** | `docs/demo/FestivaPulseAI_Official_Demo_Video_4Min.mp4`<br>`docs/demo/FestivaPulseAI_Official_Demo_Cover.jpg` |

---

## 2. Chronological Scene Breakdown & Synchronization

```
00:00 ─── Scene 1: Welcome, Themes & Multilingual Localization (35.15s)
00:35 ─── Scene 2: Celebration Blueprint & 1-Click Cultural Presets (34.58s)
01:10 ─── Scene 3: Google Cloud ADK Multi-Agent Swarm Deliberation (31.75s)
01:42 ─── Scene 4: AI Event Imagination Studio & Vertex AI Image Synthesis (30.60s)
02:12 ─── Scene 5: Event Pulse, 4DX Sensory Digital Twin & Shock Simulator (27.31s)
02:40 ─── Scene 6: Rescue Studio, 3-Way Comparative Recovery & Sign-Off (29.11s)
03:09 ─── Scene 7: Immutable Decision Ledger & In-App Automated QA Runner (24.31s)
03:33 ─── Scene 8: Enterprise Cloud Architecture & Impact (29.02s)
04:02 ─── End of Walkthrough
```

### Scene 1: Welcome, Themes & Multilingual Localization (00:00 - 00:35)
- **Visuals:** Opulent palace hero header, dynamic toggle between **Midnight Velvet** (dark) and **Ivory Silk** (light) modes, real-time interface localization cycling through **Tamil (`ta`)**, **Hindi (`hi`)**, **Kannada (`kn`)**, **Telugu (`te`)**, and **English (`en`)**.
- **Narration:** Welcome to FestivaPulseAI, an autonomous celebration operating system engineered for the Google Cloud APAC AI Builder Cup 2026. Replacing event chaos with mathematical certainty, cultural grandeur, and zero food waste.

### Scene 2: Celebration Blueprint & 1-Click Cultural Presets (00:35 - 01:10)
- **Visuals:** Exploring Phase 1 intake form. Triggering the **Test Error State** preset to demonstrate real-time HSE overcrowding validation and RFC email error banners. Switching to the **Kalyana Mandapam Wedding (₹18L)** preset, clicking **Generate Celebration Blueprint**, and smooth scrolling to the synchronized plan, itinerary, and portion planner.
- **Narration:** Master Celebration Blueprint Atelier with 1-click cultural accelerators. Client-side validation prevents fire overcrowding before submission, generating an end-to-end schedule and Pareto budget ledger.

### Scene 3: Google Cloud ADK Multi-Agent Swarm Deliberation (01:10 - 01:42)
- **Visuals:** Inspecting the 6 specialist Google ADK agents: `EventSupervisorAgent`, `BlueprintSpecialistAgent`, `FestivaFoodGuardAgent`, `BudgetElasticityAgent`, `TimelineCascadeAgent`, and `SpatialCrowdSafetyAgent`. Clicking agent cards to reveal thought logs, tool invocations, and sub-second execution latencies. Switching to the **Predictive Forecasting Dashboard** showing crowd arrival curves and 40/30/30 catering depletion.
- **Narration:** Autonomous Google ADK swarm coordination with step-by-step reasoning, zero arithmetic hallucinations, and sub-second execution latencies.

### Scene 4: AI Event Imagination Studio & Vertex AI Image Synthesis (01:42 - 02:12)
- **Visuals:** Activating the AI Event Imagination Studio. Selecting the 1-click theme pill **👑 Raja Rani Rajput Palace**, choosing **Muhurtham Twilight** lighting, and clicking **Visualize with Imagen 3**. Rendering the high-resolution photographic output with enriched prompt and model telemetry.
- **Narration:** Driven by Vertex AI Gemini Flash and Imagen 3.0. Dynamic prompt expansion injects photorealistic camera optics and cultural motifs for instant visualization.

### Scene 5: Event Pulse, 4DX Sensory Digital Twin & Shock Simulator (02:12 - 02:40)
- **Visuals:** Transitioning to the Day-of-Event Pulse cockpit. Adjusting the live attendance slider to simulate field arrivals. Inspecting the Food Sufficiency Radar and SVG Venue Zone Schematic. Triggering the **Crowd Surge** shock simulator (250 to 360 guests mid-event).
- **Narration:** Real-time 4DX Sensory Digital Twin monitoring guest velocity, acoustic decibel curfews, and catering burn rate.

### Scene 6: Rescue Studio, 3-Way Comparative Recovery & Sign-Off (02:40 - 03:09)
- **Visuals:** Reviewing Rescue Studio's 3 comparative counter-mitigations: Strategy A (Conservative), Strategy B (Balanced), Strategy C (Aggressive). Examining the rejected proposal due to HSE fire safety violations. Clicking **Approve Proposal** on Strategy B to exercise Human-in-the-Loop governance.
- **Narration:** Multi-alternative crisis resolution with strict Human-in-the-Loop coordinator authorization and certified FSSAI surplus food routing.

### Scene 7: Immutable Decision Ledger & In-App Automated QA Runner (03:09 - 03:33)
- **Visuals:** Transitioning to the Decision Ledger displaying the new certified Version v2.0 entry with coordinator sign-off and cryptographic audit trail. Opening the GenAI Telemetry X-Ray drawer. Launching the **In-App Automated QA Modal**, clicking **Run Automated Test Suite**, and observing 100% green passing tests.
- **Narration:** Cryptographic audit trail stamping, GenAI telemetry observation, and live in-app pytest verification.

### Scene 8: Enterprise Cloud Architecture & Impact (03:33 - 04:02)
- **Visuals:** Smooth scroll back to the Master Blueprint and opulent palace hero header. Highlighting Google Cloud serverless scalability, SAIF compliance, and final conclusion.
- **Narration:** Unifying Google Cloud ADK, Vertex AI Gemini 2.5, Cloud Run, and Firebase Hosting into a resilient celebration platform.

---

## 3. How to Replay or Regenerate

```bash
# 1. Synthesize Scene Voiceover Tracks (Gemini Live Audio Kore Voice)
python scripts/generate_demo_audio.py

# 2. Record Playwright Walkthrough & Mux with FFmpeg
python scripts/record_demo_video.py
```
