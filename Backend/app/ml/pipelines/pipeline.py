"""End-to-end financial intelligence pipeline.

Implements the canonical FlowMind flow:

    User Expenses
        -> Data Cleaning
        -> Feature Engineering
        -> Model Inference
        -> Predictions
        -> AI Insights
        -> API Response

Service-layer callers run this once and read whichever slice they need,
so feature extraction and model inference happen a single time per
request rather than being repeated by each endpoint.
"""

from __future__ import annotations

from typing import Any

from app.core.logging import get_logger
from app.insights.engine import generate_insights
from app.ml.features import extract_user_features
from app.ml.inference.engine import InferenceEngine, get_inference_engine

log = get_logger("ml.pipeline")


def _field(expense: Any, key: str) -> Any:
    """Read a field from either an ORM row or a plain dict."""
    if isinstance(expense, dict):
        return expense.get(key)
    return getattr(expense, key, None)


def _clean(expenses: list[Any]) -> list[Any]:
    """Data-cleaning stage: drop zero-amount / timestamp-less rows."""
    cleaned = [
        e
        for e in expenses
        if _field(e, "occurred_at") is not None
        and float(_field(e, "amount") or 0) != 0
    ]
    dropped = len(expenses) - len(cleaned)
    if dropped:
        log.debug("Pipeline cleaning dropped %d invalid expenses", dropped)
    return cleaned


class FinancialIntelligencePipeline:
    def __init__(self, engine: InferenceEngine | None = None) -> None:
        self.engine = engine or get_inference_engine()

    def run(self, expenses: list[Any], insight_limit: int = 6) -> dict[str, Any]:
        """Execute every stage and return the assembled result."""
        cleaned = _clean(expenses)

        features = extract_user_features(cleaned)
        predictions = self.engine.predict_all(cleaned)
        insights = generate_insights(cleaned, predictions, limit=insight_limit)

        return {
            "transaction_count": len(cleaned),
            "features": features,
            "predictions": predictions,
            "insights": insights,
            "model_versions": self.engine.registry.versions,
        }


def run_pipeline(expenses: list[Any], insight_limit: int = 6) -> dict[str, Any]:
    return FinancialIntelligencePipeline().run(expenses, insight_limit)
