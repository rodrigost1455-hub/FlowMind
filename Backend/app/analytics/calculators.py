"""Pure analytics calculators.

These operate on a list of expense objects (ORM rows or dicts) and return
plain dictionaries shaped to match the analytics schemas. Keeping them
pure makes them trivial to unit-test and reuse from Celery tasks.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

import pandas as pd

from app.ml.features.engineering import IMPULSE_MOODS, build_transaction_frame
from app.utils.datetime import WEEKDAY_LABELS


def _pct_change(current: float, previous: float) -> float:
    if previous == 0:
        return 0.0 if current == 0 else 100.0
    return round((current - previous) / abs(previous) * 100.0, 1)


def compute_period_analytics(
    expenses: list[Any],
    period: str,
    period_start: datetime,
    period_end: datetime,
    previous_expenses: list[Any] | None = None,
) -> dict[str, Any]:
    """Compute the analytics block for a single period (week or month)."""
    df = build_transaction_frame(expenses)
    spent = float(df.loc[~df["is_income"], "outflow"].sum()) if not df.empty else 0.0
    income = float(df.loc[df["is_income"], "amount"].sum()) if not df.empty else 0.0

    out = df[~df["is_income"]] if not df.empty else df
    txn_count = int(len(out))
    days = max((period_end - period_start).days, 1)

    impulse_spend = (
        float(out.loc[out["emotional_state"].isin(IMPULSE_MOODS), "outflow"].sum())
        if not out.empty else 0.0
    )

    prev_spent = 0.0
    if previous_expenses is not None:
        pdf = build_transaction_frame(previous_expenses)
        prev_spent = float(pdf.loc[~pdf["is_income"], "outflow"].sum()) if not pdf.empty else 0.0

    return {
        "period": period,
        "period_start": period_start.date().isoformat(),
        "period_end": period_end.date().isoformat(),
        "total_spent": round(spent, 2),
        "total_income": round(income, 2),
        "net_saved": round(income - spent, 2),
        "avg_per_day": round(spent / days, 2),
        "avg_transaction": round(spent / txn_count, 2) if txn_count else 0.0,
        "transaction_count": txn_count,
        "impulse_spend": round(impulse_spend, 2),
        "impulse_pct": round(impulse_spend / spent * 100, 1) if spent else 0.0,
        "vs_previous_pct": _pct_change(spent, prev_spent),
        "daily": _daily_series(out, period_start, period_end),
        "category_breakdown": category_breakdown(expenses),
    }


def _daily_series(
    out: pd.DataFrame, start: datetime, end: datetime
) -> list[dict[str, Any]]:
    """Per-day outflow totals across the period (zero-filled)."""
    by_day: dict[str, float] = {}
    if not out.empty:
        grouped = out.set_index("occurred_at")["outflow"].resample("D").sum()
        by_day = {ts.date().isoformat(): float(v) for ts, v in grouped.items()}

    series: list[dict[str, Any]] = []
    cursor = start
    while cursor < end:
        iso = cursor.date().isoformat()
        series.append(
            {
                "label": WEEKDAY_LABELS[cursor.weekday()],
                "date": iso,
                "amount": round(by_day.get(iso, 0.0), 2),
            }
        )
        cursor += timedelta(days=1)
    return series


def category_breakdown(expenses: list[Any]) -> list[dict[str, Any]]:
    """Outflow grouped by category, sorted high -> low, with percentages."""
    df = build_transaction_frame(expenses)
    out = df[~df["is_income"]] if not df.empty else df
    if out.empty:
        return []
    total = float(out["outflow"].sum()) or 1.0
    grouped = out.groupby("category_slug")["outflow"].agg(["sum", "count"])
    items = [
        {
            "category_slug": slug,
            "amount": round(float(row["sum"]), 2),
            "pct": round(float(row["sum"]) / total * 100, 1),
            "count": int(row["count"]),
        }
        for slug, row in grouped.iterrows()
    ]
    return sorted(items, key=lambda i: i["amount"], reverse=True)


def savings_trend(expenses: list[Any], weeks: int = 12) -> list[dict[str, Any]]:
    """Net savings per week with a running cumulative total."""
    df = build_transaction_frame(expenses)
    if df.empty:
        return []
    weekly = df.set_index("occurred_at")["amount"].resample("W").sum().sort_index()
    weekly = weekly.tail(weeks)
    cumulative = 0.0
    points: list[dict[str, Any]] = []
    for ts, net in weekly.items():
        cumulative += float(net)
        points.append(
            {
                "period_start": ts.date().isoformat(),
                "net_saved": round(float(net), 2),
                "cumulative": round(cumulative, 2),
            }
        )
    return points


def spending_heatmap(expenses: list[Any]) -> list[dict[str, Any]]:
    """Weekday x hour spend density, normalised to 0..1."""
    df = build_transaction_frame(expenses)
    out = df[~df["is_income"]] if not df.empty else df
    if out.empty:
        return []
    grid = out.groupby(["weekday", "hour"])["outflow"].sum()
    peak = float(grid.max()) or 1.0
    return [
        {
            "weekday": int(wd),
            "hour": int(hr),
            "intensity": round(float(amt) / peak, 3),
        }
        for (wd, hr), amt in grid.items()
    ]
