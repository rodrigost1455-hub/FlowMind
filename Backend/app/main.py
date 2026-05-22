"""FlowMind FastAPI application entrypoint."""

from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import api_router
from app.core.cache import close_cache
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.rate_limit import limiter
from app.database.init_db import init_db
from app.ml.inference.registry import get_model_registry

log = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown — bootstrap DB, warm the model registry.

    Startup work is best-effort: a slow or unreachable database must not
    keep the app from binding its port. Hosts like Render fail the deploy
    if the port does not open promptly, so DB bootstrap is time-boxed and
    its failure is logged rather than fatal.
    """
    configure_logging()
    log.info("Starting %s (%s)", settings.PROJECT_NAME, settings.ENVIRONMENT)
    try:
        await asyncio.wait_for(init_db(), timeout=25)
    except Exception as exc:  # noqa: BLE001
        log.error("Database bootstrap skipped (%s) — continuing startup", exc)
    try:
        get_model_registry()  # eager-load ML models so first request is fast
    except Exception as exc:  # noqa: BLE001
        log.error("Model registry load failed (%s) — continuing", exc)
    log.info("FlowMind backend ready")
    yield
    await close_cache()
    log.info("FlowMind backend shut down")


app = FastAPI(
    title=f"{settings.PROJECT_NAME} API",
    description=(
        "AI-powered financial wellness backend — expenses, analytics, the "
        "Financial Health Score™, a dynamic AI insight engine and a "
        "machine-learning prediction system."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ── rate limiting ────────────────────────────────────────────────
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Please slow down."},
    )


# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── security headers ─────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if not settings.DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


# ── routes ───────────────────────────────────────────────────────
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["meta"])
async def root() -> dict[str, str]:
    return {
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs": "/docs",
        "api": settings.API_V1_PREFIX,
    }


@app.get("/health", tags=["meta"])
async def health_check() -> dict[str, str]:
    """Liveness probe used by Docker / orchestrators."""
    return {"status": "ok", "environment": settings.ENVIRONMENT}
