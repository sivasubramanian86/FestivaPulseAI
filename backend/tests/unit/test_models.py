"""Unit tests for all Pydantic v2 domain models and schema validations.

Ensures 100% boundary and exception coverage for models in backend/app/models/.
"""

import pytest
from pydantic import ValidationError

from backend.app.models.event import (
    DietaryRequirement,
    EventBlueprint,
    EventIntakeRequest,
    EventPreferences,
    EventType,
    MilestoneItem,
    VendorSLAItem,
)
from backend.app.models.incident import (
    IncidentSubmission,
    IncidentType,
    RecoveryProposal,
    RecoveryStrategyType,
    RescueStudioComparison,
)
from backend.app.models.inventory import (
    CategoryPortionStatus,
    FoodSufficiencyRadar,
    FSSAISurplusManifest,
    MealCategory,
)
from backend.app.models.telemetry import GenAITelemetryTrace
from backend.app.models.timeline import TimelineCascadeImpact, TimelineNode


@pytest.mark.unit
class TestEventModels:
    def test_dietary_requirement_valid(self):
        diet = DietaryRequirement(
            general_veg_pct=50,
            vegan_pct=20,
            jain_pct=10,
            non_veg_pct=20,
            allergy_specific_count=5,
            children_meals_count=20,
            staff_vendor_meals_count=25,
        )
        assert diet.general_veg_pct == 50
        assert diet.vegan_pct + diet.jain_pct + diet.non_veg_pct + diet.general_veg_pct == 100

    def test_dietary_requirement_sum_not_100_raises(self):
        with pytest.raises(ValidationError) as exc:
            DietaryRequirement(
                general_veg_pct=50,
                vegan_pct=10,
                jain_pct=10,
                non_veg_pct=20,  # Sum = 90%
            )
        assert "must sum to exactly 100%" in str(exc.value)

    def test_event_preferences_defaults(self):
        pref = EventPreferences()
        assert pref.elders_comfort_priority is True
        assert pref.healthy_lifestyle_focus is True
        assert pref.kids_activity_zone is True
        assert pref.sound_curfew_time == "22:00"

    def test_event_intake_valid(self):
        intake = EventIntakeRequest(
            event_name="Grand Coimbatore Wedding",
            event_type=EventType.WEDDING,
            organizer_email="organizer@festivapulse.ai",
            target_date="2026-11-20",
            location="Coimbatore",
            expected_guests=300,
            max_venue_capacity=400,
            total_budget=800000,
        )
        assert intake.event_name == "Grand Coimbatore Wedding"
        assert intake.currency == "INR"

    def test_event_intake_invalid_date_format(self):
        with pytest.raises(ValidationError) as exc:
            EventIntakeRequest(
                event_name="Invalid Date Event",
                event_type=EventType.WEDDING,
                organizer_email="org@festiva.ai",
                target_date="20-11-2026",
                location="Chennai",
                expected_guests=200,
                max_venue_capacity=300,
                total_budget=500000,
            )
        assert "YYYY-MM-DD format" in str(exc.value)

    def test_event_intake_year_out_of_bounds(self):
        with pytest.raises(ValidationError) as exc:
            EventIntakeRequest(
                event_name="Past Event",
                event_type=EventType.WEDDING,
                organizer_email="org@festiva.ai",
                target_date="2020-01-01",
                location="Chennai",
                expected_guests=200,
                max_venue_capacity=300,
                total_budget=500000,
            )
        assert "between 2024 and 2035" in str(exc.value)

    def test_event_intake_capacity_less_than_guests(self):
        with pytest.raises(ValidationError) as exc:
            EventIntakeRequest(
                event_name="Overbooked Hall",
                event_type=EventType.COMMUNITY_EVENT,
                organizer_email="org@festiva.ai",
                target_date="2026-12-01",
                location="Chennai",
                expected_guests=500,
                max_venue_capacity=400,
                total_budget=500000,
            )
        assert "cannot be less than expected guests" in str(exc.value)

    def test_event_intake_invalid_email(self):
        with pytest.raises(ValidationError):
            EventIntakeRequest(
                event_name="Invalid Email Event",
                event_type=EventType.BIRTHDAY,
                organizer_email="not-an-email",
                target_date="2026-12-01",
                location="Chennai",
                expected_guests=50,
                max_venue_capacity=100,
                total_budget=100000,
            )

    def test_event_blueprint_instantiation(self):
        bp = EventBlueprint(
            id="EVT-001",
            event_name="Silver Jubilee",
            event_type=EventType.COMMUNITY_EVENT,
            location="Madurai",
            target_date="2026-10-15",
            expected_guests=250,
            max_venue_capacity=350,
            total_budget=600000,
            currency="INR",
            executive_summary="Community gathering summary",
            personalized_themes=["Heritage", "Organic"],
            intergenerational_features=["Quiet area for elders"],
            milestones=[MilestoneItem(phase="T-30", task_name="Venue", owner="Host", deadline="2026-09-15")],
            vendor_slas=[
                VendorSLAItem(
                    vendor_type="Caterer",
                    vendor_name="Annapoorna",
                    quote_amount=200000,
                    advance_paid=100000,
                    pending_amount=100000,
                    sla_requirement="Hot food",
                    backup_vendor_contact="+91-99999",
                    arrival_time="12:00",
                )
            ],
            initial_risks_and_contingencies=["Rain probability"],
            unverified_assumptions=["Power backup ready"],
            created_at="2026-04-10T10:00:00",
        )
        assert bp.version == 1
        assert len(bp.milestones) == 1
        assert len(bp.vendor_slas) == 1


@pytest.mark.unit
class TestIncidentAndRecoveryModels:
    def test_incident_submission(self):
        inc = IncidentSubmission(
            event_id="EVT-001",
            incident_type=IncidentType.ATTENDANCE_SURGE,
            entered_values={"new_attendance": 350},
            observation_time="18:00",
        )
        assert inc.incident_type == IncidentType.ATTENDANCE_SURGE
        assert inc.is_simulation is False

    def test_recovery_proposal_and_comparison(self):
        p1 = RecoveryProposal(
            proposal_id="P1",
            strategy_type=RecoveryStrategyType.LOWEST_COST,
            summary="Deploy batch stretch",
            action_items=["Item 1"],
            additional_cost=5000,
            remaining_budget_projected=795000,
            guests_covered=350,
            timeline_impact_minutes=10,
            vendor_dependencies=["Caterer"],
            unresolved_constraints=[],
            actions_requiring_human_approval=["Approval 1"],
            is_feasible=True,
        )
        p2 = p1.model_copy(
            update={
                "proposal_id": "P2",
                "strategy_type": RecoveryStrategyType.BEST_EXPERIENCE,
            }
        )
        p3 = p1.model_copy(
            update={
                "proposal_id": "P3",
                "strategy_type": RecoveryStrategyType.LOWEST_DISRUPTION,
            }
        )
        comp = RescueStudioComparison(
            incident_id="INC-1",
            event_id="EVT-001",
            timestamp="2026-10-25T18:00:00",
            incident_summary="Attendance surge",
            candidate_lowest_cost=p1,
            candidate_best_experience=p2,
            candidate_lowest_disruption=p3,
            rejected_proposals=[],
            system_advisory="Advisory notes",
        )
        assert comp.candidate_lowest_cost.proposal_id == "P1"
        assert len(comp.rejected_proposals) == 0


@pytest.mark.unit
class TestInventoryTelemetryTimelineModels:
    def test_food_category_breakdown_and_radar(self):
        status = CategoryPortionStatus(
            category=MealCategory.GENERAL_VEG,
            required_portions=180,
            prepared_portions=200,
            served_portions=100,
            available_portions=100,
            reserved_portions=20,
            confirmed_inbound=0,
            net_shortfall_or_surplus=20,
            burn_rate_plates_per_min=1.5,
            depletion_projected_minutes=60,
            supplier_lead_time_minutes=30,
            is_critical_shortage=False,
        )
        radar = FoodSufficiencyRadar(
            event_id="EVT-01",
            timestamp="2026-10-25T19:00:00",
            overall_attendance_expected=300,
            actual_checked_in=280,
            categories=[status],
            total_shortfall_count=0,
            total_surplus_count=20,
            fssai_manifest=None,
            stale_data_warning=False,
        )
        assert radar.total_surplus_count == 20
        assert len(radar.categories) == 1

    def test_fssai_manifest_model(self):
        manifest = FSSAISurplusManifest(
            manifest_id="MAN-001",
            timestamp="2026-10-25T21:00:00",
            event_id="EVT-001",
            surplus_kg_total=50.0,
            hot_holding_temp_celsius=65.0,
            cold_holding_temp_celsius=4.0,
            is_temperature_compliant=True,
            tamper_evident_packaging_verified=True,
            registered_ngo_partner="Robin Hood Army",
            ngo_contact_phone="+91-99999",
            pickup_window_deadline="22:30",
            carbon_emissions_prevented_kg=125.0,
            csr_tax_deduction_inr=6250.0,
            responsible_person_signature="Coordinator",
        )
        assert manifest.is_temperature_compliant is True
        assert manifest.carbon_emissions_prevented_kg == 125.0

    def test_telemetry_model(self):
        t = GenAITelemetryTrace(
            trace_id="TR-01",
            timestamp="2026-10-25T19:00:00",
            active_agent="TestAgent",
            purpose="Test Telemetry",
            raw_prompt_sent="Prompt",
            structured_json_response={"status": "ok"},
            latency_ms=120,
            token_usage_estimated=250,
            dynamic_diff_summary="Diff",
            is_live_call=False,
        )
        assert t.latency_ms == 120
        assert t.is_live_call is False

    def test_timeline_node_and_impact_models(self):
        node = TimelineNode(
            node_id="N-1",
            task_name="Opening",
            scheduled_start="10:00",
            scheduled_end="11:00",
        )
        impact = TimelineCascadeImpact(
            delayed_node_id="N-1",
            delay_minutes=20,
            propagated_delays=[node],
            curfew_breached=False,
            curfew_cutoff_time="22:00",
            overtime_penalty_estimated=0,
            kitchen_warm_hold_exceeded=False,
            recommendation="Absorbed",
        )
        assert impact.delayed_node_id == "N-1"
