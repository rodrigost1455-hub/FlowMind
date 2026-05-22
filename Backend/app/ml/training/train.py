"""Reusable ML training pipelines.

Run all pipelines from the project root:

    python -m app.ml.training.train

Each pipeline performs: preprocessing -> feature extraction ->
normalisation -> training -> evaluation -> MLflow logging -> artifact
save (joblib). Artifacts land in ``settings.ML_MODEL_DIR`` and are picked
up automatically by the :class:`ModelRegistry`.
"""

from __future__ import annotations

import numpy as np
from sklearn.ensemble import (
    GradientBoostingRegressor,
    IsolationForest,
    RandomForestClassifier,
)
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor

from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.ml.features import USER_FEATURE_NAMES
from app.ml.models import (
    AnomalyDetector,
    BehaviorClassifier,
    SavingsForecaster,
    SpendingPredictor,
)
from app.ml.models.base import ModelArtifact
from app.ml.models.anomaly_detector import _TXN_FEATURES
from app.ml.training.preprocessing import feature_matrix, generate_synthetic_dataset

log = get_logger("ml.train")

try:  # MLflow is optional — training still works without a tracking server.
    import mlflow

    _MLFLOW = True
except Exception:  # noqa: BLE001
    _MLFLOW = False


def _log_mlflow(run_name: str, params: dict, metrics: dict) -> None:
    if not _MLFLOW:
        return
    try:
        mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
        mlflow.set_experiment("flowmind")
        with mlflow.start_run(run_name=run_name):
            mlflow.log_params(params)
            mlflow.log_metrics(metrics)
    except Exception as exc:  # noqa: BLE001
        log.warning("MLflow logging skipped: %s", exc)


# ── 1. spending prediction (XGBoost regressor) ───────────────────
def train_spending_model(feature_df, txn_df) -> dict:
    x = feature_matrix(feature_df)
    y = feature_df["next_week_spend"].to_numpy(dtype=float)
    x_tr, x_te, y_tr, y_te = train_test_split(x, y, test_size=0.2, random_state=42)

    scaler = StandardScaler().fit(x_tr)
    model = XGBRegressor(
        n_estimators=300, max_depth=4, learning_rate=0.05, subsample=0.9,
        objective="reg:squarederror", random_state=42,
    )
    model.fit(scaler.transform(x_tr), y_tr)

    pred = model.predict(scaler.transform(x_te))
    metrics = {
        "mae": float(mean_absolute_error(y_te, pred)),
        "r2": float(r2_score(y_te, pred)),
    }
    log.info("spending_predictor metrics: %s", metrics)

    artifact = ModelArtifact(
        name="spending_predictor", estimator=model, scaler=scaler,
        feature_names=USER_FEATURE_NAMES, version="xgb-v1", metrics=metrics,
    )
    SpendingPredictor(artifact).save(settings.ML_MODEL_DIR)
    _log_mlflow("spending_predictor", {"model": "XGBRegressor", "n_estimators": 300}, metrics)
    return metrics


# ── 2. behaviour classification (Random Forest) ──────────────────
def train_behavior_model(feature_df, txn_df) -> dict:
    x = feature_matrix(feature_df)
    y = feature_df["behavior_label"].to_numpy()
    x_tr, x_te, y_tr, y_te = train_test_split(
        x, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler().fit(x_tr)
    model = RandomForestClassifier(
        n_estimators=250, max_depth=8, class_weight="balanced", random_state=42
    )
    model.fit(scaler.transform(x_tr), y_tr)

    pred = model.predict(scaler.transform(x_te))
    metrics = {
        "accuracy": float(accuracy_score(y_te, pred)),
        "f1_macro": float(f1_score(y_te, pred, average="macro")),
    }
    log.info("behavior_classifier metrics: %s", metrics)

    artifact = ModelArtifact(
        name="behavior_classifier", estimator=model, scaler=scaler,
        feature_names=USER_FEATURE_NAMES, version="rf-v1", metrics=metrics,
    )
    BehaviorClassifier(artifact).save(settings.ML_MODEL_DIR)
    _log_mlflow("behavior_classifier", {"model": "RandomForest", "n_estimators": 250}, metrics)
    return metrics


# ── 3. anomaly detection (Isolation Forest) ──────────────────────
def train_anomaly_model(feature_df, txn_df) -> dict:
    from app.ml.features import build_transaction_frame

    df = build_transaction_frame(txn_df.to_dict("records"))
    out = df[~df["is_income"]]
    x = out[_TXN_FEATURES].astype(float).to_numpy()

    scaler = StandardScaler().fit(x)
    model = IsolationForest(
        n_estimators=200, contamination=0.03, random_state=42
    )
    model.fit(scaler.transform(x))

    flagged = float((model.predict(scaler.transform(x)) == -1).mean())
    metrics = {"flagged_ratio": flagged, "n_samples": float(len(x))}
    log.info("anomaly_detector metrics: %s", metrics)

    artifact = ModelArtifact(
        name="anomaly_detector", estimator=model, scaler=scaler,
        feature_names=_TXN_FEATURES, version="iforest-v1", metrics=metrics,
    )
    AnomalyDetector(artifact).save(settings.ML_MODEL_DIR)
    _log_mlflow("anomaly_detector", {"model": "IsolationForest", "contamination": 0.03}, metrics)
    return metrics


# ── 4. savings forecasting (Gradient Boosting) ───────────────────
def train_savings_model(feature_df, txn_df) -> dict:
    rng = np.random.default_rng(7)
    # Build short weekly-savings sequences from each user's savings rate.
    rows, targets = [], []
    for rate in feature_df["savings_rate_target"].to_numpy(dtype=float):
        base = rate * 1000.0
        seq = base + rng.normal(0, 60, size=9)
        rows.append(seq[:8])
        targets.append(float(seq[8]))
    x = np.array(rows, dtype=float)
    y = np.array(targets, dtype=float)
    x_tr, x_te, y_tr, y_te = train_test_split(x, y, test_size=0.2, random_state=42)

    scaler = StandardScaler().fit(x_tr)
    model = GradientBoostingRegressor(n_estimators=200, max_depth=3, random_state=42)
    model.fit(scaler.transform(x_tr), y_tr)

    pred = model.predict(scaler.transform(x_te))
    metrics = {"mae": float(mean_absolute_error(y_te, pred)), "r2": float(r2_score(y_te, pred))}
    log.info("savings_forecaster metrics: %s", metrics)

    artifact = ModelArtifact(
        name="savings_forecaster", estimator=model, scaler=scaler,
        feature_names=[f"week_{i}" for i in range(8)], version="gbr-v1", metrics=metrics,
    )
    SavingsForecaster(artifact).save(settings.ML_MODEL_DIR)
    _log_mlflow("savings_forecaster", {"model": "GradientBoosting", "n_estimators": 200}, metrics)
    return metrics


def train_all() -> dict[str, dict]:
    """Run every training pipeline end-to-end."""
    log.info("Generating synthetic training dataset ...")
    # 30 users/archetype keeps peak memory within a 512MB worker while
    # still giving the models enough labelled examples to learn from.
    feature_df, txn_df = generate_synthetic_dataset(users_per_archetype=30)
    log.info("Dataset: %d users, %d transactions", len(feature_df), len(txn_df))

    return {
        "spending_predictor": train_spending_model(feature_df, txn_df),
        "behavior_classifier": train_behavior_model(feature_df, txn_df),
        "anomaly_detector": train_anomaly_model(feature_df, txn_df),
        "savings_forecaster": train_savings_model(feature_df, txn_df),
    }


if __name__ == "__main__":
    configure_logging()
    results = train_all()
    log.info("Training complete. Summary:")
    for name, metrics in results.items():
        log.info("  %-22s %s", name, metrics)
