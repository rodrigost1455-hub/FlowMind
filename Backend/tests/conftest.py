"""Pytest fixtures — an isolated SQLite database and an async test client.

Environment is configured *before* any ``app`` import so the application
engine binds to the throwaway SQLite database rather than PostgreSQL.
"""

from __future__ import annotations

import os
import uuid
from collections.abc import AsyncGenerator

# ── must run before importing anything under `app` ───────────────
os.environ["DATABASE_URL_OVERRIDE"] = "sqlite+aiosqlite:///./test_flowmind.db"
os.environ["RATE_LIMIT_STORAGE_URI"] = "memory://"
os.environ["RATE_LIMIT_DEFAULT"] = "100000/minute"  # effectively disabled for tests
os.environ["SECRET_KEY"] = "test-secret-key-do-not-use-in-production-0001"
os.environ["DEBUG"] = "false"

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.database.init_db import seed_categories  # noqa: E402
from app.database.session import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base  # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def _database() -> AsyncGenerator[None, None]:
    """Create a fresh schema per test and drop it afterwards."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_categories()
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_client(client: AsyncClient) -> AsyncGenerator[AsyncClient, None]:
    """A client pre-authenticated as a freshly registered user."""
    email = f"user_{uuid.uuid4().hex[:10]}@flowmind.app"
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "supersecret1", "full_name": "Test User"},
    )
    assert resp.status_code == 201, resp.text
    token = resp.json()["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    yield client
