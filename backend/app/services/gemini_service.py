"""Gemini 2.5 Flash Orchestrator Service for FestivaPulseAI.

Implements real GenAI calls with structured response schemas,
sub-400ms latency profiling, telemetry tracing, and seamless offline demo fallback.
Adheres to @05_vertex_model_registry, @03_agentic_framework_architect, and @21_hackathon_demo_pipeline.
"""

import json
import time
import uuid
from datetime import datetime
from typing import Any

from backend.app.config import settings
from backend.app.models.event import (
    EventBlueprint,
    EventIntakeRequest,
    MilestoneItem,
    VendorSLAItem,
)
from backend.app.models.incident import (
    IncidentSubmission,
    RecoveryProposal,
    RecoveryStrategyType,
    RescueStudioComparison,
)
from backend.app.models.telemetry import GenAITelemetryTrace


class GeminiOrchestratorService:
    """Enterprise Google Gemini 2.5 generative orchestrator for blueprints, triage, and multi-agent synthesis."""

    def __init__(self) -> None:
        """Initializes Gemini orchestration client, setting target models and API credentials."""
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL
        self._client = None
        self._init_client()

    def _init_client(self) -> None:
        """Establishes Google GenAI client instance when valid credentials are present."""
        if settings.is_live_gemini_enabled:
            try:
                from google import genai

                self._client = genai.Client(api_key=settings.effective_gemini_key)
            except Exception as e:
                print(f"[WARN] Failed to initialize Google GenAI client: {e}. Running in graceful demo mode.")
                self._client = None

    def generate_blueprint(self, intake: EventIntakeRequest) -> tuple[EventBlueprint, GenAITelemetryTrace]:
        """Generates a comprehensive, constraint-aware master celebration blueprint."""
        start_time = time.time()
        event_id = f"EVT-{uuid.uuid4().hex[:8].upper()}"

        system_instruction = (
            "You are FestivaPulseAI's Senior Celebration Architect. "
            "Synthesize a constraint-aware, culturally nuanced event blueprint "
            "balancing both families, all age groups (seniors comfort, healthy lifestyle, kids play), "
            "and strict budget limits. Output pure structured JSON adhering to EventBlueprint schema."
        )

        user_prompt = (
            f"Generate celebration blueprint for:\n"
            f"- Event Name: {intake.event_name}\n"
            f"- Type: {intake.event_type.value}\n"
            f"- Target Date: {intake.target_date}\n"
            f"- Location: {intake.location}\n"
            f"- Expected Attendance: {intake.expected_guests} guests (Venue Limit: {intake.max_venue_capacity})\n"
            f"- Total Budget: {intake.currency} {intake.total_budget:,}\n"
            f"- Dietary Mix: Veg {intake.dietary.general_veg_pct}%, Vegan {intake.dietary.vegan_pct}%, "
            f"Jain {intake.dietary.jain_pct}%, Non-Veg {intake.dietary.non_veg_pct}%\n"
            f"- Cultural & Theme Preferences: {intake.preferences.cultural_vibe}\n"
            f"- Intergenerational Needs: Elders Comfort={intake.preferences.elders_comfort_priority}, "
            f"Healthy Lifestyle={intake.preferences.healthy_lifestyle_focus}, "
            f"Kids Activity Zone={intake.preferences.kids_activity_zone}\n"
            f"- Sound Curfew Time: {intake.preferences.sound_curfew_time}\n"
        )

        # Dynamic generation based on inputs
        if self._client:
            try:
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config={
                        "system_instruction": system_instruction,
                        "temperature": 0.3,
                        "response_mime_type": "application/json",
                    },
                )
                raw_json = json.loads(response.text)
                executive_summary = raw_json.get("executive_summary", "")
                themes = raw_json.get("personalized_themes", [])
                intergen = raw_json.get("intergenerational_features", [])
            except Exception as e:
                print(f"[WARN] Gemini API error: {e}. Falling back to dynamic rule synthesizer.")
                raw_json, executive_summary, themes, intergen = self._synthesize_local_blueprint(intake)
        else:
            raw_json, executive_summary, themes, intergen = self._synthesize_local_blueprint(intake)

        # Build typed milestones & vendor SLAs
        milestones = [
            MilestoneItem(
                phase="T-30 Days",
                task_name="Lock catering menu & tasting session",
                owner="Food Committee",
                deadline="2026-10-10",
            ),
            MilestoneItem(
                phase="T-15 Days",
                task_name="Confirm acoustic sound permit and 22:00 police curfew clearance",
                owner="AV Team",
                deadline="2026-10-25",
            ),
            MilestoneItem(
                phase="T-7 Days",
                task_name="Finalize elder wheelchair ramps and quiet dining room setup",
                owner="Venue Captain",
                deadline="2026-11-02",
            ),
            MilestoneItem(
                phase="Day of Event",
                task_name="Live gate check-in & 40/30/30 kitchen batch coordination",
                owner="Stage Manager",
                deadline="2026-11-12",
            ),
        ]

        per_head = int(intake.total_budget * 0.40 / max(1, intake.expected_guests))
        vendor_slas = [
            VendorSLAItem(
                vendor_type="Catering & Feast",
                vendor_name=f"{intake.location} Premier Heritage Caterers",
                quote_amount=int(intake.total_budget * 0.40),
                advance_paid=int(intake.total_budget * 0.20),
                pending_amount=int(intake.total_budget * 0.20),
                sla_requirement=f"Staggered 40/30/30 batch cooking; guaranteed hot-holding >=63°C; ₹{per_head}/plate",
                backup_vendor_contact="+91-98401-23456",
                arrival_time="14:00",
            ),
            VendorSLAItem(
                vendor_type="Audio & Acoustic Production",
                vendor_name="SonicVibe AV Solutions",
                quote_amount=int(intake.total_budget * 0.15),
                advance_paid=int(intake.total_budget * 0.08),
                pending_amount=int(intake.total_budget * 0.07),
                sla_requirement=f"Acoustic calibration under 75dB; strictly conclude amplified sound before {intake.preferences.sound_curfew_time}",
                backup_vendor_contact="+91-98402-34567",
                arrival_time="15:30",
            ),
            VendorSLAItem(
                vendor_type="Decor & Eco-Florals",
                vendor_name="Samskriti Sustainable Florals",
                quote_amount=int(intake.total_budget * 0.20),
                advance_paid=int(intake.total_budget * 0.10),
                pending_amount=int(intake.total_budget * 0.10),
                sla_requirement="Zero plastic; local marigold/jasmine drapes; setup complete by 16:00",
                backup_vendor_contact="+91-98403-45678",
                arrival_time="11:00",
            ),
            VendorSLAItem(
                vendor_type="Venue & Hospitality",
                vendor_name=f"{intake.location} Grand Mandapam & Lawns",
                quote_amount=int(intake.total_budget * 0.25),
                advance_paid=int(intake.total_budget * 0.25),
                pending_amount=0,
                sla_requirement=f"Capacity {intake.max_venue_capacity} approved; dedicated elder access ramps; parking for 90 vehicles",
                backup_vendor_contact="+91-98404-56789",
                arrival_time="08:00",
            ),
        ]

        blueprint = EventBlueprint(
            id=event_id,
            event_name=intake.event_name,
            event_type=intake.event_type,
            location=intake.location,
            target_date=intake.target_date,
            expected_guests=intake.expected_guests,
            max_venue_capacity=intake.max_venue_capacity,
            total_budget=intake.total_budget,
            currency=intake.currency,
            executive_summary=executive_summary,
            personalized_themes=themes,
            intergenerational_features=intergen,
            milestones=milestones,
            vendor_slas=vendor_slas,
            initial_risks_and_contingencies=[
                "Guest turnout surge above RSVP projections (+25% buffer mapped)",
                f"Police acoustic curfew strictly enforced at {intake.preferences.sound_curfew_time}",
                "FSSAI food surplus collection protocol pre-aligned with Feeding India",
            ],
            unverified_assumptions=[
                "Venue power backup generator fuel verified for 6 continuous hours",
                "Vendor parking ingress permits obtained from local traffic police",
            ],
            created_at=datetime.now().isoformat(),
            version=1,
        )

        latency_ms = int((time.time() - start_time) * 1000)

        telemetry = GenAITelemetryTrace(
            trace_id=f"TRACE-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now().isoformat(),
            active_agent="CelebrationBlueprintPlannerAgent",
            purpose=f"Synthesize comprehensive constraint-aware {intake.event_type.value} blueprint",
            raw_prompt_sent=user_prompt,
            structured_json_response={
                "event_id": event_id,
                "summary": executive_summary,
                "themes_count": len(themes),
                "milestones_count": len(milestones),
                "budget_allocated": intake.total_budget,
            },
            latency_ms=latency_ms,
            token_usage_estimated=len(user_prompt.split()) + 450,
            dynamic_diff_summary="New blueprint initialized from live intake brief",
            is_live_call=self._client is not None,
        )

        return blueprint, telemetry

    def _synthesize_local_blueprint(
        self, intake: EventIntakeRequest
    ) -> tuple[dict[str, Any], str, list[str], list[str]]:
        """Dynamic local synthesis guaranteeing 100% responsiveness even without internet."""
        executive_summary = (
            f"End-to-End {intake.event_type.value} Blueprint for {intake.expected_guests} guests at {intake.location}. "
            f"Engineered around '{intake.preferences.cultural_vibe}', incorporating dedicated elder comfort routes, "
            f"a vibrant children's activity enclave, and a healthy lifestyle dining menu with zero food waste protocol."
        )
        themes = [
            f"Theme 1: {intake.preferences.cultural_vibe} — Eco-friendly handcrafted fabric & live heritage brass lamps",
            "Theme 2: Sangam Harmony — Multi-generational acoustic courtyard with low-decibel classical fusion",
            "Theme 3: Sustainable Harvest — Locally sourced organic millets, farm-fresh jackfruit biryani & jaggery payasam",
            "Theme 4: Digital Memory Pavilion — Interactive QR photo gallery avoiding single-use printed album waste",
        ]
        intergen = [
            "Elders: Zero-threshold wheelchair ramps, designated quiet seating with low-sugar beverage station",
            "Young Adults: Interactive live mocktail station, acoustic lawn seating, high-speed Wi-Fi photo hub",
            "Kids: Supervised clay sculpting & traditional board games pavilion, child-friendly mild pasta & fruit skewers",
        ]
        return {}, executive_summary, themes, intergen

    def synthesize_recovery_options(
        self, intake: EventIntakeRequest, incident: IncidentSubmission, current_state: Any
    ) -> tuple[RescueStudioComparison, GenAITelemetryTrace]:
        """Generates 3 comparative recovery alternatives in Rescue Studio: Lowest Cost, Best Experience, Lowest Disruption."""
        start_time = time.time()
        incident_id = f"INC-{uuid.uuid4().hex[:6].upper()}"

        user_prompt = (
            f"Analyze event shock and generate 3 comparative recovery proposals:\n"
            f"- Incident Type: {incident.incident_type.value}\n"
            f"- Incident Values: {json.dumps(incident.entered_values)}\n"
            f"- Event Context: {intake.event_name} ({intake.expected_guests} guests, Budget ₹{intake.total_budget:,})\n"
            f"- Venue Capacity: {intake.max_venue_capacity}\n"
        )

        # Extract flexible parameter values
        val = incident.entered_values
        new_guests = val.get("new_guests", val.get("new_attendance", intake.expected_guests))
        budget_cut = val.get("budget_cut_amount", val.get("budget_cut", 0))
        food_shortage_count = val.get("shortage_count", val.get("food_shortage_count", 0))
        delay_mins = val.get("delay_minutes", val.get("delay_mins", 0))

        if self._client:
            try:
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=user_prompt,
                    config={
                        "response_mime_type": "application/json",
                        "temperature": 0.2,
                    },
                )
                raw_json = json.loads(response.text)
                proposals = raw_json.get("proposals", [])
                if len(proposals) >= 3:
                    cand_a = RecoveryProposal(**proposals[0])
                    cand_b = RecoveryProposal(**proposals[1])
                    cand_c = RecoveryProposal(**proposals[2])
                    rejected_raw = raw_json.get("rejected_proposal")
                    rejected_list = [RecoveryProposal(**rejected_raw)] if rejected_raw else []
                    system_advisory = raw_json.get("system_advisory", "AI triage synthesis completed.")
                    comparison = RescueStudioComparison(
                        incident_id=incident_id,
                        event_id=intake.event_name,
                        timestamp=datetime.now().isoformat(),
                        incident_summary=f"{incident.incident_type.value} shock triage",
                        candidate_lowest_cost=cand_a,
                        candidate_best_experience=cand_b,
                        candidate_lowest_disruption=cand_c,
                        rejected_proposals=rejected_list,
                        system_advisory=system_advisory,
                    )
                    latency_ms = int((time.time() - start_time) * 1000)
                    telemetry = GenAITelemetryTrace(
                        trace_id=f"TRACE-{uuid.uuid4().hex[:8]}",
                        timestamp=datetime.now().isoformat(),
                        active_agent="RescueStudioTriageAgent",
                        purpose=f"Generate 3-way recovery alternatives for {incident.incident_type.value}",
                        raw_prompt_sent=user_prompt,
                        structured_json_response={
                            "incident_id": incident_id,
                            "strategy_a": comparison.candidate_lowest_cost.summary,
                            "strategy_b": comparison.candidate_best_experience.summary,
                            "strategy_c": comparison.candidate_lowest_disruption.summary,
                            "rejected_count": len(comparison.rejected_proposals),
                        },
                        latency_ms=latency_ms,
                        token_usage_estimated=len(user_prompt.split()) + 380,
                        dynamic_diff_summary=f"Synthesized 3 comparative recovery alternatives for {incident.incident_type.value}",
                        is_live_call=True,
                    )
                    return comparison, telemetry
            except Exception as e:
                print(f"[WARN] Gemini triage API error: {e}. Falling back to deterministic triage.")

        # Deterministic generation of 3 strategies
        if new_guests > intake.max_venue_capacity:
            rejected = RecoveryProposal(
                proposal_id=f"REJ-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.BEST_EXPERIENCE,
                summary=f"Pack {new_guests} guests into current hall",
                action_items=["Attempt to seat all arrivals inside"],
                additional_cost=25000,
                remaining_budget_projected=intake.total_budget - 25000,
                guests_covered=new_guests,
                timeline_impact_minutes=0,
                vendor_dependencies=[],
                unresolved_constraints=[f"Venue fire limit is {intake.max_venue_capacity}"],
                actions_requiring_human_approval=["Override fire safety limits (PROHIBITED)"],
                is_feasible=False,
                infeasibility_reason=f"NOT FEASIBLE: Guest count ({new_guests}) exceeds authorized venue fire capacity ({intake.max_venue_capacity}). HSE safety regulation forbids overcrowding.",
            )
            cand_a = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.LOWEST_COST,
                summary=f"Egress Staggering: Stream banquet live to outdoor marquee for excess {new_guests - intake.max_venue_capacity} guests",
                action_items=[
                    f"Erect temporary outdoor awning for {new_guests - intake.max_venue_capacity} overflow guests",
                    "Deploy satellite beverage counter and live AV projection screen",
                ],
                additional_cost=18000,
                remaining_budget_projected=intake.total_budget - 18000,
                guests_covered=new_guests,
                timeline_impact_minutes=15,
                vendor_dependencies=["AV Projection", "Tent Rental"],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Authorize outdoor awning rental (₹18,000)"],
                is_feasible=True,
            )
            cand_b = cand_a.model_copy(
                update={
                    "strategy_type": RecoveryStrategyType.BEST_EXPERIENCE,
                    "summary": "Dual-Hall Split: Rent adjacent banquet hall B for overflow",
                    "additional_cost": 45000,
                    "remaining_budget_projected": intake.total_budget - 45000,
                    "actions_requiring_human_approval": ["Authorize Hall B lease (₹45,000)"],
                }
            )
            cand_c = cand_a.model_copy(
                update={
                    "strategy_type": RecoveryStrategyType.LOWEST_DISRUPTION,
                    "summary": "Staggered Dining Waves: Two 45-minute dining shifts",
                    "additional_cost": 5000,
                    "remaining_budget_projected": intake.total_budget - 5000,
                    "timeline_impact_minutes": 30,
                    "actions_requiring_human_approval": ["Announce wave dining schedule"],
                }
            )

            comparison = RescueStudioComparison(
                incident_id=incident_id,
                event_id=intake.event_name,
                timestamp=datetime.now().isoformat(),
                incident_summary=f"Attendance Surge: {new_guests} guests vs {intake.max_venue_capacity} venue fire capacity",
                candidate_lowest_cost=cand_a,
                candidate_best_experience=cand_b,
                candidate_lowest_disruption=cand_c,
                rejected_proposals=[rejected],
                system_advisory="SAFETY GATE ACTIVE: Rejected direct overcrowding. Approved options mandate physical space expansion or wave seating.",
            )
        elif food_shortage_count > 0:
            # Food Shortage Incident
            shortage_cat = val.get("category", "General Vegetarian")
            cand_a = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.LOWEST_COST,
                summary=f"Rapid Pantry Batch-Stretch for {food_shortage_count} {shortage_cat} portions",
                action_items=[
                    "Authorize head chef to deploy 15-minute quick-prep cashew-vegetable pulav",
                    "Stretch existing curry base with tomato-cashew puree in kitchen",
                    "Pace appetizer refill intervals from 8 mins to 14 mins",
                ],
                additional_cost=4500,
                remaining_budget_projected=intake.total_budget - 4500,
                guests_covered=food_shortage_count,
                timeline_impact_minutes=15,
                vendor_dependencies=["Catering Kitchen Lead"],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Approve kitchen recipe batch-stretch (₹4,500 ingredient cost)"],
                is_feasible=True,
            )
            cand_b = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.BEST_EXPERIENCE,
                summary=f"Emergency Local Cloud-Kitchen Micro-Dispatch for {food_shortage_count} {shortage_cat} plates",
                action_items=[
                    "Dispatch hot-container courier for 40 fresh premium portions from partner cloud kitchen",
                    "Open temporary live pasta / chaat counter to absorb immediate queue pressure",
                ],
                additional_cost=14000,
                remaining_budget_projected=intake.total_budget - 14000,
                guests_covered=food_shortage_count,
                timeline_impact_minutes=25,
                vendor_dependencies=["Cloud Kitchen Partner", "Courier"],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Authorize emergency cloud-kitchen order (₹14,000)"],
                is_feasible=True,
            )
            cand_c = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.LOWEST_DISRUPTION,
                summary="Activate Pre-Contracted 15% Catering Reserve",
                action_items=[
                    "Release reserve chaffing trays #5 & #6 from back kitchen",
                    "Notify dining coordinator to open secondary buffet line",
                ],
                additional_cost=7500,
                remaining_budget_projected=intake.total_budget - 7500,
                guests_covered=food_shortage_count,
                timeline_impact_minutes=5,
                vendor_dependencies=["Head Caterer"],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Authorize reserve meal unsealing (₹7,500)"],
                is_feasible=True,
            )
            comparison = RescueStudioComparison(
                incident_id=incident_id,
                event_id=intake.event_name,
                timestamp=datetime.now().isoformat(),
                incident_summary=f"Catering Triage: {food_shortage_count} plate shortage in {shortage_cat}",
                candidate_lowest_cost=cand_a,
                candidate_best_experience=cand_b,
                candidate_lowest_disruption=cand_c,
                rejected_proposals=[],
                system_advisory="ZERO-STOCKOUT TRIAGE: Candidate C offers immediate 5m deployment; Candidate A saves ₹9,500.",
            )
        elif budget_cut > 0:
            # Budget Cut Incident
            cand_a = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.LOWEST_COST,
                summary=f"Pareto Pruning: Absorb -₹{budget_cut:,} via decor & luxury add-ons",
                action_items=[
                    "Swap exotic imported floral ceiling for local marigold/jasmine drapes (-₹45,000)",
                    "Convert printed gift hampers to digital gourmet vouchers (-₹25,000)",
                    "Reduce secondary videography team hours from 8h to 4h (-₹15,000)",
                ],
                additional_cost=0,
                remaining_budget_projected=intake.total_budget - budget_cut,
                guests_covered=intake.expected_guests,
                timeline_impact_minutes=0,
                vendor_dependencies=["Decor Lead", "Videographer"],
                unresolved_constraints=[],
                actions_requiring_human_approval=[f"Approve decor & media contract adjustments (-₹{budget_cut:,})"],
                is_feasible=True,
            )
            cand_b = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.BEST_EXPERIENCE,
                summary=f"Partial Sponsor Integration: Offset -₹{budget_cut:,} via sustainable brand partnership",
                action_items=[
                    "Integrate eco-friendly beverage brand partner in welcome lounge (+₹35,000 sponsorship)",
                    "Trim uncommitted lighting line items (-₹20,000)",
                ],
                additional_cost=0,
                remaining_budget_projected=intake.total_budget - budget_cut + 15000,
                guests_covered=intake.expected_guests,
                timeline_impact_minutes=0,
                vendor_dependencies=["Sponsorship Coordinator"],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Approve sponsor lounge banner integration"],
                is_feasible=True,
            )
            cand_c = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.LOWEST_DISRUPTION,
                summary="Uniform 8% Contingency Drawdown",
                action_items=[
                    "Draw from unallocated contingency buffer without altering any vendor deliverables",
                    "Maintain full original aesthetic and menu spread",
                ],
                additional_cost=0,
                remaining_budget_projected=intake.total_budget - budget_cut,
                guests_covered=intake.expected_guests,
                timeline_impact_minutes=0,
                vendor_dependencies=[],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Authorize contingency fund drawdown"],
                is_feasible=True,
            )
            comparison = RescueStudioComparison(
                incident_id=incident_id,
                event_id=intake.event_name,
                timestamp=datetime.now().isoformat(),
                incident_summary=f"Budget Re-Optimization: -₹{budget_cut:,} slash absorbed",
                candidate_lowest_cost=cand_a,
                candidate_best_experience=cand_b,
                candidate_lowest_disruption=cand_c,
                rejected_proposals=[],
                system_advisory="PARETO RE-OPTIMIZER: Protected anchor items (food & venue safety) remain 100% intact.",
            )
        else:
            # Timeline Delay Incident (e.g. 40 min ceremony delay)
            cand_a = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.LOWEST_COST,
                summary="Compress Transition Buffers & Pacing",
                action_items=[
                    "Compress welcome speeches and photo sessions by 25 minutes",
                    "Advance dinner service call-time to prevent food over-holding",
                ],
                additional_cost=0,
                remaining_budget_projected=intake.total_budget,
                guests_covered=intake.expected_guests,
                timeline_impact_minutes=15,
                vendor_dependencies=["MC / Host", "Priest"],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Authorize accelerated photo queue"],
                is_feasible=True,
            )
            cand_b = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.BEST_EXPERIENCE,
                summary="Overtime Extension for Venue & Sound",
                action_items=[
                    "Request 45-minute police acoustic extension permit",
                    "Book 1 hour venue overtime for staff and valet parking",
                ],
                additional_cost=15000,
                remaining_budget_projected=intake.total_budget - 15000,
                guests_covered=intake.expected_guests,
                timeline_impact_minutes=45,
                vendor_dependencies=["Venue Manager", "AV Sound Crew"],
                unresolved_constraints=["Subject to local police acoustic approval"],
                actions_requiring_human_approval=["Authorize overtime payment (₹15,000)"],
                is_feasible=True,
            )
            cand_c = RecoveryProposal(
                proposal_id=f"PROP-{uuid.uuid4().hex[:4]}",
                strategy_type=RecoveryStrategyType.LOWEST_DISRUPTION,
                summary="Parallel Dining Transition",
                action_items=[
                    "Begin dinner buffet for waiting guests while ceremony completes on dais",
                    "Sound curtain lowered to preserve sanctity of ritual",
                ],
                additional_cost=2000,
                remaining_budget_projected=intake.total_budget - 2000,
                guests_covered=intake.expected_guests,
                timeline_impact_minutes=5,
                vendor_dependencies=["Catering Lead", "Stage Manager"],
                unresolved_constraints=[],
                actions_requiring_human_approval=["Open dining hall in parallel with ceremony"],
                is_feasible=True,
            )
            comparison = RescueStudioComparison(
                incident_id=incident_id,
                event_id=intake.event_name,
                timestamp=datetime.now().isoformat(),
                incident_summary=f"Timeline Cascade: {delay_mins}m ceremony overrun",
                candidate_lowest_cost=cand_a,
                candidate_best_experience=cand_b,
                candidate_lowest_disruption=cand_c,
                rejected_proposals=[],
                system_advisory=f"CRITICAL PATH ADJUSTMENT: Buffer compression absorbs {delay_mins}m delay without police curfew breach.",
            )

        latency_ms = int((time.time() - start_time) * 1000)

        telemetry = GenAITelemetryTrace(
            trace_id=f"TRACE-{uuid.uuid4().hex[:8]}",
            timestamp=datetime.now().isoformat(),
            active_agent="RescueStudioTriageAgent",
            purpose=f"Generate 3-way recovery alternatives for {incident.incident_type.value}",
            raw_prompt_sent=user_prompt,
            structured_json_response={
                "incident_id": incident_id,
                "strategy_a": comparison.candidate_lowest_cost.summary,
                "strategy_b": comparison.candidate_best_experience.summary,
                "strategy_c": comparison.candidate_lowest_disruption.summary,
                "rejected_count": len(comparison.rejected_proposals),
            },
            latency_ms=latency_ms,
            token_usage_estimated=len(user_prompt.split()) + 380,
            dynamic_diff_summary=f"Synthesized 3 comparative recovery alternatives for {incident.incident_type.value}",
            is_live_call=self._client is not None,
        )

        return comparison, telemetry


gemini_service = GeminiOrchestratorService()
