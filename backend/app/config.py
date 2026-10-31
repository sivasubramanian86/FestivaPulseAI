"""Configuration settings for FestivaPulseAI.

Adheres to @10_security_governance.
"""

import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GEMINI_API_KEY: str = "demo_mode_key"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    IMAGEN_MODEL: str = "imagen-3.0-generate-002"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000,"
        "https://festivapulseai.web.app,https://festivapulseai.firebaseapp.com,"
        "https://genai-apac-2026-491004.web.app,https://genai-apac-2026-491004.firebaseapp.com"
    )
    DATABASE_PATH: str = "festivapulse.db"
    DEMO_MODE: bool = True

    # Google Cloud & Enterprise Integrations
    GCP_PROJECT_ID: str = "festivapulse-prod-2026"
    GCP_REGION: str = "asia-south1"
    ENABLE_FIRESTORE: bool = False
    FIRESTORE_DATABASE: str = "(default)"
    ENABLE_PUBSUB: bool = False
    PUBSUB_TELEMETRY_TOPIC: str = "festivapulse-live-telemetry"
    PUBSUB_CHAOS_TOPIC: str = "festivapulse-chaos-events"
    ENABLE_CLOUD_MONITORING: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def effective_gemini_key(self) -> str:
        """Resolves active Gemini key from settings or OS environment."""
        if self.GEMINI_API_KEY and self.GEMINI_API_KEY not in ("demo_mode_key", "your_gemini_api_key_here"):
            return self.GEMINI_API_KEY.strip()
        os_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if os_key and os_key.strip() not in ("demo_mode_key", "your_gemini_api_key_here"):
            return os_key.strip()
        return self.GEMINI_API_KEY.strip()

    @property
    def is_live_gemini_enabled(self) -> bool:
        """Checks if a valid Gemini API key is active for live Google ADK calls."""
        key = self.effective_gemini_key
        return bool(key and key not in ("demo_mode_key", "your_gemini_api_key_here"))

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return origins if origins else ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
