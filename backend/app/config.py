from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./ai_financial_advisor.db"

    jwt_secret_key: str = "change_me_in_dev_only"
    jwt_access_token_expire_minutes: int = 60

    llm_provider: str = "dummy"
    llm_api_key: str | None = None

    backend_cors_origins: List[AnyHttpUrl] | List[str] = ["http://localhost:5173"]

    @field_validator("backend_cors_origins", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        """
        Allow BACKEND_CORS_ORIGINS to be provided either as:
        - a JSON list, e.g. '["http://localhost:5173"]'
        - a comma-separated string, e.g. 'http://localhost:5173,http://localhost:8000'
        - or already as a list
        """
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("["):
                # JSON list
                import json

                return json.loads(v)
            # Comma-separated list
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()

