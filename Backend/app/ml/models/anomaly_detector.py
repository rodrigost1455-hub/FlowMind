"""Transaction anomaly detector.

Trained model: Isolation Forest over per-transaction features.
Fallback: robust z-score (median / MAD) on outflow amounts.
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

from app.ml.features import build_transaction_frame
from app.ml.models.base import BaseMLModel

# Per-transaction features fed to the Isolation Forest.
_TXN_FEATURES = ["outflow", "weekday", "hour", "is_weekend", "is_late_night"]


class AnomalyDetector(BaseMLModel):
    artifact_name = "anomaly_detector"

    def detect(self, expenses: list[Any]) -> list[dict[str, Any]]:
        """Return a list of anomaly records for the supplied expenses.

        Each record carries an ``index`` aligned with the input list, so
        callers can map results back to expense IDs.
        """
        df = build_transaction_frame(expenses)
        out = df[~df["is_income"]].copy()
        if len(out) < 5:
            return []  # not enough history to judge what is "normal"

        if self.is_trained:
            scores, flags = self._score_trained(out)
        else:
            scores, flags = self._score_heuristic(out)

        results: list[dict[str, Any]] = []
        for pos, (idx, row) in enumerate(out.iterrows()):
            if flags[pos]:
                results.append(
                    {
                        "index": int(idx),
                        "amount": float(row["amount"]),
                        "merchant": row["merchant"],
                        "occurred_at": row["occurred_at"],
                        "anomaly_score": round(float(scores[pos]), 3),
                        "reason": self._reason(row, out["outflow"]),
                    }
                )
        return sorted(results, key=lambda r: r["anomaly_score"], reverse=True)

    # ── trained path ─────────────────────────────────────────────
    def _score_trained(self, out: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
        assert self.artifact is not None
        x = out[_TXN_FEATURES].astype(float).to_numpy()
        if self.artifact.scaler is not None:
            x = self.artifact.scaler.transform(x)
        est = self.artifact.estimator
        # IsolationForest: lower score_samples => more anomalous.
        raw = -est.score_samples(x)
        flags = est.predict(x) == -1
        return raw, flags

    # ── heuristic path ───────────────────────────────────────────
    def _score_heuristic(self, out: pd.DataFrame) -> tuple[np.ndarray, np.ndarray]:
        amounts = out["outflow"].to_numpy(dtype=float)
        median = np.median(amounts)
        mad = np.median(np.abs(amounts - median)) or 1.0
        # 0.6745 scales MAD to a standard-deviation equivalent.
        z = 0.6745 * (amounts - median) / mad
        flags = z > 3.5
        return np.abs(z), flags

    @staticmethod
    def _reason(row: pd.Series, all_outflow: pd.Series) -> str:
        bits = []
        if row["outflow"] > all_outflow.quantile(0.95):
            bits.append("amount far above your usual spend")
        if row["is_late_night"]:
            bits.append("late-night purchase")
        if row["is_weekend"]:
            bits.append("weekend purchase")
        return "; ".join(bits) or "unusual spending pattern"
