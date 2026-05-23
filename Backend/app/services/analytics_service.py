"""Analytics service — period analytics, overview, caching."""

from __future__ import annotations

import uuid
from datetime import timedelta
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.calculators import (
    compute_period_analytics,
    savings_trend,
    spending_heatmap,
)
from app.core.cache import cache_get, cache_set
from app.models.user import User
from app.services.expense_service import ExpenseService
from app.utils.datetime import as_utc, month_bounds, week_bounds


class AnalyticsService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.expenses = ExpenseService(db)

    async def _expenses(self, user_id: uuid.UUID) -> list[Any]:
        return await self.expenses.list_all(user_id)

    @staticmethod
    def _in_window(expenses: list[Any], start, end) -> list[Any]:
        return [e for e in expenses if start <= as_utc(e.occurred_at) < end]

    async def weekly(self, user_id: uuid.UUID) -> dict[str, Any]:
        cached = await cache_get(f"analytics:week:user:{user_id}")
        if cached:
            return cached

        expenses = await self._expenses(user_id)
        start, end = week_bounds()
        prev_start, prev_end = week_bounds(start - timedelta(days=1))
        result = compute_period_analytics(
            self._in_window(expenses, start, end),
            "week", start, end,
            self._in_window(expenses, prev_start, prev_end),
        )
        await cache_set(f"analytics:week:user:{user_id}", result)
        return result

    async def monthly(self, user_id: uuid.UUID) -> dict[str, Any]:
        cached = await cache_get(f"analytics:month:user:{user_id}")
        if cached:
            return cached

        expenses = await self._expenses(user_id)
        start, end = month_bounds()
        prev_start, prev_end = month_bounds(start - timedelta(days=1))
        result = compute_period_analytics(
            self._in_window(expenses, start, end),
            "month", start, end,
            self._in_window(expenses, prev_start, prev_end),
        )
        await cache_set(f"analytics:month:user:{user_id}", result)
        return result

    async def overview(self, user: User) -> dict[str, Any]:
        """Aggregate dashboard payload."""
        expenses = await self._expenses(user.id)
        balance = round(sum(e.amount for e in expenses), 2)

        week = await self.weekly(user.id)
        month = await self.monthly(user.id)

        weekly_budget = user.weekly_budget or 0.0
        budget_used = (
            round(week["total_spent"] / weekly_budget * 100, 1)
            if weekly_budget else 0.0
        )
        return {
            "balance": balance,
            "income": user.monthly_income,
            "spent_this_week": week["total_spent"],
            "weekly_budget": weekly_budget,
            "budget_used_pct": budget_used,
            "week": week,
            "month": month,
            "savings_trend": savings_trend(expenses),
            "heatmap": spending_heatmap(expenses),
        }

    async def heatmap(self, user_id: uuid.UUID) -> list[dict[str, Any]]:
        return spending_heatmap(await self._expenses(user_id))

    async def savings(self, user_id: uuid.UUID) -> list[dict[str, Any]]:
        return savings_trend(await self._expenses(user_id))
