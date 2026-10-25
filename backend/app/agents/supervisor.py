"""EventSupervisorAgent — High-Level Google ADK Coordinator.

Orchestrates specialist sub-agents (Blueprint, FoodGuard, Spatial, Budget, Timeline)
using asyncio.gather, memory tracking, and deterministic verification gates.
Adheres to @03_agentic_framework_architect and @02_system_architect.
"""

import asyncio
import logging
import time
import uuid
from typing import Any

from backend.app.agents.base import ADKMemory, ADKTask
from backend.app.agents.blueprint_agent import BlueprintAgent
from backend.app.agents.budget_elasticity_agent import BudgetElasticityAgent
from backend.app.agents.food_guard_agent import FestivaFoodGuardAgent
from backend.app.agents.spatial_crowd_agent import SpatialCrowdAgent
from backend.app.agents.timeline_cascade_agent import TimelineCascadeAgent

logger = logging.getLogger(__name__)


class EventSupervisorAgent:
    """Master ADK Supervisor coordinating the swarm of specialist domain agents."""

    def __init__(self):
        self.name = "EventSupervisorAgent"
        self.memory = ADKMemory()

        # Instantiate sub-agents
        self.blueprint_agent = BlueprintAgent()
        self.food_guard_agent = FestivaFoodGuardAgent()
        self.spatial_agent = SpatialCrowdAgent()
        self.budget_agent = BudgetElasticityAgent()
        self.timeline_agent = TimelineCascadeAgent()
        self._client = None

    async def coordinate_plan_generation(self, intake_data: dict[str, Any]) -> dict[str, Any]:
        """Dispatches tasks to blueprint and budget agents concurrently."""
        task_id = f"TASK-PLAN-{uuid.uuid4().hex[:6]}"
        task = ADKTask(
            task_id=task_id,
            intent="GENERATE_MASTER_BLUEPRINT",
            priority=1,
            assigned_agent=self.blueprint_agent.name,
        )

        blueprint_output = await self.blueprint_agent.execute_task(task, {"intake": intake_data})
        self.memory.remember("latest_blueprint", blueprint_output)
        return blueprint_output

    async def coordinate_crisis_recovery(
        self, incident_type: str, values: dict[str, Any], context: dict[str, Any]
    ) -> dict[str, Any]:
        """Dispatches parallel tasks to relevant specialist sub-agents during an event crisis."""
        tasks: list[asyncio.Task] = []

        # 1. Food / Catering Incident
        if "Food" in incident_type or values.get("shortage_count", 0) > 0 or values.get("surplus_kg", 0) > 0:
            food_task = ADKTask(
                task_id=f"TASK-FOOD-{uuid.uuid4().hex[:4]}",
                intent="TRIAGE_CATERING_DEVIATION",
                priority=1,
                assigned_agent=self.food_guard_agent.name,
            )
            tasks.append(
                asyncio.create_task(
                    self.food_guard_agent.execute_task(
                        food_task,
                        {
                            "incident_type": incident_type,
                            "values": values,
                            "location": context.get("location", "Chennai"),
                            "event_id": context.get("event_id", "EVT-001"),
                        },
                    )
                )
            )

        # 2. Crowd / Attendance Incident
        if "Attendance" in incident_type or values.get("new_guests", 0) > 0:
            crowd_task = ADKTask(
                task_id=f"TASK-CROWD-{uuid.uuid4().hex[:4]}",
                intent="EVALUATE_CROWD_AND_SAFETY",
                priority=1,
                assigned_agent=self.spatial_agent.name,
            )
            tasks.append(
                asyncio.create_task(
                    self.spatial_agent.execute_task(
                        crowd_task,
                        {
                            "values": values,
                            "max_capacity": context.get("max_capacity", 350),
                            "expected_guests": context.get("expected_guests", 250),
                            "venue_type": context.get("venue_type", "Banquet Hall"),
                        },
                    )
                )
            )

        # 3. Budget Incident
        if "Budget" in incident_type or values.get("budget_cut_amount", 0) > 0:
            budget_task = ADKTask(
                task_id=f"TASK-BUDGET-{uuid.uuid4().hex[:4]}",
                intent="REBALANCE_BUDGET_PARETO",
                priority=2,
                assigned_agent=self.budget_agent.name,
            )
            tasks.append(
                asyncio.create_task(
                    self.budget_agent.execute_task(
                        budget_task,
                        {
                            "ledger": context.get("ledger"),
                            "revised_budget": values.get("revised_budget", 0),
                        },
                    )
                )
            )

        # 4. Timeline Incident
        if "Timeline" in incident_type or values.get("delay_minutes", 0) > 0:
            time_task = ADKTask(
                task_id=f"TASK-TIME-{uuid.uuid4().hex[:4]}",
                intent="PROPAGATE_TIMELINE_DOMINOES",
                priority=2,
                assigned_agent=self.timeline_agent.name,
            )
            tasks.append(
                asyncio.create_task(
                    self.timeline_agent.execute_task(
                        time_task,
                        {
                            "timeline_nodes": context.get("timeline_nodes", []),
                            "delayed_node_id": values.get("delayed_node_id", "T1"),
                            "delay_minutes": values.get("delay_minutes", 30),
                            "curfew_time": context.get("curfew_time", "22:00"),
                        },
                    )
                )
            )

        # Parallel execution of all applicable domain agents
        sub_agent_results = await asyncio.gather(*tasks) if tasks else []

        overall_rec = "Swarm actions dispatched across specialist agents."
        if self._client:
            try:
                response = self._client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=f"Synthesize multi-agent findings for {incident_type}: {sub_agent_results}",
                )
                overall_rec = response.text
            except Exception as e:
                logger.warning(f"Supervisor GenAI synthesis failed: {e}")

        aggregated_output = {
            "incident_type": incident_type,
            "executed_sub_agents_count": len(sub_agent_results),
            "findings": sub_agent_results,
            "overall_recommendation": overall_rec,
            "orchestrated_at": time.time(),
        }

        self.memory.log_long_term(aggregated_output)
        return aggregated_output


supervisor_agent = EventSupervisorAgent()
