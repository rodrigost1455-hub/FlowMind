"""User account model."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.expense import Expense
    from app.models.financial_score import FinancialScore
    from app.models.insight import AIInsight
    from app.models.prediction import Prediction
    from app.models.weekly_summary import WeeklySummary


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"), default=UserRole.USER, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Onboarding / gamification state surfaced directly to the frontend.
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    monthly_income: Mapped[float] = mapped_column(default=0.0, nullable=False)
    weekly_budget: Mapped[float] = mapped_column(default=0.0, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    level: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    streak_days: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    expenses: Mapped[list[Expense]] = relationship(
        back_populates="user", cascade="all, delete-orphan", lazy="selectin"
    )
    insights: Mapped[list[AIInsight]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    scores: Mapped[list[FinancialScore]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    predictions: Mapped[list[Prediction]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    summaries: Mapped[list[WeeklySummary]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
