"""AI insight and weekly summary schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel

from app.models.enums import InsightTone
from app.schemas.common import ORMModel


class InsightPublic(ORMModel):
    id: uuid.UUID
    tone: InsightTone
    title: str
    body: str
    action_label: str | None
    source: str
    confidence: float
    is_read: bool
    is_dismissed: bool
    created_at: datetime


class WeeklySummaryPublic(ORMModel):
    id: uuid.UUID
    week_start: date
    headline: str
    narrative: str
    bullet_points: list[str]
    total_spent: float
    total_income: float
    net_saved: float
    vs_prev_week_pct: float
    created_at: datetime
