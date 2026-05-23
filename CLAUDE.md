# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**FlowMind** is an AI-powered financial wellness backend. It is a Python/FastAPI service that manages user expenses, computes a Financial Health Score™, runs a machine-learning prediction pipeline, and generates human-readable AI insights. The React Native mobile app consumes this API.

All backend code lives under `Backend/`. There is no frontend code in this repository.

---

## Development commands

All commands must be run from the `Backend/` directory.

### Docker (recommended)
```bash
cp .env.example .env    # edit SECRET_KEY
docker compose up --build
```
Starts PostgreSQL, Redis, the API, Celery worker, and Celery beat together.

### Local (venv)
```bash
python -m venv .venv
.venv\Scripts\activate          # Windows; Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Train ML models (writes joblib artifacts to ./ml_artifacts)
python -m app.ml.training.train

# Seed a demo account (~12 weeks of transactions)
python -m scripts.seed_demo

# Start the API
uvicorn app.main:app --reload
```

Demo login: `demo@flowmind.app` / `demo12345`

The API works without ML artifacts — every model falls back to a deterministic heuristic until trained artifacts exist.

### Celery worker (local)
```bash
celery -A app.core.celery_app.celery worker --beat --loglevel=info
```

### Database migrations (production)
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

In development the schema is auto-created on startup (`init_db()`); Alembic is for production only.

### Linting
```bash
ruff check .            # configured in pyproject.toml (line-length=100, target=py311)
```

### Tests
```bash
pytest                  # all tests (uses SQLite, no external services required)
pytest tests/test_auth.py                      # single file
pytest tests/test_expenses.py -k "test_create" # single test
```

Tests run against an in-memory SQLite database via `DATABASE_URL_OVERRIDE` set in `tests/conftest.py`. No PostgreSQL or Redis needed to run tests.

---

## Architecture

```
Backend/
  app/
    api/v1/endpoints/   HTTP layer — thin: validates input, calls a service, returns schema
    core/               config, security (JWT/bcrypt), Redis cache, Celery app, rate limiter
    auth/               AuthService + FastAPI JWT dependency (get_current_user)
    database/           async engine, session, declarative base, seed categories
    models/             SQLAlchemy ORM models
    schemas/            Pydantic v2 request/response schemas (separate from ORM models)
    services/           Domain services (ExpenseService, AnalyticsService, HealthService, …)
    ml/
      features/         Raw expenses → pandas DataFrame with engineered features
      models/           Model wrappers (each wraps a joblib artifact + heuristic fallback)
      training/         Training pipelines + synthetic data generation
      inference/        InferenceEngine (calls all four models) + ModelRegistry (singleton)
      pipelines/        FinancialIntelligencePipeline — the end-to-end orchestration
    analytics/          Pure calculators (no DB, no ML) used by AnalyticsService
    insights/           InsightEngine (rule-based + ML-signal detectors) + WeeklySummary
    tasks/              Celery tasks (ml_tasks, analytics_tasks, insight_tasks)
    utils/              datetime helpers, pagination helper
  tests/
  scripts/seed_demo.py
  alembic/
```

### Request flow

Endpoint → Service → (DB query | Cache lookup | ML pipeline)

Services receive an `AsyncSession` injected by `get_db()` (FastAPI dependency). Every endpoint is protected by `get_current_user` (JWT bearer) unless it's an auth endpoint.

### ML pipeline

```
Expenses → _clean() → feature engineering (pandas) → InferenceEngine.predict_all()
         → InsightEngine.generate() → structured response
```

`FinancialIntelligencePipeline.run()` in `ml/pipelines/pipeline.py` is the single entry point. Services call `run_pipeline(expenses)` and pluck the slice they need, so feature engineering runs once per request.

The four model wrappers (`SpendingPredictor`, `BehaviorClassifier`, `AnomalyDetector`, `SavingsForecaster`) each extend `BaseModel` in `ml/models/base.py`. They load a joblib artifact from `ML_MODEL_DIR` on startup and expose `.predict()`. If no artifact exists the `_heuristic_predict()` fallback fires silently.

`ModelRegistry` (singleton via `get_model_registry()`) holds the live wrappers and supports hot-reload after retraining via `registry.reload()`.

### Caching

`app/core/cache.py` wraps Redis with `cache_get / cache_set / cache_invalidate`. Keys follow the pattern `<domain>:user:<uuid>:...`. Any mutation (create/update/delete expense) calls `cache_invalidate(f"*:user:{user_id}*")` to bust derived analytics and prediction caches. The cache degrades gracefully when Redis is unavailable.

### Expense amount convention

`amount` is **negative for outflows** and **positive for income**. All analytics queries filter on `amount < 0` for spending and `> 0` for income.

### Database

PostgreSQL with async SQLAlchemy 2.0. UUID primary keys throughout. Key composite indexes: `(user_id, occurred_at)` and `(user_id, category_slug)` on `expenses`. For tests, `DATABASE_URL_OVERRIDE=sqlite+aiosqlite:///./test_flowmind.db` is set before any import in `conftest.py`; NullPool is used for SQLite so per-test event loops don't share connections.

### Background tasks (Celery)

- `tasks.run_predictions` — full ML pipeline for one user, persists predictions
- `tasks.compute_health_score` — recomputes and snapshots the Financial Health Score
- `tasks.retrain_models` — retrains all four models then calls `registry.reload()`
- `tasks.generate_insights` / `tasks.refresh_user_analytics` — on-demand refreshes

Celery beat schedule: weekly summaries Monday 06:00 UTC, analytics refresh nightly 03:00 UTC, model retraining Sunday 04:00 UTC.

### Deployment

`render.yaml` at the repo root defines a Render Blueprint: Redis (free), FastAPI web service (free), Celery worker (starter ~$7/mo). The database is hosted on Neon (external). Set `DATABASE_URL_OVERRIDE` in the Render dashboard with the Neon connection string — `core/config.py` normalises it to `postgresql+asyncpg` and strips libpq-only query params automatically.

---

## Key conventions

- **Settings** are loaded once via `@lru_cache` in `core/config.py` as a `pydantic_settings.BaseSettings` object. Access them via `from app.core.config import settings`.
- **Logging** uses `get_logger(name)` from `app/core/logging.py` — not bare `logging`.
- **Services** accept an `AsyncSession` in `__init__` and perform all ORM work via async SQLAlchemy. They call `db.flush()` + `db.refresh()` after writes (commit is handled by `get_db()`).
- **Schemas** are Pydantic v2 models. Use `model_dump(exclude_unset=True)` for partial updates.
- **Insight detectors** in `InsightEngine` must be resilient: each runs inside a bare `except Exception` so a broken detector never blocks the others.
