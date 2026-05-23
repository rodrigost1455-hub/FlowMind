"""Weekly AI summary model."""

from __future__ import annotations

import uuid
from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Date, Float, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class WeeklySummary(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "weekly_summaries"
    __table_args__ = (
        UniqueConstraint("user_id", "week_start", name="uq_summary_user_week"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    week_start: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    headline: Mapped[str] = mapped_column(Text, nullable=False)
    narrative: Mapped[str] = mapped_column(Text, nullable=False)
    bullet_points: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    total_spent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_income: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    net_saved: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    vs_prev_week_pct: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    user: Mapped[User] = relationship(back_populates="summaries")
