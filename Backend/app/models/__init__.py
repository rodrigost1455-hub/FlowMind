"""SQLAlchemy models. Importing this package registers every table on Base."""

from app.database.base import Base
from app.models.achievement import Achievement, Challenge
from app.models.category import Category
from app.models.enums import (
    BehaviorClass,
    EmotionalState,
    InsightTone,
    PaymentMethod,
    PredictionType,
    UserRole,
)
from app.models.expense import Expense
from app.models.financial_score import FinancialScore
from app.models.insight import AIInsight
from app.models.prediction import Prediction
from app.models.spending_trend import SpendingTrend
from app.models.user import User
from app.models.weekly_summary import WeeklySummary

__all__ = [
    "Base",
    "User",
    "Category",
    "Expense",
    "AIInsight",
    "FinancialScore",
    "WeeklySummary",
    "Achievement",
    "Challenge",
    "Prediction",
    "SpendingTrend",
    "UserRole",
    "EmotionalState",
    "PaymentMethod",
    "InsightTone",
    "BehaviorClass",
    "PredictionType",
]
