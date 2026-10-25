"""Rescue Studio endpoints for 3-way comparative recovery strategies.

Enforces human-in-the-loop explicit approvals and records immutable
decision ledger entries adhering to @01_memory_manager and @02_system_architect.
"""

from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.app.models.incident import IncidentSubmission
from backend.app.services.gemini_service import gemini_service
from backend.app.services.storage_service import storage_service

router = APIRouter(prefix="/api/v1/event", tags=["Rescue Studio"])


@router.post("/{event_id}/rescue/propose")
async def propose_recovery_options(event_id: str, incident: IncidentSubmission) -> dict[str, Any]:
    """Generates 3 comparative recovery alternatives in Rescue Studio."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")

    comparison, telemetry = gemini_service.synthesize_recovery_options(state.intake, incident, state)
    state.latest_rescue_comparison = comparison
    storage_service.record_telemetry(event_id, telemetry)

    return {
        "success": True,
        "comparison": comparison.model_dump(),
        "telemetry": telemetry.model_dump(),
    }


class ApproveProposalRequest(BaseModel):
    proposal_id: str = Field(..., description="ID of the candidate proposal approved by the host/coordinator")
    reason_for_approval: str = Field(default="Selected optimal balance between cost and guest experience")


@router.post("/{event_id}/rescue/approve")
async def approve_recovery_proposal(event_id: str, request: ApproveProposalRequest) -> dict[str, Any]:
    """Atomically applies the human-approved recovery revision and updates the Decision Ledger."""
    state = storage_service.get_event(event_id)
    if not state:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event {event_id} not found")

    if not state.latest_rescue_comparison:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active rescue proposal to approve")

    comp = state.latest_rescue_comparison
    candidates = [
        comp.candidate_lowest_cost,
        comp.candidate_best_experience,
        comp.candidate_lowest_disruption,
    ]

    approved_proposal = next((p for p in candidates if p.proposal_id == request.proposal_id), None)
    if not approved_proposal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Proposal {request.proposal_id} not found",
        )

    if not approved_proposal.is_feasible:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve infeasible proposal: {approved_proposal.infeasibility_reason}",
        )

    # 1. Record Decision in immutable Decision Ledger
    orig_values = {
        "budget": state.blueprint.total_budget,
        "guests": state.blueprint.expected_guests,
        "version": state.version,
    }
    revised_values = {
        "budget": state.blueprint.total_budget + approved_proposal.additional_cost,
        "guests": approved_proposal.guests_covered or state.blueprint.expected_guests,
        "version": state.version + 1,
        "applied_strategy": approved_proposal.strategy_type.value,
    }

    decision_entry = storage_service.record_decision(
        event_id=event_id,
        what_changed=f"Applied {approved_proposal.strategy_type.value}: {approved_proposal.summary}",
        why_it_changed=request.reason_for_approval,
        original_values=orig_values,
        revised_values=revised_values,
        calculation_proof=f"Additional Cost: ₹{approved_proposal.additional_cost:,}, Timeline Impact: {approved_proposal.timeline_impact_minutes}m",
        gemini_recommendation=approved_proposal.summary,
    )

    # 2. Update Blueprint
    state.blueprint.total_budget += approved_proposal.additional_cost

    return {
        "success": True,
        "event_id": event_id,
        "decision_entry": decision_entry.model_dump(),
        "new_version": state.version,
        "message": f"Successfully applied revision {approved_proposal.proposal_id} to event plan.",
    }
