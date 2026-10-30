"""Integration tests for all FastAPI REST API routers in FestivaPulseAI.

Validates end-to-end request/response flows, serialization, state mutations,
and error status codes (400, 404, 422).
Adheres to @08_polyglot_tdd_engineer and enterprise-testing-pyramid.
"""

import io

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


@pytest.mark.integration
class TestHealthAndPresetsRoutes:
    def test_health_check_endpoint(self):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "HEALTHY"
        assert data["invariants"]["deterministic_math"] is True

    def test_presets_list_endpoint(self):
        response = client.get("/api/v1/event/presets/list")
        assert response.status_code == 200
        presets = response.json()
        assert len(presets) == 3
        assert any(p["type"] == "Community Event" for p in presets)


@pytest.mark.integration
class TestEventRoutesIntegration:
    def test_create_event_success_and_retrieval(self):
        payload = {
            "event_name": "Coimbatore Heritage Sangam",
            "event_type": "Community Event",
            "organizer_email": "siva@festivapulse.ai",
            "target_date": "2026-11-20",
            "location": "Coimbatore",
            "expected_guests": 250,
            "max_venue_capacity": 350,
            "total_budget": 600000,
            "currency": "INR",
            "dietary": {
                "general_veg_pct": 50,
                "vegan_pct": 20,
                "jain_pct": 10,
                "non_veg_pct": 20,
                "allergy_specific_count": 5,
                "children_meals_count": 15,
                "staff_vendor_meals_count": 20,
            },
            "preferences": {
                "cultural_vibe": "Kongu Nadu brass lamps & classical fusion",
                "elders_comfort_priority": True,
                "healthy_lifestyle_focus": True,
                "kids_activity_zone": True,
                "sound_curfew_time": "22:00",
            },
        }

        # 1. Create Event -> returns 201 Created
        res_create = client.post("/api/v1/event/create", json=payload)
        assert res_create.status_code == 201
        body = res_create.json()
        assert body["success"] is True
        event_id = body["event_id"]
        assert event_id.startswith("EVT-")
        assert "blueprint" in body
        assert "ledger" in body
        assert "food_radar" in body
        assert "timeline" in body
        assert "telemetry" in body

        # 2. Retrieve Event
        res_get = client.get(f"/api/v1/event/{event_id}")
        assert res_get.status_code == 200
        state = res_get.json()
        assert state["blueprint"]["id"] == event_id
        assert state["blueprint"]["expected_guests"] == 250

    def test_get_event_not_found_returns_404(self):
        response = client.get("/api/v1/event/EVT-NON-EXISTENT")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_event_validation_error_returns_422(self):
        invalid_payload = {
            "event_name": "Bad Event",
            "organizer_email": "not-an-email",
            "expected_guests": -5,
        }
        response = client.post("/api/v1/event/create", json=invalid_payload)
        assert response.status_code == 422

    def test_venues_search_endpoint(self):
        res = client.get("/api/v1/event/venues/search?location=Bengaluru&guests=350&budget=1200000")
        assert res.status_code == 200
        body = res.json()
        assert body["location"] == "Bengaluru"
        assert body["count"] > 0
        assert len(body["venues"]) > 0

    def test_apply_venue_to_event_success_and_errors(self):
        payload = {
            "event_name": "Venue Apply Test",
            "event_type": "Wedding",
            "organizer_email": "venue@festiva.ai",
            "target_date": "2026-11-28",
            "location": "Bengaluru",
            "expected_guests": 300,
            "max_venue_capacity": 450,
            "total_budget": 1000000,
            "currency": "INR",
        }
        res_create = client.post("/api/v1/event/create", json=payload)
        event_id = res_create.json()["event_id"]

        # Valid apply
        res_apply = client.post(f"/api/v1/event/{event_id}/venues/apply/blr-palace-glasshouse")
        assert res_apply.status_code == 200
        apply_data = res_apply.json()
        assert apply_data["success"] is True
        assert apply_data["hall"]["id"] == "blr-palace-glasshouse"
        assert apply_data["ledger"]["approved_total"] > 0

        # Hall not found
        res_bad_hall = client.post(f"/api/v1/event/{event_id}/venues/apply/invalid-hall-xyz")
        assert res_bad_hall.status_code == 404

        # Event not found
        res_bad_evt = client.post("/api/v1/event/non-existent-evt/venues/apply/blr-palace-glasshouse")
        assert res_bad_evt.status_code == 404

    def test_refine_event_success_and_errors(self):
        payload = {
            "event_name": "Refine Test Gala",
            "event_type": "Community Event",
            "organizer_email": "refine@festiva.ai",
            "target_date": "2026-11-29",
            "location": "Bengaluru",
            "expected_guests": 200,
            "max_venue_capacity": 300,
            "total_budget": 500000,
            "currency": "INR",
        }
        res_create = client.post("/api/v1/event/create", json=payload)
        event_id = res_create.json()["event_id"]

        # Refine guests and curfew
        res_refine = client.post(
            f"/api/v1/event/{event_id}/refine",
            json={"user_prompt": "Add 50 guests and extend curfew to 23:00"},
        )
        assert res_refine.status_code == 200
        ref_body = res_refine.json()
        assert ref_body["success"] is True
        assert ref_body["blueprint"]["expected_guests"] == 250
        assert ref_body["blueprint"]["version"] == 2
        assert ref_body["decision_entry"] is not None

        # Refine menu theme
        res_theme = client.post(
            f"/api/v1/event/{event_id}/refine",
            json={"user_prompt": "Switch menu to organic millet banquet"},
        )
        assert res_theme.status_code == 200
        assert res_theme.json()["blueprint"]["version"] == 3

        # Refine set guest count
        res_set = client.post(
            f"/api/v1/event/{event_id}/refine",
            json={"user_prompt": "Change guests to 300"},
        )
        assert res_set.status_code == 200
        assert res_set.json()["blueprint"]["expected_guests"] == 300
        assert res_set.json()["blueprint"]["version"] == 4

        # Non-existent event returns 404
        res_bad = client.post(
            "/api/v1/event/EVT-NONEXISTENT/refine",
            json={"user_prompt": "Add 50 guests"},
        )
        assert res_bad.status_code == 404


@pytest.mark.integration
class TestPulseRoutesIntegration:
    @pytest.fixture
    def setup_event(self):
        payload = {
            "event_name": "Pulse Test Gala",
            "event_type": "Wedding",
            "organizer_email": "host@festiva.ai",
            "target_date": "2026-11-25",
            "location": "Chennai",
            "expected_guests": 300,
            "max_venue_capacity": 400,
            "total_budget": 800000,
            "currency": "INR",
        }
        res = client.post("/api/v1/event/create", json=payload)
        return res.json()["event_id"]

    def test_pulse_lifecycle_with_budget_and_delay(self, setup_event):
        event_id = setup_event

        # 1. Update pulse with surge and budget slash
        pulse_payload = {
            "actual_checked_in": 240,
            "revised_expected_guests": 340,
            "category_inventory_update": {},
            "revised_budget": 750000,
            "delayed_node_id": "",
            "delay_minutes": 0,
        }
        res_pulse = client.post(f"/api/v1/event/{event_id}/pulse", json=pulse_payload)
        assert res_pulse.status_code == 200
        p_body = res_pulse.json()
        assert p_body["food_radar"]["actual_checked_in"] == 240

        # 2. Update pulse with timeline delay
        delay_payload = {
            "actual_checked_in": 240,
            "revised_expected_guests": 340,
            "category_inventory_update": {},
            "revised_budget": 0,
            "delayed_node_id": "T1",
            "delay_minutes": 35,
        }
        res_delay = client.post(f"/api/v1/event/{event_id}/pulse", json=delay_payload)
        assert res_delay.status_code == 200

        # 3. Generate FSSAI Food Rescue Manifest
        fssai_payload = {
            "surplus_kg": 45.0,
            "hot_temp_celsius": 66.0,
            "cold_temp_celsius": 3.5,
            "partner_ngo": "No Food Waste Coimbatore",
        }
        res_fssai = client.post(f"/api/v1/event/{event_id}/food/fssai-manifest", json=fssai_payload)
        assert res_fssai.status_code == 200
        f_body = res_fssai.json()
        assert f_body["is_temperature_compliant"] is True
        assert f_body["esg_certificate"]["carbon_offset_kg"] == 112.5

        # 4. Reset event state
        res_reset = client.post(f"/api/v1/event/{event_id}/reset")
        assert res_reset.status_code == 200
        assert res_reset.json()["success"] is True

    def test_pulse_missing_event_returns_404(self):
        res = client.post(
            "/api/v1/event/EVT-MISSING/pulse",
            json={
                "actual_checked_in": 100,
                "revised_expected_guests": 120,
                "category_inventory_update": {},
                "revised_budget": 0,
                "delayed_node_id": "",
                "delay_minutes": 0,
            },
        )
        assert res.status_code == 404


@pytest.mark.integration
class TestRescueRoutesIntegration:
    @pytest.fixture
    def setup_event_for_rescue(self):
        payload = {
            "event_name": "Rescue Test Wedding",
            "event_type": "Wedding",
            "organizer_email": "rescue@festiva.ai",
            "target_date": "2026-11-28",
            "location": "Madurai",
            "expected_guests": 200,
            "max_venue_capacity": 300,
            "total_budget": 500000,
            "currency": "INR",
        }
        res = client.post("/api/v1/event/create", json=payload)
        return res.json()["event_id"]

    def test_rescue_propose_and_approve_lifecycle(self, setup_event_for_rescue):
        event_id = setup_event_for_rescue

        # 1. Propose Recovery
        incident_payload = {
            "event_id": event_id,
            "incident_type": "Food Shortage",
            "entered_values": {"shortage_count": 30, "category": "General Vegetarian"},
            "observation_time": "19:00",
        }
        res_prop = client.post(f"/api/v1/event/{event_id}/rescue/propose", json=incident_payload)
        assert res_prop.status_code == 200
        p_body = res_prop.json()
        assert p_body["success"] is True
        comparison = p_body["comparison"]
        chosen_proposal_id = comparison["candidate_lowest_cost"]["proposal_id"]

        # 2. Approve Selected Proposal
        approve_payload = {
            "proposal_id": chosen_proposal_id,
            "reason_for_approval": "Fastest kitchen prep with minimal budget impact",
        }
        res_app = client.post(f"/api/v1/event/{event_id}/rescue/approve", json=approve_payload)
        assert res_app.status_code == 200
        app_body = res_app.json()
        assert app_body["success"] is True
        assert app_body["decision_entry"]["actor"] == "Host / Event Coordinator"

        # 3. Negative path: Approve non-existent proposal ID
        bad_approve = client.post(
            f"/api/v1/event/{event_id}/rescue/approve",
            json={"proposal_id": "PROP-INVALID", "reason_for_approval": "Invalid"},
        )
        assert bad_approve.status_code == 404

    def test_rescue_propose_missing_event_returns_404(self):
        res = client.post(
            "/api/v1/event/EVT-MISSING/rescue/propose",
            json={
                "event_id": "EVT-MISSING",
                "incident_type": "Food Shortage",
                "entered_values": {},
                "observation_time": "18:00",
            },
        )
        assert res.status_code == 404

    def test_rescue_approve_missing_event_returns_404(self):
        res = client.post(
            "/api/v1/event/EVT-MISSING/rescue/approve",
            json={"proposal_id": "PROP-1", "reason_for_approval": "Test"},
        )
        assert res.status_code == 404

    def test_reset_missing_event_returns_404(self):
        res = client.post("/api/v1/event/EVT-MISSING/reset")
        assert res.status_code == 404


@pytest.mark.integration
class TestQARoutesAndMultimodalIntegration:
    def test_run_tests_endpoint(self):
        res = client.post("/api/v1/qa/run-tests")
        assert res.status_code == 200
        body = res.json()
        assert body["all_passed"] is True
        assert body["failed_tests"] == 0
        assert body["passed_tests"] >= 7

    def test_voice_memo_analysis_route(self):
        res = client.post(
            "/api/v1/multimodal/voice",
            json={"transcript": "There are 50 extra guests arriving at main reception right now"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["detected_incident"] == "ATTENDANCE_SURGE"
        assert body["extracted_parameters"]["new_guests"] == 50

    def test_vendor_quote_upload_route(self):
        txt_content = b"Invoice: Eco-friendly Jasmine Stage Arch 45000\nBrass Lamps 15000\nTotal: 60000"
        res = client.post(
            "/api/v1/multimodal/quote",
            files={"file": ("quote.txt", io.BytesIO(txt_content), "text/plain")},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["total_extracted_amount"] > 0
        assert body["requires_human_verification"] is True

    def test_get_supported_languages_route(self):
        res = client.get("/api/v1/languages")
        assert res.status_code == 200
        body = res.json()
        assert "languages" in body
        assert len(body["languages"]) >= 10
