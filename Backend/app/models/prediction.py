"""ML prediction model — persists every model inference for audit / charts."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import PredictionType

if TYPE_CHECKING:
    from app.models.user import User


class Prediction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "predictions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    prediction_type: Mapped[PredictionType] = mapped_column(
        Enum(PredictionType, name="prediction_type"), nullable=False
    )

    value: Mapped[float] = mapped_column(Float, nullable=False)
    # Free-form label for classification outputs (e.g. "impulsive").
    label: Mapped[str | None] = mapped_column(String(40), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)

    # Which model version produced this (MLflow run id or "heuristic-v0").
    model_version: Mapped[str] = mapped_column(String(80), default="heuristic-v0", nullable=False)
    features: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    user: Mapped[User] = relationship(back_populates="predictions")
