"""AI insights & weekly summary endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, status

from app.auth.dependencies import CurrentUser, DbSession
from app.schemas.insight import InsightPublic, WeeklySummaryPublic
from app.services.insight_service import InsightService
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=list[InsightPublic])
async def list_insights(user: CurrentUser, db: DbSession) -> list[InsightPublic]:
    """List the user's active (non-dismissed) AI insights."""
    rows = await InsightService(db).list_active(user.id)
    return [InsightPublic.model_validate(r) for r in rows]


@router.post("/generate", response_model=list[InsightPublic])
async def generate_insights(user: CurrentUser, db: DbSession) -> list[InsightPublic]:
    """Recompute insights from the latest expenses and ML predictions."""
    predictions = await PredictionService(db).run(user.id, persist=False)
    rows = await InsightService(db).regenerate(user.id, predictions)
    return [InsightPublic.model_validate(r) for r in rows]


@router.post("/{insight_id}/read", response_model=InsightPublic)
async def mark_read(
    insight_id: uuid.UUID, user: CurrentUser, db: DbSession
) -> InsightPublic:
    """Mark an insight as read."""
    insight = await InsightService(db).mark_read(user.id, insight_id)
    if insight is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Insight not found")
    return InsightPublic.model_validate(insight)


@router.post("/{insight_id}/dismiss", response_model=InsightPublic)
async def dismiss(
    insight_id: uuid.UUID, user: CurrentUser, db: DbSession
) -> InsightPublic:
    """Dismiss an insight so it no longer appears in the active list."""
    insight = await InsightService(db).dismiss(user.id, insight_id)
    if insight is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Insight not found")
    return InsightPublic.model_validate(insight)


@router.get("/weekly-summary", response_model=WeeklySummaryPublic | None)
async def latest_weekly_summary(
    user: CurrentUser, db: DbSession
) -> WeeklySummaryPublic | None:
    """Return the most recent AI weekly summary, if one exists."""
    summary = await InsightService(db).latest_summary(user.id)
    return WeeklySummaryPublic.model_validate(summary) if summary else None


@router.post("/weekly-summary/generate", response_model=WeeklySummaryPublic)
async def generate_weekly_summary(
    user: CurrentUser, db: DbSession
) -> WeeklySummaryPublic:
    """Generate (or refresh) this week's AI summary."""
    summary = await InsightService(db).generate_summary(user.id)
    return WeeklySummaryPublic.model_validate(summary)
