"""Expense schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import EmotionalState, PaymentMethod
from app.schemas.common import ORMModel


class ExpenseBase(BaseModel):
    amount: float = Field(description="Negative = outflow, positive = income")
    category_slug: str = Field(min_length=1, max_length=40)
    occurred_at: datetime
    merchant: str = Field(default="", max_length=160)
    notes: str | None = Field(default=None, max_length=2000)
    payment_method: PaymentMethod = PaymentMethod.CARD
    emotional_state: EmotionalState | None = None
    tags: list[str] = Field(default_factory=list)
    location: str | None = Field(default=None, max_length=180)


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: float | None = None
    category_slug: str | None = Field(default=None, max_length=40)
    occurred_at: datetime | None = None
    merchant: str | None = Field(default=None, max_length=160)
    notes: str | None = Field(default=None, max_length=2000)
    payment_method: PaymentMethod | None = None
    emotional_state: EmotionalState | None = None
    tags: list[str] | None = None
    location: str | None = Field(default=None, max_length=180)


class ExpensePublic(ORMModel):
    id: uuid.UUID
    amount: float
    category_slug: str
    occurred_at: datetime
    merchant: str
    notes: str | None
    payment_method: PaymentMethod
    emotional_state: EmotionalState | None
    tags: list[str]
    location: str | None
    is_recurring: bool
    is_anomaly: bool
    created_at: datetime


class ExpenseFilter(BaseModel):
    """Query filters for the expense list endpoint."""

    category_slug: str | None = None
    payment_method: PaymentMethod | None = None
    emotional_state: EmotionalState | None = None
    date_from: datetime | None = None
    date_to: datetime | None = None
    min_amount: float | None = None
    max_amount: float | None = None
    search: str | None = Field(default=None, description="Substring match on merchant/notes")


class CategoryGroup(BaseModel):
    category_slug: str
    total: float
    count: int
    avg: float
