"""Feature engineering — turns raw expenses into ML-ready features.

Two granularities are produced:

* **transaction frame** — one row per expense, used by the anomaly
  detector and as the basis for all aggregation.
* **user feature vector** — a single fixed-length vector summarising a
  user's behaviour, consumed by the spending / behaviour / savings models.

`USER_FEATURE_NAMES` is the contract between training and inference:
training scripts and the inference engine must build vectors in this
exact order.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from typing import Any

import numpy as np
import pandas as pd

from app.utils.datetime import is_late_night, is_weekend

# Order matters — training and inference both rely on this list.
USER_FEATURE_NAMES: list[str] = [
    "txn_count",
    "spend_frequency_per_day",
    "avg_expense",
    "median_expense",
    "std_expense",
    "max_expense",
    "weekend_spend_ratio",
    "late_night_spend_ratio",
    "category_concentration",      # Herfindahl index across categories
    "distinct_categories",
    "recurring_ratio",
    "impulse_spend_ratio",         # share of spend tied to negative moods
    "savings_rate",                # (income - outflow) / income
    "income_to_spend_ratio",
    "discretionary_ratio",         # share of spend on non-essential categories
    "spend_trend_slope",           # linear slope of weekly spend
]

# Categories considered essential — not impulse / discretionary.
ESSENTIAL_CATEGORIES = {"rent", "bills", "health", "transport"}
# Self-reported moods that flag a likely impulse purchase.
IMPULSE_MOODS = {"stressed", "bored", "sad"}


def _to_records(expenses: Iterable[Any]) -> list[dict[str, Any]]:
    """Normalise ORM rows or dicts into plain feature dicts."""
    records: list[dict[str, Any]] = []
    for e in expenses:
        get = (lambda k: e.get(k)) if isinstance(e, dict) else (lambda k: getattr(e, k, None))
        occurred_at = get("occurred_at")
        if occurred_at is None:
            continue
        records.append(
            {
                "amount": float(get("amount") or 0.0),
                "category_slug": get("category_slug") or "other",
                "occurred_at": pd.to_datetime(occurred_at, utc=True),
                "merchant": (get("merchant") or "").strip().lower(),
                "payment_method": str(get("payment_method") or "card"),
                "emotional_state": (str(get("emotional_state")) if get("emotional_state") else None),
                "is_recurring": bool(get("is_recurring") or False),
            }
        )
    return records


def build_transaction_frame(expenses: Iterable[Any]) -> pd.DataFrame:
    """Return a per-transaction DataFrame with engineered columns."""
    records = _to_records(expenses)
    cols = [
        "amount", "category_slug", "occurred_at", "merchant", "payment_method",
        "emotional_state", "is_recurring", "is_income", "outflow", "weekday",
        "hour", "is_weekend", "is_late_night", "is_impulse", "is_essential",
    ]
    if not records:
        return pd.DataFrame(columns=cols)

    df = pd.DataFrame.from_records(records)
    df["is_income"] = df["amount"] > 0
    df["outflow"] = df["amount"].clip(upper=0).abs()
    df["weekday"] = df["occurred_at"].dt.weekday
    df["hour"] = df["occurred_at"].dt.hour
    df["is_weekend"] = df["occurred_at"].apply(is_weekend)
    df["is_late_night"] = df["occurred_at"].apply(is_late_night)
    df["is_impulse"] = df["emotional_state"].isin(IMPULSE_MOODS) & ~df["is_income"]
    df["is_essential"] = df["category_slug"].isin(ESSENTIAL_CATEGORIES)
    return df


def _slope(values: Sequence[float]) -> float:
    """Least-squares slope of a short series; 0.0 when undefined."""
    if len(values) < 2:
        return 0.0
    x = np.arange(len(values), dtype=float)
    y = np.asarray(values, dtype=float)
    return float(np.polyfit(x, y, 1)[0])


def extract_user_features(expenses: Iterable[Any]) -> dict[str, float]:
    """Aggregate a user's expenses into the named feature dict."""
    df = build_transaction_frame(expenses)
    feats = dict.fromkeys(USER_FEATURE_NAMES, 0.0)
    if df.empty:
        return feats

    out = df[~df["is_income"]]
    income_total = float(df.loc[df["is_income"], "amount"].sum())
    outflow_total = float(out["outflow"].sum())

    span_days = max((df["occurred_at"].max() - df["occurred_at"].min()).days, 1)
    feats["txn_count"] = float(len(out))
    feats["spend_frequency_per_day"] = len(out) / span_days

    if not out.empty:
        feats["avg_expense"] = float(out["outflow"].mean())
        feats["median_expense"] = float(out["outflow"].median())
        feats["std_expense"] = float(out["outflow"].std(ddof=0) or 0.0)
        feats["max_expense"] = float(out["outflow"].max())
        feats["weekend_spend_ratio"] = _ratio(out.loc[out["is_weekend"], "outflow"].sum(), outflow_total)
        feats["late_night_spend_ratio"] = _ratio(out.loc[out["is_late_night"], "outflow"].sum(), outflow_total)
        feats["impulse_spend_ratio"] = _ratio(out.loc[out["is_impulse"], "outflow"].sum(), outflow_total)
        feats["recurring_ratio"] = _ratio(out.loc[out["is_recurring"], "outflow"].sum(), outflow_total)
        feats["discretionary_ratio"] = _ratio(out.loc[~out["is_essential"], "outflow"].sum(), outflow_total)

        by_cat = out.groupby("category_slug")["outflow"].sum()
        shares = (by_cat / outflow_total) if outflow_total else by_cat * 0
        feats["category_concentration"] = float((shares**2).sum())
        feats["distinct_categories"] = float(out["category_slug"].nunique())

    feats["savings_rate"] = _ratio(income_total - outflow_total, income_total)
    feats["income_to_spend_ratio"] = _ratio(income_total, outflow_total or 1.0)

    weekly = (
        out.set_index("occurred_at")["outflow"].resample("W").sum()
        if not out.empty else pd.Series(dtype=float)
    )
    feats["spend_trend_slope"] = _slope(weekly.tolist())
    return feats


def _ratio(numerator: float, denominator: float) -> float:
    return float(numerator / denominator) if denominator else 0.0


def user_feature_vector(expenses: Iterable[Any]) -> np.ndarray:
    """Return the user feature vector in canonical `USER_FEATURE_NAMES` order."""
    feats = extract_user_features(expenses)
    return np.array([feats[name] for name in USER_FEATURE_NAMES], dtype=float)
