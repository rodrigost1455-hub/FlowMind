"""AI weekly summary engine.

Once a user has enough history, this composes a natural-language weekly
recap from their analytics — a headline, a short narrative and concrete
bullet points. The copy is fully data-driven (templated over computed
numbers) so it stays accurate without an LLM call; the structure leaves
a clean seam to swap in an LLM later.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from app.analytics.calculators import category_breakdown, compute_period_analytics
from app.utils.datetime import week_bounds


def generate_weekly_summary(
    expenses: list[Any],
    previous_expenses: list[Any],
    reference: datetime | None = None,
) -> dict[str, Any]:
    """Build a weekly summary dict (maps onto WeeklySummary / its schema)."""
    start, end = week_bounds(reference)
    week = compute_period_analytics(expenses, "week", start, end, previous_expenses)

    spent = week["total_spent"]
    saved = week["net_saved"]
    delta = week["vs_previous_pct"]
    breakdown = category_breakdown(expenses)
    top_cat = breakdown[0]["category_slug"] if breakdown else None

    # ── headline ─────────────────────────────────────────────────
    if saved > 0 and delta < 0:
        headline = f"Strong week — you saved ${saved:.0f} and spent less"
    elif delta < 0:
        headline = f"You reined spending in by {abs(delta):.0f}%"
    elif delta > 15:
        headline = f"Spending jumped {delta:.0f}% this week"
    else:
        headline = f"A steady week — ${spent:.0f} spent"

    # ── bullet points ────────────────────────────────────────────
    bullets: list[str] = []
    if top_cat:
        bullets.append(
            f"{top_cat.title()} was your biggest category at "
            f"${breakdown[0]['amount']:.0f} ({breakdown[0]['pct']:.0f}% of spend)."
        )
    if delta != 0:
        direction = "down" if delta < 0 else "up"
        bullets.append(f"Total spending is {direction} {abs(delta):.0f}% versus last week.")
    if week["impulse_pct"] > 20:
        bullets.append(
            f"{week['impulse_pct']:.0f}% of spend was mood-driven — "
            "watch for stressed or bored purchases."
        )
    if saved > 0:
        bullets.append(f"You netted ${saved:.0f} in savings this week.")
    else:
        bullets.append(f"You spent ${abs(saved):.0f} more than you earned this week.")

    # ── narrative ────────────────────────────────────────────────
    narrative = (
        f"This week you made {week['transaction_count']} transactions totalling "
        f"${spent:.0f}, averaging ${week['avg_transaction']:.0f} each. "
    )
    if delta < 0:
        narrative += f"That's {abs(delta):.0f}% less than last week — nice control. "
    elif delta > 0:
        narrative += f"That's {delta:.0f}% more than last week. "
    if top_cat:
        narrative += f"Most of it went to {top_cat}. "
    narrative += (
        "Keep logging your mood at purchase time — it's the signal that powers "
        "your sharpest insights."
    )

    return {
        "week_start": start.date(),
        "headline": headline,
        "narrative": narrative,
        "bullet_points": bullets,
        "total_spent": spent,
        "total_income": week["total_income"],
        "net_saved": saved,
        "vs_prev_week_pct": delta,
    }
