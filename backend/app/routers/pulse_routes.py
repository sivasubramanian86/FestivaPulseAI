"""Event Pulse operational telemetry and live shock intake endpoints.

Executes deterministic domain calculations upon live field input changes.
Adheres to @02_system_architect and @04_responsible_ai_ethics.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.core.engine import (
    calculate_food_sufficiency,
    generate_fssai_surplus_manifest,
    propagate_timeline_delay,
    rebalance_budget_pareto,
)
from backend.app.services.monitoring_service import monitoring_service
from backend.app.services.pubsub_service import pubsub_service
from backend.app.services.storage_service import storage_service

router = APIRouter(prefix="/api/v1/event", tags=["Event Pulse"])


class PulseUpdateRequest(BaseModel):
    """Payload schema for real-time celebration pulse updates (check-ins, inventory, delays)."""

    actual_checked_in: int = Field(default=0, ge=0)
    revised_expected_guests: int = Field(default=250, ge=10)
    category_inventory_update: dict[str, dict[str, int]] = Field(default_factory=dict)
    revised_budget: int = Field(default=0, ge=0)
    delayed_node_id: str = Field(default="")
    delay_minutes: int = Field(default=0, ge=0)


@router.post("/{event_id}/pulse")
async def update_event_pulse(event_id: str, payload: PulseUpdateRequest) -> dict[str, Any]:
    """Applies live field observations and executes deterministic updates."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")

    calculations_run = []

    # 1. Update Food Sufficiency Radar if inventory or attendance changed
    if payload.category_inventory_update or payload.actual_checked_in > 0:
        inv = (
            payload.category_inventory_update
            if payload.category_inventory_update
            else {
                c.category.value: {
                    "prepared": c.prepared_portions,
                    "served": c.served_portions,
                    "reserved": c.reserved_portions,
                    "inbound": c.confirmed_inbound,
                }
                for c in state.food_radar.categories
            }
            if state.food_radar
            else {}
        )

        state.food_radar = calculate_food_sufficiency(
            event_id,
            payload.revised_expected_guests,
            payload.actual_checked_in,
            state.intake.dietary,
            inv,
        )
        calculations_run.append(
            f"Food Sufficiency Engine: {state.food_radar.total_shortfall_count} shortfalls, "
            f"{state.food_radar.total_surplus_count} surplus portions calculated."
        )

    # 2. Update Budget Ledger if budget changed
    budget_rebalance_result = None
    if payload.revised_budget > 0 and state.ledger:
        budget_rebalance_result = rebalance_budget_pareto(state.ledger, payload.revised_budget)
        calculations_run.append(
            f"Pareto Budget Rebalancer: Feasible={budget_rebalance_result.is_feasible}, "
            f"Delta={budget_rebalance_result.budget_delta:,}"
        )

    # 3. Propagate Timeline Delay if delay specified
    timeline_cascade_result = None
    if payload.delayed_node_id and payload.delay_minutes > 0 and state.timeline_nodes:
        timeline_cascade_result = propagate_timeline_delay(
            state.timeline_nodes,
            payload.delayed_node_id,
            payload.delay_minutes,
            curfew_time=state.intake.preferences.sound_curfew_time,
        )
        state.timeline_nodes = timeline_cascade_result.propagated_delays
        calculations_run.append(
            f"Timeline DAG: Node {payload.delayed_node_id} delayed by {payload.delay_minutes}m. "
            f"Curfew Breached={timeline_cascade_result.curfew_breached}."
        )

    await pubsub_service.publish_telemetry(event_id, payload.model_dump())

    return {
        "success": True,
        "event_id": event_id,
        "food_radar": state.food_radar.model_dump() if state.food_radar else None,
        "timeline": [t.model_dump() for t in state.timeline_nodes],
        "budget_rebalance": budget_rebalance_result.model_dump() if budget_rebalance_result else None,
        "timeline_cascade": timeline_cascade_result.model_dump() if timeline_cascade_result else None,
        "calculations_executed": calculations_run,
    }


class FSSAIDispatchRequest(BaseModel):
    """Payload schema for generating certified FSSAI food donation recovery manifests."""

    surplus_kg: float = Field(..., ge=1.0, le=500.0)
    hot_temp_celsius: float = Field(default=68.0, ge=40.0, le=95.0)
    cold_temp_celsius: float = Field(default=4.0, ge=0.0, le=25.0)
    partner_ngo: str = Field(default="Feeding India (Zomato Giving)")


@router.post("/{event_id}/food/fssai-manifest")
async def generate_fssai_manifest(event_id: str, payload: FSSAIDispatchRequest) -> dict[str, Any]:
    """Generates official FSSAI certified food-rescue dispatch manifest with ESG carbon impact."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")

    manifest = generate_fssai_surplus_manifest(
        event_id,
        payload.surplus_kg,
        payload.hot_temp_celsius,
        payload.cold_temp_celsius,
        payload.partner_ngo,
    )
    if state.food_radar:
        state.food_radar.fssai_manifest = manifest

    monitoring_service.record_fssai_redistribution(payload.surplus_kg, payload.partner_ngo)

    return {
        "success": True,
        "manifest": manifest.model_dump(),
        "is_temperature_compliant": manifest.is_temperature_compliant,
        "esg_certificate": {
            "carbon_offset_kg": manifest.carbon_emissions_prevented_kg,
            "csr_tax_deduction_inr": manifest.csr_tax_deduction_inr,
            "meals_rescued": int(payload.surplus_kg * 3),
        },
    }
