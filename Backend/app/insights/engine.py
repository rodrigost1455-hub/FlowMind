"""AI insight engine.

Analyses real expense patterns and ML predictions to produce concrete,
human-readable insights. Each detector is an independent rule that
inspects engineered features / analytics and, when its pattern fires,
emits a structured insight. The engine ranks insights by confidence and
returns the strongest few.

Insights are *grounded*: every number in the copy is computed from the
user's actual transactions — there is no templated guessing.
"""

from __future__ import annotations

from typing import Any

from app.analytics.calculators import category_breakdown
from app.ml.features.engineering import build_transaction_frame

# Categories whose growth is worth surfacing as "subscription drift".
_SUBSCRIPTION_CATEGORIES = {"fun", "bills"}


def _insight(
    tone: str, title: str, body: str, source: str, confidence: float,
    action: str | None = None,
) -> dict[str, Any]:
    return {
        "tone": tone,
        "title": title,
        "body": body,
        "action_label": action,
        "source": source,
        "confidence": round(confidence, 2),
    }


class InsightEngine:
    """Runs every detector against a user's expense history."""

    MIN_TRANSACTIONS = 8  # below this there is not enough signal

    def generate(
        self,
        expenses: list[Any],
        predictions: dict[str, Any] | None = None,
        limit: int = 6,
    ) -> list[dict[str, Any]]:
        df = build_transaction_frame(expenses)
        out = df[~df["is_income"]] if not df.empty else df
        if len(out) < self.MIN_TRANSACTIONS:
            return []

        detectors = (
            self._weekend_spike,
            self._late_night_spending,
            self._category_growth,
            self._subscription_drift,
            self._impulse_mood,
            self._savings_progress,
            self._stable_category,
        )
        found: list[dict[str, Any]] = []
        for detector in detectors:
            try:
                result = detector(out)
            except Exception:  # noqa: BLE001 — one bad detector must not break the rest
                result = None
            if result:
                found.append(result)

        if predictions:
            found.extend(self._from_predictions(predictions))

        found.sort(key=lambda i: i["confidence"], reverse=True)
        return found[:limit]

    # ── detectors ────────────────────────────────────────────────
    def _weekend_spike(self, out) -> dict | None:
        weekend = out.loc[out["is_weekend"], "outflow"]
        weekday = out.loc[~out["is_weekend"], "outflow"]
        if weekend.empty or weekday.empty:
            return None
        wknd_avg, wkdy_avg = weekend.mean(), weekday.mean()
        if wkdy_avg <= 0 or wknd_avg <= wkdy_avg * 1.2:
            return None
        pct = round((wknd_avg - wkdy_avg) / wkdy_avg * 100)
        return _insight(
            "warn",
            f"You spend {pct}% more on weekends",
            f"Weekend purchases average ${wknd_avg:.0f} vs ${wkdy_avg:.0f} on weekdays. "
            "Setting a Friday-night budget could help.",
            "weekend_spike",
            confidence=min(0.95, 0.5 + pct / 200),
            action="See pattern",
        )

    def _late_night_spending(self, out) -> dict | None:
        late = out.loc[out["is_late_night"], "outflow"]
        if late.empty:
            return None
        share = late.sum() / out["outflow"].sum()
        if share < 0.15:
            return None
        return _insight(
            "warn",
            "Late-night spending detected",
            f"{share*100:.0f}% of your spend happens after 10pm — often a sign of "
            "impulse purchases. Worth a second look.",
            "late_night",
            confidence=min(0.9, 0.5 + share),
            action="Review",
        )

    def _category_growth(self, out) -> dict | None:
        """Compare the latest week to the prior week per category."""
        if out["occurred_at"].nunique() < 8:
            return None
        weekly = (
            out.set_index("occurred_at")
            .groupby("category_slug")["outflow"]
            .resample("W").sum()
            .reset_index()
        )
        best: dict | None = None
        for slug, grp in weekly.groupby("category_slug"):
            vals = grp["outflow"].tolist()
            if len(vals) < 2 or vals[-2] <= 0:
                continue
            growth = (vals[-1] - vals[-2]) / vals[-2]
            if growth > 0.25 and (best is None or growth > best[1]):
                best = (slug, growth)
        if not best:
            return None
        slug, growth = best
        return _insight(
            "warn",
            f"{slug.title()} spending increased",
            f"Your {slug} spend rose {growth*100:.0f}% versus last week. "
            "Keep an eye on it before it becomes a habit.",
            "category_growth",
            confidence=min(0.9, 0.5 + growth / 2),
            action="See details",
        )

    def _subscription_drift(self, out) -> dict | None:
        recurring = out.loc[out["is_recurring"]]
        if recurring.empty:
            return None
        sub = recurring.loc[recurring["category_slug"].isin(_SUBSCRIPTION_CATEGORIES)]
        if len(sub) < 3:
            return None
        total = sub["outflow"].sum()
        return _insight(
            "info",
            "Your subscriptions are growing",
            f"{len(sub)} recurring charges totalling ${total:.0f} were detected. "
            "Pausing unused ones could free up cash.",
            "subscription_drift",
            confidence=0.7,
            action=f"Review {len(sub)}",
        )

    def _impulse_mood(self, out) -> dict | None:
        impulse = out.loc[out["is_impulse"], "outflow"]
        if impulse.empty:
            return None
        share = impulse.sum() / out["outflow"].sum()
        if share < 0.2:
            return None
        return _insight(
            "warn",
            "Mood is driving your spending",
            f"{share*100:.0f}% of spend happened while feeling stressed, bored or sad. "
            "Noticing the trigger is the first step.",
            "impulse_mood",
            confidence=min(0.92, 0.55 + share),
            action="Learn more",
        )

    def _savings_progress(self, out) -> dict | None:
        if out["occurred_at"].nunique() < 8:
            return None
        weekly = out.set_index("occurred_at")["outflow"].resample("W").sum().tolist()
        if len(weekly) < 2 or weekly[-2] <= 0:
            return None
        change = (weekly[-1] - weekly[-2]) / weekly[-2]
        if change >= -0.08:
            return None
        return _insight(
            "good",
            f"You saved {abs(change)*100:.0f}% more this week",
            f"Spending dropped from ${weekly[-2]:.0f} to ${weekly[-1]:.0f}. "
            "Whatever you changed — keep doing it.",
            "savings_progress",
            confidence=min(0.9, 0.6 + abs(change)),
            action="Lock it in",
        )

    def _stable_category(self, out) -> dict | None:
        weekly = (
            out.set_index("occurred_at")
            .groupby("category_slug")["outflow"]
            .resample("W").sum()
            .reset_index()
        )
        for slug, grp in weekly.groupby("category_slug"):
            vals = grp["outflow"].tolist()
            if len(vals) < 3 or sum(vals) == 0:
                continue
            mean = sum(vals) / len(vals)
            spread = max(vals) - min(vals)
            if mean > 0 and spread / mean < 0.15:
                return _insight(
                    "good",
                    f"{slug.title()} spending is stable",
                    f"Your {slug} costs have stayed near ${mean:.0f}/week — "
                    "predictable spending makes budgeting easier.",
                    "stable_category",
                    confidence=0.65,
                )
        return None

    # ── ML-driven insights ───────────────────────────────────────
    def _from_predictions(self, predictions: dict[str, Any]) -> list[dict[str, Any]]:
        items: list[dict[str, Any]] = []
        spending = predictions.get("spending", {})
        overspend = spending.get("overspend_probability", 0.0)
        if overspend > 0.6:
            items.append(
                _insight(
                    "warn",
                    "High chance of overspending this week",
                    f"Our model puts your overspend risk at {overspend*100:.0f}%. "
                    "A small mid-week check-in could change the outcome.",
                    "ml_overspend",
                    confidence=overspend,
                    action="See forecast",
                )
            )
        savings = predictions.get("savings", {})
        if savings.get("trajectory") == "healthy":
            items.append(
                _insight(
                    "good",
                    "You're on a healthy savings trajectory",
                    f"Projected to save ${savings.get('projected_savings_30d', 0):.0f} "
                    "over the next 30 days at your current pace.",
                    "ml_savings",
                    confidence=0.75,
                )
            )
        return items


_engine = InsightEngine()


def generate_insights(
    expenses: list[Any], predictions: dict[str, Any] | None = None, limit: int = 6
) -> list[dict[str, Any]]:
    """Module-level convenience wrapper around :class:`InsightEngine`."""
    return _engine.generate(expenses, predictions, limit)
