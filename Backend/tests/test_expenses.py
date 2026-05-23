"""Expense API tests."""

from datetime import datetime, timedelta, timezone

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


def _expense(**overrides) -> dict:
    base = {
        "amount": -25.0,
        "category_slug": "food",
        "occurred_at": datetime.now(timezone.utc).isoformat(),
        "merchant": "Test Diner",
        "payment_method": "card",
        "emotional_state": "neutral",
        "tags": ["lunch"],
    }
    base.update(overrides)
    return base


async def test_create_and_get_expense(auth_client: AsyncClient) -> None:
    created = await auth_client.post("/api/v1/expenses", json=_expense())
    assert created.status_code == 201
    expense_id = created.json()["id"]

    fetched = await auth_client.get(f"/api/v1/expenses/{expense_id}")
    assert fetched.status_code == 200
    assert fetched.json()["merchant"] == "Test Diner"


async def test_list_pagination(auth_client: AsyncClient) -> None:
    for i in range(25):
        await auth_client.post("/api/v1/expenses", json=_expense(amount=-(i + 1)))
    resp = await auth_client.get("/api/v1/expenses?page=1&size=10")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 25
    assert len(body["items"]) == 10
    assert body["pages"] == 3


async def test_filter_by_category(auth_client: AsyncClient) -> None:
    await auth_client.post("/api/v1/expenses", json=_expense(category_slug="food"))
    await auth_client.post("/api/v1/expenses", json=_expense(category_slug="transport"))
    resp = await auth_client.get("/api/v1/expenses?category_slug=transport")
    items = resp.json()["items"]
    assert len(items) == 1
    assert items[0]["category_slug"] == "transport"


async def test_update_expense(auth_client: AsyncClient) -> None:
    created = await auth_client.post("/api/v1/expenses", json=_expense())
    expense_id = created.json()["id"]
    resp = await auth_client.patch(
        f"/api/v1/expenses/{expense_id}", json={"amount": -99.99, "merchant": "Updated"}
    )
    assert resp.status_code == 200
    assert resp.json()["amount"] == -99.99
    assert resp.json()["merchant"] == "Updated"


async def test_delete_expense(auth_client: AsyncClient) -> None:
    created = await auth_client.post("/api/v1/expenses", json=_expense())
    expense_id = created.json()["id"]
    assert (await auth_client.delete(f"/api/v1/expenses/{expense_id}")).status_code == 204
    assert (await auth_client.get(f"/api/v1/expenses/{expense_id}")).status_code == 404


async def test_category_grouping(auth_client: AsyncClient) -> None:
    await auth_client.post("/api/v1/expenses", json=_expense(category_slug="food", amount=-10))
    await auth_client.post("/api/v1/expenses", json=_expense(category_slug="food", amount=-20))
    await auth_client.post("/api/v1/expenses", json=_expense(category_slug="coffee", amount=-5))
    resp = await auth_client.get("/api/v1/expenses/by-category")
    groups = {g["category_slug"]: g for g in resp.json()}
    assert groups["food"]["total"] == 30.0
    assert groups["food"]["count"] == 2


async def test_expense_isolation_between_users(client: AsyncClient) -> None:
    """A user must never see another user's expenses."""
    async def register(email: str) -> str:
        r = await client.post(
            "/api/v1/auth/register",
            json={"email": email, "password": "password123", "full_name": "U"},
        )
        return r.json()["access_token"]

    token_a = await register("owner@flowmind.app")
    created = await client.post(
        "/api/v1/expenses",
        json=_expense(),
        headers={"Authorization": f"Bearer {token_a}"},
    )
    expense_id = created.json()["id"]

    token_b = await register("intruder@flowmind.app")
    resp = await client.get(
        f"/api/v1/expenses/{expense_id}",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp.status_code == 404
