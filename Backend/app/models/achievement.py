"""Gamification: achievements / badges and challenges."""

from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDMixin


class Achievement(Base, UUIDMixin, TimestampMixin):
    """A badge a user can unlock (mirrors frontend `badges`)."""

    __tablename__ = "achievements"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    code: Mapped[str] = mapped_column(String(40), nullable=False)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    icon: Mapped[str] = mapped_column(String(16), default="★", nullable=False)
    tint: Mapped[str] = mapped_column(String(24), default="#10D9A3", nullable=False)
    unlocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class Challenge(Base, UUIDMixin, TimestampMixin):
    """An active savings challenge (mirrors frontend `challenges`)."""

    __tablename__ = "challenges"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    reward_xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    progress: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    locked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    done: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
