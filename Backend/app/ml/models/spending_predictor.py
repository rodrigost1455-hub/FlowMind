"""Spending prediction model — weekly / monthly spend + overspend risk.

Trained model: XGBoost regressor on the user feature vector.
Fallback: frequency x average-expense projection.
"""

from __future__ import annotations

import numpy as np

from app.ml.features import USER_FEATURE_NAMES
from app.ml.models.base import BaseMLModel


class SpendingPredictor(BaseMLModel):
    artifact_name = "spending_predictor"

    def predict(self, features: dict[str, float]) -> dict[str, float]:
        """Return weekly/monthly spend and overspend probability."""
        if self.is_trained:
            return self._predict_trained(features)
        return self._predict_heuristic(features)

    # ── trained path ─────────────────────────────────────────────
    def _predict_trained(self, features: dict[str, float]) -> dict[str, float]:
        assert self.artifact is not None
        vec = np.array([[features.get(n, 0.0) for n in USER_FEATURE_NAMES]], dtype=float)
        if self.artifact.scaler is not None:
            vec = self.artifact.scaler.transform(vec)
        weekly = float(self.artifact.estimator.predict(vec)[0])
        weekly = max(weekly, 0.0)
        return self._assemble(weekly, features, confidence=0.85)

    # ── heuristic path ───────────────────────────────────────────
    def _predict_heuristic(self, features: dict[str, float]) -> dict[str, float]:
        freq = features.get("spend_frequency_per_day", 0.0)
        avg = features.get("avg_expense", 0.0)
        # Base projection, nudged up by the observed weekly trend slope.
        weekly = freq * 7.0 * avg
        weekly += max(features.get("spend_trend_slope", 0.0), 0.0)
        return self._assemble(max(weekly, 0.0), features, confidence=0.5)

    def _assemble(
        self, weekly: float, features: dict[str, float], confidence: float
    ) -> dict[str, float]:
        monthly = weekly * 4.345
        # Overspend probability rises with volatility, impulse share and an
        # upward spend trend; squashed through a logistic.
        volatility = features.get("std_expense", 0.0) / (features.get("avg_expense", 1.0) or 1.0)
        risk_score = (
            0.9 * features.get("impulse_spend_ratio", 0.0)
            + 0.6 * min(volatility, 2.0) / 2.0
            + 0.8 * (1.0 if features.get("spend_trend_slope", 0.0) > 0 else 0.0)
            - 1.2 * max(features.get("savings_rate", 0.0), 0.0)
        )
        overspend_prob = float(1.0 / (1.0 + np.exp(-2.0 * (risk_score - 0.4))))
        return {
            "weekly_spending": round(weekly, 2),
            "monthly_spending": round(monthly, 2),
            "overspend_probability": round(overspend_prob, 3),
            "confidence": confidence,
        }
