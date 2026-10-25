"""Incident and Rescue Studio recovery comparison models for FestivaPulseAI.

Enforces 3-way comparative recovery strategies and 'Not Feasible' refusals
adhering to @02_system_architect and @04_responsible_ai_ethics.
"""

from __future__ import annotations

import uuid
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class IncidentType(str, Enum):
    ATTENDANCE_SURGE = "Attendance Surge"
    ATTENDANCE_DROP = "Attendance Drop"
    FOOD_SHORTAGE = "Food Shortage"
    FOOD_SURPLUS = "Food Surplus"
    BUDGET_CUT = "Budget Cut"
    BUDGET_BOOST = "Budget Increase"
    TIMELINE_DELAY = "Timeline Delay"
    ZONE_DISRUPTION = "Venue Zone Disruption"


class RecoveryStrategyType(str, Enum):
    LOWEST_COST = "Lowest Additional Cost"
    BEST_EXPERIENCE = "Best Guest Experience"
    LOWEST_DISRUPTION = "Lowest Operational Disruption"


class IncidentSubmission(BaseModel):
    event_id: str
    incident_type: IncidentType
    entered_values: dict[str, Any] = Field(
        ...,
        description="e.g. {'new_attendance': 360, 'shortage_category': 'General Vegetarian', 'shortage_count': 40}",
    )
    source: str = "Organizer Live Input"
    observation_time: str
    is_simulation: bool = False


class RecoveryProposal(BaseModel):
    proposal_id: str = Field(default_factory=lambda: f"PROP-{uuid.uuid4().hex[:4]}")
    strategy_type: RecoveryStrategyType
    summary: str
    action_items: list[str]
    additional_cost: int
    remaining_budget_projected: int
    guests_covered: int
    timeline_impact_minutes: int
    vendor_dependencies: list[str]
    unresolved_constraints: list[str]
    actions_requiring_human_approval: list[str]
    is_feasible: bool = True
    infeasibility_reason: str | None = None


class RescueStudioComparison(BaseModel):
    incident_id: str
    event_id: str
    timestamp: str
    incident_summary: str
    candidate_lowest_cost: RecoveryProposal
    candidate_best_experience: RecoveryProposal
    candidate_lowest_disruption: RecoveryProposal
    rejected_proposals: list[RecoveryProposal] = Field(default_factory=list)
    system_advisory: str
