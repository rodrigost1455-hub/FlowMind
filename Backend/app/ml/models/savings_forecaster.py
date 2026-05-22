"""Savings forecasting model.

Projects future net savings and a financial-decline risk.
Trained model: gradient-boosted regressor on weekly savings history.
Fallback: linear extrapolation of the recent savings run-rate.
"""

from __future__ import annotations

import numpy as np

from app.ml.models.base import BaseMLModel


class SavingsForecaster(BaseMLModel):
    artifact_name = "savings_forecaster"

    def predict(
        self, weekly_net: list[float], features: dict[str, float]
    ) -> dict[str, object]:
        """Forecast 30/90-day savings given recent weekly net-savings.

        ``weekly_net`` is an ordered list (oldest -> newest) of net saved
        per week. ``features`` is the user feature dict.
        """
        if self.is_trained:
            return self._predict_trained(weekly_net, features)
        return self._predict_heuristic(weekly_net, features)

    # ── trained path ─────────────────────────────────────────────
    def _predict_trained(
        self, weekly_net: list[float], features: dict[str, float]
    ) -> dict[str, object]:
        assert self.artifact is not None
        window = (weekly_net or [0.0])[-8:]
        padded = ([0.0] * 8 + window)[-8:]
        x = np.array([padded], dtype=float)
        if self.artifact.scaler is not None:
            x = self.artifact.scaler.transform(x)
        weekly_rate = float(self.artifact.estimator.predict(x)[0])
        return self._assemble(weekly_rate, weekly_net)

    # ── heuristic path ───────────────────────────────────────────
    def _predict_heuristic(
        self, weekly_net: list[float], features: dict[str, float]
    ) -> dict[str, object]:
        recent = weekly_net[-4:] if weekly_net else [0.0]
        weekly_rate = float(np.mean(recent))
        # Bias the rate slightly by the observed spend trend.
        weekly_rate -= 0.3 * max(features.get("spend_trend_slope", 0.0), 0.0)
        return self._assemble(weekly_rate, weekly_net)

    def _assemble(self, weekly_rate: float, weekly_net: list[float]) -> dict[str, object]:
        proj_30 = round(weekly_rate * 4.345, 2)
        proj_90 = round(weekly_rate * 13.04, 2)

        slope = self._slope(weekly_net[-6:]) if len(weekly_net) >= 2 else 0.0
        if weekly_rate < 0:
            trajectory, decline_risk = "declining", 0.85
        elif slope < 0:
            trajectory, decline_risk = "flat", 0.5
        else:
            trajectory, decline_risk = "healthy", 0.15
        return {
            "projected_savings_30d": proj_30,
            "projected_savings_90d": proj_90,
            "decline_risk": decline_risk,
            "trajectory": trajectory,
        }

    @staticmethod
    def _slope(values: list[float]) -> float:
        if len(values) < 2:
            return 0.0
        x = np.arange(len(values), dtype=float)
        return float(np.polyfit(x, np.asarray(values, dtype=float), 1)[0])
