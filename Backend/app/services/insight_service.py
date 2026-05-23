"""Insight service — generates, persists and serves AI insights & summaries."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.insights.engine import generate_insights
from app.insights.summary import generate_weekly_summary
from app.models.insight import AIInsight
from app.models.weekly_summary import WeeklySummary
from app.services.expense_service import ExpenseService
from app.utils.datetime import as_utc, week_bounds


class InsightService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.expenses = ExpenseService(db)

    # ── insights ─────────────────────────────────────────────────
    async def list_active(self, user_id: uuid.UUID) -> list[AIInsight]:
        stmt = (
            select(AIInsight)
            .where(AIInsight.user_id == user_id, AIInsight.is_dismissed.is_(False))
            .order_by(AIInsight.confidence.desc(), AIInsight.created_at.desc())
        )
        return list((await self.db.execute(stmt)).scalars().all())

    async def regenerate(
        self, user_id: uuid.UUID, predictions: dict[str, Any] | None = None
    ) -> list[AIInsight]:
        """Recompute insights from current data.

        Dismissed insights are preserved; all other auto-generated
        insights are replaced with the freshly detected set.
        """
        expenses = await self.expenses.list_all(user_id)
        generated = generate_insights(expenses, predictions)

        existing = await self.list_active(user_id)
        for row in existing:
            await self.db.delete(row)
        await self.db.flush()

        created: list[AIInsight] = []
        for item in generated:
            insight = AIInsight(
                user_id=user_id,
                tone=item["tone"],
                title=item["title"],
                body=item["body"],
                action_label=item["action_label"],
                source=item["source"],
                confidence=item["confidence"],
            )
            self.db.add(insight)
            created.append(insight)
        await self.db.flush()
        for row in created:
            await self.db.refresh(row)
        return created

    async def mark_read(self, user_id: uuid.UUID, insight_id: uuid.UUID) -> AIInsight | None:
        insight = await self._get(user_id, insight_id)
        if insight:
            insight.is_read = True
            await self.db.flush()
        return insight

    async def dismiss(self, user_id: uuid.UUID, insight_id: uuid.UUID) -> AIInsight | None:
        insight = await self._get(user_id, insight_id)
        if insight:
            insight.is_dismissed = True
            await self.db.flush()
        return insight

    async def _get(self, user_id: uuid.UUID, insight_id: uuid.UUID) -> AIInsight | None:
        stmt = select(AIInsight).where(
            AIInsight.id == insight_id, AIInsight.user_id == user_id
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    # ── weekly summary ───────────────────────────────────────────
    async def latest_summary(self, user_id: uuid.UUID) -> WeeklySummary | None:
        stmt = (
            select(WeeklySummary)
            .where(WeeklySummary.user_id == user_id)
            .order_by(WeeklySummary.week_start.desc())
            .limit(1)
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def generate_summary(self, user_id: uuid.UUID) -> WeeklySummary:
        """Build and upsert the current week's AI summary."""
        from datetime import timedelta

        expenses = await self.expenses.list_all(user_id)
        start, end = week_bounds()
        prev_start, prev_end = week_bounds(start - timedelta(days=1))

        this_week = [e for e in expenses if start <= as_utc(e.occurred_at) < end]
        last_week = [e for e in expenses if prev_start <= as_utc(e.occurred_at) < prev_end]
        data = generate_weekly_summary(this_week, last_week)

        stmt = select(WeeklySummary).where(
            WeeklySummary.user_id == user_id,
            WeeklySummary.week_start == data["week_start"],
        )
        summary = (await self.db.execute(stmt)).scalar_one_or_none()
        if summary is None:
            summary = WeeklySummary(user_id=user_id, **data)
            self.db.add(summary)
        else:
            for field, value in data.items():
                setattr(summary, field, value)
        await self.db.flush()
        await self.db.refresh(summary)
        return summary
