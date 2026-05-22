"""Financial Health Score™ service.

The score blends six interpretable sub-scores (each 0..100) derived from a
user's engineered features, then persists a snapshot so the frontend can
show the score and its week-over-week delta.
"""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.ml.features import extract_user_features
from app.models.financial_score import FinancialScore
from app.services.expense_service import ExpenseService

log = get_logger("health")

# Sub-score weights — must sum to 1.0.
_WEIGHTS = {
    "spending_stability": 0.20,
    "savings_consistency": 0.25,
    "debt_ratio_score": 0.15,
    "impulse_control": 0.20,
    "recurring_load": 0.10,
    "trend_score": 0.10,
}


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def compute_components(features: dict[str, float]) -> dict[str, float]:
    """Map engineered features onto six 0..100 sub-scores."""
    avg = features.get("avg_expense", 0.0) or 1.0
    volatility = features.get("std_expense", 0.0) / avg
    savings_rate = features.get("savings_rate", 0.0)
    income_ratio = features.get("income_to_spend_ratio", 0.0)
    impulse = features.get("impulse_spend_ratio", 0.0)
    recurring = features.get("recurring_ratio", 0.0)
    slope = features.get("spend_trend_slope", 0.0)

    return {
        # Lower volatility => steadier, more predictable spending.
        "spending_stability": _clamp(100 * (1 - min(volatility, 1.5) / 1.5)),
        # Savings rate of 30%+ is excellent; negative is a fail.
        "savings_consistency": _clamp((savings_rate + 0.2) / 0.5 * 100),
        # Earning comfortably more than you spend protects against debt.
        "debt_ratio_score": _clamp((income_ratio - 0.8) / 0.7 * 100),
        # Less mood-driven spending => stronger impulse control.
        "impulse_control": _clamp(100 * (1 - min(impulse, 0.4) / 0.4)),
        # Some recurring load is fine; a heavy fixed-cost base is risky.
        "recurring_load": _clamp(100 * (1 - min(recurring, 0.6) / 0.6)),
        # A downward spend trend scores high, an upward one scores low.
        "trend_score": _clamp(60 - slope * 4),
    }


def _grade(score: int) -> str:
    for threshold, grade in [(85, "A"), (70, "B"), (55, "C"), (40, "D")]:
        if score >= threshold:
            return grade
    return "F"


def _narrative(components: dict[str, float]) -> tuple[list[str], list[str], list[str]]:
    """Derive warnings / strengths / recommendations from sub-scores."""
    warnings, strengths, recommendations = [], [], []
    labels = {
        "spending_stability": "spending stability",
        "savings_consistency": "savings consistency",
        "debt_ratio_score": "income-to-spend ratio",
        "impulse_control": "impulse control",
        "recurring_load": "recurring expense load",
        "trend_score": "spending trend",
    }
    for key, score in components.items():
        label = labels[key]
        if score < 45:
            warnings.append(f"Low {label} ({score:.0f}/100)")
        elif score >= 75:
            strengths.append(f"Strong {label} ({score:.0f}/100)")

    if components["savings_consistency"] < 50:
        recommendations.append("Automate a fixed weekly transfer to savings.")
    if components["impulse_control"] < 55:
        recommendations.append("Add a 24-hour pause before non-essential purchases.")
    if components["spending_stability"] < 50:
        recommendations.append("Set per-category weekly budgets to smooth out spikes.")
    if components["trend_score"] < 50:
        recommendations.append("Your spending is trending up — review this week's top category.")
    if not recommendations:
        recommendations.append("You're on track — keep logging expenses to stay sharp.")
    return warnings, strengths, recommendations


class HealthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.expenses = ExpenseService(db)

    async def _last_score(self, user_id: uuid.UUID) -> FinancialScore | None:
        stmt = (
            select(FinancialScore)
            .where(FinancialScore.user_id == user_id)
            .order_by(FinancialScore.created_at.desc())
            .limit(1)
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def compute(self, user_id: uuid.UUID, persist: bool = True) -> dict[str, Any]:
        """Compute (and optionally persist) the current health score."""
        expenses = await self.expenses.list_all(user_id)
        features = extract_user_features(expenses)
        components = compute_components(features)

        score = round(sum(components[k] * w for k, w in _WEIGHTS.items()))
        previous = await self._last_score(user_id)
        delta = score - previous.score if previous else 0
        warnings, strengths, recommendations = _narrative(components)

        if persist:
            snapshot = FinancialScore(
                user_id=user_id,
                score=score,
                delta=delta,
                warnings=warnings,
                strengths=strengths,
                recommendations=recommendations,
                **components,
            )
            self.db.add(snapshot)
            await self.db.flush()

        return {
            "score": score,
            "delta": delta,
            "grade": _grade(score),
            "components": components,
            "warnings": warnings,
            "strengths": strengths,
            "recommendations": recommendations,
        }

    async def history(self, user_id: uuid.UUID, limit: int = 12) -> list[dict[str, Any]]:
        stmt = (
            select(FinancialScore)
            .where(FinancialScore.user_id == user_id)
            .order_by(FinancialScore.created_at.desc())
            .limit(limit)
        )
        rows = (await self.db.execute(stmt)).scalars().all()
        return [
            {"score": r.score, "delta": r.delta, "date": r.created_at.date().isoformat()}
            for r in reversed(rows)
        ]
