"""Model registry — loads and caches every model wrapper.

Acts as the single source of truth for which model versions are live.
Models are loaded lazily on first use and can be hot-reloaded after a
retraining run via :meth:`reload`.
"""

from __future__ import annotations

import threading

from app.core.config import settings
from app.core.logging import get_logger
from app.ml.models import (
    AnomalyDetector,
    BehaviorClassifier,
    SavingsForecaster,
    SpendingPredictor,
)

log = get_logger("ml.registry")


class ModelRegistry:
    """Thread-safe holder for the live set of model wrappers."""

    def __init__(self, model_dir: str) -> None:
        self._model_dir = model_dir
        self._lock = threading.Lock()
        self.spending: SpendingPredictor | None = None
        self.behavior: BehaviorClassifier | None = None
        self.anomaly: AnomalyDetector | None = None
        self.savings: SavingsForecaster | None = None

    def load(self) -> None:
        with self._lock:
            self.spending = SpendingPredictor.load(self._model_dir)
            self.behavior = BehaviorClassifier.load(self._model_dir)
            self.anomaly = AnomalyDetector.load(self._model_dir)
            self.savings = SavingsForecaster.load(self._model_dir)
            log.info("Model registry loaded from %s", self._model_dir)

    def reload(self) -> None:
        """Hot-reload artifacts (called after a retraining job completes)."""
        log.info("Reloading model registry")
        self.load()

    @property
    def versions(self) -> dict[str, str]:
        return {
            "spending_predictor": self.spending.version if self.spending else "unloaded",
            "behavior_classifier": self.behavior.version if self.behavior else "unloaded",
            "anomaly_detector": self.anomaly.version if self.anomaly else "unloaded",
            "savings_forecaster": self.savings.version if self.savings else "unloaded",
        }


_registry: ModelRegistry | None = None


def get_model_registry() -> ModelRegistry:
    """Return the process-wide registry, loading models on first access."""
    global _registry
    if _registry is None:
        _registry = ModelRegistry(settings.ML_MODEL_DIR)
        _registry.load()
    return _registry
