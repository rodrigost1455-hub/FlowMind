"""Financial behaviour classifier.

Classes: impulsive | stable | conservative | high_risk.
Trained model: RandomForest classifier on the user feature vector.
Fallback: an interpretable scoring rule over the same features.
"""

from __future__ import annotations

import numpy as np

from app.ml.features import USER_FEATURE_NAMES
from app.ml.models.base import BaseMLModel
from app.models.enums import BehaviorClass

_CLASSES = [c.value for c in BehaviorClass]


class BehaviorClassifier(BaseMLModel):
    artifact_name = "behavior_classifier"

    def predict(self, features: dict[str, float]) -> dict[str, object]:
        if self.is_trained:
            return self._predict_trained(features)
        return self._predict_heuristic(features)

    # ── trained path ─────────────────────────────────────────────
    def _predict_trained(self, features: dict[str, float]) -> dict[str, object]:
        assert self.artifact is not None
        vec = np.array([[features.get(n, 0.0) for n in USER_FEATURE_NAMES]], dtype=float)
        if self.artifact.scaler is not None:
            vec = self.artifact.scaler.transform(vec)
        est = self.artifact.estimator
        proba = est.predict_proba(vec)[0]
        classes = list(est.classes_)
        probs = {str(c): float(p) for c, p in zip(classes, proba)}
        top = max(probs, key=probs.get)
        return {
            "behavior_class": top,
            "confidence": probs[top],
            "class_probabilities": probs,
            "drivers": self._drivers(features),
        }

    # ── heuristic path ───────────────────────────────────────────
    def _predict_heuristic(self, features: dict[str, float]) -> dict[str, object]:
        impulse = features.get("impulse_spend_ratio", 0.0)
        savings = features.get("savings_rate", 0.0)
        volatility = features.get("std_expense", 0.0) / (features.get("avg_expense", 1.0) or 1.0)
        trend = features.get("spend_trend_slope", 0.0)

        # Unnormalised affinity per class.
        scores = {
            "impulsive": 2.0 * impulse + 1.0 * min(volatility, 2.0) + (0.5 if trend > 0 else 0.0),
            "high_risk": 1.5 * max(-savings, 0.0) + 1.5 * impulse + (1.0 if trend > 0 else 0.0),
            "stable": 1.5 * (1.0 - min(volatility, 1.0)) + 1.0 * max(savings, 0.0),
            "conservative": 2.0 * max(savings, 0.0) + 1.0 * (1.0 - impulse),
        }
        arr = np.array([scores[c] for c in _CLASSES], dtype=float)
        exp = np.exp(arr - arr.max())
        proba = exp / exp.sum()
        probs = {c: float(p) for c, p in zip(_CLASSES, proba)}
        top = max(probs, key=probs.get)
        return {
            "behavior_class": top,
            "confidence": probs[top],
            "class_probabilities": probs,
            "drivers": self._drivers(features),
        }

    @staticmethod
    def _drivers(features: dict[str, float]) -> list[str]:
        drivers: list[str] = []
        if features.get("impulse_spend_ratio", 0.0) > 0.25:
            drivers.append("High share of mood-driven (impulse) spending")
        if features.get("savings_rate", 0.0) > 0.2:
            drivers.append("Consistently saving a healthy share of income")
        if features.get("savings_rate", 0.0) < 0:
            drivers.append("Spending exceeds income")
        if features.get("spend_trend_slope", 0.0) > 0:
            drivers.append("Weekly spending is trending upward")
        if features.get("weekend_spend_ratio", 0.0) > 0.45:
            drivers.append("Spending concentrated on weekends")
        return drivers or ["Spending pattern is within normal ranges"]
