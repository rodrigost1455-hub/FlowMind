"""Analytics endpoints — weekly / monthly / overview / heatmap / trends."""

from __future__ import annotations

from fastapi import APIRouter

from app.auth.dependencies import CurrentUser, DbSession
from app.schemas.analytics import (
    AnalyticsOverview,
    CategoryBreakdownItem,
    HeatmapCell,
    PeriodAnalytics,
    SavingsTrendPoint,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def overview(user: CurrentUser, db: DbSession) -> AnalyticsOverview:
    """Aggregate dashboard payload (balance, week, month, trends, heatmap)."""
    data = await AnalyticsService(db).overview(user)
    return AnalyticsOverview(**data)


@router.get("/weekly", response_model=PeriodAnalytics)
async def weekly(user: CurrentUser, db: DbSession) -> PeriodAnalytics:
    """Analytics for the current week."""
    return PeriodAnalytics(**await AnalyticsService(db).weekly(user.id))


@router.get("/monthly", response_model=PeriodAnalytics)
async def monthly(user: CurrentUser, db: DbSession) -> PeriodAnalytics:
    """Analytics for the current month."""
    return PeriodAnalytics(**await AnalyticsService(db).monthly(user.id))


@router.get("/category-breakdown", response_model=list[CategoryBreakdownItem])
async def category_breakdown(user: CurrentUser, db: DbSession) -> list[CategoryBreakdownItem]:
    """Weekly spend split by category."""
    week = await AnalyticsService(db).weekly(user.id)
    return [CategoryBreakdownItem(**c) for c in week["category_breakdown"]]


@router.get("/savings-trend", response_model=list[SavingsTrendPoint])
async def savings_trend(user: CurrentUser, db: DbSession) -> list[SavingsTrendPoint]:
    """Weekly net savings with a running cumulative total."""
    return [SavingsTrendPoint(**p) for p in await AnalyticsService(db).savings(user.id)]


@router.get("/heatmap", response_model=list[HeatmapCell])
async def heatmap(user: CurrentUser, db: DbSession) -> list[HeatmapCell]:
    """Weekday x hour spending-intensity heatmap."""
    return [HeatmapCell(**c) for c in await AnalyticsService(db).heatmap(user.id)]
