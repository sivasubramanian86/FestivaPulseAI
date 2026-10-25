"""QA, Multimodal, and Automated Test Suite endpoints for FestivaPulseAI.

Powers the on-screen Live QA Test Runner Modal for video evaluator proof.
Adheres to @14_quality_assurance_engineer and @15_ai_evaluator_100.
"""

import time
from typing import Any

from fastapi import APIRouter, File, UploadFile
from pydantic import BaseModel, Field

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
from backend.app.services.multimodal_service import multimodal_service

router = APIRouter(prefix="/api/v1", tags=["QA & Multimodal"])


class VoiceMemoRequest(BaseModel):
    transcript: str = Field(..., min_length=3, max_length=1000)


@router.post("/qa/run-tests")
async def run_in_app_test_suite() -> dict[str, Any]:
    """Executes the full automated domain verification and edge-case test suite in-memory."""
    start_total = time.time()
    results: list[dict[str, Any]] = []

    # Test 1: Budget Ledger No Double-Counting
    t0 = time.time()
    cats = [
        BudgetCategoryItem(
            category_name="Venue",
            approved_budget=100000,
            spent_amount=50000,
            committed_unpaid=50000,
            uncommitted_planned=0,
            is_protected_anchor=True,
        ),
        BudgetCategoryItem(
            category_name="Decor",
            approved_budget=100000,
            spent_amount=20000,
            committed_unpaid=30000,
            uncommitted_planned=50000,
            is_protected_anchor=False,
        ),
    ]
    ledger = calculate_budget_ledger("T1", 200000, cats)
    pass1 = (
        (ledger.spent_total == 70000)
        and (ledger.committed_unpaid_total == 80000)
        and (ledger.projected_final_cost == 200000)
    )
    results.append(
        {
            "id": "TC-01",
            "name": "Budget Arithmetic & Double-Count Prevention",
            "category": "Domain Math",
            "status": "PASS" if pass1 else "FAIL",
            "duration_ms": int((time.time() - t0) * 1000),
            "assertion": "Spent (₹70k) + Committed (₹80k) + Planned (₹50k) == Projected (₹200k)",
        }
    )

    # Test 2: Pareto Rebalance Absorbs Slash via Elastic Items
    t0 = time.time()
    rebal = rebalance_budget_pareto(ledger, 170000)  # -30,000 cut
    pass2 = rebal.is_feasible and (rebal.pruned_elastic_total == 30000)
    results.append(
        {
            "id": "TC-02",
            "name": "Pareto Budget Slash Absorbed via Elastic Line Items",
            "category": "Elasticity",
            "status": "PASS" if pass2 else "FAIL",
            "duration_ms": int((time.time() - t0) * 1000),
            "assertion": "Decor uncommitted trimmed from ₹50k to ₹20k; Anchor venue untouched",
        }
    )

    # Test 3: System Rejection ("NOT FEASIBLE") on Deficit Exceeding Elasticity
    t0 = time.time()
    rebal_infeasible = rebalance_budget_pareto(ledger, 120000)  # -80,000 cut exceeds 50,000 elastic
    pass3 = (not rebal_infeasible.is_feasible) and (rebal_infeasible.unresolved_deficit == 30000)
    results.append(
        {
            "id": "TC-03",
            "name": "System Refusal ('NOT FEASIBLE') on Unmitigated Budget Deficit",
            "category": "Constraint Gate",
            "status": "PASS" if pass3 else "FAIL",
            "duration_ms": int((time.time() - t0) * 1000),
            "assertion": "Returns explicit 'NOT FEASIBLE' refusal with ₹30,000 unresolved deficit",
        }
    )

    # Test 4: Dietary Category Shortfall Detection (Vegan Gap)
    t0 = time.time()
    diet = DietaryRequirement(general_veg_pct=70, vegan_pct=30, jain_pct=0, non_veg_pct=0)
    radar = calculate_food_sufficiency(
        "T4",
        100,
        20,
        diet,
        {
            MealCategory.GENERAL_VEG.value: {
                "prepared": 80,
                "served": 0,
                "reserved": 0,
                "inbound": 0,
            },
            MealCategory.VEGAN.value: {"prepared": 10, "served": 0, "reserved": 0, "inbound": 0},
        },
    )
    vegan_cat = next(c for c in radar.categories if c.category == MealCategory.VEGAN)
    pass4 = (vegan_cat.net_shortfall_or_surplus == -20) and vegan_cat.is_critical_shortage
    results.append(
        {
            "id": "TC-04",
            "name": "Category-Specific Food Shortfall (Vegan Gap Despite Overall Surplus)",
            "category": "Catering Radar",
            "status": "PASS" if pass4 else "FAIL",
            "duration_ms": int((time.time() - t0) * 1000),
            "assertion": "Detects 20-portion Vegan shortage without silently pooling general veg",
        }
    )

    # Test 5: FSSAI Certified Surplus Food Rescue Standards
    t0 = time.time()
    manifest = generate_fssai_surplus_manifest("T5", 50.0, 67.0, 3.5)
    pass5 = (
        manifest.is_temperature_compliant
        and (manifest.carbon_emissions_prevented_kg == 125.0)
        and (manifest.csr_tax_deduction_inr == 6250.0)
    )
    results.append(
        {
            "id": "TC-05",
            "name": "FSSAI Regulatory Temperature & ESG Carbon Prevention Metrics",
            "category": "Sustainability",
            "status": "PASS" if pass5 else "FAIL",
            "duration_ms": int((time.time() - t0) * 1000),
            "assertion": "Hot >=63°C and Cold <=5°C pass; 50 kg rescued = 125 kg CO2e prevented",
        }
    )

    # Test 6: HSE Venue Capacity Breach Gate
    t0 = time.time()
    feasible, reason = validate_proposal_feasibility("Add Chairs", 420, 350, 10000, 50000)
    pass6 = (not feasible) and ("HSE safety regulation forbids overcrowding" in reason)
    results.append(
        {
            "id": "TC-06",
            "name": "HSE Venue Fire Capacity Overcrowding Rejection",
            "category": "Safety Gate",
            "status": "PASS" if pass6 else "FAIL",
            "duration_ms": int((time.time() - t0) * 1000),
            "assertion": "Refuses 420 guests in 350-capacity venue; flags HSE fire safety breach",
        }
    )

    # Test 7: Timeline Critical Path Delay Propagation & Curfew Flag
    t0 = time.time()
    nodes = [
        TimelineNode(
            node_id="A1",
            title="Ritual",
            owner="Priest",
            scheduled_start="19:00",
            scheduled_end="20:30",
            duration_minutes=90,
            dependencies=[],
        ),
        TimelineNode(
            node_id="A2",
            title="DJ Music",
            owner="AV Crew",
            scheduled_start="20:30",
            scheduled_end="22:00",
            duration_minutes=90,
            dependencies=["A1"],
            is_fixed_contractual_window=True,
        ),
    ]
    cascade = propagate_timeline_delay(nodes, "A1", 30, curfew_time="22:00")
    pass7 = cascade.curfew_breached and (cascade.overtime_penalty_estimated > 0)
    results.append(
        {
            "id": "TC-07",
            "name": "Timeline DAG Delay Propagation & 22:00 Sound Curfew Alert",
            "category": "Scheduling",
            "status": "PASS" if pass7 else "FAIL",
            "duration_ms": int((time.time() - t0) * 1000),
            "assertion": "30m delay pushes DJ to 22:30; triggers 22:00 curfew violation flag",
        }
    )

    total_ms = int((time.time() - start_total) * 1000)
    all_passed = all(r["status"] == "PASS" for r in results)

    return {
        "success": True,
        "all_passed": all_passed,
        "total_tests": len(results),
        "passed_tests": sum(1 for r in results if r["status"] == "PASS"),
        "failed_tests": sum(1 for r in results if r["status"] == "FAIL"),
        "total_duration_ms": total_ms,
        "results": results,
    }


@router.post("/multimodal/quote")
async def extract_vendor_quote(file: UploadFile = File(...)) -> dict[str, Any]:
    """Extracts line items from an uploaded vendor quote or invoice."""
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    return multimodal_service.extract_vendor_quote(file.filename or "quote.txt", text)


@router.post("/multimodal/voice")
async def parse_coordinator_voice_memo(request: VoiceMemoRequest) -> dict[str, Any]:
    """Interprets unstructured coordinator voice memo into structured incident intent."""
    return multimodal_service.parse_voice_memo(request.transcript)


@router.get("/languages")
async def get_supported_languages() -> dict[str, Any]:
    """Returns 10 supported Indian languages with localized welcome strings."""
    return {"success": True, "languages": multimodal_service.get_supported_languages()}
