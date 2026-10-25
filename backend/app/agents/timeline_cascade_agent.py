"""Timeline Cascade ADK Specialist Agent for FestivaPulseAI.

Specializes in DAG critical-path dependency shifts, buffer window absorption,
and police sound curfew compliance.
Adheres to @02_system_architect.
"""

from typing import Any

from backend.app.agents.base import ADKTask, FestivaAgent
from backend.app.core.engine import propagate_timeline_delay


class TimelineCascadeAgent(FestivaAgent):
    def __init__(self):
        super().__init__(
            name="TimelineCascadeAgent",
            role="Critical-Path Timeline & Curfew Coordinator",
            instruction=(
                "Propagate delays across directed acyclic graph timeline nodes. "
                "Protect contractual windows, detect police sound curfew violations (22:00), "
                "and prevent food heating cycles from over-holding in kitchen warmers."
            ),
            model_name="gemini-2.5-flash",
        )

    async def _run_logic(self, task: ADKTask, context: dict[str, Any]) -> dict[str, Any]:
        nodes = context.get("timeline_nodes", [])
        delayed_node_id = context.get("delayed_node_id", "T1")
        delay_minutes = context.get("delay_minutes", 30)
        curfew_time = context.get("curfew_time", "22:00")

        if not nodes:
            return {"error": "Missing timeline nodes for DAG propagation"}

        impact = propagate_timeline_delay(nodes, delayed_node_id, delay_minutes, curfew_time)

        return {
            "delayed_node_id": impact.delayed_node_id,
            "delay_minutes": impact.delay_minutes,
            "curfew_breached": impact.curfew_breached,
            "overtime_penalty_estimated": impact.overtime_penalty_estimated,
            "kitchen_warm_hold_exceeded": impact.kitchen_warm_hold_exceeded,
            "recommendation": impact.recommendation,
            "propagated_delays": [n.model_dump() for n in impact.propagated_delays],
        }
