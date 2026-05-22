"""ML pipeline unit tests — feature engineering, models, inference."""

from datetime import datetime, timedelta, timezone

import pytest

from app.ml.features import USER_FEATURE_NAMES, extract_user_features
from app.ml.models import AnomalyDetector, BehaviorClassifier, SpendingPredictor
from app.ml.pipelines import run_pipeline
from app.ml.training.preprocessing import generate_synthetic_dataset


def _expense(amount: float, days_ago: int, hour: int = 12, mood: str | None = None) -> dict:
    return {
        "amount": amount,
        "category_slug": "food",
        "occurred_at": datetime.now(timezone.utc) - timedelta(days=days_ago, hours=-hour),
        "merchant": "m",
        "payment_method": "card",
        "emotional_state": mood,
        "is_recurring": False,
    }


def _history(n: int = 40) -> list[dict]:
    rows = [_expense(-20.0 - i % 10, days_ago=i) for i in range(n)]
    rows.append(_expense(3000.0, days_ago=5))  # income
    return rows


def test_feature_vector_has_all_named_features() -> None:
    feats = extract_user_features(_history())
    assert set(feats) == set(USER_FEATURE_NAMES)
    assert feats["txn_count"] > 0
    assert feats["avg_expense"] > 0


def test_feature_extraction_empty_is_safe() -> None:
    feats = extract_user_features([])
    assert all(v == 0.0 for v in feats.values())


def test_spending_predictor_heuristic_shape() -> None:
    result = SpendingPredictor().predict(extract_user_features(_history()))
    assert result["weekly_spending"] >= 0
    assert result["monthly_spending"] >= result["weekly_spending"]
    assert 0.0 <= result["overspend_probability"] <= 1.0


def test_behavior_classifier_returns_valid_class() -> None:
    result = BehaviorClassifier().predict(extract_user_features(_history()))
    assert result["behavior_class"] in {"impulsive", "stable", "conservative", "high_risk"}
    assert 0.0 <= result["confidence"] <= 1.0
    probs = result["class_probabilities"]
    assert abs(sum(probs.values()) - 1.0) < 1e-6


def test_anomaly_detector_flags_outlier() -> None:
    history = [_expense(-15.0, days_ago=i) for i in range(30)]
    history.append(_expense(-5000.0, days_ago=2))  # obvious outlier
    flagged = AnomalyDetector().detect(history)
    assert any(a["amount"] == -5000.0 for a in flagged)


def test_pipeline_runs_end_to_end() -> None:
    result = run_pipeline(_history())
    assert result["transaction_count"] > 0
    assert "spending" in result["predictions"]
    assert "behavior" in result["predictions"]
    assert "savings" in result["predictions"]
    assert isinstance(result["insights"], list)


def test_synthetic_dataset_is_labelled() -> None:
    feature_df, txn_df = generate_synthetic_dataset(users_per_archetype=5)
    assert len(feature_df) == 20  # 4 archetypes x 5 users
    assert set(feature_df["behavior_label"].unique()) == {
        "conservative", "stable", "impulsive", "high_risk"
    }
    assert not txn_df.empty
