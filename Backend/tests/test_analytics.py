"""Analytics, financial-health, insight and prediction API tests."""

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def _seed_expenses(client: AsyncClient, n: int = 30) -> None:
    """Create a spread of expenses + income over the last few weeks."""
    now = datetime.now(timezone.utc)
    for i in range(n):
        occurred = now - timedelta(days=i % 21, hours=i % 24)
        await client.post(
            "/api/v1/expenses",
            json={
                "amount": -(15.0 + i % 40),
                "category_slug": ["food", "transport", "shopping", "fun"][i % 4],
                "occurred_at": occurred.isoformat(),
                "merchant": f"Merchant {i}",
                "payment_method": "card",
                "emotional_state": ["neutral", "stressed", "bored"][i % 3],
            },
        )
    await client.post(
        "/api/v1/expenses",
        json={
            "amount": 4000.0,
            "category_slug": "income",
            "occurred_at": now.isoformat(),
            "merchant": "Salary",
            "payment_method": "direct_deposit",
        },
    )


async def test_analytics_overview(auth_client: AsyncClient) -> None:
    await _seed_expenses(auth_client)
    resp = await auth_client.get("/api/v1/analytics/overview")
    assert resp.status_code == 200
    body = resp.json()
    assert "balance" in body
    assert body["week"]["period"] == "week"
    assert body["month"]["period"] == "month"


async def test_weekly_analytics_daily_series(auth_client: AsyncClient) -> None:
    await _seed_expenses(auth_client)
    resp = await auth_client.get("/api/v1/analytics/weekly")
    assert resp.status_code == 200
    assert len(resp.json()["daily"]) == 7


async def test_financial_health_score(auth_client: AsyncClient) -> None:
    await _seed_expenses(auth_client)
    resp = await auth_client.get("/api/v1/financial-health/score")
    assert resp.status_code == 200
    body = resp.json()
    assert 0 <= body["score"] <= 100
    assert body["grade"] in {"A", "B", "C", "D", "F"}
    assert set(body["components"]) == {
        "spending_stability", "savings_consistency", "debt_ratio_score",
        "impulse_control", "recurring_load", "trend_score",
    }
    assert isinstance(body["recommendations"], list)


async def test_insights_generation(auth_client: AsyncClient) -> None:
    await _seed_expenses(auth_client, n=40)
    resp = await auth_client.post("/api/v1/insights/generate")
    assert resp.status_code == 200
    insights = resp.json()
    assert isinstance(insights, list)
    if insights:
        assert {"tone", "title", "body", "confidence"} <= set(insights[0])


async def test_predictions_bundle(auth_client: AsyncClient) -> None:
    await _seed_expenses(auth_client, n=40)
    resp = await auth_client.get("/api/v1/predictions")
    assert resp.status_code == 200
    body = resp.json()
    assert body["spending"]["weekly_spending"] >= 0
    assert body["behavior"]["behavior_class"] in {
        "impulsive", "stable", "conservative", "high_risk"
    }
    assert body["savings"]["trajectory"] in {"healthy", "flat", "declining"}


async def test_weekly_summary_generation(auth_client: AsyncClient) -> None:
    await _seed_expenses(auth_client)
    resp = await auth_client.post("/api/v1/insights/weekly-summary/generate")
    assert resp.status_code == 200
    body = resp.json()
    assert body["headline"]
    assert isinstance(body["bullet_points"], list)


async def test_health_endpoint(client: AsyncClient) -> None:
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
