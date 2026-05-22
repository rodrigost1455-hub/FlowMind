"""SQLAlchemy pagination helper."""

from __future__ import annotations

from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def paginate(
    db: AsyncSession, stmt: Select, *, offset: int, limit: int
) -> tuple[list[Any], int]:
    """Execute ``stmt`` paginated and also return the unpaginated total count."""
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = (await db.execute(count_stmt)).scalar_one()
    rows = (await db.execute(stmt.offset(offset).limit(limit))).scalars().all()
    return list(rows), int(total)
