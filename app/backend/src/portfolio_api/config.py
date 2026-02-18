from __future__ import annotations

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="PORTFOLIO_API_", extra="ignore")

    app_name: str = "Portfolio API"
    app_version: str = "0.1.0"
    aws_region: str = "eu-central-1"
    dynamodb_endpoint_url: str | None = None
    aws_access_key_id: str | None = None
    aws_secret_access_key: str | None = None
    comments_table_name: str = "portfolio-comments"
    ttl_retention_days: int = 30
    default_list_limit: int = 20
    max_list_limit: int = 100
    log_level: str = "INFO"

    @field_validator("ttl_retention_days")
    @classmethod
    def _validate_ttl_retention_days(cls, value: int) -> int:
        if value < 1:
            raise ValueError("ttl_retention_days must be greater than 0")
        return value

    @field_validator("default_list_limit", "max_list_limit")
    @classmethod
    def _validate_limits(cls, value: int) -> int:
        if value < 1:
            raise ValueError("list limits must be greater than 0")
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
