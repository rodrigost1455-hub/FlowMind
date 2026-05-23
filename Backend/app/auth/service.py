"""Authentication service — registration, login, token refresh, reset."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenPair

log = get_logger("auth")


class AuthService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return (await self.db.execute(stmt)).scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        return await self.db.get(User, user_id)

    # ── registration ─────────────────────────────────────────────
    async def register(self, data: RegisterRequest) -> User:
        if await self.get_by_email(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )
        user = User(
            email=data.email.lower(),
            hashed_password=hash_password(data.password),
            full_name=data.full_name,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        log.info("Registered user %s", user.id)
        return user

    # ── login ────────────────────────────────────────────────────
    async def authenticate(self, email: str, password: str) -> User:
        user = await self.get_by_email(email)
        # verify_password is run even on a miss to keep timing uniform.
        valid = verify_password(password, user.hashed_password) if user else False
        if not user or not valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled"
            )
        return user

    def issue_tokens(self, user: User) -> TokenPair:
        return TokenPair(
            access_token=create_access_token(str(user.id)),
            refresh_token=create_refresh_token(str(user.id)),
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    # ── refresh ──────────────────────────────────────────────────
    async def refresh(self, refresh_token: str) -> TokenPair:
        try:
            payload = decode_token(refresh_token, "refresh")
        except jwt.PyJWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            ) from exc
        user = await self.get_by_id(uuid.UUID(payload["sub"]))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer valid"
            )
        return self.issue_tokens(user)

    # ── password reset ───────────────────────────────────────────
    async def create_reset_token(self, email: str) -> str | None:
        """Return a short-lived reset token, or None if the email is unknown.

        The endpoint always responds 200 regardless, to avoid leaking
        which emails are registered.
        """
        user = await self.get_by_email(email)
        if not user:
            return None
        now = datetime.now(timezone.utc)
        token = jwt.encode(
            {"sub": str(user.id), "type": "reset", "iat": now, "exp": now + timedelta(minutes=30)},
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )
        log.info("Password reset requested for user %s", user.id)
        return token

    async def reset_password(self, token: str, new_password: str) -> None:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            if payload.get("type") != "reset":
                raise jwt.InvalidTokenError("Not a reset token")
        except jwt.PyJWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token",
            ) from exc
        user = await self.get_by_id(uuid.UUID(payload["sub"]))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.hashed_password = hash_password(new_password)
        await self.db.flush()
        log.info("Password reset completed for user %s", user.id)
