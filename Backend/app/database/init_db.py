"""Database bootstrap — schema creation and category seeding.

`create_all` is convenient for local development and tests. In a real
deployment, schema migrations are managed by Alembic (see ``alembic/``);
call :func:`seed_categories` from a migration or a startup hook instead.
"""

from __future__ import annotations

from sqlalchemy import select

from app.core.logging import get_logger
from app.database.session import SessionLocal, engine
from app.models import Base  # noqa: F401 — ensures every model is registered
from app.models.category import DEFAULT_CATEGORIES, Category

log = get_logger("init_db")


async def create_tables() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    log.info("Database tables ensured")


async def seed_categories() -> None:
    """Insert the default category taxonomy if it is missing."""
    async with SessionLocal() as db:
        existing = set(
            (await db.execute(select(Category.slug))).scalars().all()
        )
        added = 0
        for slug, label, icon, color, is_income in DEFAULT_CATEGORIES:
            if slug not in existing:
                db.add(
                    Category(
                        slug=slug, label=label, icon=icon,
                        color=color, is_income=is_income,
                    )
                )
                added += 1
        if added:
            await db.commit()
            log.info("Seeded %d categories", added)


async def init_db() -> None:
    await create_tables()
    await seed_categories()
