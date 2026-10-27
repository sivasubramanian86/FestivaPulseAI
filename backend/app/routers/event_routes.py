"""Event creation and blueprint endpoints for FestivaPulseAI.

Adheres to @07_modern_polyglot_standards and @10_security_governance.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, status

from backend.app.agents.supervisor import EventSupervisorAgent
from backend.app.config import settings
from backend.app.core.engine import (
    calculate_budget_ledger,
    calculate_food_sufficiency,
)
from backend.app.models.budget import BudgetCategoryItem
from backend.app.models.event import EventIntakeRequest
from backend.app.models.inventory import MealCategory
from backend.app.models.timeline import TimelineNode
from backend.app.services.firestore_service import firestore_service
from backend.app.services.gemini_service import gemini_service
from backend.app.services.monitoring_service import monitoring_service
from backend.app.services.storage_service import EventState, storage_service

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

    state.timeline_nodes = [
        TimelineNode(
            node_id="T1",
            title="Guest Arrival & Welcome Refreshments",
            owner="Hospitality Team",
            scheduled_start="17:00",
            scheduled_end="18:00",
            duration_minutes=60,
            dependencies=[],
        ),
        TimelineNode(
            node_id="T2",
            title="Main Celebration & Auspicious Rituals",
            owner="Priest / Officiant",
            scheduled_start="18:15",
            scheduled_end="19:45",
            duration_minutes=90,
            dependencies=["T1"],
        ),
        TimelineNode(
            node_id="T3",
            title="Traditional Feast & Banquet Service",
            owner="Catering Head",
            scheduled_start="19:45",
            scheduled_end="21:15",
            duration_minutes=90,
            dependencies=["T2"],
        ),
        TimelineNode(
            node_id="T4",
            title="Musical Fusion & Farewell",
            owner="AV Crew",
            scheduled_start="21:15",
            scheduled_end="22:00",
            duration_minutes=45,
            dependencies=["T3"],
            is_fixed_contractual_window=True,
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
