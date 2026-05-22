"""Celery background tasks. Importing this package registers every task."""

from app.tasks import analytics_tasks, insight_tasks, ml_tasks  # noqa: F401
