"""Unit tests for FestivaPulseAI Core Engine.

Validates deterministic mathematical models, Pareto budget rebalancer,
FSSAI surplus manifest calculation, and Timeline DAG delay propagation.
Adheres to @08_polyglot_tdd_engineer and @02_system_architect.
"""

import pytest

from backend.app.core.engine import (
    calculate_budget_ledger,
    calculate_food_sufficiency,
    generate_fssai_surplus_manifest,
    propagate_timeline_delay,
    rebalance_budget_pareto,
    validate_proposal_feasibility,
)
from backend.app.models.budget import BudgetCategoryItem
from backend.app.models.event import DietaryRequirement
from backend.app.models.inventory import MealCategory
from backend.app.models.timeline import TimelineNode


@pytest.mark.unit
class TestBudgetEngine:
    """Test suite for Budget Engine."""
    def test_calculate_budget_ledger_arithmetic(self) -> None:
        """Verifies that budget spent and committed amounts are never double-counted."""
        categories = [
            BudgetCategoryItem(
                category_name="Venue & Security",
                approved_budget=200000,
                spent_amount=150000,
                committed_unpaid=50000,
                uncommitted_planned=0,
                is_protected_anchor=True,
            ),
            BudgetCategoryItem(
                category_name="Catering",
                approved_budget=200000,
                spent_amount=50000,
                committed_unpaid=100000,
                uncommitted_planned=50000,
                is_protected_anchor=True,
            ),
            BudgetCategoryItem(
                category_name="Decor & Stage",
                approved_budget=100000,
                spent_amount=20000,
                committed_unpaid=30000,
                uncommitted_planned=50000,
                is_protected_anchor=False,
            ),
        ]

        ledger = calculate_budget_ledger("EVT-001", 500000, categories)
        assert ledger.spent_total == 220000
        assert ledger.committed_unpaid_total == 180000
        assert ledger.uncommitted_planned_total == 100000
        assert ledger.projected_final_cost == 500000
        assert ledger.variance == 0
        assert not ledger.is_in_deficit

    def test_rebalance_budget_pareto_feasible_slash(self) -> None:
        """Verifies that elastic line items are pruned while protecting anchor items."""
        categories = [
            BudgetCategoryItem(
                category_name="Core Food & Accessibility",
                approved_budget=300000,
                spent_amount=100000,
                committed_unpaid=150000,
                uncommitted_planned=50000,
                is_protected_anchor=True,
            ),
            BudgetCategoryItem(
                category_name="Floral Decor & Photography Upgrades",
                approved_budget=200000,
                spent_amount=20000,
                committed_unpaid=30000,
                uncommitted_planned=150000,
                is_protected_anchor=False,
            ),
        ]

        ledger = calculate_budget_ledger("EVT-001", 500000, categories)
        # Cut budget by 100,000 (from 500k to 400k)
        rebalance = rebalance_budget_pareto(ledger, 400000)

        assert rebalance.is_feasible is True
        assert rebalance.unresolved_deficit == 0
        assert rebalance.pruned_elastic_total == 100000
        # Core food anchor planned remains untouched
        assert rebalance.rebalanced_categories[0].uncommitted_planned == 50000
        # Elastic decor planned is pruned from 150k down to 50k
        assert rebalance.rebalanced_categories[1].uncommitted_planned == 50000

    def test_rebalance_budget_pareto_infeasible_deficit(self) -> None:
        """Verifies that system says NOT FEASIBLE when cut exceeds all elastic funds."""
        categories = [
            BudgetCategoryItem(
                category_name="Core Food & Accessibility",
                approved_budget=450000,
                spent_amount=200000,
                committed_unpaid=200000,
                uncommitted_planned=50000,
                is_protected_anchor=True,
            ),
            BudgetCategoryItem(
                category_name="Decor",
                approved_budget=50000,
                spent_amount=10000,
                committed_unpaid=10000,
                uncommitted_planned=30000,
                is_protected_anchor=False,
            ),
        ]

        ledger = calculate_budget_ledger("EVT-001", 500000, categories)
        # Try to slash budget by 100,000 when only 30,000 is elastic
        rebalance = rebalance_budget_pareto(ledger, 400000)

        assert rebalance.is_feasible is False
        assert "NOT FEASIBLE" in rebalance.rationale
        assert rebalance.unresolved_deficit == 70000

    def test_rebalance_budget_expansion(self) -> None:
        """Verifies budget expansion allocates surplus to contingency buffer."""
        categories = [
            BudgetCategoryItem(
                category_name="Venue",
                approved_budget=300000,
                spent_amount=0,
                committed_unpaid=0,
                uncommitted_planned=300000,
                is_protected_anchor=True,
            )
        ]
        ledger = calculate_budget_ledger("EVT-001", 300000, categories)
        rebalance = rebalance_budget_pareto(ledger, 350000)
        assert rebalance.is_feasible is True
        assert rebalance.budget_delta == 50000


@pytest.mark.unit
class TestFoodAndFSSAI:
    """Test suite for Food And F S S A I."""
    def test_food_sufficiency_category_shortfall(self) -> None:
        """Verifies category-level shortfall detection (e.g., vegan shortage despite overall surplus)."""
        dietary = DietaryRequirement(
            general_veg_pct=60,
            vegan_pct=20,
            jain_pct=0,
            non_veg_pct=20,
            allergy_specific_count=10,
            children_meals_count=10,
            staff_vendor_meals_count=20,
        )

        inv = {
            MealCategory.GENERAL_VEG.value: {
                "prepared": 80,
                "served": 10,
                "reserved": 0,
                "inbound": 0,
            },
            MealCategory.VEGAN.value: {"prepared": 8, "served": 0, "reserved": 0, "inbound": 0},
        }

        radar = calculate_food_sufficiency("EVT-001", 100, 30, dietary, inv)

        vegan_status = next(c for c in radar.categories if c.category == MealCategory.VEGAN)
        assert vegan_status.is_critical_shortage is True
        assert vegan_status.net_shortfall_or_surplus == -12

        gen_veg_status = next(c for c in radar.categories if c.category == MealCategory.GENERAL_VEG)
        assert gen_veg_status.is_critical_shortage is False
        assert gen_veg_status.net_shortfall_or_surplus == 20

    def test_fssai_surplus_manifest_standards(self) -> None:
        """Verifies FSSAI regulatory compliance verification and ESG metric generation."""
        manifest = generate_fssai_surplus_manifest("EVT-001", 40.0, 68.0, 4.0)
        assert manifest.is_temperature_compliant is True
        assert manifest.carbon_emissions_prevented_kg == 100.0  # 40 * 2.5
        assert manifest.csr_tax_deduction_inr == 5000.0  # 40 * 125

        non_compliant = generate_fssai_surplus_manifest("EVT-001", 40.0, 55.0, 4.0)
        assert non_compliant.is_temperature_compliant is False


@pytest.mark.unit
class TestTimelineDAG:
    """Test suite for Timeline D A G."""
    def test_propagate_timeline_delay_dag(self) -> None:
        """Verifies that delays propagate downstream and sound curfew (22:00) is flagged."""
        nodes = [
            TimelineNode(
                node_id="N1",
                title="Barat & Welcome",
                owner="Host Family",
                scheduled_start="18:00",
                scheduled_end="19:00",
                duration_minutes=60,
                dependencies=[],
            ),
            TimelineNode(
                node_id="N2",
                title="Main Ceremony & Pheras",
                owner="Priest",
                scheduled_start="19:15",
                scheduled_end="20:45",
                duration_minutes=90,
                dependencies=["N1"],
            ),
            TimelineNode(
                node_id="N3",
                title="Musical Sangeet & DJ",
                owner="AV Technician",
                scheduled_start="21:00",
                scheduled_end="22:00",
                duration_minutes=60,
                dependencies=["N2"],
                is_fixed_contractual_window=True,
            ),
        ]

        cascade = propagate_timeline_delay(nodes, "N1", 30, curfew_time="22:00")

        n3_updated = next(n for n in cascade.propagated_delays if n.node_id == "N3")
        assert n3_updated.scheduled_end == "22:30"
        assert n3_updated.curfew_alert is True
        assert cascade.curfew_breached is True
        assert cascade.overtime_penalty_estimated > 0

    def test_timeline_delay_node_not_found_raises(self) -> None:
        """Verifies timeline delay node not found raises."""
        nodes = [
            TimelineNode(
                node_id="N1",
                title="Welcome",
                owner="Host",
                scheduled_start="18:00",
                scheduled_end="19:00",
                duration_minutes=60,
                dependencies=[],
            )
        ]
        with pytest.raises(ValueError, match="not found in timeline DAG"):
            propagate_timeline_delay(nodes, "NON_EXISTENT", 20)

    def test_timeline_delay_unaffected_nodes(self) -> None:
        """Verifies timeline delay unaffected nodes."""
        nodes = [
            TimelineNode(
                node_id="N1",
                title="A",
                owner="Host",
                scheduled_start="18:00",
                scheduled_end="19:00",
                duration_minutes=60,
                dependencies=[],
            ),
            TimelineNode(
                node_id="N2",
                title="Independent",
                owner="Host",
                scheduled_start="18:00",
                scheduled_end="19:00",
                duration_minutes=60,
                dependencies=[],
            ),
        ]
        res = propagate_timeline_delay(nodes, "N1", 15)
        n2_res = next(n for n in res.propagated_delays if n.node_id == "N2")
        assert n2_res.scheduled_start == "18:00"


@pytest.mark.unit
class TestProposalFeasibilityRules:
    """Test suite for Proposal Feasibility Rules."""
    def test_validate_proposal_feasibility_rules(self) -> None:
        """Verifies hard capacity and budget rejection checks."""
        feasible, msg = validate_proposal_feasibility("Add chairs", 250, 300, 20000, 50000)
        assert feasible is True

        infeasible_cap, msg_cap = validate_proposal_feasibility("Add crowd", 350, 300, 20000, 50000)
        assert infeasible_cap is False
        assert "HSE safety regulation forbids overcrowding" in msg_cap

        infeasible_bud, msg_bud = validate_proposal_feasibility("Hire celebrity band", 250, 300, 80000, 50000)
        assert infeasible_bud is False
        assert "exceeds total remaining authorized budget" in msg_bud
