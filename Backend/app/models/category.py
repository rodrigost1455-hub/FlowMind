"""Expense category model — seeded to mirror the frontend taxonomy."""

from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDMixin


class Category(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "categories"

    # Stable slug matching the frontend (`food`, `transport`, ...).
    slug: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(60), nullable=False)
    icon: Mapped[str] = mapped_column(String(16), default="•", nullable=False)
    color: Mapped[str] = mapped_column(String(24), default="#888888", nullable=False)
    is_income: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


# Seed taxonomy mirrored from Frontend/FlowMind/data.js
DEFAULT_CATEGORIES = [
    ("food", "Food", "🍜", "#FF8A65", False),
    ("coffee", "Coffee", "☕", "#B97A56", False),
    ("transport", "Transport", "🚇", "#4F7CFF", False),
    ("shopping", "Shopping", "🛍", "#A855F7", False),
    ("rent", "Rent", "🏠", "#34D399", False),
    ("health", "Health", "✚", "#FF6B7A", False),
    ("fun", "Fun", "🎧", "#FF5BA8", False),
    ("bills", "Bills", "⚡", "#FFB547", False),
    ("travel", "Travel", "✈", "#22D3EE", False),
    ("income", "Income", "↓", "#10D9A3", True),
]
