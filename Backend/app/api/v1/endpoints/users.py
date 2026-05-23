"""User profile & onboarding endpoints."""

from __future__ import annotations

from fastapi import APIRouter

from app.auth.dependencies import CurrentUser, DbSession
from app.schemas.user import OnboardingUpdate, UserPublic, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.patch("/me", response_model=UserPublic)
async def update_profile(payload: UserUpdate, user: CurrentUser, db: DbSession) -> UserPublic:
    """Update the authenticated user's profile fields."""
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    await db.flush()
    await db.refresh(user)
    return UserPublic.model_validate(user)


@router.post("/me/onboarding", response_model=UserPublic)
async def complete_onboarding(
    payload: OnboardingUpdate, user: CurrentUser, db: DbSession
) -> UserPublic:
    """Persist onboarding answers (income + budget) and mark it complete."""
    user.monthly_income = payload.monthly_income
    user.weekly_budget = payload.weekly_budget
    user.onboarding_completed = payload.onboarding_completed
    await db.flush()
    await db.refresh(user)
    return UserPublic.model_validate(user)
