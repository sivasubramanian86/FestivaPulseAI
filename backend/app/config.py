"""Configuration settings for FestivaPulseAI.

Adheres to @10_security_governance.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    GEMINI_API_KEY: str = "demo_mode_key"
    GEMINI_MODEL: str = "gemini-2.5-flash"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "127.0.0.1"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
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
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return origins if origins else ["http://localhost:5173", "http://127.0.0.1:5173"]


settings = Settings()
