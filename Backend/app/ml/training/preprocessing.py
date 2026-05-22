"""Training-time preprocessing: cleaning, normalisation and dataset prep.

Because a fresh deployment has no historical labelled data, this module
also ships a *synthetic* dataset generator. It simulates several
behavioural archetypes so the training pipelines produce real, loadable
artifacts on day one; once genuine user data exists, swap
``generate_synthetic_dataset`` for a database export.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd

from app.ml.features import USER_FEATURE_NAMES, extract_user_features

# ── archetype simulation parameters ──────────────────────────────
# (label, daily_txn_rate, avg_amount, amount_std, impulse_prob, savings_rate)
_ARCHETYPES = {
    "conservative": (0.6, 22.0, 8.0, 0.05, 0.35),
    "stable": (1.1, 30.0, 14.0, 0.12, 0.18),
    "impulsive": (2.2, 41.0, 34.0, 0.40, 0.02),
    "high_risk": (2.6, 58.0, 48.0, 0.30, -0.10),
}
_CATEGORIES = ["food", "coffee", "transport", "shopping", "fun", "bills", "health"]
_MOODS = ["happy", "neutral", "stressed", "bored", "sad", "excited"]


def clean_expense_frame(df: pd.DataFrame) -> pd.DataFrame:
    """Drop nulls / duplicates and clip absurd amounts (data-cleaning stage)."""
    df = df.dropna(subset=["amount", "occurred_at"]).drop_duplicates()
    df = df[df["amount"] != 0]
    # Clip the most extreme 0.5% of amounts to curb data-entry errors.
    if len(df) > 20:
        hi = df["amount"].abs().quantile(0.995)
        df = df[df["amount"].abs() <= hi]
    return df.reset_index(drop=True)


def _simulate_user(rng: np.random.Generator, label: str, weeks: int = 16) -> list[dict]:
    rate, avg, std, impulse_p, savings_rate = _ARCHETYPES[label]
    start = datetime.now(timezone.utc) - timedelta(weeks=weeks)
    rows: list[dict] = []
    n_days = weeks * 7
    for day in range(n_days):
        ts = start + timedelta(days=day)
        for _ in range(rng.poisson(rate)):
            amount = -abs(rng.normal(avg, std))
            is_impulse = rng.random() < impulse_p
            mood = rng.choice(["stressed", "bored", "sad"]) if is_impulse else rng.choice(_MOODS)
            hour = int(rng.integers(22, 27) % 24) if is_impulse else int(rng.integers(7, 21))
            rows.append(
                {
                    "amount": round(float(amount), 2),
                    "category_slug": str(rng.choice(_CATEGORIES)),
                    "occurred_at": ts.replace(hour=hour, minute=int(rng.integers(0, 60))),
                    "merchant": f"merchant_{rng.integers(0, 60)}",
                    "payment_method": "card",
                    "emotional_state": mood,
                    "is_recurring": bool(rng.random() < 0.12),
                }
            )
        # Weekly income that yields the archetype's target savings rate.
        if day % 7 == 0:
            weekly_spend = avg * rate * 7
            income = weekly_spend / max(1 - savings_rate, 0.2)
            rows.append(
                {
                    "amount": round(float(income), 2),
                    "category_slug": "income",
                    "occurred_at": ts,
                    "merchant": "payroll",
                    "payment_method": "direct_deposit",
                    "emotional_state": None,
                    "is_recurring": True,
                }
            )
    return rows


def generate_synthetic_dataset(
    users_per_archetype: int = 60, seed: int = 42
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Build a labelled training set.

    Returns
    -------
    feature_df : one row per simulated user, columns = USER_FEATURE_NAMES
                 plus ``behavior_label`` and ``next_week_spend`` (regression
                 target) and ``weekly_net`` (savings history list).
    txn_df     : the raw simulated transactions (for the anomaly detector).
    """
    rng = np.random.default_rng(seed)
    feature_rows: list[dict] = []
    all_txns: list[dict] = []

    for label in _ARCHETYPES:
        for _ in range(users_per_archetype):
            txns = _simulate_user(rng, label)
            all_txns.extend(txns)
            feats = extract_user_features(txns)
            # Regression target: realised next-week spend ~ weekly projection.
            next_week = feats["spend_frequency_per_day"] * 7 * feats["avg_expense"]
            next_week *= rng.normal(1.0, 0.12)
            feats["behavior_label"] = label
            feats["next_week_spend"] = max(next_week, 0.0)
            feats["savings_rate_target"] = feats["savings_rate"]
            feature_rows.append(feats)

    feature_df = pd.DataFrame(feature_rows)
    txn_df = clean_expense_frame(pd.DataFrame(all_txns))
    return feature_df, txn_df


def feature_matrix(feature_df: pd.DataFrame) -> np.ndarray:
    """Extract the canonical feature matrix in `USER_FEATURE_NAMES` order."""
    return feature_df[USER_FEATURE_NAMES].astype(float).to_numpy()
