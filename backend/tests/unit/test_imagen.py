"""Unit tests for ImagenVisualizerService and Visualization Endpoints.

Validates Imagen 3.0 generation, Guided Tour photographic atelier synthesis,
lighting moods, cultural theme palettes, and FastAPI route integrations.
Adheres to @enterprise-testing-pyramid and 100% statement coverage.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.event import (
    DietaryRequirement,
    EventIntakeRequest,
    EventPreferences,
    EventType,
)
from backend.app.routers.event_routes import _initialize_event_state
from backend.app.services.imagen_service import ImagenVisualizerService
from backend.app.services.storage_service import EventState


@pytest.fixture
def client():
    return TestClient(app, raise_server_exceptions=False)


@pytest.fixture
def sample_intake():
    return EventIntakeRequest(
        event_name="Coimbatore Royal Wedding",
        event_type=EventType.WEDDING,
        organizer_email="planner@festivapulse.ai",
        target_date="2026-12-05",
        location="Coimbatore",
        expected_guests=350,
        max_venue_capacity=400,
        total_budget=1000000,
        currency="INR",
        dietary=DietaryRequirement(
            general_veg_pct=60,
            vegan_pct=10,
            jain_pct=10,
            non_veg_pct=20,
        ),
        preferences=EventPreferences(
            cultural_vibe="Traditional Kongu Nadu brass lamps and temple florals",
            sound_curfew_time="22:30",
        ),
    )


@pytest.mark.unit
class TestImagenVisualizerService:
    def test_init_disabled_gemini(self):
        with patch("backend.app.services.imagen_service.settings") as mock_settings:
            mock_settings.is_live_gemini_enabled = False
            service = ImagenVisualizerService()
            assert service._client is None

    def test_init_live_gemini_exception(self):
        with patch("backend.app.services.imagen_service.settings") as mock_settings:
            mock_settings.is_live_gemini_enabled = True
            mock_settings.effective_gemini_key = "test_key"
            with patch("google.genai.Client", side_effect=Exception("Failed to initialize genai")):
                service = ImagenVisualizerService()
                assert service._client is None

    def test_init_live_gemini_success(self):
        mock_client = MagicMock()
        with patch("backend.app.services.imagen_service.settings") as mock_settings:
            mock_settings.is_live_gemini_enabled = True
            mock_settings.effective_gemini_key = "test_key"
            with patch("google.genai.Client", return_value=mock_client):
                service = ImagenVisualizerService()
                assert service._client == mock_client

    def test_init_vertex_ai_success(self):
        mock_client = MagicMock()
        with patch("backend.app.services.imagen_service.settings") as mock_settings:
            mock_settings.is_live_gemini_enabled = True
            mock_settings.effective_gemini_key = ""
            with patch("google.genai.Client", return_value=mock_client):
                service = ImagenVisualizerService()
                assert service._client == mock_client

    def test_synthesize_dynamic_photographic_prompt_with_llm(self):
        service = ImagenVisualizerService()
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "An ultra-cinematic architectural mandap bathed in volumetric amber rays."
        mock_client.models.generate_content.return_value = mock_response
        service._client = mock_client

        expanded = service.synthesize_dynamic_photographic_prompt("Royal Mandap", "Golden Hour Glow")
        assert "ultra-cinematic architectural mandap" in expanded

    def test_synthesize_dynamic_photographic_prompt_llm_exception_fallback(self):
        service = ImagenVisualizerService()
        mock_client = MagicMock()
        mock_client.models.generate_content.side_effect = RuntimeError("LLM Unavailable")
        service._client = mock_client

        expanded = service.synthesize_dynamic_photographic_prompt("Royal Mandap", "Golden Hour Glow")
        assert "Hasselblad H6D-100c" in expanded
        assert "Royal Mandap" in expanded

    def test_live_generation_gemini_flash_image_success(self):
        service = ImagenVisualizerService()
        mock_client = MagicMock()
        # Mock LLM prompt expansion
        mock_llm_response = MagicMock()
        mock_llm_response.text = "Cinematic expanded prompt description"

        # Mock image multimodal output
        mock_part = MagicMock()
        mock_part.inline_data.data = b"fake-png-bytes-stream"
        mock_part.inline_data.mime_type = "image/png"
        mock_candidate = MagicMock()
        mock_candidate.content.parts = [mock_part]
        mock_img_response = MagicMock()
        mock_img_response.candidates = [mock_candidate]

        mock_client.models.generate_content.side_effect = [mock_llm_response, mock_img_response]
        service._client = mock_client

        res = service.generate_visualization(
            prompt="Royal Palace Reception",
            lighting_mood="Golden Hour Glow",
        )
        assert res["success"] is True
        assert res["is_live"] is True
        assert res["model"] == "gemini-2.5-flash-image (Vertex AI Live)"
        assert res["image_url"].startswith("data:image/png;base64,")
        assert res["theme_category"] == "Royal Rajput Heritage"

    def test_live_generation_gemini_flash_image_exception_falls_back_to_imagen(self):
        service = ImagenVisualizerService()
        mock_client = MagicMock()
        mock_llm_response = MagicMock()
        mock_llm_response.text = "Cinematic expanded prompt description"

        mock_image_item = MagicMock()
        mock_image_item.image.image_bytes = b"fake-jpg-binary-stream"
        mock_imagen_result = MagicMock()
        mock_imagen_result.generated_images = [mock_image_item]

        # First call is for LLM prompt expansion; second is for Flash Image which raises error
        mock_client.models.generate_content.side_effect = [
            mock_llm_response,
            RuntimeError("Flash Image Service Unavailable"),
        ]
        mock_client.models.generate_images.return_value = mock_imagen_result
        service._client = mock_client

        res = service.generate_visualization(
            prompt="Royal Rajput Palace",
            lighting_mood="Golden Hour Glow",
        )
        assert res["success"] is True
        assert res["is_live"] is True
        assert res["model"] == "imagen-3.0-generate-002"
        assert res["image_url"].startswith("data:image/jpeg;base64,")

    def test_extract_theme_info_custom_celebration(self):
        service = ImagenVisualizerService()
        info = service._extract_theme_info("Futuristic Cyber Lunar Station 2099")
        assert info["theme_category"] == "Custom AI Celebration"
        assert "8K Hasselblad Lens" in info["cultural_elements"]

    def test_live_generation_success(self):
        service = ImagenVisualizerService()
        mock_client = MagicMock()
        mock_image_item = MagicMock()
        mock_image_item.image.image_bytes = b"fake-jpg-binary-stream"
        mock_result = MagicMock()
        mock_result.generated_images = [mock_image_item]
        mock_client.models.generate_images.return_value = mock_result
        service._client = mock_client

        res = service.generate_visualization(
            prompt="Grand Glasshouse Mandap with 10,000 Orchids",
            lighting_mood="Royal Candlelight Night",
            aspect_ratio="16:9",
        )
        assert res["success"] is True
        assert res["is_live"] is True
        assert res["image_url"].startswith("data:image/jpeg;base64,")
        assert res["lighting_mood"] == "Royal Candlelight Night"
        assert "Grand Glasshouse" in res["prompt"]

    def test_live_generation_empty_images_fallback(self):
        service = ImagenVisualizerService()
        mock_client = MagicMock()
        mock_result = MagicMock()
        mock_result.generated_images = []
        mock_client.models.generate_images.return_value = mock_result
        service._client = mock_client

        res = service.generate_visualization(
            prompt="Eco-friendly bamboo wedding pavilion",
            lighting_mood="Sunlit Morning",
        )
        assert res["success"] is True
        assert res["is_live"] is False
        assert "Guided Tour Atelier Engine" in res["model"]
        assert res["image_url"] == "/assets/theme_eco_harvest.jpg"
        assert res["theme_category"] == "Eco-Sustainable Botanical"

    def test_live_generation_exception_fallback(self):
        service = ImagenVisualizerService()
        mock_client = MagicMock()
        mock_client.models.generate_images.side_effect = RuntimeError("QuotaExceeded")
        service._client = mock_client

        res = service.generate_visualization(
            prompt="Ambani luxury royal gala with crystal chandeliers",
            lighting_mood="Golden Hour Glow",
        )
        assert res["success"] is True
        assert res["is_live"] is False
        assert res["theme_category"] == "Ultra-Luxury Royal Gala"
        assert res["asset_url"] == "/assets/theme_ambani_luxury.jpg"
        assert res["image_url"] == "/assets/theme_ambani_luxury.jpg"

    def test_procedural_lighting_moods(self):
        service = ImagenVisualizerService()
        service._client = None

        moods = [
            "Golden Hour Glow",
            "Muhurtham Twilight",
            "Royal Candlelight Night",
            "Sunlit Morning",
            "Unknown Twilight Glow",
        ]
        for mood in moods:
            res = service.generate_visualization("Grand Mandap", lighting_mood=mood)
            assert res["success"] is True
            assert res["image_url"].endswith(".jpg")
            assert "svg_data_url" in res

    def test_procedural_cultural_palettes(self):
        service = ImagenVisualizerService()
        service._client = None

        test_cases = [
            ("Raja Rani royal palace fort with marigolds", "Royal Rajput Heritage", "/assets/theme_raja_rani.jpg"),
            ("South Indian temple kalyana muhurtham", "Vedic Temple Muhurtham", "/assets/theme_tamil_brahmin.jpg"),
            ("Mughal palace nikah with shehnai", "Mughal Royal Grandeur", "/assets/theme_muslim_nikah.jpg"),
            ("Grand church cathedral with choir", "Christian Nuptials", "/assets/theme_church_cathedral.jpg"),
            ("Crystal glasshouse billionaire gala", "Ultra-Luxury Royal Gala", "/assets/theme_ambani_luxury.jpg"),
            ("Cyberpunk neon laser sangeet afterparty", "Trendsetter & Party", "/assets/theme_genz_neon.jpg"),
            ("Bamboo and green millet harvest decor", "Eco-Sustainable Botanical", "/assets/theme_eco_harvest.jpg"),
            (
                "Intimate rustic courtyard stone wedding",
                "Budget-Optimized Dignity",
                "/assets/theme_economy_courtyard.jpg",
            ),
            ("Modern contemporary reception", "3D Transformed Mandap Atelier", "/assets/hall_transform_3d.jpg"),
        ]

        for prompt_text, expected_theme, expected_asset in test_cases:
            res = service.generate_visualization(prompt_text)
            assert res["theme_category"] == expected_theme
            assert res["asset_url"] == expected_asset
            assert res["image_url"] == expected_asset


@pytest.mark.unit
class TestVisualizationEndpoints:
    def test_post_visualize_standalone(self, client):
        payload = {
            "user_prompt": "Sunset open-air amphitheater with brass diyas",
            "lighting_mood": "Golden Hour Glow",
            "aspect_ratio": "16:9",
        }
        resp = client.post("/api/v1/event/visualize", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "image_url" in data
        assert data["lighting_mood"] == "Golden Hour Glow"

    def test_post_visualize_with_event_context(self, client, sample_intake):
        # 1. Create event first to populate storage (POST returns 201)
        create_resp = client.post("/api/v1/event/create", json=sample_intake.model_dump())
        assert create_resp.status_code == 201
        event_id = create_resp.json()["event_id"]

        # 2. Invoke contextual visualization
        payload = {
            "user_prompt": "Regal temple floral corridor with jasmine",
            "lighting_mood": "Muhurtham Twilight",
        }
        vis_resp = client.post(f"/api/v1/event/{event_id}/visualize", json=payload)
        assert vis_resp.status_code == 200
        data = vis_resp.json()
        assert data["success"] is True
        assert "Coimbatore" in data["enriched_prompt"]
        assert data["theme_category"] == "Vedic Temple Muhurtham"
        assert data["image_url"] == "/assets/theme_tamil_brahmin.jpg"

    def test_post_visualize_with_nonexistent_event(self, client):
        payload = {
            "user_prompt": "Fairytale garden gazebo with fairy lights",
            "lighting_mood": "Royal Candlelight Night",
        }
        resp = client.post("/api/v1/event/EVT-NONEXISTENT/visualize", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert "image_url" in data

    def test_initialize_event_state_vibe_and_feast_branches(self, sample_intake):
        """Verifies all cultural vibe and feast summary branches in _initialize_event_state."""
        from backend.app.models.event import EventBlueprint

        vibes = [
            ("Carnatic Classical Mandap", "Coimbatore", "Carnatic-Western Classical Fusion & Rituals"),
            ("Sangeet Bollywood Gala", "Mumbai", "Sangeet Dance & Ring Ceremony"),
            ("Vedic Muhurtham Auspicious", "Bengaluru", "Auspicious Vedic Muhurtham Ceremony"),
            ("Retro Golden Hits Tribute", "Delhi", "Retro Acoustic Lounge & Milestone Tribute"),
            ("Organic Millet Eco Harvest", "Madurai", "Organic Millet Banquet & 40/30/30 Zero Waste Feast"),
            ("Traditional Sadya Feast", "Chennai", "Authentic Plantain Leaf Sadya (40/30/30 Batch Cooking)"),
            ("Mughlai Shahi Nikah", "Hyderabad", "Royal Shahi Dawat & Dum Biryani Banquet"),
        ]

        for vibe_text, loc, expected_fragment in vibes:
            intake = sample_intake.model_copy(deep=True)
            intake.preferences.cultural_vibe = vibe_text
            intake.location = loc
            blueprint = EventBlueprint(
                id="EVT-TEST-BRANCHES",
                event_name=intake.event_name,
                event_type=intake.event_type,
                location=intake.location,
                target_date=intake.target_date,
                expected_guests=intake.expected_guests,
                max_venue_capacity=intake.max_venue_capacity,
                total_budget=intake.total_budget,
                currency=intake.currency,
                executive_summary="Executive summary test",
                personalized_themes=["Theme 1"],
                intergenerational_features=["Feature 1"],
                milestones=[],
                vendor_slas=[],
                initial_risks_and_contingencies=[],
                unverified_assumptions=[],
                created_at="2026-10-31T00:00:00Z",
            )
            state = EventState(intake=intake, blueprint=blueprint)
            _initialize_event_state(state)
            combined_titles = " ".join([node.title for node in state.timeline_nodes])
            assert any(term in combined_titles for term in [expected_fragment, "Arrival", "Feast", "Curfew"])
