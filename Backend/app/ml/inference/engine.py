"""Inference engine — the runtime entry point for all ML predictions.

Given a user's raw expenses it orchestrates feature extraction and every
model wrapper, returning structured prediction dictionaries that the
service layer maps onto API schemas.
"""

from __future__ import annotations

from typing import Any

import pandas as pd

from app.core.logging import get_logger
from app.ml.features import build_transaction_frame, extract_user_features
from app.ml.inference.registry import ModelRegistry, get_model_registry

log = get_logger("ml.engine")


class InferenceEngine:
    def __init__(self, registry: ModelRegistry) -> None:
        self.registry = registry

    # ── individual predictions ───────────────────────────────────
    def predict_spending(self, expenses: list[Any]) -> dict[str, Any]:
        feats = extract_user_features(expenses)
        result = self.registry.spending.predict(feats)
        result["model_version"] = self.registry.spending.version
        return result

    def classify_behavior(self, expenses: list[Any]) -> dict[str, Any]:
        feats = extract_user_features(expenses)
        result = self.registry.behavior.predict(feats)
        result["model_version"] = self.registry.behavior.version
        return result

    def forecast_savings(self, expenses: list[Any]) -> dict[str, Any]:
        feats = extract_user_features(expenses)
        weekly_net = self._weekly_net_savings(expenses)
        result = self.registry.savings.predict(weekly_net, feats)
        result["model_version"] = self.registry.savings.version
        return result

    def detect_anomalies(self, expenses: list[Any]) -> list[dict[str, Any]]:
        return self.registry.anomaly.detect(expenses)

    # ── full bundle ──────────────────────────────────────────────
    def predict_all(self, expenses: list[Any]) -> dict[str, Any]:
        """Run every model — powers the predictions API in one call."""
        return {
            "spending": self.predict_spending(expenses),
            "behavior": self.classify_behavior(expenses),
            "savings": self.forecast_savings(expenses),
            "anomalies": self.detect_anomalies(expenses),
            "features": extract_user_features(expenses),
        }

    # ── helpers ──────────────────────────────────────────────────
    @staticmethod
    def _weekly_net_savings(expenses: list[Any]) -> list[float]:
        """Net (income - outflow) per ISO week, ordered oldest -> newest."""
        df = build_transaction_frame(expenses)
        if df.empty:
            return []
        weekly = (
            df.set_index("occurred_at")["amount"].resample("W").sum().sort_index()
        )
        return [round(float(v), 2) for v in weekly.tolist()]


_engine: InferenceEngine | None = None


def get_inference_engine() -> InferenceEngine:
    global _engine
    if _engine is None:
        _engine = InferenceEngine(get_model_registry())
    return _engine
