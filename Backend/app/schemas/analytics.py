"""Analytics response schemas — shaped to match the frontend charts."""

from __future__ import annotations

from pydantic import BaseModel


class CategoryBreakdownItem(BaseModel):
    category_slug: str
    amount: float
    pct: float
    count: int


class DailyPoint(BaseModel):
    label: str          # "Mon", "Tue", ...
    date: str           # ISO date
    amount: float


class HeatmapCell(BaseModel):
    weekday: int        # 0 = Monday
    hour: int           # 0..23
    intensity: float    # 0..1, normalised spend density


class PeriodAnalytics(BaseModel):
    """Weekly or monthly analytics block."""

    period: str                  # "week" | "month"
    period_start: str
    period_end: str
    total_spent: float
    total_income: float
    net_saved: float
    avg_per_day: float
    avg_transaction: float
    transaction_count: int
    impulse_spend: float         # spend tagged to stressed/bored/sad moods
    impulse_pct: float
    vs_previous_pct: float
    daily: list[DailyPoint]
    category_breakdown: list[CategoryBreakdownItem]


class SavingsTrendPoint(BaseModel):
    period_start: str
    net_saved: float
    cumulative: float


class AnalyticsOverview(BaseModel):
    """Aggregate payload powering the dashboard screen."""

    balance: float
    income: float
    spent_this_week: float
    weekly_budget: float
    budget_used_pct: float
    week: PeriodAnalytics
    month: PeriodAnalytics
    savings_trend: list[SavingsTrendPoint]
    heatmap: list[HeatmapCell]
