"""Shared helpers for running async service code inside sync Celery workers."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable
from typing import TypeVar

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.user import User

T = TypeVar("T")


def run_async(coro: Awaitable[T]) -> T:
    """Execute a coroutine to completion from a synchronous Celery task."""
    return asyncio.run(coro)  # type: ignore[arg-type]


async def all_user_ids() -> list:
    """Return every active user id (used by fan-out scheduled tasks)."""
    async with SessionLocal() as db:
        stmt = select(User.id).where(User.is_active.is_(True))
        return list((await db.execute(stmt)).scalars().all())


async def with_session(fn: Callable[..., Awaitable[T]], *args) -> T:
    """Run ``fn(db, *args)`` inside a committed async session."""
    async with SessionLocal() as db:
        try:
            result = await fn(db, *args)
            await db.commit()
            return result
        except Exception:
            await db.rollback()
            raise
