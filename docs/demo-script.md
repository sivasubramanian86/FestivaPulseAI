# FestivaPulseAI — 3:40 Video Demonstration Script

**Competition:** PromptWars Virtual — [Challenge 5] Celebration & Event Planner  
**Duration:** 3 Minutes 40 Seconds (Target)  
**Tone:** Confident, Senior Architectural, Clear, Paced for Judges  

---

## Video Timeline & On-Screen Demonstration Walkthrough

| Timestamp | Screen / Visual Focus | Action Taken by Presenter | What Judges See & Evaluation Rubric Satisfied |
|:---|:---|:---|:---|
| **0:00 – 0:20** | Clean browser at `http://localhost:5173`. Browser zoomed to 110% for crisp readability. | Click **"Test Error State"** preset or type live: Email `bad-email`, Guests `0`, Budget `-5000`. Pause 2 seconds. | **Visible Test Cases / Error State Rubric:** Immediate bright red ARIA alert banner appears showing 3 explicit validation errors. Proves live validation guardrails. |
| **0:20 – 1:00** | Switch to Tab 1 (Celebration Blueprint). | Click **"Diwali Fest (₹5L)"** preset or type: Event: *"Tirunelveli Tamil-English Community Celebration"*, Guests: `250`, Budget: `₹5,00,000`, Location: *"Tirunelveli Town Hall"*. Click **"Generate Celebration Blueprint"**. | **Natural User Workflow & Problem Scope:** Gemini synthesizes structured blueprint. Walk cursor over: (1) Executive Summary, (2) 4 Tailored Cultural Themes, (3) Elder Ramps & Kids Activity Enclave, (4) Categorized Smart Budget Bars, (5) Vendor SLA Table with backup contacts. |
| **1:00 – 1:40** | Open **"Judge X-Ray"** side drawer on the right. | Click **"Judge X-Ray"** button in Navbar. Highlight the live telemetry panel. | **GenAI in Action (Proof of Non-Hardcoded AI):** Points out: (1) Active Agent name, (2) Exact outgoing prompt with live user variables, (3) Incoming structured JSON response, (4) Latency clock (~350ms), (5) Green Diff Badge proving 100% dynamic generation. |
| **1:40 – 2:20** | Switch to **Tab 2 (Event Pulse)**. | Drag the **"Simulate Gate Check-Ins"** slider from `210` to `280`. Scroll down to **FestivaFoodGuard: Category-Level Sufficiency Radar**. | **Dynamic Day-of-Event Telemetry & Zero Food Waste:** Show real-time calculation: Vegan has a 12-portion shortage while General Veg has 30 surplus. Show live tray burn rate (`pl/min`). Click **"Generate FSSAI Dispatch Pass"** -> shows certified temperature audit (hot >63°C, cold <5°C), Feeding India pickup window, and 87.5 kg CO2e prevented! Show the procedural SVG Venue layout with the required disclaimer. |
| **2:20 – 3:00** | Switch to **Tab 3 (Rescue Studio)**. | Click **"Simulate 40-Plate Food Shortage"** or **"Crowd Surge"**. | **Recovery via Comparison (Not Chatbot):** Gemini synthesizes 3 structured alternatives: Candidate A (Lowest Cost: 15-min kitchen batch-stretch, ₹4,500), Candidate B (Best Experience: Cloud-kitchen micro-order, ₹14,000), Candidate C (Lowest Disruption: Pre-contracted reserve, ₹7,500). Walk through cost deltas. |
| **3:00 – 3:20** | Click **"Test Overcrowding Breach (420 Guests)"** button. | Point to the red **"REJECTED: NOT FEASIBLE"** card. | **The "Not Feasible" Gate Differentiator:** System explicitly refuses to cram 420 people into a 350-capacity hall citing HSE fire safety regulations. Proves ethical safety boundaries. |
| **3:20 – 3:35** | Click **"Approve & Apply Plan Revision"** on Candidate A. | Switch to **Decision Ledger** tab. | **Human-in-the-Loop & Immutable Audit Trail:** Shows new entry v2.0 stamped in the Decision Ledger with original vs revised values, mathematical calculation proof, and human approval badge. |
| **3:35 – 3:40** | Click **"Run QA Tests (100%)"** in Navbar. | Modal pops up running all 7 test cases live, showing all green checkmarks in 25ms. Close with summary sentence. | **Engineering Rigor & 100/100 Evaluation:** Proves zero fake math, strict type safety, lean `< 1.5 MB` repository size, and complete problem statement alignment before the 4-minute cutoff. |

---

## Narration Voiceover Script (Optional if Narrating)

> "What happens when you plan an event for 250 guests, 360 walk through the door, the budget gets cut by 20%, and the main course runs short 45 minutes into dinner?
> Static checklists break. Autonomous agents adapt.
> Welcome to **FestivaPulseAI** — an autonomous event resilience copilot and day-of-event operating system built for PromptWars Virtual Challenge 5.
> We start by intentionally testing an invalid state: negative budget and zero guests. Notice the immediate red ARIA validation alert — zero silent failures.
> Now we load our Tirunelveli Community Fest: 250 guests, ₹5 Lakh budget. One click generates a culturally grounded, inter-generational blueprint complete with elder comfort ramps, kids' enclaves, categorized budgets, and vendor SLAs.
> Opening our Judge X-Ray drawer proves this is 100% dynamic: you see the exact prompt sent to Gemini 2.5 Flash, the structured JSON received, and a sub-400ms latency clock.
> On Event Day, reality hits. Our FestivaFoodGuard radar tracks live tray burn rates by category. It flags an exact 12-portion vegan deficit without silently pooling other dishes, and generates a certified FSSAI surplus food recovery pass preventing 87 kg of CO2e.
> When a crisis strikes, Rescue Studio never gives a generic chatbot answer. It synthesizes three comparative options: Lowest Cost, Best Experience, and Lowest Disruption. And when asked to cram 420 people into a 350-capacity hall, our system says 'NOT FEASIBLE' citing HSE fire limits.
> Approving a plan atomically stamps an immutable audit record in our Decision Ledger.
> Running our automated test suite proves 100% green compliance across all invariants, all packed into a lean 0.33 MB repository.
> From static plans to dynamic resilience: this is FestivaPulseAI."
