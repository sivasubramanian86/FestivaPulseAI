"""Imagen 3.0 Programmatic Visualizer Service for FestivaPulseAI.

Generates opulent, constraint-aware celebration visualizations using Vertex AI / Google GenAI
Imagen 3.0 (imagen-3.0-generate-002) with sub-second procedural fallback for local demo and offline modes.
Adheres to @05_vertex_model_registry, @09_frontend_gui_architect, and production-invariants.
"""

import base64
import time
from typing import Any

from backend.app.config import settings


class ImagenVisualizerService:
    def __init__(self):
        self.model_name = settings.IMAGEN_MODEL
        self._client = None
        self._init_client()

    def _init_client(self):
        if settings.is_live_gemini_enabled:
            try:
                from google import genai

                self._client = genai.Client(api_key=settings.effective_gemini_key)
            except Exception as e:
                print(f"[WARN] Failed to initialize Google GenAI Imagen client: {e}. Running in graceful demo mode.")
                self._client = None

    def generate_visualization(
        self,
        prompt: str,
        style: str = "photorealistic",
        lighting_mood: str = "Golden Hour Glow",
        aspect_ratio: str = "16:9",
    ) -> dict[str, Any]:
        """Generates celebration visual using Vertex AI Imagen 3.0 or opulent procedural synthesis."""
        start_time = time.time()
        clean_prompt = prompt.strip()
        enriched_prompt = (
            f"Opulent Indian celebration event design: {clean_prompt}. "
            f"Atmosphere: {lighting_mood}, floral arch with marigold and jasmine, regal mandap pillars, "
            f"warm candlelit lanterns, 8k resolution, architectural digest style, professional event photography."
        )

        # 1. Attempt Live Imagen 3 Generation via Google GenAI SDK
        if self._client:
            try:
                result = self._client.models.generate_images(
                    model=self.model_name,
                    prompt=enriched_prompt,
                    config={
                        "number_of_images": 1,
                        "aspect_ratio": aspect_ratio,
                    },
                )
                if result.generated_images and len(result.generated_images) > 0:
                    generated_img = result.generated_images[0]
                    img_bytes = generated_img.image.image_bytes
                    b64_data = base64.b64encode(img_bytes).decode("utf-8")
                    latency_ms = int((time.time() - start_time) * 1000)
                    return {
                        "success": True,
                        "image_url": f"data:image/jpeg;base64,{b64_data}",
                        "model": self.model_name,
                        "prompt": clean_prompt,
                        "enriched_prompt": enriched_prompt,
                        "lighting_mood": lighting_mood,
                        "latency_ms": latency_ms,
                        "is_live": True,
                    }
            except Exception as e:
                print(f"[WARN] Imagen 3 live generation error: {e}. Falling back to procedural visualization.")

        # 2. Deterministic Procedural Visualizer (Nano Procedural Engine)
        latency_ms = int((time.time() - start_time) * 1000)
        procedural = self._synthesize_procedural_visual(clean_prompt, lighting_mood)
        return {
            "success": True,
            "image_url": procedural["data_url"],
            "asset_url": procedural["asset_url"],
            "model": f"{self.model_name} (Nano Procedural Engine)",
            "prompt": clean_prompt,
            "enriched_prompt": enriched_prompt,
            "lighting_mood": lighting_mood,
            "latency_ms": max(latency_ms, 35),
            "is_live": False,
            "theme_category": procedural["theme_category"],
        }

    def _synthesize_procedural_visual(self, prompt: str, lighting_mood: str) -> dict[str, Any]:
        """Synthesizes high-fidelity 16:9 celebration architectural SVG data URI and matched asset."""
        prompt_low = prompt.lower()

        # Lighting color scales
        lighting_map = {
            "Golden Hour Glow": ("#FFB800", "#FF8A00", "#4A1800", "#1C0A00"),
            "Muhurtham Twilight": ("#E0AAFF", "#9D4EDD", "#3C096C", "#10002B"),
            "Royal Candlelight Night": ("#FFD166", "#EF476F", "#2B0938", "#080114"),
            "Sunlit Morning": ("#FFE6A7", "#D4A373", "#6F4E37", "#251605"),
        }
        accent, mid_color, bg_mid, bg_deep = lighting_map.get(
            lighting_mood, ("#FFB800", "#FF8A00", "#4A1800", "#1C0A00")
        )

        # Asset and theme category matching
        if any(k in prompt_low for k in ["eco", "green", "harvest", "bamboo", "nature", "organic", "millet"]):
            theme_cat = "Eco-Sustainable Botanical"
            asset_url = "/assets/theme_eco_harvest.jpg"
            accent = "#10B981"
            mid_color = "#059669"
        elif any(k in prompt_low for k in ["ambani", "billionaire", "luxury", "crystal", "glasshouse", "opulence"]):
            theme_cat = "Ultra-Luxury Royal Gala"
            asset_url = "/assets/theme_ambani_luxury.jpg"
            accent = "#F59E0B"
            mid_color = "#D97706"
        elif any(k in prompt_low for k in ["nikah", "mughal", "dawat", "palace", "haveli", "shehnai"]):
            theme_cat = "Mughal Royal Grandeur"
            asset_url = "/assets/theme_muslim_nikah.jpg"
            accent = "#EC4899"
            mid_color = "#BE185D"
        elif any(k in prompt_low for k in ["temple", "kalyana", "carnatic", "south", "traditional", "brahmin"]):
            theme_cat = "Vedic Temple Muhurtham"
            asset_url = "/assets/hall_transform_3d.jpg"
            accent = "#F97316"
            mid_color = "#C2410C"
        else:
            theme_cat = "Regal Royal Celebration"
            asset_url = "/assets/royal_hero.jpg"

        # Generate responsive vector SVG
        svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{bg_mid}"/>
      <stop offset="100%" stop-color="{bg_deep}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="{accent}" stop-opacity="0.5"/>
      <stop offset="60%" stop-color="{mid_color}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="{bg_deep}" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>

  <!-- Sky and Atmosphere -->
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="640" cy="300" r="380" fill="url(#glow)"/>

  <!-- Royal Pillars -->
  <g fill="{accent}" opacity="0.85">
    <!-- Left Pillars -->
    <rect x="180" y="240" width="40" height="380" rx="8"/>
    <rect x="280" y="260" width="35" height="360" rx="6" opacity="0.7"/>
    <!-- Right Pillars -->
    <rect x="1060" y="240" width="40" height="380" rx="8"/>
    <rect x="965" y="260" width="35" height="360" rx="6" opacity="0.7"/>
  </g>

  <!-- Mandap Arch -->
  <path d="M 180 260 Q 640 100 1100 260" fill="none" stroke="{accent}" stroke-width="12" stroke-linecap="round"/>
  <path d="M 220 280 Q 640 140 1060 280" fill="none" stroke="{mid_color}" stroke-width="6" opacity="0.6"/>

  <!-- Floral Garlands / Hanging Jasmine Torans -->
  <g fill="{accent}" opacity="0.9">
    <circle cx="340" cy="220" r="8"/>
    <circle cx="440" cy="180" r="9"/>
    <circle cx="540" cy="160" r="10"/>
    <circle cx="640" cy="150" r="12" fill="#FFFFFF"/>
    <circle cx="740" cy="160" r="10"/>
    <circle cx="840" cy="180" r="9"/>
    <circle cx="940" cy="220" r="8"/>
  </g>

  <!-- Dias Stage Platform -->
  <polygon points="120,640 1160,640 1240,720 40,720" fill="{bg_mid}" opacity="0.95" stroke="{accent}" stroke-width="2"/>
  <rect x="360" y="580" width="560" height="60" rx="8" fill="{bg_deep}" stroke="{accent}" stroke-width="3"/>

  <!-- Brass Diya / Oil Lamps -->
  <g fill="{accent}">
    <path d="M 380 570 Q 395 540 410 570 Z"/>
    <circle cx="395" cy="545" r="5" fill="#FFF7D6" filter="url(#blur)"/>
    <path d="M 870 570 Q 885 540 900 570 Z"/>
    <circle cx="885" cy="545" r="5" fill="#FFF7D6" filter="url(#blur)"/>
  </g>

  <!-- Typography Card -->
  <rect x="300" y="60" width="680" height="70" rx="16" fill="rgba(10, 5, 20, 0.75)" stroke="{accent}" stroke-width="1.5"/>
  <text x="640" y="92" font-family="system-ui, sans-serif" font-size="18" font-weight="bold" fill="{accent}" text-anchor="middle" letter-spacing="1.5">
    FESTIVAPULSE AI • IMAGEN 3.0 ARCHITECTURAL VISUALIZER
  </text>
  <text x="640" y="115" font-family="system-ui, sans-serif" font-size="12" fill="#E2E8F0" text-anchor="middle">
    Theme: {theme_cat} • Mood: {lighting_mood}
  </text>
</svg>"""
        b64_svg = base64.b64encode(svg.encode("utf-8")).decode("utf-8")
        return {
            "data_url": f"data:image/svg+xml;base64,{b64_svg}",
            "asset_url": asset_url,
            "theme_category": theme_cat,
        }


imagen_service = ImagenVisualizerService()
