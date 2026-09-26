from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "ISML Resource Platform AI Service"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    DEBUG: bool = True

    # Backend Connection
    BACKEND_API_URL: str = "http://localhost:4000/api/v1"
    BACKEND_TIMEOUT_SECONDS: float = 10.0


    # LLM Settings (Gemini Configuration)
    LLM_PROVIDER: str = "gemini"
    LLM_MODEL: str = "gemini-flash-lite-latest"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # Security & SSRF Protection
    ALLOW_PRIVATE_IPS: bool = False
    MAX_REQUEST_TIMEOUT: float = 15.0
    MAX_CONTENT_BYTES: int = 5_000_000  # 5MB max content size

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

@lru_cache()
def get_settings() -> Settings:
    return settings
