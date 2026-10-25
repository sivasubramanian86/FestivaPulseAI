"""End-to-End (E2E) Test Suite for FestivaPulseAI.

Simulates the complete real-world event lifecycle from initial intake
to Day-of-Event shock absorption, 3-way rescue proposal triage,
Human-in-the-Loop decision ledger recording, and FSSAI surplus food rescue.
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


@pytest.mark.e2e
class TestFullEventLifecycleE2E:
    def test_complete_event_management_lifecycle(self):
        # =========================================================================
        # PHASE 1: Event Intake & Master Blueprint Synthesis
        # =========================================================================
        intake_payload = {
            "event_name": "Dr. Ananya & Karthik Royal Wedding",
            "event_type": "Wedding",
            "organizer_email": "ananya.wedding@festivapulse.ai",
            "target_date": "2026-11-20",
            "location": "Le Meridien Coimbatore",
            "expected_guests": 300,
            "max_venue_capacity": 400,
            "total_budget": 800000,
            "currency": "INR",
            "dietary": {
                "general_veg_pct": 50,
                "vegan_pct": 15,
                "jain_pct": 15,
                "non_veg_pct": 20,
                "allergy_specific_count": 5,
                "children_meals_count": 20,
                "staff_vendor_meals_count": 25,
            },
            "preferences": {
                "cultural_vibe": "Kongu Nadu Brass & Acoustic Classical Fusion",
                "elders_comfort_priority": True,
                "healthy_lifestyle_focus": True,
                "kids_activity_zone": True,
                "sound_curfew_time": "22:00",
            },
        }

        res_create = client.post("/api/v1/event/create", json=intake_payload)
        assert res_create.status_code == 201, f"Failed intake creation: {res_create.text}"
        create_data = res_create.json()
        assert create_data["success"] is True
        event_id = create_data["event_id"]
        assert event_id.startswith("EVT-")

        blueprint = create_data["blueprint"]
        assert blueprint["expected_guests"] == 300
        assert blueprint["total_budget"] == 800000
        assert len(blueprint["milestones"]) >= 4
        assert len(blueprint["vendor_slas"]) >= 3

        # =========================================================================
        # PHASE 2: Live Day-of-Event Pulse & Health Monitoring
        # =========================================================================
        pulse_payload = {
            "actual_checked_in": 340,  # +40 guest surge at 19:15
            "revised_expected_guests": 340,
            "category_inventory_update": {},
            "revised_budget": 0,
            "delayed_node_id": "",
            "delay_minutes": 0,
        }
        res_pulse = client.post(f"/api/v1/event/{event_id}/pulse", json=pulse_payload)
        assert res_pulse.status_code == 200
        pulse_data = res_pulse.json()
        assert pulse_data["food_radar"]["actual_checked_in"] == 340
        assert pulse_data["food_radar"]["total_shortfall_count"] > 0  # Surge creates meal shortfall

        # =========================================================================
        # PHASE 3: Incident Trigger & Rescue Studio 3-Way Triage
        # =========================================================================
        incident_payload = {
            "event_id": event_id,
            "incident_type": "Food Shortage",
            "entered_values": {
                "shortage_count": 40,
                "shortage_category": "General Vegetarian",
            },
            "observation_time": "19:20",
        }
        res_rescue = client.post(f"/api/v1/event/{event_id}/rescue/propose", json=incident_payload)
        assert res_rescue.status_code == 200
        rescue_data = res_rescue.json()
        assert rescue_data["success"] is True

        comparison = rescue_data["comparison"]
        assert comparison["candidate_lowest_cost"] is not None
        assert comparison["candidate_best_experience"] is not None
        assert comparison["candidate_lowest_disruption"] is not None
        assert "ZERO-STOCKOUT" in comparison["system_advisory"]

        # Strategy A (Lowest Cost) must be cheaper than Strategy B (Best Experience)
        assert (
            comparison["candidate_lowest_cost"]["additional_cost"]
            <= comparison["candidate_best_experience"]["additional_cost"]
        )

        chosen_proposal = comparison["candidate_lowest_cost"]
        chosen_proposal_id = chosen_proposal["proposal_id"]

        # =========================================================================
        # PHASE 4: Human-in-the-Loop Decision & Immutable Ledger Recording
        # =========================================================================
        approval_payload = {
            "proposal_id": chosen_proposal_id,
            "reason_for_approval": "Rapid kitchen batch stretch solves shortfall in 15 mins with minimal cost.",
        }
        res_approve = client.post(f"/api/v1/event/{event_id}/rescue/approve", json=approval_payload)
        assert res_approve.status_code == 200
        approve_data = res_approve.json()
        assert approve_data["success"] is True

        decision_entry = approve_data["decision_entry"]
        assert decision_entry["entry_id"].startswith("DEC-")
        assert decision_entry["actor"] == "Host / Event Coordinator"
        assert "Applied" in decision_entry["what_changed"]

        # Verify Event State updated
        res_state = client.get(f"/api/v1/event/{event_id}")
        assert res_state.status_code == 200
        event_state = res_state.json()
        assert len(event_state["decision_ledger"]) == 1
        assert event_state["blueprint"]["total_budget"] == 800000 + chosen_proposal["additional_cost"]

        # =========================================================================
        # PHASE 5: Post-Event Food Rescue & FSSAI Carbon Offset Certification
        # =========================================================================
        fssai_payload = {
            "surplus_kg": 50.0,
            "hot_temp_celsius": 65.0,
            "cold_temp_celsius": 3.8,
            "partner_ngo": "Feeding India / Robin Hood Army Coimbatore",
        }
        res_fssai = client.post(f"/api/v1/event/{event_id}/food/fssai-manifest", json=fssai_payload)
        assert res_fssai.status_code == 200
        fssai_data = res_fssai.json()
        assert fssai_data["is_temperature_compliant"] is True
        assert fssai_data["esg_certificate"]["carbon_offset_kg"] == 125.0  # 50kg * 2.5
        assert fssai_data["esg_certificate"]["csr_tax_deduction_inr"] == 6250.0  # 50kg * 125
        assert fssai_data["esg_certificate"]["meals_rescued"] == 150  # 50kg * 3

        # =========================================================================
        # PHASE 6: Self-Auditing QA Test Runner Verification
        # =========================================================================
        res_qa = client.post("/api/v1/qa/run-tests")
        assert res_qa.status_code == 200
        qa_data = res_qa.json()
        assert qa_data["success"] is True
        assert qa_data["all_passed"] is True
        assert qa_data["total_tests"] == 7
        assert qa_data["passed_tests"] == 7
        assert qa_data["failed_tests"] == 0
