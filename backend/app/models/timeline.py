"""Timeline DAG and schedule models for FestivaPulseAI.

Tracks critical path dependencies, buffer absorption, and curfew compliance.
"""

from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class TimelineNode(BaseModel):
    node_id: str
    title: str
    owner: str  # e.g., "Priest", "Catering Lead", "AV Technician", "Host Family"
    scheduled_start: str  # "HH:MM"
    scheduled_end: str    # "HH:MM"
    duration_minutes: int
    dependencies: List[str] = Field(default_factory=list, description="IDs of tasks that must complete first")
    is_fixed_contractual_window: bool = Field(default=False, description="Fixed timeslot like venue rental or curfew")
    curfew_alert: bool = False
    status: str = "SCHEDULED"  # SCHEDULED, IN_PROGRESS, COMPLETED, DELAYED


class TimelineCascadeImpact(BaseModel):
    delayed_node_id: str
    delay_minutes: int
    propagated_delays: List[TimelineNode]
    curfew_breached: bool = False
    curfew_cutoff_time: str = "22:00"
    overtime_penalty_estimated: int = 0
    kitchen_warm_hold_exceeded: bool = False
    recommendation: str
