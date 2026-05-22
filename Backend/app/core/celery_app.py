"""Celery application and beat schedule for background ML / analytics jobs."""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery = Celery(
    "flowmind",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.analytics_tasks",
        "app.tasks.ml_tasks",
        "app.tasks.insight_tasks",
    ],
)

celery.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,
    worker_max_tasks_per_child=200,
)

# ── Periodic schedule ────────────────────────────────────────────
celery.conf.beat_schedule = {
    "weekly-summaries": {
        "task": "tasks.generate_weekly_summaries",
        "schedule": crontab(hour=6, minute=0, day_of_week="monday"),
    },
    "nightly-analytics-refresh": {
        "task": "tasks.refresh_all_analytics",
        "schedule": crontab(hour=3, minute=0),
    },
    "weekly-model-retrain": {
        "task": "tasks.retrain_models",
        "schedule": crontab(hour=4, minute=0, day_of_week="sunday"),
    },
}
