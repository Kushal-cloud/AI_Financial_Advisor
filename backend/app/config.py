from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite:///./ai_financial_advisor.db"

    jwt_secret_key: str = "change_me_in_dev_only"
    jwt_access_token_expire_minutes: int = 60

    llm_provider: str = "dummy"
    llm_api_key: str | None = None

    backend_cors_origins: List[AnyHttpUrl] | List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()

