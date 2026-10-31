"""Unit tests for individual ADK Agents and MCP / Agentic RAG tools.

Validates each agent in isolation: Base, Blueprint, FoodGuard, SpatialCrowd,
BudgetElasticity, TimelineCascade, and MCP tools.
Adheres to @03_agentic_framework_architect and @08_polyglot_tdd_engineer.
"""

from unittest.mock import patch

import pytest

from backend.app.agents.base import ADKMemory, ADKTask, FestivaAgent
from backend.app.agents.blueprint_agent import BlueprintAgent
from backend.app.agents.budget_elasticity_agent import BudgetElasticityAgent
from backend.app.agents.food_guard_agent import FestivaFoodGuardAgent
from backend.app.agents.mcp_tools import (
    ngo_registry_lookup,
    pantry_rag_search,
    venue_hse_capacity_lookup,
    weather_risk_evaluator,
)
from backend.app.agents.spatial_crowd_agent import SpatialCrowdAgent
from backend.app.agents.timeline_cascade_agent import TimelineCascadeAgent
from backend.app.core.engine import calculate_budget_ledger
from backend.app.models.budget import BudgetCategoryItem
from backend.app.models.timeline import TimelineNode


class ConcreteAgent(FestivaAgent):
    """Test suite for Concrete Agent."""
    async def _run_logic(self, task: ADKTask, context: dict) -> dict:
        """Verifies run logic."""
        if task.intent == "FAIL":
            raise RuntimeError("Test runtime error")
        return {"status": "ok", "context": context}


@pytest.mark.unit
class TestADKBaseAndMemory:
    """Test suite for A D K Base And Memory."""
    def test_memory_remember_recall_and_clear(self) -> None:
        """Verifies memory remember recall and clear."""
        mem = ADKMemory()
        mem.remember("key1", {"value": 100})
        assert mem.recall("key1") == {"value": 100}
        assert mem.recall("missing_key") is None
        mem.log_long_term({"entry": 1})
        assert len(mem.long_term) == 1
        mem.clear()
        assert mem.recall("key1") is None
        assert len(mem.long_term) == 0

    @pytest.mark.asyncio
    async def test_base_agent_execution_success(self) -> None:
        """Verifies base agent execution success."""
        agent = ConcreteAgent(name="TestAgent", role="Tester")
        agent.register_tool(lambda x: x * 2)
        assert len(agent.tools) == 1

        task = ADKTask(task_id="T-01", intent="SUCCESS")
        result = await agent.execute_task(task, {"foo": "bar"})
        assert task.status == "COMPLETED"
        assert result["status"] == "ok"
        assert result["_meta"]["agent"] == "TestAgent"

    @pytest.mark.asyncio
    async def test_base_agent_execution_failure(self) -> None:
        """Verifies base agent execution failure."""
        agent = ConcreteAgent(name="FailAgent", role="Tester")
        task = ADKTask(task_id="T-02", intent="FAIL")
        result = await agent.execute_task(task, {})
        assert task.status == "FAILED"
        assert "Test runtime error" in result["error"]

    @pytest.mark.asyncio
    async def test_base_agent_not_implemented(self) -> None:
        """Verifies base agent not implemented."""
        agent = FestivaAgent(name="RawBase", role="Tester")
        task = ADKTask(task_id="T-03", intent="UNKNOWN")
        result = await agent.execute_task(task, {})
        assert task.status == "FAILED"
        assert "Sub-classes must implement _run_logic" in result["error"]

    def test_agent_client_init_exception(self) -> None:
        """Verifies agent client init exception."""
        with patch("backend.app.agents.base.settings") as mock_settings:
            mock_settings.is_live_gemini_enabled = True
            mock_settings.effective_gemini_key = "live_key"
            with patch("google.genai.Client", side_effect=Exception("Failed to init")):
                agent = FestivaAgent(name="InitFail", role="Tester")
                assert agent._client is None

    def test_agent_google_adk_init_exception(self) -> None:
        """Verifies agent google adk init exception."""
        with patch("backend.app.agents.base.HAS_GOOGLE_ADK", True):
            with patch("backend.app.agents.base.GoogleADKAgent", side_effect=Exception("ADK failure")):
                agent = ConcreteAgent(name="ADKFailAgent", role="Tester")
                assert agent.adk_agent is None


@pytest.mark.unit
class TestMCPTools:
    """Test suite for M C P Tools."""
    def test_pantry_rag_search_all_categories(self) -> None:
        """Verifies pantry rag search all categories."""
        for q in ["pulav", "millet", "dal", "dessert"]:
            res = pantry_rag_search(query=q, required_portions=40)
            assert "recommended_recipe" in res
            assert res["prep_time_minutes"] <= 15
            assert res["required_raw_kg"] > 0
            assert res["estimated_ingredient_cost_inr"] > 0

    def test_pantry_rag_search_category_keyword_match(self) -> None:
        """Verifies pantry rag search category keyword match."""
        res = pantry_rag_search(query="We need grains urgently", required_portions=25)
        assert res["recommended_recipe"] is not None

    def test_ngo_registry_lookup_known_and_fallback(self) -> None:
        """Verifies ngo registry lookup known and fallback."""
        res_cbe = ngo_registry_lookup("Chennai")
        assert "Feeding India" in res_cbe["registered_ngo"]
        assert res_cbe["pickup_sla_minutes"] > 0
        # Fallback city
        res_unknown = ngo_registry_lookup("Tirunelveli")
        assert "Robin Hood Army" in res_unknown["registered_ngo"]

    def test_venue_hse_capacity_lookup(self) -> None:
        """Verifies venue hse capacity lookup."""
        res = venue_hse_capacity_lookup(
            venue_type="Heritage Banquet Hall", requested_guests=320, authorized_capacity=350
        )
        assert res["authorized_capacity"] == 350
        assert res["compliance_status"] == "HSE_COMPLIANT"
        assert res["is_breach"] is False

        # Overcrowding breach
        res_breach = venue_hse_capacity_lookup(
            venue_type="Heritage Banquet Hall", requested_guests=450, authorized_capacity=350
        )
        assert res_breach["compliance_status"] == "PROHIBITED_OVERCROWDING"
        assert res_breach["is_breach"] is True

    def test_weather_risk_evaluator(self) -> None:
        """Verifies weather risk evaluator."""
        res = weather_risk_evaluator("Chennai")
        assert "rain_probability_pct" in res
        assert "recommended_contingency" in res


@pytest.mark.unit
class TestSpecialistAgents:
    """Test suite for Specialist Agents."""
    @pytest.mark.asyncio
    async def test_blueprint_agent_execution(self) -> None:
        """Verifies blueprint agent execution."""
        agent = BlueprintAgent()
        task = ADKTask(task_id="T-BP-01", intent="GENERATE_BLUEPRINT")
        intake_data = {
            "event_name": "Kongu Heritage Reception",
            "expected_guests": 250,
            "total_budget": 600000,
            "location": "Coimbatore",
            "preferences": {"cultural_vibe": "Kongu Heritage brass lamps"},
        }
        res = await agent.execute_task(task, {"intake": intake_data})
        assert task.status == "COMPLETED"
        assert len(res["themes"]) == 4
        assert len(res["intergenerational_features"]) == 3

    @pytest.mark.asyncio
    async def test_blueprint_agent_with_live_genai_client(self) -> None:
        """Verifies blueprint agent with live genai client."""
        from unittest.mock import MagicMock

        agent = BlueprintAgent()
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = (
            '{"themes": ["GenAI Royal Gold Mandap", "GenAI Lotus Pool", "GenAI Feast", "GenAI Lounge"], '
            '"intergenerational": ["Elders lounge", "Teens arcade", "Kids play enclave"], '
            '"reasoning": "Synthesized with Gemini 2.5 Flash"}'
        )
        mock_client.models.generate_content.return_value = mock_response
        agent._client = mock_client

        task = ADKTask(task_id="T-BP-02", intent="GENERATE_BLUEPRINT")
        res = await agent.execute_task(task, {"intake": {"event_name": "Royal Gala"}})
        assert task.status == "COMPLETED"
        assert res["themes"][0] == "GenAI Royal Gold Mandap"
        assert res["reasoning_trace"] == "Synthesized with Gemini 2.5 Flash"

    @pytest.mark.asyncio
    async def test_blueprint_agent_with_genai_exception(self) -> None:
        """Verifies blueprint agent with genai exception."""
        from unittest.mock import MagicMock

        agent = BlueprintAgent()
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = Exception("API rate limited")
        agent._client = mock_client

        task = ADKTask(task_id="T-BP-03", intent="GENERATE_BLUEPRINT")
        res = await agent.execute_task(task, {"intake": {"event_name": "Fallback Gala"}})
        assert task.status == "COMPLETED"
        assert len(res["themes"]) == 4

    @pytest.mark.asyncio
    async def test_food_guard_scarcity_mitigation(self) -> None:
        """Verifies food guard scarcity mitigation."""
        agent = FestivaFoodGuardAgent()
        task = ADKTask(task_id="T-FG-01", intent="FOOD_SHORTAGE")
        res = await agent.execute_task(
            task,
            {
                "incident_type": "Food Shortage",
                "values": {"shortage_count": 35, "category": "General Vegetarian"},
            },
        )
        assert task.status == "COMPLETED"
        assert res["triage_mode"] == "SCARCITY_MITIGATION"
        assert "rag_solution" in res

    @pytest.mark.asyncio
    async def test_food_guard_surplus_fssai_manifest(self) -> None:
        """Verifies food guard surplus fssai manifest."""
        agent = FestivaFoodGuardAgent()
        task = ADKTask(task_id="T-FG-02", intent="FOOD_SURPLUS")
        res = await agent.execute_task(
            task,
            {
                "incident_type": "Food Surplus",
                "values": {"surplus_kg": 40.0, "hot_temp": 64.0, "cold_temp": 4.0},
                "location": "Coimbatore",
                "event_id": "EVT-01",
            },
        )
        assert task.status == "COMPLETED"
        assert res["triage_mode"] == "SURPLUS_RECOVERY"
        assert "manifest" in res

    @pytest.mark.asyncio
    async def test_spatial_crowd_agent_hse_refusal(self) -> None:
        """Verifies spatial crowd agent hse refusal."""
        agent = SpatialCrowdAgent()
        task = ADKTask(task_id="T-SC-01", intent="SURGE")
        res = await agent.execute_task(
            task,
            {
                "values": {"new_guests": 450},
                "max_capacity": 350,
            },
        )
        assert task.status == "COMPLETED"
        assert res["is_feasible"] is False
        assert "NOT FEASIBLE" in res["refusal_reason"]

    @pytest.mark.asyncio
    async def test_spatial_crowd_agent_feasible(self) -> None:
        """Verifies spatial crowd agent feasible."""
        agent = SpatialCrowdAgent()
        task = ADKTask(task_id="T-SC-02", intent="SURGE")
        res = await agent.execute_task(
            task,
            {
                "values": {"new_guests": 280},
                "max_capacity": 350,
            },
        )
        assert task.status == "COMPLETED"
        assert res["is_feasible"] is True

    @pytest.mark.asyncio
    async def test_budget_elasticity_successful_pareto_rebalance(self) -> None:
        """Verifies budget elasticity successful pareto rebalance."""
        agent = BudgetElasticityAgent()
        task = ADKTask(task_id="T-BE-02", intent="REBALANCE_BUDGET")
        cats = [
            BudgetCategoryItem(
                category_name="Food",
                approved_budget=400000,
                spent_amount=0,
                committed_unpaid=0,
                uncommitted_planned=400000,
                is_protected_anchor=True,
            ),
            BudgetCategoryItem(
                category_name="Decor",
                approved_budget=200000,
                spent_amount=0,
                committed_unpaid=0,
                uncommitted_planned=200000,
                is_protected_anchor=False,
            ),
        ]
        ledger = calculate_budget_ledger("EVT-01", 600000, cats)
        res = await agent.execute_task(
            task,
            {
                "ledger": ledger,
                "revised_budget": 550000,
            },
        )
        assert task.status == "COMPLETED"
        assert res["is_feasible"] is True
        assert res["protected_anchor_total"] > 0
        assert res["pruned_elastic_total"] > 0

    @pytest.mark.asyncio
    async def test_timeline_cascade_execution(self) -> None:
        """Verifies timeline cascade execution."""
        agent = TimelineCascadeAgent()
        task = ADKTask(task_id="T-TC-01", intent="PROPAGATE_DELAY")
        nodes = [
            TimelineNode(
                node_id="N1",
                title="Welcome",
                owner="Host",
                scheduled_start="18:00",
                scheduled_end="19:00",
                duration_minutes=60,
                dependencies=[],
            ),
            TimelineNode(
                node_id="N2",
                title="Dinner",
                owner="Caterer",
                scheduled_start="19:00",
                scheduled_end="20:30",
                duration_minutes=90,
                dependencies=["N1"],
                is_fixed_contractual_window=True,
            ),
        ]
        res = await agent.execute_task(
            task,
            {
                "timeline_nodes": nodes,
                "delayed_node_id": "N1",
                "delay_minutes": 30,
            },
        )
        assert task.status == "COMPLETED"
        assert "propagated_delays" in res
        assert res["delay_minutes"] == 30
