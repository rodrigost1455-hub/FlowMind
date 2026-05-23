"""Base class for FlowMind model wrappers.

Every model wrapper can run in two modes:

* **trained** — a serialised :class:`ModelArtifact` (estimator + scaler +
  metadata) was found on disk and loaded.
* **heuristic fallback** — no artifact exists yet, so the wrapper uses a
  transparent rule-based approximation. This keeps the whole API
  functional from a cold start and during the data-collection phase,
  while remaining a drop-in once real models are trained.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import joblib

from app.core.logging import get_logger

log = get_logger("ml.model")


@dataclass
class ModelArtifact:
    """Serialisable bundle persisted by the training pipelines."""

    name: str
    estimator: Any
    scaler: Any | None = None
    feature_names: list[str] = field(default_factory=list)
    version: str = "v0"
    metrics: dict[str, float] = field(default_factory=dict)
    trained_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BaseMLModel:
    """Common load / save / version behaviour for model wrappers."""

    #: filename used under ``settings.ML_MODEL_DIR``
    artifact_name: str = "base"

    def __init__(self, artifact: ModelArtifact | None = None) -> None:
        self.artifact = artifact

    # ── persistence ──────────────────────────────────────────────
    @classmethod
    def load(cls, model_dir: str) -> "BaseMLModel":
        path = os.path.join(model_dir, f"{cls.artifact_name}.joblib")
        if os.path.exists(path):
            try:
                artifact: ModelArtifact = joblib.load(path)
                log.info("Loaded %s artifact (version=%s)", cls.artifact_name, artifact.version)
                return cls(artifact)
            except Exception as exc:  # noqa: BLE001
                log.error("Failed to load %s, using heuristic: %s", cls.artifact_name, exc)
        else:
            log.warning("No artifact for %s — using heuristic fallback", cls.artifact_name)
        return cls(None)

    def save(self, model_dir: str) -> str:
        if self.artifact is None:
            raise ValueError("Cannot save a model with no artifact")
        os.makedirs(model_dir, exist_ok=True)
        path = os.path.join(model_dir, f"{self.artifact_name}.joblib")
        joblib.dump(self.artifact, path)
        log.info("Saved %s artifact to %s", self.artifact_name, path)
        return path

    # ── introspection ────────────────────────────────────────────
    @property
    def is_trained(self) -> bool:
        return self.artifact is not None

    @property
    def version(self) -> str:
        return self.artifact.version if self.artifact else "heuristic-v0"
