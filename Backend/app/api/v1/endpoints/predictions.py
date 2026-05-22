"""ML prediction endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.auth.dependencies import AdminUser, CurrentUser, DbSession
from app.ml.inference.registry import get_model_registry
from app.schemas.prediction import (
    AnomalyResult,
    BehaviorProfile,
    PredictionBundle,
    PredictionPublic,
    SavingsForecast,
    SpendingForecast,
)
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("", response_model=PredictionBundle)
async def get_predictions(user: CurrentUser, db: DbSession) -> PredictionBundle:
    """Run every model and return the full prediction bundle."""
    data = await PredictionService(db).run(user.id, persist=True)
    return PredictionBundle(
        spending=SpendingForecast(**data["spending"]),
        behavior=BehaviorProfile(**data["behavior"]),
        savings=SavingsForecast(**data["savings"]),
        anomalies=[AnomalyResult(**a) for a in data["anomalies"]],
    )


@router.get("/spending", response_model=SpendingForecast)
async def spending_forecast(user: CurrentUser, db: DbSession) -> SpendingForecast:
    """Predicted weekly / monthly spend and overspend probability."""
    data = await PredictionService(db).run(user.id, persist=False)
    return SpendingForecast(**data["spending"])


@router.get("/behavior", response_model=BehaviorProfile)
async def behavior_profile(user: CurrentUser, db: DbSession) -> BehaviorProfile:
    """Classify the user's financial behaviour."""
    data = await PredictionService(db).run(user.id, persist=False)
    return BehaviorProfile(**data["behavior"])


@router.get("/savings", response_model=SavingsForecast)
async def savings_forecast(user: CurrentUser, db: DbSession) -> SavingsForecast:
    """Forecast future savings and financial-decline risk."""
    data = await PredictionService(db).run(user.id, persist=False)
    return SavingsForecast(**data["savings"])


@router.get("/anomalies", response_model=list[AnomalyResult])
async def anomalies(user: CurrentUser, db: DbSession) -> list[AnomalyResult]:
    """Detect unusual / risky transactions."""
    data = await PredictionService(db).run(user.id, persist=False)
    return [AnomalyResult(**a) for a in data["anomalies"]]


@router.get("/history", response_model=list[PredictionPublic])
async def prediction_history(user: CurrentUser, db: DbSession) -> list[PredictionPublic]:
    """Return recent persisted predictions for the user."""
    rows = await PredictionService(db).history(user.id)
    return [PredictionPublic.model_validate(r) for r in rows]


@router.get("/models", response_model=dict[str, str])
async def model_versions(user: CurrentUser) -> dict[str, str]:
    """Report the live version of each ML model."""
    return get_model_registry().versions


@router.post("/models/reload", response_model=dict[str, str])
async def reload_models(admin: AdminUser) -> dict[str, str]:
    """Hot-reload model artifacts from disk (admin only)."""
    registry = get_model_registry()
    registry.reload()
    return registry.versions
