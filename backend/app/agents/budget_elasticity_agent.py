"""Budget Elasticity ADK Specialist Agent for FestivaPulseAI.

Specializes in Pareto frontier rebalancing, protecting anchor priorities,
and pruning elastic line items during budget shocks.
Adheres to @02_system_architect and @19_cost_efficiency_architect.
"""

from typing import Any

from backend.app.agents.base import ADKTask, FestivaAgent
from backend.app.core.engine import rebalance_budget_pareto


class BudgetElasticityAgent(FestivaAgent):
    def __init__(self):
        super().__init__(
            name="BudgetElasticityAgent",
            role="Financial Elasticity & Pareto Re-Optimizer",
            instruction=(
                "Apply Pareto frontier optimization during budget cuts or expansions. "
                "Lock non-negotiable anchors (core catering, security, accessibility) and dynamically "
                "prune elastic line items (decor upgrades, extra photography, optional gifts). "
                "Explicitly refuse deficits that exceed all uncommitted funds."
            ),
            model_name="gemini-2.5-flash",
        )

    async def _run_logic(self, task: ADKTask, context: dict[str, Any]) -> dict[str, Any]:
        ledger = context.get("ledger")
        revised_budget = context.get("revised_budget", 0)

        if not ledger or revised_budget <= 0:
            return {"error": "Missing ledger or revised budget for rebalancing"}

        rebalance = rebalance_budget_pareto(ledger, revised_budget)

        return {
            "is_feasible": rebalance.is_feasible,
            "budget_delta": rebalance.budget_delta,
            "protected_anchor_total": rebalance.protected_anchor_total,
            "pruned_elastic_total": rebalance.pruned_elastic_total,
            "rationale": rebalance.rationale,
            "unresolved_deficit": rebalance.unresolved_deficit,
            "rebalanced_categories": [c.model_dump() for c in rebalance.rebalanced_categories],
        }
