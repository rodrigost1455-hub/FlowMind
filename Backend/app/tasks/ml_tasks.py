"""Celery tasks: ML inference and scheduled model retraining."""

from __future__ import annotations

import uuid

from app.core.celery_app import celery
from app.core.logging import get_logger
from app.services.health_service import HealthService
from app.services.prediction_service import PredictionService
from app.tasks.base import run_async, with_session

log = get_logger("tasks.ml")


@celery.task(name="tasks.run_predictions")
def run_predictions(user_id: str) -> dict:
    """Run the full ML pipeline for a user and persist the predictions."""
    async def _job(db):
        result = await PredictionService(db).run(uuid.UUID(user_id), persist=True)
        return {
            "user_id": user_id,
            "behavior_class": result["behavior"]["behavior_class"],
            "anomalies": len(result["anomalies"]),
        }

    return run_async(with_session(_job))


@celery.task(name="tasks.compute_health_score")
def compute_health_score(user_id: str) -> dict:
    """Recompute and snapshot a user's Financial Health Score."""
    async def _job(db):
        data = await HealthService(db).compute(uuid.UUID(user_id), persist=True)
        return {"user_id": user_id, "score": data["score"]}

    return run_async(with_session(_job))


@celery.task(name="tasks.retrain_models", bind=True)
def retrain_models(self) -> dict:
    """Scheduled retraining of every ML model.

    Runs the training pipelines, then hot-reloads the registry so the
    API immediately serves the new artifacts — no redeploy required.
    """
    from app.ml.inference.registry import get_model_registry
    from app.ml.training.train import train_all

    log.info("Starting scheduled model retraining ...")
    metrics = train_all()
    get_model_registry().reload()
    log.info("Retraining complete: %s", metrics)
    return {"status": "retrained", "metrics": metrics}
