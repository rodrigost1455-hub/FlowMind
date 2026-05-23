"""Financial Health Score schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class ScoreComponents(BaseModel):
    spending_stability: float
    savings_consistency: float
    debt_ratio_score: float
    impulse_control: float
    recurring_load: float
    trend_score: float


class FinancialHealthResponse(ORMModel):
    score: int
    delta: int
    grade: str                       # "A" .. "F"
    components: ScoreComponents
    warnings: list[str]
    strengths: list[str]
    recommendations: list[str]
    computed_at: datetime


class ScoreHistoryPoint(BaseModel):
    score: int
    delta: int
    date: str
