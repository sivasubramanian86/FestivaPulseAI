"""End-to-end integration tests for FestivaPulseAI FastAPI endpoints.

Adheres to @08_polyglot_tdd_engineer and enterprise-testing-pyramid.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health_check_endpoint():
    """Verifies health check endpoint returns 200 and healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["invariants"]["deterministic_math"] is True


def test_presets_list_endpoint():
    """Verifies presets endpoint returns 3 diverse celebration templates."""
    response = client.get("/api/v1/event/presets/list")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) == 3
    assert any(p["type"] == "Community Event" for p in presets)
    assert any(p["type"] == "Wedding" for p in presets)
    assert any(p["type"] == "Birthday" for p in presets)


def test_create_event_and_recovery_lifecycle():
    """Tests full lifecycle: Create event -> Pulse update -> Rescue proposal -> Human approval -> Decision Ledger."""
    # 1. Create Event
    intake_payload = {
        "event_name": "Tirunelveli Tamil-English Community Celebration",
        "event_type": "Community Event",
        "organizer_email": "siva@festivapulse.org",
        "target_date": "2026-11-12",
        "location": "Tirunelveli Town Hall & Lawns",
        "expected_guests": 250,
        "max_venue_capacity": 350,
        "total_budget": 500000,
        "currency": "INR",
        "dietary": {
            "general_veg_pct": 70,
            "vegan_pct": 10,
            "jain_pct": 10,
            "non_veg_pct": 10,
            "allergy_specific_count": 5,
            "children_meals_count": 20,
            "staff_vendor_meals_count": 20
        },
        "preferences": {
            "cultural_vibe": "Eco-friendly Tamil heritage with live classical fusion & organic banana leaf feast",
            "elders_comfort_priority": True,
            "healthy_lifestyle_focus": True,
            "kids_activity_zone": True,
            "sound_curfew_time": "22:00"
        }
    }

    create_res = client.post("/api/v1/event/create", json=intake_payload)
    assert create_res.status_code == 201
    create_data = create_res.json()
    event_id = create_data["event_id"]
    assert "EVT-" in event_id
    assert create_data["blueprint"]["total_budget"] == 500000
    assert create_data["telemetry"]["active_agent"] == "CelebrationBlueprintPlannerAgent"

    # 2. Update Pulse: Check-ins reach 210, catering progress logged
    pulse_res = client.post(f"/api/v1/event/{event_id}/pulse", json={
        "actual_checked_in": 210,
        "revised_expected_guests": 280,
        "category_inventory_update": {},
        "revised_budget": 0,
        "delayed_node_id": "",
        "delay_minutes": 0
    })
    assert pulse_res.status_code == 200
    pulse_data = pulse_res.json()
    assert pulse_data["food_radar"]["actual_checked_in"] == 210

    # 3. Generate FSSAI Surplus Manifest (e.g. 35 kg unserved intact food rescued)
    fssai_res = client.post(f"/api/v1/event/{event_id}/food/fssai-manifest", json={
        "surplus_kg": 35.0,
        "hot_temp_celsius": 68.0,
        "cold_temp_celsius": 4.0,
        "partner_ngo": "Feeding India (Zomato Giving)"
    })
    assert fssai_res.status_code == 200
    fssai_data = fssai_res.json()
    assert fssai_data["is_temperature_compliant"] is True
    assert fssai_data["esg_certificate"]["carbon_offset_kg"] == 87.5  # 35 * 2.5

    # 4. Propose Rescue Options for Food Shortage
    rescue_propose_res = client.post(f"/api/v1/event/{event_id}/rescue/propose", json={
        "event_id": event_id,
        "incident_type": "Food Shortage",
        "entered_values": {"shortage_count": 40, "category": "General Vegetarian"},
        "source": "Kitchen Head Walkie-Talkie",
        "observation_time": "20:15",
        "is_simulation": False
    })
    assert rescue_propose_res.status_code == 200
    rescue_data = rescue_propose_res.json()
    comparison = rescue_data["comparison"]
    assert comparison["candidate_lowest_cost"]["strategy_type"] == "Lowest Additional Cost"
    assert comparison["candidate_best_experience"]["strategy_type"] == "Best Guest Experience"
    assert comparison["candidate_lowest_disruption"]["strategy_type"] == "Lowest Operational Disruption"

    # 5. Approve Candidate Lowest Cost
    chosen_proposal_id = comparison["candidate_lowest_cost"]["proposal_id"]
    approve_res = client.post(f"/api/v1/event/{event_id}/rescue/approve", json={
        "proposal_id": chosen_proposal_id,
        "reason_for_approval": "Selected rapid 15m kitchen batch-stretch to protect budget"
    })
    assert approve_res.status_code == 200
    approve_data = approve_res.json()
    assert approve_data["decision_entry"]["plan_version"] >= 1
    assert "Lowest Additional Cost" in approve_data["decision_entry"]["what_changed"]


def test_in_app_qa_test_runner_endpoint():
    """Verifies that the In-App automated test suite endpoint runs and passes 100%."""
    response = client.post("/api/v1/qa/run-tests")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["all_passed"] is True
    assert data["failed_tests"] == 0
    assert data["passed_tests"] >= 7
