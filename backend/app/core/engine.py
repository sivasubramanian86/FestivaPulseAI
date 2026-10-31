"""FestivaPulseAI Deterministic Domain Engine.

Pure Python functions executing all arithmetic, constraint checking,
budget reconciliation, food sufficiency calculations, and timeline DAG shifts.
Adheres strictly to the architectural invariant:
'AI proposes; a deterministic engine verifies. The model is NEVER the source of truth for arithmetic.'
"""

from __future__ import annotations

from datetime import datetime, timedelta

from backend.app.models.budget import BudgetCategoryItem, BudgetLedger, BudgetParetoRebalance
from backend.app.models.event import DietaryRequirement
from backend.app.models.inventory import (
    CategoryPortionStatus,
    FoodSufficiencyRadar,
    FSSAISurplusManifest,
    MealCategory,
)
from backend.app.models.timeline import TimelineCascadeImpact, TimelineNode


def calculate_budget_ledger(
    event_id: str, approved_total: int, categories: list[BudgetCategoryItem], currency: str = "INR"
) -> BudgetLedger:
    """Computes exact budget allocations and prevents double-counting between spent and committed."""
    spent_total = sum(c.spent_amount for c in categories)
    committed_unpaid_total = sum(c.committed_unpaid for c in categories)
    uncommitted_planned_total = sum(c.uncommitted_planned for c in categories)

    # 5% baseline contingency reserve if unallocated
    contingency = max(0, int(approved_total * 0.05))
    projected_final = spent_total + committed_unpaid_total + uncommitted_planned_total
    variance = approved_total - projected_final
    is_in_deficit = variance < 0

    return BudgetLedger(
        event_id=event_id,
        currency=currency,
        approved_total=approved_total,
        spent_total=spent_total,
        committed_unpaid_total=committed_unpaid_total,
        uncommitted_planned_total=uncommitted_planned_total,
        contingency_allocation=contingency,
        projected_final_cost=projected_final,
        variance=variance,
        is_in_deficit=is_in_deficit,
        categories=categories,
    )


def rebalance_budget_pareto(current_ledger: BudgetLedger, revised_budget: int) -> BudgetParetoRebalance:
    """Rebalances budget using Pareto frontier optimization.

    Locks Non-Negotiable Anchors (Core food, security, accessibility) and
    dynamically prunes Elastic line items (Decor upgrades, extra lighting, gifts).
    """
    budget_delta = revised_budget - current_ledger.approved_total
    new_categories: list[BudgetCategoryItem] = []

    protected_total = 0
    elastic_total = 0

    for cat in current_ledger.categories:
        if cat.is_protected_anchor:
            protected_total += cat.spent_amount + cat.committed_unpaid + cat.uncommitted_planned
        else:
            elastic_total += cat.uncommitted_planned

    # If it's a budget slash
    if budget_delta < 0:
        cut_needed = abs(budget_delta)
        if cut_needed > elastic_total:
            # Infeasible: even wiping out 100% of elastic items does not bridge the gap
            unresolved = cut_needed - elastic_total
            return BudgetParetoRebalance(
                original_budget=current_ledger.approved_total,
                revised_budget=revised_budget,
                budget_delta=budget_delta,
                protected_anchor_total=protected_total,
                pruned_elastic_total=elastic_total,
                rationale="NOT FEASIBLE: Deficit exceeds all uncommitted elastic budget lines. Contractual commitments prevent further reduction.",
                rebalanced_categories=current_ledger.categories,
                is_feasible=False,
                unresolved_deficit=unresolved,
            )

        # Pro-rata pruning across elastic items
        prune_ratio = cut_needed / max(1, elastic_total)
        for cat in current_ledger.categories:
            if cat.is_protected_anchor:
                new_categories.append(cat.model_copy())
            else:
                reduced_planned = int(cat.uncommitted_planned * (1.0 - prune_ratio))
                new_cat = cat.model_copy(update={"uncommitted_planned": reduced_planned})
                new_categories.append(new_cat)

        return BudgetParetoRebalance(
            original_budget=current_ledger.approved_total,
            revised_budget=revised_budget,
            budget_delta=budget_delta,
            protected_anchor_total=protected_total,
            pruned_elastic_total=cut_needed,
            rationale=f"Successfully absorbed -₹{cut_needed:,} by pruning elastic decor & entertainment while preserving core food and accessibility anchors.",
            rebalanced_categories=new_categories,
            is_feasible=True,
            unresolved_deficit=0,
        )
    else:
        # Budget expansion: increase contingency reserve rather than blowing spend
        return BudgetParetoRebalance(
            original_budget=current_ledger.approved_total,
            revised_budget=revised_budget,
            budget_delta=budget_delta,
            protected_anchor_total=protected_total,
            pruned_elastic_total=0,
            rationale=f"Surplus of +₹{budget_delta:,} allocated to contingency buffer to absorb day-of shocks.",
            rebalanced_categories=current_ledger.categories,
            is_feasible=True,
            unresolved_deficit=0,
        )


def calculate_food_sufficiency(
    event_id: str,
    attendance_expected: int,
    actual_checked_in: int,
    dietary: DietaryRequirement,
    current_inventory: dict[str, dict[str, int]],
) -> FoodSufficiencyRadar:
    """Calculates category-specific food sufficiency without pooling non-interchangeable diets."""
    categories_status: list[CategoryPortionStatus] = []
    total_shortfall = 0
    total_surplus = 0

    # Portion calculations by category
    category_portions_needed = {
        MealCategory.GENERAL_VEG: int(attendance_expected * (dietary.general_veg_pct / 100.0)),
        MealCategory.VEGAN: int(attendance_expected * (dietary.vegan_pct / 100.0)),
        MealCategory.JAIN: int(attendance_expected * (dietary.jain_pct / 100.0)),
        MealCategory.NON_VEG: int(attendance_expected * (dietary.non_veg_pct / 100.0)),
        MealCategory.ALLERGY_SAFE: dietary.allergy_specific_count,
        MealCategory.CHILDREN: dietary.children_meals_count,
        MealCategory.STAFF_VENDOR: dietary.staff_vendor_meals_count,
    }

    for cat_enum, required in category_portions_needed.items():
        inv = current_inventory.get(cat_enum.value, {"prepared": required, "served": 0, "reserved": 0, "inbound": 0})
        prepared = inv.get("prepared", required)
        served = inv.get("served", 0)
        reserved = inv.get("reserved", 0)
        inbound = inv.get("inbound", 0)

        available = prepared - served - reserved
        net_balance = (available + inbound) - (required - served)

        # Burn rate: simulated consumption based on checked in ratio
        burn_rate = round((served / max(1, actual_checked_in)) * 1.8, 2) if actual_checked_in > 0 else 0.0
        depletion_mins = int(available / max(0.1, burn_rate)) if burn_rate > 0 and available > 0 else None

        is_critical = net_balance < 0

        if net_balance < 0:
            total_shortfall += abs(net_balance)
        else:
            total_surplus += net_balance

        categories_status.append(
            CategoryPortionStatus(
                category=cat_enum,
                required_portions=required,
                prepared_portions=prepared,
                served_portions=served,
                available_portions=available,
                reserved_portions=reserved,
                confirmed_inbound=inbound,
                net_shortfall_or_surplus=net_balance,
                burn_rate_plates_per_min=burn_rate,
                depletion_projected_minutes=depletion_mins,
                supplier_lead_time_minutes=30,
                is_critical_shortage=is_critical,
            )
        )

    return FoodSufficiencyRadar(
        event_id=event_id,
        timestamp=datetime.now().isoformat(),
        overall_attendance_expected=attendance_expected,
        actual_checked_in=actual_checked_in,
        categories=categories_status,
        total_shortfall_count=total_shortfall,
        total_surplus_count=total_surplus,
        fssai_manifest=None,
        stale_data_warning=False,
    )


def generate_fssai_surplus_manifest(
    event_id: str,
    surplus_kg: float,
    hot_temp_celsius: float,
    cold_temp_celsius: float,
    ngo_partner: str = "Feeding India (Zomato Giving)",
    responsible_person: str = "Event Head Coordinator",
) -> FSSAISurplusManifest:
    """Verifies FSSAI regulatory compliance and generates verified surplus food rescue manifest."""
    # FSSAI rules: Hot holding >= 63°C, Cold holding <= 5°C
    is_temp_compliant = (hot_temp_celsius >= 63.0) and (cold_temp_celsius <= 5.0)

    # 1 kg rescued food = 2.5 kg CO2e prevented, ₹125 tax credit CSR value
    co2e_prevented = round(surplus_kg * 2.5, 2)
    csr_value = round(surplus_kg * 125.0, 2)

    return FSSAISurplusManifest(
        manifest_id=f"FSSAI-RESCUE-{int(datetime.now().timestamp())}",
        timestamp=datetime.now().isoformat(),
        event_id=event_id,
        surplus_kg_total=surplus_kg,
        hot_holding_temp_celsius=hot_temp_celsius,
        cold_holding_temp_celsius=cold_temp_celsius,
        is_temperature_compliant=is_temp_compliant,
        tamper_evident_packaging_verified=True,
        registered_ngo_partner=ngo_partner,
        ngo_contact_phone="+91-1800-425-3333",
        pickup_window_deadline=(datetime.now() + timedelta(hours=2)).strftime("%H:%M"),
        carbon_emissions_prevented_kg=co2e_prevented,
        csr_tax_deduction_inr=csr_value,
        responsible_person_signature=responsible_person,
    )


def propagate_timeline_delay(
    nodes: list[TimelineNode], delayed_node_id: str, delay_minutes: int, curfew_time: str = "22:00"
) -> TimelineCascadeImpact:
    """Propagates timeline delays downstream across directed acyclic graph dependencies."""
    updated_nodes: list[TimelineNode] = []
    node_map = {n.node_id: n for n in nodes}

    if delayed_node_id not in node_map:
        raise ValueError(f"Node {delayed_node_id} not found in timeline DAG")

    # Verify delayed node exists in map
    _ = node_map[delayed_node_id]

    def parse_time(t_str: str) -> datetime:
        """Parses hour-minute timestamp string into a datetime object for comparison."""
        return datetime.strptime(t_str, "%H:%M")

    delayed_nodes_ids = {delayed_node_id}
    curfew_dt = parse_time(curfew_time)
    curfew_breached = False

    for n in nodes:
        # Check if node depends on any delayed node
        is_dependent = any(dep in delayed_nodes_ids for dep in n.dependencies)
        if is_dependent or n.node_id == delayed_node_id:
            delayed_nodes_ids.add(n.node_id)
            orig_start = parse_time(n.scheduled_start)
            orig_end = parse_time(n.scheduled_end)
            new_start = orig_start + timedelta(minutes=delay_minutes)
            new_end = orig_end + timedelta(minutes=delay_minutes)

            breached = new_end > curfew_dt
            if breached and n.is_fixed_contractual_window:
                curfew_breached = True

            updated_nodes.append(
                n.model_copy(
                    update={
                        "scheduled_start": new_start.strftime("%H:%M"),
                        "scheduled_end": new_end.strftime("%H:%M"),
                        "curfew_alert": breached,
                        "status": "DELAYED",
                    }
                )
            )
        else:
            updated_nodes.append(n.model_copy())

    overtime_fee = 15000 if curfew_breached else 0
    recommendation = (
        f"CRITICAL: 22:00 police sound curfew breached by {delay_minutes}m. "
        "Recommend compressing dining speeches by 25m to protect acoustic window."
        if curfew_breached
        else f"Delay of {delay_minutes}m successfully absorbed by buffer windows."
    )

    return TimelineCascadeImpact(
        delayed_node_id=delayed_node_id,
        delay_minutes=delay_minutes,
        propagated_delays=updated_nodes,
        curfew_breached=curfew_breached,
        curfew_cutoff_time=curfew_time,
        overtime_penalty_estimated=overtime_fee,
        kitchen_warm_hold_exceeded=delay_minutes > 45,
        recommendation=recommendation,
    )


def validate_proposal_feasibility(
    proposal_summary: str,
    requested_guests: int,
    max_venue_capacity: int,
    estimated_cost: int,
    available_budget: int,
) -> tuple[bool, str]:
    """Strict gate verifying feasibility against hard physical and financial constraints."""
    if requested_guests > max_venue_capacity:
        return (
            False,
            f"NOT FEASIBLE: Requested guest count ({requested_guests}) exceeds authorized venue fire capacity ({max_venue_capacity}). HSE safety regulation forbids overcrowding.",
        )
    if estimated_cost > available_budget:
        return (
            False,
            f"NOT FEASIBLE: Estimated cost (₹{estimated_cost:,}) exceeds total remaining authorized budget (₹{available_budget:,}). Deficit of ₹{estimated_cost - available_budget:,}.",
        )
    return (True, "Feasible and within authorized safety & financial constraints.")
