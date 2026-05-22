"""Authentication endpoints."""

from __future__ import annotations

from fastapi import APIRouter, status

from app.auth.dependencies import CurrentUser, DbSession
from app.auth.service import AuthService
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    OnboardingStatus,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenPair,
)
from app.schemas.common import Message
from app.schemas.user import UserPublic
from app.services.expense_service import ExpenseService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: DbSession) -> TokenPair:
    """Create an account and return an access / refresh token pair."""
    service = AuthService(db)
    user = await service.register(payload)
    return service.issue_tokens(user)


@router.post("/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: DbSession) -> TokenPair:
    """Authenticate with email + password."""
    service = AuthService(db)
    user = await service.authenticate(payload.email, payload.password)
    return service.issue_tokens(user)


@router.post("/refresh", response_model=TokenPair)
async def refresh_token(payload: RefreshRequest, db: DbSession) -> TokenPair:
    """Exchange a valid refresh token for a new token pair."""
    return await AuthService(db).refresh(payload.refresh_token)


@router.post("/forgot-password", response_model=Message)
async def forgot_password(payload: ForgotPasswordRequest, db: DbSession) -> Message:
    """Begin a password reset.

    Always returns 200 — the response never reveals whether the email is
    registered. In production the reset token is emailed; here it is
    logged by the service layer.
    """
    await AuthService(db).create_reset_token(payload.email)
    return Message(detail="If that email exists, a reset link has been sent.")


@router.post("/reset-password", response_model=Message)
async def reset_password(payload: ResetPasswordRequest, db: DbSession) -> Message:
    """Complete a password reset using a valid reset token."""
    await AuthService(db).reset_password(payload.token, payload.new_password)
    return Message(detail="Password updated successfully.")


@router.get("/me", response_model=UserPublic)
async def me(user: CurrentUser) -> UserPublic:
    """Return the authenticated user's profile."""
    return UserPublic.model_validate(user)


@router.get("/onboarding-status", response_model=OnboardingStatus)
async def onboarding_status(user: CurrentUser, db: DbSession) -> OnboardingStatus:
    """Report onboarding progress so the app can route the user correctly."""
    expenses = await ExpenseService(db).list_all(user.id)
    return OnboardingStatus(
        onboarding_completed=user.onboarding_completed,
        monthly_income=user.monthly_income,
        weekly_budget=user.weekly_budget,
        has_expenses=len(expenses) > 0,
    )
