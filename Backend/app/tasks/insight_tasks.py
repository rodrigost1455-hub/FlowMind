"""Celery tasks: AI insight generation."""

from __future__ import annotations

import uuid

from app.core.celery_app import celery
from app.core.logging import get_logger
from app.services.insight_service import InsightService
from app.services.prediction_service import PredictionService
from app.tasks.base import all_user_ids, run_async, with_session

log = get_logger("tasks.insights")


@celery.task(name="tasks.generate_insights")
def generate_insights(user_id: str) -> dict:
    """Regenerate AI insights for a user, grounded in ML predictions."""
    async def _job(db):
        uid = uuid.UUID(user_id)
        predictions = await PredictionService(db).run(uid, persist=False)
        rows = await InsightService(db).regenerate(uid, predictions)
        return {"user_id": user_id, "insights": len(rows)}

    return run_async(with_session(_job))


@celery.task(name="tasks.generate_all_insights")
def generate_all_insights() -> dict:
    """Fan-out insight regeneration across every active user."""
    user_ids = run_async(all_user_ids())
    for uid in user_ids:
        generate_insights.delay(str(uid))
    log.info("Queued insight generation for %d users", len(user_ids))
    return {"queued": len(user_ids)}
