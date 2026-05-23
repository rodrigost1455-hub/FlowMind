"""AI-generated insight model."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import InsightTone

if TYPE_CHECKING:
    from app.models.user import User


class AIInsight(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "ai_insights"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    tone: Mapped[InsightTone] = mapped_column(
        Enum(InsightTone, name="insight_tone"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    action_label: Mapped[str | None] = mapped_column(String(60), nullable=True)

    # Identifies the rule/model that produced this insight (e.g. "weekend_spike").
    source: Mapped[str] = mapped_column(String(60), default="rule", nullable=False)
    # 0..1 — how strongly the pattern was detected.
    confidence: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_dismissed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    user: Mapped[User] = relationship(back_populates="insights")
