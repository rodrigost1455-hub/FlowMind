"""Financial Health Score snapshot model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.user import User


class FinancialScore(Base, UUIDMixin, TimestampMixin):
    """A point-in-time Financial Health Score™ with its component breakdown."""

    __tablename__ = "financial_scores"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    score: Mapped[int] = mapped_column(Integer, nullable=False)
    delta: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Sub-scores (each 0..100) that compose the headline score.
    spending_stability: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    savings_consistency: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    debt_ratio_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    impulse_control: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    recurring_load: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    trend_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)

    warnings: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    strengths: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    recommendations: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    user: Mapped[User] = relationship(back_populates="scores")
