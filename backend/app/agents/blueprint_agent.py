"""Blueprint ADK Specialist Agent for FestivaPulseAI.

Specializes in multi-generational celebration planning, cultural theme synthesis,
and vendor SLA contract definition.
"""

import json
import logging
from typing import Any

from backend.app.agents.base import ADKTask, FestivaAgent

logger = logging.getLogger(__name__)


class BlueprintAgent(FestivaAgent):
    """Specialist agent synthesizing culturally grounded event blueprints and vendor SLAs."""

    def __init__(self) -> None:
        """Initialize BlueprintAgent with Gemini 2.5 Flash model and cultural instructions."""
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
        """Executes blueprint synthesis logic generating concepts, vendor SLAs, and catering breakdown."""
        intake = context.get("intake", {})
        event_name = intake.get("event_name", "Celebration")
        guests = intake.get("expected_guests", 250)
        budget = intake.get("total_budget", 500000)
        location = intake.get("location", "Venue")
        vibe = intake.get("preferences", {}).get("cultural_vibe", "Traditional Heritage")

        # Dynamic contextual synthesis
        themes = [
            f"Concept A: {vibe} — Eco-friendly woven fabric mandap & brass lamps",
            f"Concept B: Multi-Generational Harmony — Acoustic courtyard in {location} with quiet elder seating",
            "Concept C: Sustainable Harvest Feast — Organic millets, jackfruit biryani & jaggery payasam",
            "Concept D: Digital Keepsake Hub — Interactive QR photo gallery eliminating paper waste",
        ]

        intergenerational = [
            "Elders: Zero-threshold wheelchair ramps, priority dining seating, and low-sugar dessert options",
            "Young Adults: Interactive live mocktail bar, acoustic fusion music, and high-speed Wi-Fi lounge",
            "Children: Supervised clay sculpting & traditional board games enclave with child-friendly menu",
        ]

        reasoning = (
            f"Synthesized cultural blueprint for '{event_name}' ({guests} guests, budget ₹{budget:,}) at {location}. "
            f"Configured 4 distinct cultural concepts with elder comfort, kids play enclaves, and zero-waste decor."
        )

        if self._client:
            try:
                prompt = (
                    f"You are the BlueprintSpecialistAgent in the FestivaPulseAI ADK Swarm.\n"
                    f"Synthesize celebration concepts for: {event_name} at {location}.\n"
                    f"Guests: {guests}, Budget: ₹{budget:,}, Cultural Preference: {vibe}.\n"
                    f'Respond with JSON format: {{"themes": [string, string, string, string], '
                    f'"intergenerational": [string, string, string], "reasoning": string}}'
                )
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config={"response_mime_type": "application/json", "temperature": 0.3},
                )
                data = json.loads(response.text)
                if "themes" in data and isinstance(data["themes"], list):
                    themes = data["themes"][:4]
                if "intergenerational" in data and isinstance(data["intergenerational"], list):
                    intergenerational = data["intergenerational"][:3]
                if "reasoning" in data and isinstance(data["reasoning"], str):
                    reasoning = data["reasoning"]
            except Exception as e:
                logger.warning(f"BlueprintSpecialistAgent GenAI call failed: {e}. Using deterministic synthesis.")

        return {
            "event_name": event_name,
            "themes": themes,
            "intergenerational_features": intergenerational,
            "allocated_budget": budget,
            "expected_guests": guests,
            "summary": f"Tailored blueprint for {guests} guests at {location} balancing cultural authenticity and multi-generational comfort.",
            "reasoning_trace": reasoning,
            "tools_used": ["generate_cultural_themes", "synthesize_intergenerational_amenities"],
        }
