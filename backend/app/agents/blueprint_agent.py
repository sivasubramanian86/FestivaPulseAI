"""Blueprint ADK Specialist Agent for FestivaPulseAI.

Specializes in multi-generational celebration planning, cultural theme synthesis,
and vendor SLA contract definition.
"""

from typing import Any

from backend.app.agents.base import ADKTask, FestivaAgent


class BlueprintAgent(FestivaAgent):
    def __init__(self):
        super().__init__(
            name="BlueprintSpecialistAgent",
            role="Celebration Architect & Cultural Synthesizer",
            instruction=(
                "Synthesize comprehensive, culturally grounded blueprints for weddings, birthdays, "
                "and community events. Balance both families, ensure elder wheelchair accessibility, "
                "healthy living options, kids activities, and realistic vendor SLAs."
            ),
            model_name="gemini-2.5-flash",
        )

    async def _run_logic(self, task: ADKTask, context: dict[str, Any]) -> dict[str, Any]:
        intake = context.get("intake", {})
        event_name = intake.get("event_name", "Celebration")
        guests = intake.get("expected_guests", 250)
        budget = intake.get("total_budget", 500000)
        vibe = intake.get("preferences", {}).get("cultural_vibe", "Traditional Heritage")

        themes = [
            f"Concept A: {vibe} — Eco-friendly woven fabric mandap & brass lamps",
            "Concept B: Multi-Generational Harmony — Acoustic lawn courtyard with quiet elder seating",
            "Concept C: Sustainable Harvest Feast — Organic millets, jackfruit biryani & jaggery payasam",
            "Concept D: Digital Keepsake Hub — Interactive QR photo gallery eliminating paper waste",
        ]

        intergenerational = [
            "Elders: Zero-threshold wheelchair ramps, priority dining seating, and low-sugar dessert options",
            "Young Adults: Interactive live mocktail bar, acoustic fusion music, and high-speed Wi-Fi lounge",
            "Children: Supervised clay sculpting & traditional board games enclave with child-friendly menu",
        ]

        return {
            "event_name": event_name,
            "themes": themes,
            "intergenerational_features": intergenerational,
            "allocated_budget": budget,
            "expected_guests": guests,
            "summary": f"Tailored blueprint for {guests} guests at {intake.get('location', 'Venue')} balancing cultural authenticity and multi-generational comfort.",
        }
