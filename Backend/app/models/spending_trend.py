"""Aggregated spending trend model — precomputed for fast chart rendering."""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import Date, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDMixin


class SpendingTrend(Base, UUIDMixin, TimestampMixin):
    """One row per (user, period, category) — feeds analytics charts."""

    __tablename__ = "spending_trends"
    __table_args__ = (
        UniqueConstraint(
            "user_id", "period_start", "granularity", "category_slug",
            name="uq_trend_user_period_cat",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    # "daily" | "weekly" | "monthly"
    granularity: Mapped[str] = mapped_column(String(12), nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    # NULL category_slug = total across all categories.
    category_slug: Mapped[str | None] = mapped_column(String(40), nullable=True)

    total_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    transaction_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
