"""Async SQLAlchemy engine, session factory and FastAPI dependency."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.pool import NullPool
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

# SQLite (tests) uses NullPool so connections are never reused across the
# per-test event loops pytest-asyncio creates. PostgreSQL uses a tuned
# connection pool sized for production concurrency.
if _is_sqlite:
    _engine_kwargs: dict = {"poolclass": NullPool}
else:
    _engine_kwargs = {"pool_size": 20, "max_overflow": 10, "pool_pre_ping": True}

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG and not _is_sqlite,
    **_engine_kwargs,
)

SessionLocal = async_sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a transactional database session."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
