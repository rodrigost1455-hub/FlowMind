"""Expense / transaction model — the primary ML training signal."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import EmotionalState, PaymentMethod

if TYPE_CHECKING:
    from app.models.user import User


class Expense(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "expenses"
    __table_args__ = (
        # Composite index — almost every analytics query filters by
        # (user, time window) so this is the hot path.
        Index("ix_expense_user_ts", "user_id", "occurred_at"),
        Index("ix_expense_user_category", "user_id", "category_slug"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    # Negative = outflow, positive = income. Mirrors the frontend `amt`.
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    category_slug: Mapped[str] = mapped_column(
        ForeignKey("categories.slug"), index=True, nullable=False
    )
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    merchant: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method"),
        default=PaymentMethod.CARD,
        nullable=False,
    )
    emotional_state: Mapped[EmotionalState | None] = mapped_column(
        Enum(EmotionalState, name="emotional_state"), nullable=True
    )

    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    location: Mapped[str | None] = mapped_column(String(180), nullable=True)

    # Recurring flag is set heuristically by the analytics pipeline.
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    # Set by the Isolation Forest anomaly detector during inference.
    is_anomaly: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship(back_populates="expenses")

    @property
    def is_income(self) -> bool:
        return self.amount > 0
