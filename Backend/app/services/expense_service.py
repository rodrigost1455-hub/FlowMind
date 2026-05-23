"""Expense domain service — CRUD, filtering, pagination, grouping."""

from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import cache_invalidate
from app.models.expense import Expense
from app.schemas.common import PageParams
from app.schemas.expense import ExpenseCreate, ExpenseFilter, ExpenseUpdate
from app.utils.pagination import paginate


class ExpenseService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def _invalidate(self, user_id: uuid.UUID) -> None:
        """Drop derived caches whenever a user's expenses change."""
        await cache_invalidate(f"*:user:{user_id}*")

    # ── reads ────────────────────────────────────────────────────
    async def get(self, user_id: uuid.UUID, expense_id: uuid.UUID) -> Expense | None:
        stmt = select(Expense).where(
            Expense.id == expense_id, Expense.user_id == user_id
        )
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def list_all(self, user_id: uuid.UUID) -> list[Expense]:
        """Every expense for a user — used by analytics / ML pipelines."""
        stmt = (
            select(Expense)
            .where(Expense.user_id == user_id)
            .order_by(Expense.occurred_at.desc())
        )
        return list((await self.db.execute(stmt)).scalars().all())

    async def list_paginated(
        self, user_id: uuid.UUID, filters: ExpenseFilter, page: PageParams
    ) -> tuple[list[Expense], int]:
        stmt = (
            select(Expense)
            .where(Expense.user_id == user_id)
            .order_by(Expense.occurred_at.desc())
        )
        stmt = self._apply_filters(stmt, filters)
        return await paginate(self.db, stmt, offset=page.offset, limit=page.size)

    @staticmethod
    def _apply_filters(stmt: Any, f: ExpenseFilter) -> Any:
        conds = []
        if f.category_slug:
            conds.append(Expense.category_slug == f.category_slug)
        if f.payment_method:
            conds.append(Expense.payment_method == f.payment_method)
        if f.emotional_state:
            conds.append(Expense.emotional_state == f.emotional_state)
        if f.date_from:
            conds.append(Expense.occurred_at >= f.date_from)
        if f.date_to:
            conds.append(Expense.occurred_at <= f.date_to)
        if f.min_amount is not None:
            conds.append(Expense.amount >= f.min_amount)
        if f.max_amount is not None:
            conds.append(Expense.amount <= f.max_amount)
        if f.search:
            like = f"%{f.search}%"
            conds.append(or_(Expense.merchant.ilike(like), Expense.notes.ilike(like)))
        return stmt.where(and_(*conds)) if conds else stmt

    async def group_by_category(self, user_id: uuid.UUID) -> list[dict[str, Any]]:
        """Aggregate outflow per category directly in the database."""
        stmt = (
            select(
                Expense.category_slug,
                func.sum(func.abs(Expense.amount)).label("total"),
                func.count().label("count"),
                func.avg(func.abs(Expense.amount)).label("avg"),
            )
            .where(Expense.user_id == user_id, Expense.amount < 0)
            .group_by(Expense.category_slug)
            .order_by(func.sum(func.abs(Expense.amount)).desc())
        )
        rows = (await self.db.execute(stmt)).all()
        return [
            {
                "category_slug": r.category_slug,
                "total": round(float(r.total or 0), 2),
                "count": int(r.count),
                "avg": round(float(r.avg or 0), 2),
            }
            for r in rows
        ]

    # ── writes ───────────────────────────────────────────────────
    async def create(self, user_id: uuid.UUID, data: ExpenseCreate) -> Expense:
        expense = Expense(user_id=user_id, **data.model_dump())
        self.db.add(expense)
        await self.db.flush()
        await self.db.refresh(expense)
        await self._invalidate(user_id)
        return expense

    async def update(
        self, expense: Expense, data: ExpenseUpdate
    ) -> Expense:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(expense, field, value)
        await self.db.flush()
        await self.db.refresh(expense)
        await self._invalidate(expense.user_id)
        return expense

    async def delete(self, expense: Expense) -> None:
        user_id = expense.user_id
        await self.db.delete(expense)
        await self.db.flush()
        await self._invalidate(user_id)
