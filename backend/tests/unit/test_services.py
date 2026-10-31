"""Unit tests for FestivaPulseAI Services.

Validates GeminiOrchestratorService, MultimodalService, StorageService, and CacheService.
"""

from unittest.mock import MagicMock, patch

import pytest

from backend.app.models.event import (
    DietaryRequirement,
    EventIntakeRequest,
    EventPreferences,
    EventType,
)
from backend.app.models.incident import (
    IncidentSubmission,
    IncidentType,
)
from backend.app.services.gemini_service import (
    GeminiOrchestratorService,
    gemini_service,
)
from backend.app.services.multimodal_service import (
    MultimodalService,
)
from backend.app.services.storage_service import (
    StorageService,
)


def create_sample_intake() -> EventIntakeRequest:
    return EventIntakeRequest(
        event_name="Coimbatore Tech & Cultural Gala",
        event_type=EventType.COMMUNITY_EVENT,
        organizer_email="organizer@festivapulse.ai",
        target_date="2026-11-12",
        location="Coimbatore",
        expected_guests=300,
        max_venue_capacity=350,
        total_budget=800000,
        currency="INR",
        dietary=DietaryRequirement(
            general_veg_pct=50,
            vegan_pct=15,
            jain_pct=15,
            non_veg_pct=20,
        ),
        preferences=EventPreferences(
            cultural_vibe="Kongu Nadu heritage brass lamps & acoustic classical fusion",
            elders_comfort_priority=True,
            healthy_lifestyle_focus=True,
            kids_activity_zone=True,
            sound_curfew_time="22:00",
        ),
    )


@pytest.mark.unit
class TestGeminiServiceBlueprint:
    def test_synthesize_local_blueprint_fallback(self):
        service = GeminiOrchestratorService()
        intake = create_sample_intake()
        raw_json, exec_summary, themes, intergen = service._synthesize_local_blueprint(intake)

        assert "Kongu Nadu" in exec_summary
        assert len(themes) == 4
        assert len(intergen) >= 2

    def test_generate_event_blueprint_complete(self):
        service = GeminiOrchestratorService()
        intake = create_sample_intake()
        blueprint, telemetry = service.generate_blueprint(intake)

        assert blueprint is not None
        assert blueprint.event_name == intake.event_name
        assert blueprint.expected_guests == 300
        assert blueprint.total_budget == 800000
        assert len(blueprint.milestones) >= 4
        assert len(blueprint.vendor_slas) >= 3
        assert telemetry.latency_ms >= 0
        assert telemetry.dynamic_diff_summary != ""

    def test_generate_blueprint_with_mock_client_success(self):
        service = GeminiOrchestratorService()
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = """{
            "executive_summary": "AI Generated Luxury Wedding Plan",
            "personalized_themes": ["Royal Grandeur", "Sustainable Chic"],
            "intergenerational_features": ["Elder Ramp", "Kids Play Area"]
        }"""
        mock_client.models.generate_content.return_value = mock_response
        service._client = mock_client

        intake = create_sample_intake()
        blueprint, telemetry = service.generate_blueprint(intake)
        assert blueprint is not None
        assert telemetry.is_live_call is True
        assert blueprint.executive_summary == "AI Generated Luxury Wedding Plan"

    def test_generate_blueprint_with_mock_client_exception_falls_back(self):
        service = GeminiOrchestratorService()
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = RuntimeError("Vertex AI Quota Exceeded")
        service._client = mock_client

        intake = create_sample_intake()
        blueprint, telemetry = service.generate_blueprint(intake)
        assert blueprint is not None
        assert blueprint.event_name == intake.event_name

    def test_gemini_service_init_auth_failure_falls_back(self):
        with patch("backend.app.services.gemini_service.settings") as mock_settings:
            mock_settings.GEMINI_API_KEY = "live_key"
            mock_settings.DEMO_MODE = False
            with patch("google.genai.Client", side_effect=Exception("Auth Fail")):
                svc = GeminiOrchestratorService()
                assert svc._client is None


@pytest.mark.unit
class TestGeminiServiceTriage:
    def test_triage_attendance_surge_incident(self):
        service = GeminiOrchestratorService()
        intake = create_sample_intake()
        incident = IncidentSubmission(
            event_id="test_event",
            incident_type=IncidentType.ATTENDANCE_SURGE,
            entered_values={"new_attendance": 380},
            observation_time="17:00",
        )
        comparison, telemetry = service.synthesize_recovery_options(intake, incident, None)
        assert comparison is not None
        assert comparison.candidate_lowest_cost is not None
        assert comparison.candidate_best_experience is not None
        assert comparison.candidate_lowest_disruption is not None
        assert len(comparison.rejected_proposals) > 0  # Rejects exceeding 350 max capacity

    def test_triage_food_shortage_incident(self):
        service = GeminiOrchestratorService()
        intake = create_sample_intake()
        incident = IncidentSubmission(
            event_id="test_event",
            incident_type=IncidentType.FOOD_SHORTAGE,
            entered_values={"food_shortage_count": 45, "shortage_category": "General Vegetarian"},
            observation_time="19:30",
        )
        comparison, telemetry = service.synthesize_recovery_options(intake, incident, None)
        assert comparison is not None
        assert "ZERO-STOCKOUT" in comparison.system_advisory
        assert comparison.candidate_lowest_cost.additional_cost <= comparison.candidate_best_experience.additional_cost

    def test_triage_budget_cut_incident(self):
        service = GeminiOrchestratorService()
        intake = create_sample_intake()
        incident = IncidentSubmission(
            event_id="test_event",
            incident_type=IncidentType.BUDGET_CUT,
            entered_values={"budget_cut": 50000},
            observation_time="14:00",
        )
        comparison, telemetry = service.synthesize_recovery_options(intake, incident, None)
        assert comparison is not None
        assert "PARETO RE-OPTIMIZER" in comparison.system_advisory
        assert len(comparison.candidate_lowest_cost.action_items) >= 2

    def test_triage_timeline_delay_incident(self):
        service = GeminiOrchestratorService()
        intake = create_sample_intake()
        incident = IncidentSubmission(
            event_id="test_event",
            incident_type=IncidentType.TIMELINE_DELAY,
            entered_values={"delay_minutes": 40},
            observation_time="16:30",
        )
        comparison, telemetry = service.synthesize_recovery_options(intake, incident, None)
        assert comparison is not None
        assert "CRITICAL PATH ADJUSTMENT" in comparison.system_advisory

    def test_triage_with_mock_client_success(self):
        service = GeminiOrchestratorService()
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = """{
            "proposals": [
                {
                    "strategy_type": "Lowest Additional Cost",
                    "summary": "Internal Hall Reconfiguration",
                    "additional_cost": 5000,
                    "remaining_budget_projected": 795000,
                    "guests_covered": 50,
                    "timeline_impact_minutes": 10,
                    "vendor_dependencies": ["Venue Manager"],
                    "unresolved_constraints": [],
                    "actions_requiring_human_approval": ["Authorize ₹5,000 chair rental"],
                    "is_feasible": true,
                    "action_items": ["Open second indoor hall", "Add 50 plastic chairs"]
                },
                {
                    "strategy_type": "Best Guest Experience",
                    "summary": "Premium Waterproof Canopy",
                    "additional_cost": 35000,
                    "remaining_budget_projected": 765000,
                    "guests_covered": 50,
                    "timeline_impact_minutes": 0,
                    "vendor_dependencies": ["Tent Decorator"],
                    "unresolved_constraints": [],
                    "actions_requiring_human_approval": ["Authorize ₹35,000 tent contract"],
                    "is_feasible": true,
                    "action_items": ["Erect clear German hangar tent", "Install mist fans"]
                },
                {
                    "strategy_type": "Lowest Operational Disruption",
                    "summary": "Staggered Timeline Shift",
                    "additional_cost": 10000,
                    "remaining_budget_projected": 790000,
                    "guests_covered": 50,
                    "timeline_impact_minutes": 20,
                    "vendor_dependencies": ["Caterer"],
                    "unresolved_constraints": [],
                    "actions_requiring_human_approval": ["Approve 20-min dinner delay"],
                    "is_feasible": true,
                    "action_items": ["Extend photo-op session", "Serve mocktails inside foyer"]
                }
            ],
            "rejected_proposal": {
                "strategy_type": "Best Guest Experience",
                "summary": "Cram extra guests into single dining hall",
                "additional_cost": 0,
                "remaining_budget_projected": 800000,
                "guests_covered": 50,
                "timeline_impact_minutes": 0,
                "vendor_dependencies": [],
                "unresolved_constraints": ["Fire exit aisle clearance blocked"],
                "actions_requiring_human_approval": [],
                "is_feasible": false,
                "action_items": [],
                "infeasibility_reason": "Violates HSE fire capacity codes (0.8 persons/sqm maximum)"
            },
            "system_advisory": "Approved recovery proposals generated successfully."
        }"""
        mock_client.models.generate_content.return_value = mock_response
        service._client = mock_client

        intake = create_sample_intake()
        incident = IncidentSubmission(
            event_id="test_event",
            incident_type=IncidentType.ATTENDANCE_SURGE,
            entered_values={"new_attendance": 350},
            observation_time="18:00",
        )
        comparison, telemetry = service.synthesize_recovery_options(intake, incident, None)
        assert comparison is not None
        assert telemetry.is_live_call is True
        assert comparison.candidate_lowest_cost.summary == "Internal Hall Reconfiguration"
        assert comparison.rejected_proposals[0].is_feasible is False


@pytest.mark.unit
class TestMultimodalService:
    def test_extract_vendor_quote(self):
        svc = MultimodalService()
        res = svc.extract_vendor_quote("sample_quote.jpg", "Eco-friendly Jasmine Arch 45000")
        assert res["vendor_name"] is not None
        assert res["total_extracted_amount"] > 0
        assert res["requires_human_verification"] is True

    def test_analyze_voice_memo(self):
        svc = MultimodalService()
        # 1. Attendance Surge
        res_surge = svc.parse_voice_memo("There are 50 extra guests arriving at reception")
        assert res_surge["detected_incident"] == "ATTENDANCE_SURGE"
        assert res_surge["extracted_parameters"]["new_guests"] == 50
        assert res_surge["confidence"] > 0.8

        # 2. Timeline Delay
        res_delay = svc.parse_voice_memo("The priest is late by 45 minutes")
        assert res_delay["detected_incident"] == "TIMELINE_DELAY"
        assert res_delay["extracted_parameters"]["delay_minutes"] == 45

        # 3. Food Shortage
        res_food = svc.parse_voice_memo("We are short by 30 portions of food")
        assert res_food["detected_incident"] == "FOOD_SHORTAGE"
        assert res_food["extracted_parameters"]["shortage_count"] == 30

        # 4. General Note
        res_note = svc.parse_voice_memo("Please check the floral background lighting")
        assert res_note["detected_incident"] == "GENERAL_NOTE"

    def test_verify_multilingual_compliance(self):
        svc = MultimodalService()
        # Supported language
        res_ta = svc.verify_multilingual_compliance("Mandapam decor verified", "ta")
        assert res_ta["verified"] is True
        assert len(res_ta["detected_glossary_terms"]) > 0
        # Unsupported fallback
        res_other = svc.verify_multilingual_compliance("Hello world", "french")
        assert res_other["verified"] is True


@pytest.mark.unit
class TestStorageAndCacheServices:
    def test_storage_service_lifecycle(self):
        storage = StorageService()
        intake = create_sample_intake()
        bp, tel = gemini_service.generate_blueprint(intake)
        state = storage.save_event(bp, intake)
        assert state.blueprint.id == bp.id
        assert storage.get_event(bp.id) is not None
        assert len(storage.list_events()) >= 1

        # Record decision
        entry = storage.record_decision(
            event_id=bp.id,
            what_changed="Added chairs",
            why_it_changed="Surge",
            original_values={"chairs": 100},
            revised_values={"chairs": 150},
            calculation_proof="100+50",
            gemini_recommendation="Add chairs",
        )
        assert entry.entry_id.startswith("DEC-")

        # Record telemetry
        storage.record_telemetry(bp.id, tel)
        assert len(storage.get_event(bp.id).telemetry_traces) >= 1

    def test_storage_service_missing_event_raises(self):
        storage = StorageService()
        with pytest.raises(ValueError, match="not found"):
            storage.record_decision(
                event_id="DOES_NOT_EXIST",
                what_changed="X",
                why_it_changed="Y",
                original_values={},
                revised_values={},
                calculation_proof="Z",
                gemini_recommendation="W",
            )

    def test_cache_service(self):
        from backend.app.services.cache_service import MemoryCacheService

        cache = MemoryCacheService(max_entries=2, ttl_seconds=10)
        cache.set("events", {"id": "test_1"}, {"data": 123})
        assert cache.get("events", {"id": "test_1"}) == {"data": 123}
        assert cache.get("events", {"id": "missing"}) is None

        # Test capacity eviction
        cache.set("events", {"id": "test_2"}, {"data": 456})
        cache.set("events", {"id": "test_3"}, {"data": 789})
        # test_1 should be evicted because max_entries=2
        assert cache.get("events", {"id": "test_1"}) is None
        assert cache.get("events", {"id": "test_3"}) == {"data": 789}

        # Test TTL expiration
        cache_expired = MemoryCacheService(ttl_seconds=-1)
        cache_expired.set("events", {"id": "expired"}, {"data": 999})
        assert cache_expired.get("events", {"id": "expired"}) is None

        # Clear
        cache.clear()
        assert cache.get("events", {"id": "test_2"}) is None

    def test_settings_gemini_key_resolution(self):
        from backend.app.config import Settings

        # Default demo mode key
        s1 = Settings(GEMINI_API_KEY="demo_mode_key")
        assert not s1.is_live_gemini_enabled
        assert s1.effective_gemini_key == "demo_mode_key"

        # Explicit live key
        s2 = Settings(GEMINI_API_KEY="AIzaSyLiveCustomKey123")
        assert s2.is_live_gemini_enabled
        assert s2.effective_gemini_key == "AIzaSyLiveCustomKey123"

        # Fallback to os.environ GEMINI_API_KEY
        import os
        from unittest.mock import patch

        with patch.dict(os.environ, {"GEMINI_API_KEY": "AIzaSyEnvKey999"}):
            s3 = Settings(GEMINI_API_KEY="demo_mode_key")
            assert s3.effective_gemini_key == "AIzaSyEnvKey999"
            assert s3.is_live_gemini_enabled

        # Fallback to os.environ GOOGLE_API_KEY
        with patch.dict(os.environ, {"GOOGLE_API_KEY": "AIzaSyGoogleKey888"}, clear=True):
            s4 = Settings(GEMINI_API_KEY="")
            assert s4.effective_gemini_key == "AIzaSyGoogleKey888"
            assert s4.is_live_gemini_enabled

        # Project ID resolution variants
        s_default = Settings(GCP_PROJECT_ID="test-proj-fallback")
        assert s_default.effective_project_id in ("test-proj-fallback", "genai-apac-2026-491004")
        with patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "env-proj-123"}):
            s_env = Settings()
            assert s_env.effective_project_id == "env-proj-123"
        with patch.dict(os.environ, {"GCP_PROJECT": "gcp-proj-456"}, clear=True):
            s_gcp = Settings()
            assert s_gcp.effective_project_id == "gcp-proj-456"

        # Vertex AI ADC resolution variants
        s_demo = Settings(DEMO_MODE=True)
        assert not s_demo.is_vertex_ai_enabled

        with patch.dict(os.environ, {"K_SERVICE": "festivapulse-api"}):
            s_cloudrun = Settings(DEMO_MODE=True)
            assert s_cloudrun.is_vertex_ai_enabled
            assert s_cloudrun.is_live_gemini_enabled

        s_live_demo_false = Settings(DEMO_MODE=False)
        with patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "genai-apac-2026-491004"}):
            assert s_live_demo_false.is_vertex_ai_enabled
            assert s_live_demo_false.is_live_gemini_enabled

    def test_storage_service_sqlite_persistence_and_deserialization(self, tmp_path):
        db_file = str(tmp_path / "test_storage.db")
        storage = StorageService(db_path=db_file)
        intake = create_sample_intake()
        bp = gemini_service.generate_blueprint(intake)[0]

        # Save event
        state = storage.save_event(bp, intake)

        # Initialize full valid state
        from backend.app.routers.event_routes import _initialize_event_state

        _initialize_event_state(state)
        incident = IncidentSubmission(
            event_id=bp.id,
            observation_time="14:00",
            incident_type=IncidentType.BUDGET_CUT,
            entered_values={"reduction_inr": 50000},
            severity="Medium",
            reported_by="Coordinator",
        )
        comp, _ = gemini_service.synthesize_recovery_options(intake, incident, state)
        state.latest_rescue_comparison = comp
        storage.record_decision(
            bp.id,
            what_changed="test",
            why_it_changed="test",
            original_values={"budget": 800000},
            revised_values={"budget": 750000},
            calculation_proof="ok",
            gemini_recommendation="ok",
        )
        _, tel = gemini_service.generate_blueprint(intake)
        storage.record_telemetry(bp.id, tel)
        state.adk_swarm_output = {"consensus": "approved"}
        state.version = 2

        storage.persist_event(state)

        # Clear in-memory hot cache to force SQLite disk fetch & deserialization
        storage._events.clear()

        loaded = storage.get_event(bp.id)
        assert loaded is not None
        assert loaded.blueprint.id == bp.id
        assert loaded.ledger is not None
        assert loaded.food_radar is not None
        assert len(loaded.timeline_nodes) >= 1
        assert loaded.latest_rescue_comparison is not None
        assert len(loaded.decision_ledger) == 1
        assert len(loaded.telemetry_traces) == 1
        assert loaded.adk_swarm_output["consensus"] == "approved"
        assert loaded.version == 2

    def test_storage_service_sqlite_error_fallbacks(self, tmp_path):
        db_file = str(tmp_path / "test_fallback.db")
        storage = StorageService(db_path=db_file)
        intake = create_sample_intake()
        bp = gemini_service.generate_blueprint(intake)[0]
        state = storage.save_event(bp, intake)

        # Test SQLite init exception
        with patch("sqlite3.connect", side_effect=Exception("DB init failed")):
            broken_storage = StorageService(db_path="invalid.db")
            assert broken_storage._events == {}

        # Test SQLite persist exception
        with patch("sqlite3.connect", side_effect=Exception("DB write failed")):
            storage.persist_event(state)  # Should handle gracefully without raising

        # Test SQLite lookup exception
        storage._events.clear()
        with patch("sqlite3.connect", side_effect=Exception("DB read failed")):
            res = storage.get_event("EVT-INVALID-FAIL")
            assert res is None

        # Test resilient auto-hydration for active client sessions
        fallback_state = storage.get_event("EVT-12345678")
        assert fallback_state is not None
        assert fallback_state.blueprint.id == "EVT-12345678"

    @pytest.mark.asyncio
    async def test_firestore_save_celebration_saves_if_not_in_storage(self):
        from backend.app.services.firestore_service import firestore_service

        intake = create_sample_intake()
        bp = gemini_service.generate_blueprint(intake)[0]

        with patch("backend.app.services.firestore_service.storage_service.get_event", return_value=None):
            with patch("backend.app.services.firestore_service.storage_service.save_event") as mock_save:
                await firestore_service.save_celebration(bp, intake)
                mock_save.assert_called_once_with(bp, intake)
