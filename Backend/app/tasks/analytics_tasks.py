"""Celery tasks: analytics generation and weekly summaries."""

from __future__ import annotations

import uuid

from app.core.celery_app import celery
from app.core.logging import get_logger
from app.services.analytics_service import AnalyticsService
from app.services.insight_service import InsightService
from app.tasks.base import all_user_ids, run_async, with_session

log = get_logger("tasks.analytics")


@celery.task(name="tasks.refresh_user_analytics")
def refresh_user_analytics(user_id: str) -> dict:
    """Recompute and cache analytics for a single user."""
    async def _job(db):
        svc = AnalyticsService(db)
        await svc.weekly(uuid.UUID(user_id))
        await svc.monthly(uuid.UUID(user_id))
        return {"user_id": user_id, "status": "refreshed"}

    return run_async(with_session(_job))


@celery.task(name="tasks.refresh_all_analytics")
def refresh_all_analytics() -> dict:
    """Nightly fan-out: refresh analytics caches for every active user."""
    user_ids = run_async(all_user_ids())
    for uid in user_ids:
        refresh_user_analytics.delay(str(uid))
    log.info("Queued analytics refresh for %d users", len(user_ids))
    return {"queued": len(user_ids)}


@celery.task(name="tasks.generate_weekly_summary")
def generate_weekly_summary(user_id: str) -> dict:
    """Generate the AI weekly summary for a single user."""
    async def _job(db):
        summary = await InsightService(db).generate_summary(uuid.UUID(user_id))
        return {"user_id": user_id, "week_start": summary.week_start.isoformat()}

    return run_async(with_session(_job))


@celery.task(name="tasks.generate_weekly_summaries")
def generate_weekly_summaries() -> dict:
    """Monday fan-out: generate weekly summaries for every active user."""
    user_ids = run_async(all_user_ids())
    for uid in user_ids:
        generate_weekly_summary.delay(str(uid))
    log.info("Queued weekly summaries for %d users", len(user_ids))
    return {"queued": len(user_ids)}
