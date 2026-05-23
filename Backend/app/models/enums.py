"""Domain enumerations shared across models and schemas."""

import enum


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class EmotionalState(str, enum.Enum):
    """Self-reported mood at purchase time — a core FlowMind signal."""

    HAPPY = "happy"
    NEUTRAL = "neutral"
    STRESSED = "stressed"
    BORED = "bored"
    SAD = "sad"
    EXCITED = "excited"


class PaymentMethod(str, enum.Enum):
    CARD = "card"
    CASH = "cash"
    TRANSFER = "transfer"
    WALLET = "wallet"
    DIRECT_DEPOSIT = "direct_deposit"


class InsightTone(str, enum.Enum):
    GOOD = "good"
    WARN = "warn"
    INFO = "info"


class BehaviorClass(str, enum.Enum):
    IMPULSIVE = "impulsive"
    STABLE = "stable"
    CONSERVATIVE = "conservative"
    HIGH_RISK = "high_risk"


class PredictionType(str, enum.Enum):
    WEEKLY_SPENDING = "weekly_spending"
    MONTHLY_SPENDING = "monthly_spending"
    OVERSPEND_PROBABILITY = "overspend_probability"
    SAVINGS_FORECAST = "savings_forecast"
    BEHAVIOR_CLASS = "behavior_class"
