"""Budget models and ledger contracts for FestivaPulseAI.

Enforces arithmetic rigor, preventing double counting between
spent and committed amounts, adhering to @02_system_architect.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class BudgetCategoryItem(BaseModel):
    """Line-item category budget item with protected anchor designation."""

    category_name: str  # e.g., "Venue & Logistics", "Catering & Beverages", "Decor & Flora", "Audio & Visual"
    approved_budget: int
    spent_amount: int
    committed_unpaid: int
    uncommitted_planned: int
    is_protected_anchor: bool = Field(
        default=False, description="Protected from cuts (e.g. Accessibility, Security, Core Food)"
    )
    notes: str = ""


class BudgetLedger(BaseModel):
    """Event budget ledger tracking spent, committed, and contingency balances."""

    event_id: str
    currency: str = "INR"
    approved_total: int
    spent_total: int
    committed_unpaid_total: int
    uncommitted_planned_total: int
    contingency_allocation: int
    projected_final_cost: int
    variance: int  # approved_total - projected_final_cost (Negative = Deficit)
    is_in_deficit: bool = False
    categories: list[BudgetCategoryItem]


class BudgetParetoRebalance(BaseModel):
    """Pareto optimization reallocation result following budget expansion or contraction."""

    original_budget: int
    revised_budget: int
    budget_delta: int
    protected_anchor_total: int
    pruned_elastic_total: int
    rationale: str
    rebalanced_categories: list[BudgetCategoryItem]
    is_feasible: bool
    unresolved_deficit: int = 0
