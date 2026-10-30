"""Integration tests for the FestivaPulseAI Multi-Agent Swarm (Google ADK Mesh).

Validates inter-agent communication, parallel crisis dispatching,
shared ADK memory hydration, and supervisor synthesis.
"""

from unittest.mock import MagicMock

import pytest

from backend.app.agents.supervisor import EventSupervisorAgent
from backend.app.core.engine import calculate_budget_ledger
from backend.app.models.budget import BudgetCategoryItem


@pytest.mark.integration
class TestSupervisorAgentSwarmIntegration:
    @pytest.mark.asyncio
    async def test_supervisor_coordinate_plan_generation(self):
        supervisor = EventSupervisorAgent()
        sample_intake = {
            "event_name": "Kongu Heritage Gala",
            "expected_guests": 250,
            "total_budget": 600000,
            "location": "Coimbatore",
            "event_type": "Wedding",
        }
        res = await supervisor.coordinate_plan_generation(sample_intake)
        assert res is not None
        assert "summary" in res
        # Verify stored in supervisor memory
        cached = supervisor.memory.recall("latest_blueprint")
        assert cached is not None
        assert cached["summary"] == res["summary"]

    @pytest.mark.asyncio
    async def test_supervisor_parallel_crisis_coordination(self):
        supervisor = EventSupervisorAgent()
        # Complex shock triggering food shortage AND crowd surge concurrently
        incident_type = "Attendance Surge and Food Shortage"
        values = {
            "new_guests": 320,
            "shortage_count": 40,
            "shortage_category": "General Vegetarian",
        }
        context = {
            "location": "Coimbatore",
            "event_id": "EVT-INTEG-01",
            "max_capacity": 350,
            "expected_guests": 250,
        }

        result = await supervisor.coordinate_crisis_recovery(incident_type, values, context)
        assert result is not None
        assert result["executed_sub_agents_count"] >= 2
        assert len(result["findings"]) >= 2
        assert "overall_recommendation" in result

        # Check memory recorded the crisis in long_term
        assert len(supervisor.memory.long_term) == 1

    @pytest.mark.asyncio
    async def test_supervisor_with_budget_slash_coordination(self):
        supervisor = EventSupervisorAgent()
        cats = [
            BudgetCategoryItem(
                category_name="Catering",
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
        incident_type = "Budget Cut Shock"
        values = {"budget_cut_amount": 50000, "revised_budget": 550000}
        context = {
            "location": "Chennai",
            "event_id": "EVT-INTEG-02",
            "ledger": ledger,
        }

        result = await supervisor.coordinate_crisis_recovery(incident_type, values, context)
        assert result is not None
        assert len(result["findings"]) >= 1

    @pytest.mark.asyncio
    async def test_supervisor_with_mock_gemini_client(self):
        supervisor = EventSupervisorAgent()
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Multi-Agent Swarm Synthesis: Stagger dinner into two shifts to absorb 70 guest surge."
        mock_client.models.generate_content.return_value = mock_response
        supervisor._client = mock_client

        incident_type = "Attendance Surge"
        values = {"new_guests": 310}
        context = {"location": "Chennai", "max_capacity": 350, "expected_guests": 250}

        result = await supervisor.coordinate_crisis_recovery(incident_type, values, context)
        assert result is not None
        assert "Multi-Agent Swarm Synthesis" in result["overall_recommendation"]

    @pytest.mark.asyncio
    async def test_supervisor_plan_generation_with_live_gemini_client(self):
        supervisor = EventSupervisorAgent()
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Live Swarm Consensus: 5 specialist agents validated blueprint with 100% adherence."
        mock_client.models.generate_content.return_value = mock_response
        supervisor._client = mock_client

        sample_intake = {
            "event_name": "Royal Palace Reception",
            "expected_guests": 300,
            "max_venue_capacity": 500,
            "total_budget": 1000000,
            "location": "Bengaluru",
        }
        res = await supervisor.coordinate_plan_generation(sample_intake)
        assert res["summary"] == "Live Swarm Consensus: 5 specialist agents validated blueprint with 100% adherence."
        assert res["is_live_gemini"] is True
        assert len(res["agents"]) == 6

    @pytest.mark.asyncio
    async def test_supervisor_plan_generation_gemini_exception_fallback(self):
        supervisor = EventSupervisorAgent()
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = Exception("Vertex quota exceeded")
        supervisor._client = mock_client

        sample_intake = {
            "event_name": "Quota Fallback Gala",
            "expected_guests": 200,
            "max_venue_capacity": 400,
            "total_budget": 500000,
            "location": "Chennai",
        }
        res = await supervisor.coordinate_plan_generation(sample_intake)
        assert "Google ADK Multi-Agent Consensus" in res["summary"]
        assert len(res["agents"]) == 6

    def test_supervisor_init_client_variants(self):
        from unittest.mock import patch

        with patch("backend.app.agents.supervisor.settings") as mock_settings:
            mock_settings.is_live_gemini_enabled = True
            mock_settings.effective_gemini_key = "live_key"
            with patch("google.genai.Client", return_value=MagicMock()) as mock_cls:
                s1 = EventSupervisorAgent()
                assert s1._client is not None
                mock_cls.assert_called_once()

            with patch("google.genai.Client", side_effect=Exception("Failed to construct")):
                s2 = EventSupervisorAgent()
                assert s2._client is None
