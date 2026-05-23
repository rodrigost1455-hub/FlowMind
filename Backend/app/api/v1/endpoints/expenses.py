"""Expense CRUD, filtering, pagination and category grouping endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from app.auth.dependencies import CurrentUser, DbSession
from app.models.enums import EmotionalState, PaymentMethod
from app.schemas.common import Page, PageParams
from app.schemas.expense import (
    CategoryGroup,
    ExpenseCreate,
    ExpenseFilter,
    ExpensePublic,
    ExpenseUpdate,
)
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpensePublic, status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreate, user: CurrentUser, db: DbSession
) -> ExpensePublic:
    """Create a new expense / transaction."""
    expense = await ExpenseService(db).create(user.id, payload)
    return ExpensePublic.model_validate(expense)


@router.get("", response_model=Page[ExpensePublic])
async def list_expenses(
    user: CurrentUser,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
    category_slug: str | None = None,
    payment_method: PaymentMethod | None = None,
    emotional_state: EmotionalState | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    min_amount: float | None = None,
    max_amount: float | None = None,
    search: Annotated[str | None, Query(description="Match merchant or notes")] = None,
) -> Page[ExpensePublic]:
    """List expenses with filtering and pagination."""
    filters = ExpenseFilter(
        category_slug=category_slug,
        payment_method=payment_method,
        emotional_state=emotional_state,
        date_from=date_from,
        date_to=date_to,
        min_amount=min_amount,
        max_amount=max_amount,
        search=search,
    )
    params = PageParams(page=page, size=size)
    rows, total = await ExpenseService(db).list_paginated(user.id, filters, params)
    return Page.create(
        [ExpensePublic.model_validate(r) for r in rows], total, params
    )


@router.get("/by-category", response_model=list[CategoryGroup])
async def grouped_by_category(user: CurrentUser, db: DbSession) -> list[CategoryGroup]:
    """Aggregate the user's outflow grouped by category."""
    rows = await ExpenseService(db).group_by_category(user.id)
    return [CategoryGroup(**r) for r in rows]


@router.get("/{expense_id}", response_model=ExpensePublic)
async def get_expense(
    expense_id: uuid.UUID, user: CurrentUser, db: DbSession
) -> ExpensePublic:
    """Fetch a single expense by id."""
    expense = await ExpenseService(db).get(user.id, expense_id)
    if expense is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Expense not found")
    return ExpensePublic.model_validate(expense)


@router.patch("/{expense_id}", response_model=ExpensePublic)
async def update_expense(
    expense_id: uuid.UUID, payload: ExpenseUpdate, user: CurrentUser, db: DbSession
) -> ExpensePublic:
    """Edit an existing expense."""
    service = ExpenseService(db)
    expense = await service.get(user.id, expense_id)
    if expense is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Expense not found")
    updated = await service.update(expense, payload)
    return ExpensePublic.model_validate(updated)


@router.delete(
    "/{expense_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None
)
async def delete_expense(
    expense_id: uuid.UUID, user: CurrentUser, db: DbSession
) -> None:
    """Delete an expense."""
    service = ExpenseService(db)
    expense = await service.get(user.id, expense_id)
    if expense is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Expense not found")
    await service.delete(expense)
