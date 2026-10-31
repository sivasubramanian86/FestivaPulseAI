"""FestivaPulseAI — Full Coverage & Google Cloud Integrations Test Suite.

Ensures 100% test coverage across all domain agents, routers, error handlers,
Firestore, Pub/Sub, and Cloud Monitoring services.
Adheres to @enterprise-testing-pyramid and @08_polyglot_tdd_engineer.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.app.agents.base import ADKTask
from backend.app.agents.budget_elasticity_agent import BudgetElasticityAgent
from backend.app.agents.supervisor import EventSupervisorAgent
from backend.app.agents.timeline_cascade_agent import TimelineCascadeAgent
from backend.app.config import Settings, settings
from backend.app.main import app
from backend.app.models.event import DietaryRequirement, EventIntakeRequest, EventPreferences, EventType
from backend.app.models.incident import (
    IncidentSubmission,
    IncidentType,
    RecoveryProposal,
    RecoveryStrategyType,
    RescueStudioComparison,
)
from backend.app.models.timeline import TimelineNode
from backend.app.services.firestore_service import FirestoreService
from backend.app.services.gemini_service import gemini_service
from backend.app.services.monitoring_service import CloudMonitoringService
from backend.app.services.pubsub_service import PubSubService
from backend.app.services.storage_service import storage_service


@pytest.fixture
def client() -> TestClient:
    """Verifies client."""
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def sample_intake() -> EventIntakeRequest:
    """Verifies sample intake."""
    return EventIntakeRequest(
        event_name="Coverage Wedding Celebration",
        event_type=EventType.WEDDING,
        organizer_email="test@festivapulse.org",
        target_date="2026-11-20",
        location="Chennai Mandapam",
        expected_guests=200,
        max_venue_capacity=300,
        total_budget=600000,
        currency="INR",
        dietary=DietaryRequirement(
            general_veg_pct=70,
            vegan_pct=10,
            jain_pct=10,
            non_veg_pct=10,
            allergy_specific_count=2,
            children_meals_count=15,
            staff_vendor_meals_count=15,
        ),
        preferences=EventPreferences(
            cultural_vibe="Traditional South Indian",
            elders_comfort_priority=True,
            healthy_lifestyle_focus=True,
            kids_activity_zone=True,
            sound_curfew_time="22:00",
        ),
    )


class TestEdgeCaseBranches:
    """Test suite for Edge Case Branches."""

    @pytest.mark.asyncio
    async def test_budget_elasticity_missing_ledger_or_zero_budget(self) -> None:
        """Verifies budget elasticity missing ledger or zero budget."""
        agent = BudgetElasticityAgent()
        task = ADKTask(task_id="T-CUT", intent="REBALANCE_BUDGET")
        res = await agent.execute_task(task, {"ledger": None, "revised_budget": 0})
        assert "error" in res

    @pytest.mark.asyncio
    async def test_timeline_cascade_missing_nodes(self) -> None:
        """Verifies timeline cascade missing nodes."""
        agent = TimelineCascadeAgent()
        task = ADKTask(task_id="T-TIME", intent="PROPAGATE_TIMELINE")
        res = await agent.execute_task(task, {"timeline_nodes": []})
        assert "error" in res

    @pytest.mark.asyncio
    async def test_supervisor_timeline_incident_and_client_exception(self) -> None:
        """Verifies supervisor timeline incident and client exception."""
        supervisor = EventSupervisorAgent()
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = RuntimeError("Vertex AI rate limit")
        supervisor._client = mock_client

        res = await supervisor.coordinate_crisis_recovery(
            incident_type="Timeline Delay Incident",
            values={"delay_minutes": 45, "delayed_node_id": "T1"},
            context={
                "timeline_nodes": [
                    TimelineNode(
                        node_id="T1",
                        title="Ceremony",
                        scheduled_start="18:00",
                        scheduled_end="19:30",
                        duration_minutes=90,
                        dependencies=[],
                    )
                ],
                "curfew_time": "22:00",
            },
        )
        assert res["executed_sub_agents_count"] >= 1
        assert "Swarm actions dispatched" in res["overall_recommendation"]

    def test_cors_origin_list_fallback(self) -> None:
        """Verifies cors origin list fallback."""
        s = Settings(CORS_ORIGINS="")
        assert len(s.cors_origin_list) >= 1

    def test_main_global_exception_handler(self, client) -> None:
        """Verifies main global exception handler."""
        with patch("backend.app.routers.event_routes.storage_service.get_event", side_effect=ValueError("Test crash")):
            resp = client.get("/api/v1/event/EVT-TEST-CRASH")
            assert resp.status_code == 500
            assert resp.json()["success"] is False
            assert "Test crash" in resp.json()["message"]

    def test_event_routes_create_event_exception_handling(self, client) -> None:
        """Verifies event routes create event exception handling."""
        with patch(
            "backend.app.services.gemini_service.gemini_service.generate_blueprint",
            side_effect=RuntimeError("Engine fail"),
        ):
            resp = client.post(
                "/api/v1/event/create",
                json={
                    "event_name": "Crashing Event",
                    "event_type": "Wedding",
                    "organizer_email": "crash@festivapulse.org",
                    "target_date": "2026-11-20",
                    "location": "Chennai",
                    "expected_guests": 100,
                    "max_venue_capacity": 200,
                    "total_budget": 300000,
                    "currency": "INR",
                    "dietary": {
                        "general_veg_pct": 100,
                        "vegan_pct": 0,
                        "jain_pct": 0,
                        "non_veg_pct": 0,
                    },
                    "preferences": {},
                },
            )
            assert resp.status_code == 400

    def test_pulse_fssai_event_not_found(self, client) -> None:
        """Verifies pulse fssai event not found."""
        resp = client.post(
            "/api/v1/event/non_existent_event_999/food/fssai-manifest",
            json={
                "surplus_kg": 25.0,
                "hot_temp_celsius": 65.0,
                "cold_temp_celsius": 4.0,
            },
        )
        assert resp.status_code == 404

    def test_rescue_routes_no_active_proposal_and_infeasible_approval(self, client, sample_intake) -> None:
        """Verifies rescue routes no active proposal and infeasible approval."""
        create_resp = client.post("/api/v1/event/create", json=sample_intake.model_dump())
        assert create_resp.status_code == 201
        event_id = create_resp.json()["event_id"]

        state = storage_service.get_event(event_id)
        state.latest_rescue_comparison = None
        approve_resp = client.post(
            f"/api/v1/event/{event_id}/rescue/approve",
            json={"proposal_id": "P-NONE", "human_approval_reason": "Testing"},
        )
        assert approve_resp.status_code == 400
        assert "No active rescue proposal" in approve_resp.json()["detail"]

        infeasible_proposal = RecoveryProposal(
            proposal_id="P-INFEASIBLE",
            strategy_type=RecoveryStrategyType.BEST_EXPERIENCE,
            summary="Overcrowded expansion",
            action_items=["Force extra guests inside"],
            additional_cost=50000,
            remaining_budget_projected=10000,
            guests_covered=50,
            timeline_impact_minutes=15,
            vendor_dependencies=["Catering"],
            unresolved_constraints=["Capacity breached"],
            actions_requiring_human_approval=["Sign-off"],
            is_feasible=False,
            infeasibility_reason="HSE Fire Safety Capacity Breached",
        )
        comp = RescueStudioComparison(
            incident_id="INC-1",
            event_id=event_id,
            timestamp="2026-10-25T20:00:00",
            incident_type=IncidentType.ATTENDANCE_SURGE,
            incident_summary="Attendance Surge Inflow",
            system_advisory="Advisory Alert",
            original_state_summary="Baseline",
            candidate_lowest_cost=infeasible_proposal,
            candidate_best_experience=infeasible_proposal,
            candidate_lowest_disruption=infeasible_proposal,
        )
        state.latest_rescue_comparison = comp
        infeasible_resp = client.post(
            f"/api/v1/event/{event_id}/rescue/approve",
            json={"proposal_id": "P-INFEASIBLE", "human_approval_reason": "Trying to approve infeasible"},
        )
        assert infeasible_resp.status_code == 400
        assert "Cannot approve infeasible proposal" in infeasible_resp.json()["detail"]

    def test_gemini_service_triage_api_exception_fallback(self, sample_intake) -> None:
        """Verifies gemini service triage api exception fallback."""
        blueprint, _ = gemini_service.generate_blueprint(sample_intake)
        state = storage_service.save_event(blueprint, sample_intake)

        original_client = gemini_service._client
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = Exception("Gemini triage quota error")
        gemini_service._client = mock_client

        try:
            incident = IncidentSubmission(
                event_id=blueprint.id,
                incident_type=IncidentType.ATTENDANCE_SURGE,
                entered_values={"additional_arrivals": 50},
                observation_time="19:30:00",
            )
            comp, telemetry = gemini_service.synthesize_recovery_options(sample_intake, incident, state)
            assert comp.candidate_lowest_cost is not None
            assert telemetry.active_agent == "RescueStudioTriageAgent"
        finally:
            gemini_service._client = original_client


class TestCloudIntegrations:
    """Test suite for Cloud Integrations."""

    @pytest.mark.asyncio
    async def test_firestore_service_lifecycle_local_fallback(self, sample_intake) -> None:
        """Verifies firestore service lifecycle local fallback."""
        fs = FirestoreService()
        assert fs.is_connected is False

        bp, _ = gemini_service.generate_blueprint(sample_intake)

        state = await fs.save_celebration(bp, sample_intake)
        assert state.blueprint.id == bp.id

        entry = await fs.record_decision(
            event_id=bp.id,
            what_changed="Added 20 guests",
            why_it_changed="RSVP late arrivals",
            original_values={"guests": 200},
            revised_values={"guests": 220},
            calculation_proof="200 + 20 = 220 <= 300",
            gemini_recommendation="Accept arrivals with extra chairs",
        )
        assert entry.event_id == bp.id

        trace, _ = gemini_service.generate_blueprint(sample_intake)
        await fs.record_telemetry(bp.id, _)

    def test_firestore_service_init_enabled_success_and_failure(self) -> None:
        """Verifies firestore service init enabled success and failure."""
        with patch("backend.app.services.firestore_service.settings.ENABLE_FIRESTORE", True):
            mock_google = MagicMock()
            mock_cloud = MagicMock()
            mock_module = MagicMock()
            mock_module.AsyncClient.return_value = MagicMock()
            mock_cloud.firestore = mock_module
            mock_google.cloud = mock_cloud
            with patch.dict(
                "sys.modules",
                {
                    "google": mock_google,
                    "google.cloud": mock_cloud,
                    "google.cloud.firestore": mock_module,
                },
            ):
                fs = FirestoreService()
                assert fs.is_connected is True
                assert fs._db is not None

            with patch.dict("sys.modules", {"google.cloud.firestore": None}):
                fs_fail = FirestoreService()
                assert fs_fail.is_connected is False
                assert fs_fail._db is None

    @pytest.mark.asyncio
    async def test_firestore_service_connected_mock(self, sample_intake) -> None:
        """Verifies firestore service connected mock."""
        fs = FirestoreService()
        fs._is_connected = True
        mock_db = MagicMock()
        mock_doc = MagicMock()
        mock_doc.set = AsyncMock()
        mock_collection = MagicMock()
        mock_collection.document.return_value = mock_doc
        mock_doc.collection.return_value = mock_collection
        mock_db.collection.return_value = mock_collection
        fs._db = mock_db

        bp, _ = gemini_service.generate_blueprint(sample_intake)
        await fs.save_celebration(bp, sample_intake)
        assert mock_doc.set.called

        await fs.record_decision(
            event_id=bp.id,
            what_changed="Shifted sound start",
            why_it_changed="Curfew compliance",
            original_values={"time": "21:00"},
            revised_values={"time": "20:30"},
            calculation_proof="20:30 < 22:00",
            gemini_recommendation="Sound advance",
        )
        assert mock_doc.set.call_count >= 2

        await fs.record_telemetry(bp.id, _)
        assert mock_doc.set.call_count >= 3

    @pytest.mark.asyncio
    async def test_firestore_service_sync_exceptions(self, sample_intake) -> None:
        """Verifies firestore service sync exceptions."""
        fs = FirestoreService()
        fs._is_connected = True
        mock_db = MagicMock()
        mock_doc = MagicMock()
        mock_doc.set = AsyncMock(side_effect=Exception("Firestore timeout"))
        mock_collection = MagicMock()
        mock_collection.document.return_value = mock_doc
        mock_doc.collection.return_value = mock_collection
        mock_db.collection.return_value = mock_collection
        fs._db = mock_db

        bp, trace = gemini_service.generate_blueprint(sample_intake)
        # Should catch exception and not re-raise
        state = await fs.save_celebration(bp, sample_intake)
        assert state.blueprint.id == bp.id

        entry = await fs.record_decision(
            event_id=bp.id,
            what_changed="Shifted sound start",
            why_it_changed="Curfew compliance",
            original_values={"time": "21:00"},
            revised_values={"time": "20:30"},
            calculation_proof="20:30 < 22:00",
            gemini_recommendation="Sound advance",
        )
        assert entry.event_id == bp.id

        await fs.record_telemetry(bp.id, trace)

    def test_monitoring_service_init_enabled_success_and_failure(self) -> None:
        """Verifies monitoring service init enabled success and failure."""
        with patch("backend.app.services.monitoring_service.settings.ENABLE_CLOUD_MONITORING", True):
            mock_google = MagicMock()
            mock_cloud = MagicMock()
            mock_module = MagicMock()
            mock_module.MetricServiceClient.return_value = MagicMock()
            mock_cloud.monitoring_v3 = mock_module
            mock_google.cloud = mock_cloud
            with patch.dict(
                "sys.modules",
                {
                    "google": mock_google,
                    "google.cloud": mock_cloud,
                    "google.cloud.monitoring_v3": mock_module,
                },
            ):
                ms = CloudMonitoringService()
                assert ms._is_enabled is True
                assert ms._metric_client is not None

            with patch.dict("sys.modules", {"google.cloud.monitoring_v3": None}):
                ms_fail = CloudMonitoringService()
                assert ms_fail._is_enabled is False
                assert ms_fail._metric_client is None

    def test_monitoring_service_lifecycle(self) -> None:
        """Verifies monitoring service lifecycle."""
        ms = CloudMonitoringService()
        ms.record_gemini_latency(245, "gemini-2.5-flash", "blueprint_synthesis")
        ms.record_fssai_redistribution(18.5, "Feeding India")
        ms.record_incident_triage("Attendance Surge", "Strategy B")

        snapshot = ms.get_metrics_snapshot()
        assert snapshot["total_points_emitted"] >= 3
        assert len(snapshot["recent_metrics"]) >= 3

    def test_pubsub_service_init_enabled_success_and_failure(self) -> None:
        """Verifies pubsub service init enabled success and failure."""
        with patch("backend.app.services.pubsub_service.settings.ENABLE_PUBSUB", True):
            mock_google = MagicMock()
            mock_cloud = MagicMock()
            mock_module = MagicMock()
            mock_module.PublisherClient.return_value = MagicMock()
            mock_cloud.pubsub_v1 = mock_module
            mock_google.cloud = mock_cloud
            with patch.dict(
                "sys.modules",
                {
                    "google": mock_google,
                    "google.cloud": mock_cloud,
                    "google.cloud.pubsub_v1": mock_module,
                },
            ):
                ps = PubSubService()
                assert ps.is_cloud_enabled is True
                assert ps._publisher is not None

            with patch.dict("sys.modules", {"google.cloud.pubsub_v1": None}):
                ps_fail = PubSubService()
                assert ps_fail.is_cloud_enabled is False
                assert ps_fail._publisher is None

    @pytest.mark.asyncio
    async def test_pubsub_service_lifecycle_local_bus(self) -> None:
        """Verifies pubsub service lifecycle local bus."""
        ps = PubSubService()
        assert ps.is_cloud_enabled is False

        received_events = []

        def listener(data) -> None:
            """Verifies listener."""
            received_events.append(data)

        ps.subscribe(settings.PUBSUB_TELEMETRY_TOPIC, listener)
        msg_id = await ps.publish_telemetry("EVT-PS-1", {"gate_count": 142})
        assert "MSG-" in msg_id
        assert len(received_events) == 1
        assert received_events[0]["data"]["gate_count"] == 142

        chaos_id = await ps.publish_chaos_incident("EVT-PS-1", {"storm_risk": "High"})
        assert "MSG-" in chaos_id
        assert len(ps.get_buffered_events()) >= 2

    @pytest.mark.asyncio
    async def test_pubsub_service_cloud_mock(self) -> None:
        """Verifies pubsub service cloud mock."""
        ps = PubSubService()
        ps._is_cloud_enabled = True
        mock_pub = MagicMock()
        mock_future = MagicMock()
        mock_future.result.return_value = "PUB-CLOUD-MSG-999"
        mock_pub.publish.return_value = mock_future
        mock_pub.topic_path.return_value = "projects/test/topics/test"
        ps._publisher = mock_pub

        msg_id = await ps.publish_telemetry("EVT-PS-CLOUD", {"gate_inflow": 88})
        assert msg_id == "PUB-CLOUD-MSG-999"

    @pytest.mark.asyncio
    async def test_pubsub_service_cloud_publish_failure_and_subscribers(self) -> None:
        """Verifies pubsub service cloud publish failure and subscribers."""
        ps = PubSubService()
        ps._is_cloud_enabled = True
        mock_pub = MagicMock()
        mock_pub.publish.side_effect = Exception("PubSub cluster failure")
        mock_pub.topic_path.return_value = "projects/test/topics/test"
        ps._publisher = mock_pub

        async_received = []

        async def async_sub(data) -> None:
            """Verifies async sub."""
            async_received.append(data)

        def err_sub(data) -> None:
            """Verifies err sub."""
            raise RuntimeError("Subscriber handler crashed")

        ps.subscribe("custom-chaos-topic", async_sub)
        ps.subscribe("custom-chaos-topic", err_sub)

        payload = {"event_id": "EVT-TEST-SUB", "stream_type": "TEST", "data": {"status": "ok"}}
        msg_id = await ps._dispatch_message("custom-chaos-topic", payload)
        assert "MSG-" in msg_id
        assert len(async_received) == 1
