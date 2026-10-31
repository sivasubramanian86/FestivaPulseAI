"""Timeline DAG and schedule models for FestivaPulseAI.

Tracks critical path dependencies, buffer absorption, and curfew compliance.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class TimelineNode(BaseModel):
    """Directed acyclic graph schedule node with critical-path dependency tracking."""
    node_id: str
    title: str = "Event Milestone"
    owner: str = "Host Lead"
    scheduled_start: str  # "HH:MM"
    scheduled_end: str  # "HH:MM"
    duration_minutes: int = 60
    dependencies: list[str] = Field(default_factory=list, description="IDs of tasks that must complete first")
    is_fixed_contractual_window: bool = Field(default=False, description="Fixed timeslot like venue rental or curfew")
    curfew_alert: bool = False
    status: str = "SCHEDULED"  # SCHEDULED, IN_PROGRESS, COMPLETED, DELAYED


class TimelineCascadeImpact(BaseModel):
    """Calculated cascade impact of an upstream delay across downstream schedule nodes."""
    delayed_node_id: str
    delay_minutes: int
    propagated_delays: list[TimelineNode]
    curfew_breached: bool = False
    curfew_cutoff_time: str = "22:00"
    overtime_penalty_estimated: int = 0
    kitchen_warm_hold_exceeded: bool = False
    recommendation: str
