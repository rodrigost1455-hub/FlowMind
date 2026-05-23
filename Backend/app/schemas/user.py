"""User schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import UserRole
from app.schemas.common import ORMModel


class UserPublic(ORMModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: UserRole
    onboarding_completed: bool
    monthly_income: float
    weekly_budget: float
    xp: int
    level: int
    streak_days: int
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    monthly_income: float | None = Field(default=None, ge=0)
    weekly_budget: float | None = Field(default=None, ge=0)


class OnboardingUpdate(BaseModel):
    monthly_income: float = Field(ge=0)
    weekly_budget: float = Field(ge=0)
    onboarding_completed: bool = True
