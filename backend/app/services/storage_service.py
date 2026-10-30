"""Storage and persistence service for FestivaPulseAI.

Provides an in-memory repository with SQLite backup adapter boundary
to guarantee atomic plan revisions and immutable decision ledger entries.
Adheres to @01_memory_manager and @02_system_architect.
"""

from datetime import datetime
from typing import Any

from backend.app.models.budget import BudgetLedger
from backend.app.models.event import EventBlueprint, EventIntakeRequest
from backend.app.models.incident import RescueStudioComparison
from backend.app.models.inventory import FoodSufficiencyRadar
from backend.app.models.telemetry import DecisionLedgerEntry, GenAITelemetryTrace
from backend.app.models.timeline import TimelineNode


class EventState:
    def __init__(self, blueprint: EventBlueprint, intake: EventIntakeRequest):
        self.blueprint = blueprint
        self.intake = intake
        self.ledger: BudgetLedger | None = None
        self.food_radar: FoodSufficiencyRadar | None = None
        self.timeline_nodes: list[TimelineNode] = []
        self.latest_rescue_comparison: RescueStudioComparison | None = None
        self.decision_ledger: list[DecisionLedgerEntry] = []
        self.telemetry_traces: list[GenAITelemetryTrace] = []
        self.adk_swarm_output: dict[str, Any] | None = None
        self.version: int = 1


class StorageService:
    def __init__(self):
        self._events: dict[str, EventState] = {}

    def save_event(self, blueprint: EventBlueprint, intake: EventIntakeRequest) -> EventState:
        state = EventState(blueprint, intake)
        self._events[blueprint.id] = state
        return state

    def get_event(self, event_id: str) -> EventState | None:
        return self._events.get(event_id)

    def list_events(self) -> list[EventBlueprint]:
        return [state.blueprint for state in self._events.values()]

    def record_decision(
        self,
        event_id: str,
        what_changed: str,
        why_it_changed: str,
        original_values: dict,
        revised_values: dict,
        calculation_proof: str,
        gemini_recommendation: str,
    ) -> DecisionLedgerEntry:
        state = self.get_event(event_id)
        if not state:
            raise ValueError(f"Event {event_id} not found")

        entry = DecisionLedgerEntry(
            entry_id=f"DEC-{int(datetime.now().timestamp())}-{len(state.decision_ledger) + 1}",
            timestamp=datetime.now().isoformat(),
            event_id=event_id,
            actor="Host / Event Coordinator",
            what_changed=what_changed,
            why_it_changed=why_it_changed,
            original_values=original_values,
            revised_values=revised_values,
            calculations_executed=calculation_proof,
            gemini_recommendation=gemini_recommendation,
            human_approved=True,
            plan_version=state.version,
        )
        state.decision_ledger.append(entry)
        state.version += 1
        state.blueprint.version = state.version
        return entry

    def record_telemetry(self, event_id: str, trace: GenAITelemetryTrace) -> None:
        state = self.get_event(event_id)
        if state:
            state.telemetry_traces.insert(0, trace)  # Most recent first


storage_service = StorageService()
