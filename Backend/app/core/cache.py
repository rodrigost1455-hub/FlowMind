"""Thin async Redis cache wrapper with JSON (de)serialisation.

Gracefully degrades to a no-op when Redis is unreachable so the API
remains available even if the cache layer is down.
"""

from __future__ import annotations

import json
from typing import Any

import redis.asyncio as aioredis

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("cache")

_client: aioredis.Redis | None = None


def _get_client() -> aioredis.Redis:
    global _client
    if _client is None:
        _client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    return _client


async def cache_get(key: str) -> Any | None:
    try:
        raw = await _get_client().get(key)
        return json.loads(raw) if raw else None
    except Exception as exc:  # noqa: BLE001 — cache must never break a request
        log.warning("cache_get failed for %s: %s", key, exc)
        return None


async def cache_set(key: str, value: Any, ttl: int | None = None) -> None:
    try:
        await _get_client().set(
            key, json.dumps(value, default=str), ex=ttl or settings.CACHE_TTL_SECONDS
        )
    except Exception as exc:  # noqa: BLE001
        log.warning("cache_set failed for %s: %s", key, exc)


async def cache_invalidate(pattern: str) -> None:
    """Delete every key matching a glob pattern (e.g. ``analytics:user:*``)."""
    try:
        client = _get_client()
        async for key in client.scan_iter(match=pattern):
            await client.delete(key)
    except Exception as exc:  # noqa: BLE001
        log.warning("cache_invalidate failed for %s: %s", pattern, exc)


async def close_cache() -> None:
    global _client
    if _client is not None:
        await _client.aclose()
        _client = None
