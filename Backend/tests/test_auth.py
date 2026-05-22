"""Authentication API tests."""

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_register_returns_token_pair(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "a@flowmind.app", "password": "password123", "full_name": "A"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["access_token"] and body["refresh_token"]
    assert body["token_type"] == "bearer"


async def test_register_rejects_duplicate_email(client: AsyncClient) -> None:
    payload = {"email": "dup@flowmind.app", "password": "password123", "full_name": "D"}
    await client.post("/api/v1/auth/register", json=payload)
    resp = await client.post("/api/v1/auth/register", json=payload)
    assert resp.status_code == 409


async def test_register_rejects_short_password(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "x@flowmind.app", "password": "short", "full_name": "X"},
    )
    assert resp.status_code == 422


async def test_login_and_wrong_password(client: AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "log@flowmind.app", "password": "password123", "full_name": "L"},
    )
    ok = await client.post(
        "/api/v1/auth/login",
        json={"email": "log@flowmind.app", "password": "password123"},
    )
    assert ok.status_code == 200

    bad = await client.post(
        "/api/v1/auth/login",
        json={"email": "log@flowmind.app", "password": "wrongpass123"},
    )
    assert bad.status_code == 401


async def test_refresh_token_flow(client: AsyncClient) -> None:
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "r@flowmind.app", "password": "password123", "full_name": "R"},
    )
    refresh = reg.json()["refresh_token"]
    resp = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh})
    assert resp.status_code == 200
    assert resp.json()["access_token"]


async def test_me_requires_authentication(client: AsyncClient) -> None:
    assert (await client.get("/api/v1/auth/me")).status_code in (401, 403)


async def test_me_returns_profile(auth_client: AsyncClient) -> None:
    resp = await auth_client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"].endswith("@flowmind.app")


async def test_onboarding_status(auth_client: AsyncClient) -> None:
    resp = await auth_client.get("/api/v1/auth/onboarding-status")
    assert resp.status_code == 200
    assert resp.json()["onboarding_completed"] is False
