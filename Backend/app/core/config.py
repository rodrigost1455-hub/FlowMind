"""Centralised, typed application configuration."""

from __future__ import annotations

from functools import lru_cache
from urllib.parse import urlsplit, urlunsplit

from pydantic import Field, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _normalize_async_dsn(raw: str) -> str:
    """Coerce any Postgres DSN into an asyncpg-compatible URL.

    Managed providers (Neon, Supabase, Render) hand out `postgres://` /
    `postgresql://` URLs carrying libpq-only query params such as
    ``sslmode`` and ``channel_binding`` — asyncpg rejects those. This
    rewrites the scheme to ``postgresql+asyncpg`` and replaces the query
    with just ``ssl=require`` (every managed provider mandates TLS).
    Non-Postgres DSNs (e.g. the SQLite URL used by tests) pass through.
    """
    parts = urlsplit(raw)
    if parts.scheme in ("postgres", "postgresql", "postgresql+psycopg2", "postgresql+asyncpg"):
        return urlunsplit(
            ("postgresql+asyncpg", parts.netloc, parts.path, "ssl=require", "")
        )
    return raw


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True, extra="ignore"
    )

    # ── App ──────────────────────────────────────────────────────
    PROJECT_NAME: str = "FlowMind"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # ── Security ─────────────────────────────────────────────────
    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # ── CORS ─────────────────────────────────────────────────────
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:8081", "http://localhost:19006"]

    # ── PostgreSQL ───────────────────────────────────────────────
    POSTGRES_USER: str = "flowmind"
    POSTGRES_PASSWORD: str = "flowmind"
    POSTGRES_DB: str = "flowmind"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    # ── Redis / Celery ───────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_TTL_SECONDS: int = 300
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # ── ML ───────────────────────────────────────────────────────
    MLFLOW_TRACKING_URI: str = "file:./mlruns"
    ML_MODEL_DIR: str = "./ml_artifacts"

    # ── Rate limiting ────────────────────────────────────────────
    RATE_LIMIT_DEFAULT: str = "120/minute"
    # Defaults to Redis; tests override this with "memory://".
    RATE_LIMIT_STORAGE_URI: str | None = None

    # Set explicitly by tests to swap in a SQLite engine.
    DATABASE_URL_OVERRIDE: str | None = None

    @computed_field  # type: ignore[prop-decorator]
    @property
    def DATABASE_URL(self) -> str:
        # A managed-provider URL (Neon, Supabase, ...) takes precedence;
        # otherwise the DSN is assembled from the POSTGRES_* parts.
        if self.DATABASE_URL_OVERRIDE:
            return _normalize_async_dsn(self.DATABASE_URL_OVERRIDE)
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD,
                host=self.POSTGRES_HOST,
                port=self.POSTGRES_PORT,
                path=self.POSTGRES_DB,
            )
        )

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SYNC_DATABASE_URL(self) -> str:
        """Sync DSN used by Alembic and Celery workers."""
        return self.DATABASE_URL.replace("+asyncpg", "+psycopg2").replace(
            "ssl=require", "sslmode=require"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
