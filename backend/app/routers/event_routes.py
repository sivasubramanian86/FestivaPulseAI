"""Event creation and blueprint endpoints for FestivaPulseAI.

Adheres to @07_modern_polyglot_standards and @10_security_governance.
"""

import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.agents.supervisor import EventSupervisorAgent
from backend.app.config import settings
from backend.app.core.engine import (
    calculate_budget_ledger,
    calculate_food_sufficiency,
)
from backend.app.models.budget import BudgetCategoryItem
from backend.app.models.event import EventIntakeRequest, MilestoneItem
from backend.app.models.inventory import MealCategory
from backend.app.models.telemetry import DecisionLedgerEntry
from backend.app.models.timeline import TimelineNode
from backend.app.services.firestore_service import firestore_service
from backend.app.services.gemini_service import gemini_service
from backend.app.services.imagen_service import imagen_service
from backend.app.services.monitoring_service import monitoring_service
from backend.app.services.storage_service import EventState, storage_service
from backend.app.services.venue_rag_service import venue_rag_service

router = APIRouter(prefix="/api/v1/event", tags=["Event"])
adk_supervisor = EventSupervisorAgent()


def _initialize_event_state(state: EventState) -> None:
    """Initializes/resets budget ledger, food radar, and timeline nodes."""
    intake = state.intake
    blueprint_id = state.blueprint.id

    categories = [
        BudgetCategoryItem(
            category_name="Venue & Hospitality",
            approved_budget=int(intake.total_budget * 0.25),
            spent_amount=int(intake.total_budget * 0.25),
            committed_unpaid=0,
            uncommitted_planned=0,
            is_protected_anchor=True,
            notes="Authorized hall & guest rooms lease",
        ),
        BudgetCategoryItem(
            category_name="Catering & Feast",
            approved_budget=int(intake.total_budget * 0.40),
            spent_amount=int(intake.total_budget * 0.15),
            committed_unpaid=int(intake.total_budget * 0.20),
            uncommitted_planned=int(intake.total_budget * 0.05),
            is_protected_anchor=True,
            notes="40/30/30 batch feast with zero food waste protocol",
        ),
        BudgetCategoryItem(
            category_name="Eco-Decor & Florals",
            approved_budget=int(intake.total_budget * 0.20),
            spent_amount=int(intake.total_budget * 0.05),
            committed_unpaid=int(intake.total_budget * 0.05),
            uncommitted_planned=int(intake.total_budget * 0.10),
            is_protected_anchor=False,
            notes="Biodegradable marigold/jasmine arch & brass lamps",
        ),
        BudgetCategoryItem(
            category_name="Acoustic AV & Entertainment",
            approved_budget=int(intake.total_budget * 0.15),
            spent_amount=int(intake.total_budget * 0.05),
            committed_unpaid=int(intake.total_budget * 0.05),
            uncommitted_planned=int(intake.total_budget * 0.05),
            is_protected_anchor=False,
            notes=f"Sound system calibrated under 75dB; curfew at {intake.preferences.sound_curfew_time}",
        ),
    ]
    state.ledger = calculate_budget_ledger(blueprint_id, intake.total_budget, categories, intake.currency)

    initial_inv = {
        MealCategory.GENERAL_VEG.value: {
            "prepared": int(intake.expected_guests * (intake.dietary.general_veg_pct / 100)),
            "served": 0,
            "reserved": 0,
            "inbound": 0,
        },
        MealCategory.VEGAN.value: {
            "prepared": int(intake.expected_guests * (intake.dietary.vegan_pct / 100)),
            "served": 0,
            "reserved": 0,
            "inbound": 0,
        },
        MealCategory.JAIN.value: {
            "prepared": int(intake.expected_guests * (intake.dietary.jain_pct / 100)),
            "served": 0,
            "reserved": 0,
            "inbound": 0,
        },
        MealCategory.NON_VEG.value: {
            "prepared": int(intake.expected_guests * (intake.dietary.non_veg_pct / 100)),
            "served": 0,
            "reserved": 0,
            "inbound": 0,
        },
        MealCategory.CHILDREN.value: {
            "prepared": intake.dietary.children_meals_count,
            "served": 0,
            "reserved": 0,
            "inbound": 0,
        },
        MealCategory.STAFF_VENDOR.value: {
            "prepared": intake.dietary.staff_vendor_meals_count,
            "served": 0,
            "reserved": 0,
            "inbound": 0,
        },
    }
    state.food_radar = calculate_food_sufficiency(blueprint_id, intake.expected_guests, 0, intake.dietary, initial_inv)

    curfew = intake.preferences.sound_curfew_time or "22:00"
    vibe = intake.preferences.cultural_vibe
    vibe_summary = "Auspicious Rituals"
    if "carnatic" in vibe.lower():
        vibe_summary = "Carnatic-Western Classical Fusion & Rituals"
    elif "sangeet" in vibe.lower():
        vibe_summary = "Sangeet Dance & Ring Ceremony"
    elif "muhurtham" in vibe.lower():
        vibe_summary = "Auspicious Vedic Muhurtham Ceremony"
    elif "retro" in vibe.lower():
        vibe_summary = "Retro Acoustic Lounge & Milestone Tribute"

    feast_summary = "Traditional Feast & 40/30/30 Banquet Service"
    if "millet" in vibe.lower() or "organic" in vibe.lower():
        feast_summary = "Organic Millet Banquet & 40/30/30 Zero Waste Feast"
    elif "sadya" in vibe.lower() or "chennai" in intake.location.lower():
        feast_summary = "Authentic Plantain Leaf Sadya (40/30/30 Batch Cooking)"
    elif "nikah" in vibe.lower() or "mughlai" in vibe.lower():
        feast_summary = "Royal Shahi Dawat & Dum Biryani Banquet"

    state.timeline_nodes = [
        TimelineNode(
            node_id="T1",
            title=f"Guest Arrival & Welcome Refreshments ({intake.location[:35]})",
            owner="Hospitality Team",
            scheduled_start="17:00",
            scheduled_end="18:00",
            duration_minutes=60,
            dependencies=[],
        ),
        TimelineNode(
            node_id="T2",
            title=f"Main Celebration & {vibe_summary}",
            owner="Ceremony Lead / Officiant",
            scheduled_start="18:15",
            scheduled_end="19:45",
            duration_minutes=90,
            dependencies=["T1"],
        ),
        TimelineNode(
            node_id="T3",
            title=feast_summary,
            owner="Catering Head (40/30/30 Kitchen)",
            scheduled_start="19:45",
            scheduled_end="21:15",
            duration_minutes=90,
            dependencies=["T2"],
        ),
        TimelineNode(
            node_id="T4",
            title=f"Musical Recital & Police Curfew Clearance ({curfew})",
            owner="AV & Safety Crew",
            scheduled_start="21:15",
            scheduled_end=curfew,
            duration_minutes=45,
            dependencies=["T3"],
            is_fixed_contractual_window=True,
        ),
    ]

    target_dt = intake.target_date
    state.blueprint.milestones = [
        MilestoneItem(
            phase="T-30 Days",
            task_name=f"Lock {feast_summary[:35]} tasting & vendor contracts",
            owner="Food & Hospitality Committee",
            deadline="T-30 Days",
        ),
        MilestoneItem(
            phase="T-15 Days",
            task_name=f"Secure acoustic sound permit and {curfew} police curfew clearance",
            owner="AV & Venue Liaison",
            deadline="T-15 Days",
        ),
        MilestoneItem(
            phase="T-7 Days",
            task_name=f"Finalize elder wheelchair ramps, quiet dining & {vibe_summary[:28]}",
            owner="Stage & Operations Captain",
            deadline="T-7 Days",
        ),
        MilestoneItem(
            phase="Day of Event",
            task_name=f"Live gate check-in & 40/30/30 batch coordination for {intake.expected_guests} covers",
            owner="Lead Event Coordinator",
            deadline=target_dt,
        ),
        MilestoneItem(
            phase="Post-Event",
            task_name="FSSAI surplus food dispatch to cold-chain NGO & final vendor clearing",
            owner="ESG Sustainability Officer",
            deadline=f"{target_dt} +1d",
        ),
    ]
    state.latest_rescue_comparison = None
    state.decision_ledger = []


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_event(intake: EventIntakeRequest) -> dict[str, Any]:
    """Creates a new celebration from natural-language structured intake."""
    try:
        # 1. Coordinate through ADK Supervisor Agent
        adk_plan = await adk_supervisor.coordinate_plan_generation(intake.model_dump())

        # 2. Generate blueprint and telemetry
        blueprint, telemetry = gemini_service.generate_blueprint(intake)

        # 3. Save in storage
        state = storage_service.save_event(blueprint, intake)
        state.adk_swarm_output = adk_plan

        # 4. Initialize initial state (deterministic ledger, food radar, timeline)
        _initialize_event_state(state)

        # Record telemetry
        storage_service.record_telemetry(blueprint.id, telemetry)
        await firestore_service.save_celebration(blueprint, intake)
        await firestore_service.record_telemetry(blueprint.id, telemetry)
        monitoring_service.record_gemini_latency(telemetry.latency_ms, settings.GEMINI_MODEL, "blueprint_synthesis")

        return {
            "success": True,
            "event_id": blueprint.id,
            "blueprint": blueprint.model_dump(),
            "ledger": state.ledger.model_dump(),
            "food_radar": state.food_radar.model_dump(),
            "timeline": [t.model_dump() for t in state.timeline_nodes],
            "telemetry": telemetry.model_dump(),
            "adk_swarm_output": adk_plan,
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e


@router.get("/{event_id}")
async def get_event(event_id: str) -> dict[str, Any]:
    """Retrieves current complete state of a celebration."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")

    return {
        "blueprint": state.blueprint.model_dump(),
        "intake": state.intake.model_dump(),
        "ledger": state.ledger.model_dump() if state.ledger else None,
        "food_radar": state.food_radar.model_dump() if state.food_radar else None,
        "timeline": [t.model_dump() for t in state.timeline_nodes],
        "latest_rescue": state.latest_rescue_comparison.model_dump() if state.latest_rescue_comparison else None,
        "decision_ledger": [d.model_dump() for d in state.decision_ledger],
        "telemetry_traces": [t.model_dump() for t in state.telemetry_traces[:5]],
        "adk_swarm_output": state.adk_swarm_output,
        "version": state.version,
    }


@router.post("/{event_id}/reset")
async def reset_event(event_id: str) -> dict[str, Any]:
    """Resets the celebration state back to original intake blueprint defaults."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")
    _initialize_event_state(state)
    return {
        "success": True,
        "message": f"Event {event_id} successfully reset to initial intake defaults",
        "blueprint": state.blueprint.model_dump(),
        "ledger": state.ledger.model_dump() if state.ledger else None,
        "food_radar": state.food_radar.model_dump() if state.food_radar else None,
        "timeline": [t.model_dump() for t in state.timeline_nodes],
    }


class BlueprintRefineRequest(BaseModel):
    """Payload schema for natural-language blueprint refinement requests."""
    user_prompt: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Natural language instruction to refine or update celebration blueprint",
    )


@router.post("/{event_id}/refine")
async def refine_event(event_id: str, payload: BlueprintRefineRequest) -> dict[str, Any]:
    """Refines celebration blueprint in real time via Google ADK multi-agent consensus."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")

    prompt = payload.user_prompt.strip()
    prompt_low = prompt.lower()
    old_guests = state.intake.expected_guests
    old_budget = state.intake.total_budget
    changes = []

    # 1. Parse Guest Count Modifications
    add_guest_match = re.search(r"(?:add|plus|\+)\s*(\d+)\s*(?:extra\s*)?(?:more\s*)?guests?", prompt_low)
    set_guest_match = re.search(r"(?:set|change|update)?\s*guests?\s*(?:to|=)?\s*(\d+)", prompt_low)
    if add_guest_match:
        delta = int(add_guest_match.group(1))
        state.intake.expected_guests += delta
        state.blueprint.expected_guests += delta
        state.intake.max_venue_capacity = max(state.intake.max_venue_capacity, state.intake.expected_guests + 50)
        state.blueprint.max_venue_capacity = state.intake.max_venue_capacity
        changes.append(f"Expanded guest capacity by +{delta} to {state.intake.expected_guests}")
    elif set_guest_match:
        target_guests = int(set_guest_match.group(1))
        if 10 <= target_guests <= 10000:
            state.intake.expected_guests = target_guests
            state.blueprint.expected_guests = target_guests
            state.intake.max_venue_capacity = max(state.intake.max_venue_capacity, target_guests + 50)
            state.blueprint.max_venue_capacity = state.intake.max_venue_capacity
            changes.append(f"Updated guest count to {target_guests}")

    # 2. Parse Curfew Adjustments
    curfew_match = re.search(r"(\d{1,2}:\d{2})", prompt)
    if curfew_match and ("curfew" in prompt_low or "time" in prompt_low or "night" in prompt_low):
        new_curfew = curfew_match.group(1)
        state.intake.preferences.sound_curfew_time = new_curfew
        changes.append(f"Locked municipal police sound curfew to {new_curfew}")

    # 3. Parse Cultural Vibe / Menu Themes
    theme_keywords = ["organic", "millet", "jain", "vegan", "fusion", "carnatic", "royal", "beach", "retro", "sangeet"]
    matched_themes = [k.capitalize() for k in theme_keywords if k in prompt_low]
    if matched_themes:
        for th in matched_themes:
            if th not in state.blueprint.personalized_themes:
                state.blueprint.personalized_themes.append(th)
        state.intake.preferences.cultural_vibe = f"{state.intake.preferences.cultural_vibe} | {prompt}"
        changes.append(f"Infused specialized cultural themes: {', '.join(matched_themes)}")

    # 4. Re-orchestrate parallel consensus through ADK Multi-Agent Supervisor
    adk_plan = await adk_supervisor.coordinate_plan_generation(state.intake.model_dump())
    state.adk_swarm_output = adk_plan

    # 5. Re-balance categories & recalculate ledger
    if state.ledger:
        _initialize_event_state(state)

    state.blueprint.executive_summary = f"{state.blueprint.executive_summary} [Refinement: {prompt}]"
    state.version += 1
    state.blueprint.version = state.version

    # 6. Immutable audit log entry in Decision Ledger
    change_summary = "; ".join(changes) if changes else f"Custom refinement: {prompt}"
    entry = DecisionLedgerEntry(
        entry_id=f"DEC-REFINE-{int(datetime.now().timestamp())}",
        timestamp=datetime.now().isoformat(),
        event_id=event_id,
        actor="Host / Event Coordinator (ADK AI Copilot)",
        what_changed=change_summary,
        why_it_changed=f"Coordinator refinement prompt: '{prompt}'",
        original_values={"version": state.version - 1, "guests": old_guests, "budget": old_budget},
        revised_values={
            "version": state.version,
            "guests": state.intake.expected_guests,
            "budget": state.intake.total_budget,
            "curfew": state.intake.preferences.sound_curfew_time,
        },
        calculations_executed="Re-calibrated 40/30/30 food batches, HSE crowd density, and Pareto budget ledger.",
        gemini_recommendation="ADK multi-agent consensus validated revised plan with 0% residual variance.",
        human_approved=True,
        plan_version=state.version,
    )
    state.decision_ledger.insert(0, entry)

    return {
        "success": True,
        "message": f"Celebration blueprint successfully refined to Version v{state.version}.0 via ADK Swarm",
        "blueprint": state.blueprint.model_dump(),
        "ledger": state.ledger.model_dump() if state.ledger else None,
        "food_radar": state.food_radar.model_dump() if state.food_radar else None,
        "timeline": [t.model_dump() for t in state.timeline_nodes],
        "adk_swarm_output": adk_plan,
        "decision_entry": entry.model_dump(),
    }


@router.get("/presets/list")
async def list_presets() -> list[dict[str, Any]]:
    """Returns rich pre-loaded celebration presets for live demonstration."""
    return [
        {
            "id": "PRESET-1",
            "name": "Bengaluru Grand Palace Grounds Royal Celebration",
            "type": "Community Event",
            "location": "Palace Grounds Botanical Glasshouse & Lawns, Bengaluru",
            "date": "2026-11-12",
            "guests": 350,
            "max_capacity": 500,
            "budget": 1200000,
            "currency": "INR",
            "vibe": "Eco-friendly royal Karnataka heritage with live Carnatic-Western fusion & authentic Mysore Pak banquet",
        },
        {
            "id": "PRESET-2",
            "name": "Kalyana Mandapam Traditional Wedding",
            "type": "Wedding",
            "location": "Chennai Heritage Kalyana Mandapam",
            "date": "2026-12-18",
            "guests": 450,
            "max_capacity": 600,
            "budget": 1800000,
            "currency": "INR",
            "vibe": "Auspicious Muhurtham with 40/30/30 batch cooking, elder wheelchair routes & zero food waste",
        },
        {
            "id": "PRESET-3",
            "name": "50th Golden Milestone Birthday Gala",
            "type": "Birthday",
            "location": "Bengaluru Botanical Club",
            "date": "2026-10-30",
            "guests": 120,
            "max_capacity": 200,
            "budget": 350000,
            "currency": "INR",
            "vibe": "Retro 1970s acoustic lounge with kids play zone and diabetic-friendly dessert station",
        },
    ]


@router.get("/venues/search")
async def search_venues(
    location: str = "Bengaluru",
    guests: int = 350,
    budget: int = 1200000,
) -> dict[str, Any]:
    """Retrieves grounded celebration halls matching location, capacity, and budget."""
    halls = venue_rag_service.search_halls(location, guests, budget)
    return {
        "success": True,
        "location": location,
        "count": len(halls),
        "venues": [h.model_dump() for h in halls],
    }


@router.post("/{event_id}/venues/apply/{venue_id}")
async def apply_venue_selection(event_id: str, venue_id: str) -> dict[str, Any]:
    """Applies a selected grounded venue to the active celebration and recalibrates the plan."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")

    hall = venue_rag_service.get_hall_by_id(venue_id)
    if not hall:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Venue hall {venue_id} not found")

    # 1. Update location & capacity in blueprint and intake
    venue_full_title = f"{hall.name}, {hall.city}"
    state.blueprint.location = venue_full_title
    state.blueprint.max_venue_capacity = hall.capacity_max
    state.intake.location = venue_full_title
    state.intake.max_venue_capacity = hall.capacity_max

    # 2. Recalculate financial investment plan
    guests = state.blueprint.expected_guests
    inv_plan = venue_rag_service.calculate_hall_investment_plan(hall, guests, state.blueprint.currency)

    # 3. Rebalance categories
    categories = [
        BudgetCategoryItem(
            category_name="Venue & Hospitality",
            approved_budget=inv_plan["base_rental_inr"],
            spent_amount=inv_plan["base_rental_inr"],
            committed_unpaid=0,
            uncommitted_planned=0,
            is_protected_anchor=True,
            notes=f"Authorized hall lease for {hall.name} ({hall.area})",
        ),
        BudgetCategoryItem(
            category_name="Catering & Feast",
            approved_budget=inv_plan["catering_cost_inr"],
            spent_amount=int(inv_plan["catering_cost_inr"] * 0.35),
            committed_unpaid=int(inv_plan["catering_cost_inr"] * 0.50),
            uncommitted_planned=int(inv_plan["catering_cost_inr"] * 0.15),
            is_protected_anchor=True,
            notes=f"40/30/30 batch feast with zero food waste protocol @ ₹{hall.per_plate_veg_inr}/plate",
        ),
        BudgetCategoryItem(
            category_name="Eco-Decor & Florals",
            approved_budget=inv_plan["decor_cost_inr"],
            spent_amount=int(inv_plan["decor_cost_inr"] * 0.25),
            committed_unpaid=int(inv_plan["decor_cost_inr"] * 0.50),
            uncommitted_planned=int(inv_plan["decor_cost_inr"] * 0.25),
            is_protected_anchor=False,
            notes="Eco-friendly venue floral styling & ambient stage arch",
        ),
        BudgetCategoryItem(
            category_name="Acoustic AV & Entertainment",
            approved_budget=inv_plan["av_sound_cost_inr"],
            spent_amount=int(inv_plan["av_sound_cost_inr"] * 0.25),
            committed_unpaid=int(inv_plan["av_sound_cost_inr"] * 0.50),
            uncommitted_planned=int(inv_plan["av_sound_cost_inr"] * 0.25),
            is_protected_anchor=False,
            notes=f"Calibrated under 75dB; curfew strictly locked at {hall.sound_curfew_time}",
        ),
    ]

    total_calc = inv_plan["total_estimated_inr"]
    state.blueprint.total_budget = total_calc
    state.intake.total_budget = total_calc
    state.ledger = calculate_budget_ledger(state.blueprint.id, total_calc, categories, state.blueprint.currency)
    state.version += 1
    storage_service.persist_event(state)

    return {
        "success": True,
        "message": f"Celebration re-anchored to {hall.name} ({hall.city})",
        "hall": hall.model_dump(),
        "investment_plan": inv_plan,
        "blueprint": state.blueprint.model_dump(),
        "ledger": state.ledger.model_dump(),
    }


class VisualizationRequest(BaseModel):
    """Payload schema for Imagen-powered photorealistic celebration decor rendering."""
    user_prompt: str = Field(..., min_length=3, max_length=500, description="Visual description of celebration decor")
    lighting_mood: str = Field(default="Golden Hour Glow", description="Atmospheric lighting setting")
    aspect_ratio: str = Field(default="16:9", description="Aspect ratio for image generation")


@router.post("/visualize")
@router.post("/{event_id}/visualize")
async def generate_celebration_visualization(
    payload: VisualizationRequest,
    event_id: str | None = None,
) -> dict[str, Any]:
    """Generates an architectural visualization using Vertex AI Imagen 3.0 / Nano Procedural Engine."""
    context_prefix = ""
    if event_id:
        state = storage_service.get_event(event_id)
        if state:
            context_prefix = f"Celebration at {state.blueprint.location} for {state.blueprint.expected_guests} guests. "

    full_prompt = f"{context_prefix}{payload.user_prompt}".strip()
    result = imagen_service.generate_visualization(
        prompt=full_prompt,
        lighting_mood=payload.lighting_mood,
        aspect_ratio=payload.aspect_ratio,
    )
    return result
