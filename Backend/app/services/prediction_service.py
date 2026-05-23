"""Prediction service — runs the ML pipeline and persists predictions."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.ml.pipelines import FinancialIntelligencePipeline
from app.models.enums import PredictionType
from app.models.expense import Expense
from app.models.prediction import Prediction
from app.services.expense_service import ExpenseService

log = get_logger("predictions")


class PredictionService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.expenses = ExpenseService(db)
        self.pipeline = FinancialIntelligencePipeline()

    async def run(self, user_id: uuid.UUID, persist: bool = True) -> dict[str, Any]:
        """Run every model and return a frontend-ready prediction bundle."""
        expenses = await self.expenses.list_all(user_id)
        result = self.pipeline.run(expenses)
        preds = result["predictions"]

        anomalies = self._map_anomalies(expenses, preds["anomalies"])

        if persist:
            await self._persist(user_id, preds)
            await self._flag_anomalies(expenses, preds["anomalies"])

        return {
            "spending": {
                "weekly_spending": preds["spending"]["weekly_spending"],
                "monthly_spending": preds["spending"]["monthly_spending"],
                "overspend_probability": preds["spending"]["overspend_probability"],
                "confidence": preds["spending"]["confidence"],
                "model_version": preds["spending"]["model_version"],
            },
            "behavior": {
                "behavior_class": preds["behavior"]["behavior_class"],
                "confidence": preds["behavior"]["confidence"],
                "class_probabilities": preds["behavior"]["class_probabilities"],
                "drivers": preds["behavior"]["drivers"],
                "model_version": preds["behavior"]["model_version"],
            },
            "savings": {
                "projected_savings_30d": preds["savings"]["projected_savings_30d"],
                "projected_savings_90d": preds["savings"]["projected_savings_90d"],
                "decline_risk": preds["savings"]["decline_risk"],
                "trajectory": preds["savings"]["trajectory"],
                "model_version": preds["savings"]["model_version"],
            },
            "anomalies": anomalies,
        }

    # ── helpers ──────────────────────────────────────────────────
    @staticmethod
    def _map_anomalies(
        expenses: list[Expense], anomalies: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Attach expense IDs to anomaly records via their list index."""
        mapped: list[dict[str, Any]] = []
        for a in anomalies:
            idx = a["index"]
            if 0 <= idx < len(expenses):
                e = expenses[idx]
                mapped.append(
                    {
                        "expense_id": e.id,
                        "merchant": e.merchant,
                        "amount": e.amount,
                        "occurred_at": e.occurred_at,
                        "anomaly_score": a["anomaly_score"],
                        "reason": a["reason"],
                    }
                )
        return mapped

    async def _flag_anomalies(
        self, expenses: list[Expense], anomalies: list[dict[str, Any]]
    ) -> None:
        flagged = {expenses[a["index"]].id for a in anomalies if a["index"] < len(expenses)}
        for e in expenses:
            e.is_anomaly = e.id in flagged
        await self.db.flush()

    async def _persist(self, user_id: uuid.UUID, preds: dict[str, Any]) -> None:
        spending, behavior, savings = preds["spending"], preds["behavior"], preds["savings"]
        rows = [
            Prediction(
                user_id=user_id, prediction_type=PredictionType.WEEKLY_SPENDING,
                value=spending["weekly_spending"], confidence=spending["confidence"],
                model_version=spending["model_version"], features=preds.get("features", {}),
            ),
            Prediction(
                user_id=user_id, prediction_type=PredictionType.MONTHLY_SPENDING,
                value=spending["monthly_spending"], confidence=spending["confidence"],
                model_version=spending["model_version"],
            ),
            Prediction(
                user_id=user_id, prediction_type=PredictionType.OVERSPEND_PROBABILITY,
                value=spending["overspend_probability"], confidence=spending["confidence"],
                model_version=spending["model_version"],
            ),
            Prediction(
                user_id=user_id, prediction_type=PredictionType.BEHAVIOR_CLASS,
                value=behavior["confidence"], label=behavior["behavior_class"],
                confidence=behavior["confidence"], model_version=behavior["model_version"],
            ),
            Prediction(
                user_id=user_id, prediction_type=PredictionType.SAVINGS_FORECAST,
                value=savings["projected_savings_30d"], label=savings["trajectory"],
                confidence=1.0 - savings["decline_risk"],
                model_version=savings["model_version"],
            ),
        ]
        self.db.add_all(rows)
        await self.db.flush()

    async def history(
        self, user_id: uuid.UUID, limit: int = 50
    ) -> list[Prediction]:
        stmt = (
            select(Prediction)
            .where(Prediction.user_id == user_id)
            .order_by(Prediction.created_at.desc())
            .limit(limit)
        )
        return list((await self.db.execute(stmt)).scalars().all())
