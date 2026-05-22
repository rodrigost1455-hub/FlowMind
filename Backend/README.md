# FlowMind Backend

AI-powered financial wellness backend — a scalable, ML-first FastAPI
service that powers the FlowMind mobile app.

It manages users and financial data, generates dynamic AI insights, runs
a machine-learning prediction system, computes the **Financial Health
Score™**, and serves clean, typed JSON to the React Native frontend.

---

## Tech stack

| Layer            | Technology                                            |
|------------------|-------------------------------------------------------|
| API              | Python 3.11+, FastAPI, Uvicorn                        |
| Validation       | Pydantic v2                                           |
| Database         | PostgreSQL, SQLAlchemy 2.0 (async), Alembic           |
| Auth             | JWT (access + refresh), bcrypt                        |
| Cache            | Redis                                                 |
| Background tasks | Celery + Redis (worker + beat)                        |
| Machine learning | scikit-learn, XGBoost, Isolation Forest, pandas, NumPy|
| Experiment track | MLflow                                                |
| Packaging        | Docker + docker-compose                               |

---

## Architecture

```
app/
  api/v1/endpoints/   REST endpoints (auth, expenses, analytics, health, insights, predictions)
  core/               config, security, cache, celery, rate limiting, logging
  auth/               JWT auth service + FastAPI dependencies
  database/           async engine, session, declarative base, bootstrap
  models/             SQLAlchemy models (users, expenses, insights, scores, ...)
  schemas/            Pydantic request/response schemas
  services/           domain services (expense, analytics, health, insight, prediction)
  ml/
    features/         feature engineering (raw expenses -> ML features)
    models/           model wrappers (trained artifact OR heuristic fallback)
    training/         reusable training pipelines + synthetic dataset
    inference/        model registry + runtime inference engine
    pipelines/        end-to-end expenses -> predictions -> insights flow
  analytics/          pure analytics calculators
  insights/           AI insight engine + weekly summary engine
  predictions/        prediction domain package
  tasks/              Celery background tasks
  utils/              datetime + pagination helpers
tests/                pytest unit + API tests
```

### The ML pipeline

```
User Expenses -> Data Cleaning -> Feature Engineering -> Model Inference
              -> Predictions -> AI Insights -> API Response
```

**Models** (each wraps a trained artifact, with a transparent heuristic
fallback so the API works from a cold start):

1. **Spending prediction** — XGBoost regressor: weekly / monthly spend +
   overspend probability.
2. **Behaviour classification** — Random Forest: `impulsive` / `stable` /
   `conservative` / `high_risk`.
3. **Anomaly detection** — Isolation Forest: unusual / risky transactions.
4. **Savings forecasting** — Gradient Boosting: 30/90-day savings +
   financial-decline risk.

---

## Quick start (Docker)

```bash
cd Backend
cp .env.example .env            # then edit SECRET_KEY
docker compose up --build
```

API: <http://localhost:8000>  ·  Swagger: <http://localhost:8000/docs>

This starts PostgreSQL, Redis, the API, a Celery worker and Celery beat.

## Quick start (local)

```bash
cd Backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env

# 1. train the ML models (writes joblib artifacts to ./ml_artifacts)
python -m app.ml.training.train

# 2. seed a demo account with ~12 weeks of transactions
python -m scripts.seed_demo

# 3. run the API
uvicorn app.main:app --reload
```

Demo login: `demo@flowmind.app` / `demo12345`

> Without step 1 the API still runs — every model falls back to an
> interpretable heuristic until real artifacts exist.

---

## Key endpoints

All under `/api/v1`. Full interactive docs at `/docs`.

| Group     | Endpoints |
|-----------|-----------|
| Auth      | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `GET /auth/me`, `/auth/onboarding-status` |
| Users     | `PATCH /users/me`, `POST /users/me/onboarding` |
| Expenses  | `POST /expenses`, `GET /expenses` (filter + paginate), `GET /expenses/by-category`, `GET/PATCH/DELETE /expenses/{id}` |
| Analytics | `GET /analytics/overview`, `/analytics/weekly`, `/analytics/monthly`, `/analytics/category-breakdown`, `/analytics/savings-trend`, `/analytics/heatmap` |
| Health    | `GET /financial-health/score`, `/financial-health/history` |
| Insights  | `GET /insights`, `POST /insights/generate`, `POST /insights/{id}/read`, `/insights/{id}/dismiss`, `GET/POST /insights/weekly-summary` |
| Predict   | `GET /predictions`, `/predictions/spending`, `/predictions/behavior`, `/predictions/savings`, `/predictions/anomalies`, `/predictions/history`, `/predictions/models` |

---

## Database

PostgreSQL with UUID primary keys, timestamps, foreign-key relationships
and composite indexes on the analytics hot paths. Tables: `users`,
`categories`, `expenses`, `ai_insights`, `financial_scores`,
`weekly_summaries`, `achievements`, `challenges`, `predictions`,
`spending_trends`.

For local/dev the schema is auto-created on startup. For production use
Alembic:

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

---

## Background tasks (Celery)

Scheduled via Celery beat:

- **Weekly summaries** — Mondays 06:00 UTC
- **Analytics refresh** — nightly 03:00 UTC
- **Model retraining** — Sundays 04:00 UTC (retrains + hot-reloads the registry)

On-demand tasks: `run_predictions`, `compute_health_score`,
`generate_insights`, `refresh_user_analytics`.

---

## Testing

```bash
pytest                    # runs against an isolated SQLite database
```

Covers auth flows, expense CRUD + isolation, analytics, the Financial
Health Score, insight generation, the prediction bundle, and ML units
(feature engineering, every model, the pipeline).

---

## Security

JWT access/refresh tokens, bcrypt password hashing, per-IP rate limiting,
strict security headers, configurable CORS, Pydantic input validation at
every boundary, and SQL-injection-safe parameterised ORM queries.
