"""FestivaFoodGuard ADK Specialist Agent.

Specializes in category-level food sufficiency, real-time burn-rate tracking,
15-minute kitchen batch-stretching recipe synthesis, and FSSAI surplus certification.
Adheres to @12_rag_vectordb_architect and @04_responsible_ai_ethics.
"""

from typing import Any

from backend.app.agents.base import ADKTask, FestivaAgent
from backend.app.agents.mcp_tools import ngo_registry_lookup, pantry_rag_search
from backend.app.core.engine import generate_fssai_surplus_manifest


class FestivaFoodGuardAgent(FestivaAgent):
    def __init__(self):
        super().__init__(
            name="FestivaFoodGuardAgent",
            role="Catering Sufficiency & Zero-Waste Architect",
            instruction=(
                "Monitor real-time catering depletion by category. Synthesize 15-minute kitchen batch-stretching "
                "substitutions using pantry stock vectors during shortages, and generate certified FSSAI "
                "surplus food recovery manifests for local NGOs during surplus."
            ),
            model_name="gemini-2.5-flash",
        )
        self.register_tool(pantry_rag_search)
        self.register_tool(ngo_registry_lookup)

    async def _run_logic(self, task: ADKTask, context: dict[str, Any]) -> dict[str, Any]:
        incident_type = context.get("incident_type", "Food Shortage")
        values = context.get("values", {})
        location = context.get("location", "Chennai")

        if "Shortage" in incident_type or values.get("shortage_count", 0) > 0:
            shortage_count = values.get("shortage_count", 40)
            category = values.get("category", "General Vegetarian")

            # Run Agentic RAG over pantry inventory
            rag_result = pantry_rag_search(f"{category} quick batch", required_portions=shortage_count)

            return {
                "triage_mode": "SCARCITY_MITIGATION",
                "shortage_count": shortage_count,
                "category": category,
                "rag_solution": rag_result,
                "action_plan": [
                    f"Deploy {rag_result['recommended_recipe']} in kitchen (Prep time: {rag_result['prep_time_minutes']} mins)",
                    f"Use {rag_result['required_raw_kg']} kg raw stock; ingredient cost approx ₹{rag_result['estimated_ingredient_cost_inr']}",
                    rag_result["instructions"],
                    "Pace appetizer refill intervals to absorb immediate live line pressure",
                ],
                "lead_time_minutes": rag_result["prep_time_minutes"],
            }
        else:
            # Surplus Mode: Generate certified FSSAI Manifest
            surplus_kg = values.get("surplus_kg", 35.0)
            hot_temp = values.get("hot_temp", 68.0)
            cold_temp = values.get("cold_temp", 4.0)

            ngo_data = ngo_registry_lookup(location)
            manifest = generate_fssai_surplus_manifest(
                event_id=context.get("event_id", "EVT-001"),
                surplus_kg=surplus_kg,
                hot_temp_celsius=hot_temp,
                cold_temp_celsius=cold_temp,
                ngo_partner=ngo_data["registered_ngo"],
            )

            return {
                "triage_mode": "SURPLUS_RECOVERY",
                "manifest": manifest.model_dump(),
                "assigned_ngo": ngo_data,
                "esg_metric": {
                    "carbon_prevented_kg": manifest.carbon_emissions_prevented_kg,
                    "csr_deduction_inr": manifest.csr_tax_deduction_inr,
                    "meals_served": int(surplus_kg * 3),
                },
            }
