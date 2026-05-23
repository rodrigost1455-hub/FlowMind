"""Aggregates every v1 endpoint module into a single router."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    auth,
    expenses,
    health,
    insights,
    predictions,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(expenses.router)
api_router.include_router(analytics.router)
api_router.include_router(health.router)
api_router.include_router(insights.router)
api_router.include_router(predictions.router)
