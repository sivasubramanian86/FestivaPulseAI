"""Spatial & Crowd ADK Specialist Agent for FestivaPulseAI.

Specializes in crowd flex, seating reallocations, and HSE capacity compliance gates.
Adheres to @02_system_architect and @10_security_governance.
"""

from typing import Any

from backend.app.agents.base import ADKTask, FestivaAgent
from backend.app.agents.mcp_tools import venue_hse_capacity_lookup


class SpatialCrowdAgent(FestivaAgent):
    """Specialist agent auditing crowd density, fire safety egress, and venue capacity constraints."""

    def __init__(self) -> None:
        """Initialize SpatialCrowdAgent with municipal HSE capacity lookup tools."""
        super().__init__(
            name="SpatialCrowdAgent",
            role="Crowd Logistics & HSE Capacity Guardian",
            instruction=(
                "Evaluate spatial density and egress logistics under crowd surges or dropouts. "
                "Enforce strict HSE fire marshal capacity limits; refuse impossible overcrowding requests."
            ),
            model_name="gemini-2.5-flash",
        )
        self.register_tool(venue_hse_capacity_lookup)

    async def _run_logic(self, task: ADKTask, context: dict[str, Any]) -> dict[str, Any]:
        """Evaluates spatial crowd logistics against HSE safety and egress thresholds."""
        values = context.get("values", {})
        new_guests = values.get("new_guests", 250)
        max_capacity = context.get("max_capacity", 350)
        venue_type = context.get("venue_type", "Banquet Hall")

        # HSE capacity verification
        hse_eval = venue_hse_capacity_lookup(venue_type, new_guests, max_capacity)

        if hse_eval["is_breach"]:
            return {
                "is_feasible": False,
                "refusal_reason": (
                    f"NOT FEASIBLE: Requested attendance ({new_guests}) exceeds authorized venue fire capacity ({max_capacity}). "
                    "HSE crowd safety regulations prohibit physical overcrowding."
                ),
                "hse_metrics": hse_eval,
                "mitigation_options": [
                    "Erect temporary outdoor awning/marquee for overflow guests with live AV projection",
                    "Lease adjacent Hall B to legally expand authorized footprint",
                    "Implement staggered 2-wave dining shifts",
                ],
            }

        return {
            "is_feasible": True,
            "occupancy_rate_pct": hse_eval["occupancy_rate_pct"],
            "additional_chairs_needed": max(0, new_guests - context.get("expected_guests", 250)),
            "recommended_actions": [
                f"Deploy {max(0, new_guests - context.get('expected_guests', 250))} buffer chairs to Zone B",
                "Reposition valet parking attendants to south gate to absorb arrival velocity",
                "Activate secondary egress door for smooth guest dispersal",
            ],
            "hse_metrics": hse_eval,
        }
