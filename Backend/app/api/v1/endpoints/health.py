"""Financial Health Score endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.auth.dependencies import CurrentUser, DbSession
from app.schemas.health import FinancialHealthResponse, ScoreComponents, ScoreHistoryPoint
from app.services.health_service import HealthService

router = APIRouter(prefix="/financial-health", tags=["financial-health"])


@router.get("/score", response_model=FinancialHealthResponse)
async def get_score(user: CurrentUser, db: DbSession) -> FinancialHealthResponse:
    """Compute the current Financial Health Score™ and persist a snapshot."""
    data = await HealthService(db).compute(user.id, persist=True)
    return FinancialHealthResponse(
        score=data["score"],
        delta=data["delta"],
        grade=data["grade"],
        components=ScoreComponents(**data["components"]),
        warnings=data["warnings"],
        strengths=data["strengths"],
        recommendations=data["recommendations"],
        computed_at=datetime.now(timezone.utc),
    )


@router.get("/history", response_model=list[ScoreHistoryPoint])
async def score_history(user: CurrentUser, db: DbSession) -> list[ScoreHistoryPoint]:
    """Return recent Financial Health Score snapshots for charting."""
    rows = await HealthService(db).history(user.id)
    return [ScoreHistoryPoint(**r) for r in rows]
