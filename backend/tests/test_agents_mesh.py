"""Test suite for FestivaPulseAI Google ADK Multi-Agent Mesh.

Tests individual specialist sub-agents, dynamic tool execution,
and supervisor parallel orchestration.
Adheres to @08_polyglot_tdd_engineer and @03_agentic_framework_architect.
"""

import pytest
from backend.app.agents.base import ADKTask
from backend.app.agents.blueprint_agent import BlueprintAgent
from backend.app.agents.food_guard_agent import FestivaFoodGuardAgent
from backend.app.agents.spatial_crowd_agent import SpatialCrowdAgent
from backend.app.agents.budget_elasticity_agent import BudgetElasticityAgent
from backend.app.agents.timeline_cascade_agent import TimelineCascadeAgent
from backend.app.agents.supervisor import supervisor_agent
from backend.app.models.budget import BudgetCategoryItem, BudgetLedger
from backend.app.models.timeline import TimelineNode


@pytest.mark.asyncio
async def test_blueprint_agent_execution():
    agent = BlueprintAgent()
    task = ADKTask(task_id="T-1", intent="PLAN", priority=1, assigned_agent=agent.name)
    result = await agent.execute_task(task, {
        "intake": {
            "event_name": "Chennai Wedding",
            "expected_guests": 300,
            "total_budget": 1200000,
            "location": "Chennai",
            "preferences": {"cultural_vibe": "South Indian Heritage"}
        }
    })
    assert task.status == "COMPLETED"
    assert len(result["themes"]) == 4
    assert len(result["intergenerational_features"]) == 3
    assert result["_meta"]["agent"] == "BlueprintSpecialistAgent"


@pytest.mark.asyncio
async def test_food_guard_agent_pantry_rag():
    agent = FestivaFoodGuardAgent()
    task = ADKTask(task_id="T-2", intent="FOOD_SHORTAGE", priority=1, assigned_agent=agent.name)
    result = await agent.execute_task(task, {
        "incident_type": "Food Shortage",
        "values": {"shortage_count": 50, "category": "General Vegetarian"}
    })
    assert task.status == "COMPLETED"
    assert result["triage_mode"] == "SCARCITY_MITIGATION"
    assert "rag_solution" in result
    assert result["rag_solution"]["prep_time_minutes"] <= 15
    assert len(result["action_plan"]) >= 3


@pytest.mark.asyncio
async def test_spatial_crowd_agent_hse_refusal():
    agent = SpatialCrowdAgent()
    task = ADKTask(task_id="T-3", intent="SURGE", priority=1, assigned_agent=agent.name)
    # 450 guests in 350 capacity hall -> HSE Refusal!
    result = await agent.execute_task(task, {
        "values": {"new_guests": 450},
        "max_capacity": 350
    })
    assert task.status == "COMPLETED"
    assert result["is_feasible"] is False
    assert "NOT FEASIBLE" in result["refusal_reason"]
    assert len(result["mitigation_options"]) >= 2


@pytest.mark.asyncio
async def test_supervisor_parallel_coordination():
    result = await supervisor_agent.coordinate_crisis_recovery(
        incident_type="Compound Crisis",
        values={
            "shortage_count": 30,
            "category": "General Vegetarian",
            "new_guests": 280,
            "delay_minutes": 20
        },
        context={
            "max_capacity": 350,
            "expected_guests": 250,
            "timeline_nodes": [
                TimelineNode(node_id="T1", title="Welcome", owner="Host", scheduled_start="18:00", scheduled_end="19:00", duration_minutes=60, dependencies=[])
            ]
        }
    )
    assert result["executed_sub_agents_count"] >= 2
    assert len(result["findings"]) >= 2
