"""ML prediction schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.enums import BehaviorClass, PredictionType
from app.schemas.common import ORMModel


class PredictionPublic(ORMModel):
    id: uuid.UUID
    prediction_type: PredictionType
    value: float
    label: str | None
    confidence: float
    model_version: str
    created_at: datetime


class SpendingForecast(BaseModel):
    weekly_spending: float
    monthly_spending: float
    overspend_probability: float          # 0..1
    confidence: float
    model_version: str


class BehaviorProfile(BaseModel):
    behavior_class: BehaviorClass
    confidence: float
    class_probabilities: dict[str, float]
    drivers: list[str]                     # human-readable feature drivers
    model_version: str


class SavingsForecast(BaseModel):
    projected_savings_30d: float
    projected_savings_90d: float
    decline_risk: float                    # 0..1
    trajectory: str                        # "healthy" | "flat" | "declining"
    model_version: str


class AnomalyResult(BaseModel):
    expense_id: uuid.UUID
    merchant: str
    amount: float
    occurred_at: datetime
    anomaly_score: float                   # higher = more anomalous
    reason: str


class PredictionBundle(BaseModel):
    """Everything the frontend predictions screen needs in one call."""

    spending: SpendingForecast
    behavior: BehaviorProfile
    savings: SavingsForecast
    anomalies: list[AnomalyResult]
