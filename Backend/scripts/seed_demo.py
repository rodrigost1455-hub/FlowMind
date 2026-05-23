"""Seed a demo account with ~12 weeks of realistic transactions.

Run from the Backend directory:

    python -m scripts.seed_demo

Creates (or reuses) demo@flowmind.app / demo12345 and populates enough
expense history for analytics, insights and every ML model to produce
meaningful output.
"""

from __future__ import annotations

import asyncio
import random
from datetime import timedelta

from sqlalchemy import select

from app.core.logging import configure_logging, get_logger
from app.core.security import hash_password
from app.database.init_db import init_db
from app.database.session import SessionLocal
from app.models.enums import EmotionalState, PaymentMethod
from app.models.expense import Expense
from app.models.user import User
from app.utils.datetime import utcnow

log = get_logger("seed")

# (category, merchant pool, typical amount, std)
_SPEND = [
    ("food", ["Taqueria El Sol", "Sweetgreen", "Trader Joe's"], 24, 14),
    ("coffee", ["Blue Bottle", "Philz", "Starbucks"], 6, 2),
    ("transport", ["Uber", "BART", "Lyft"], 12, 6),
    ("shopping", ["Amazon", "Apple", "Target"], 70, 45),
    ("fun", ["Spotify", "Netflix", "AMC"], 16, 9),
    ("bills", ["PG&E", "Comcast", "AT&T"], 75, 20),
    ("health", ["CVS Pharmacy", "Equinox"], 60, 50),
]
_IMPULSE_MOODS = [EmotionalState.STRESSED, EmotionalState.BORED, EmotionalState.SAD]


async def seed() -> None:
    await init_db()
    rng = random.Random(2025)

    async with SessionLocal() as db:
        existing = (
            await db.execute(select(User).where(User.email == "demo@flowmind.app"))
        ).scalar_one_or_none()
        if existing:
            log.info("Demo user already exists (%s) — skipping seed", existing.id)
            return

        user = User(
            email="demo@flowmind.app",
            hashed_password=hash_password("demo12345"),
            full_name="Alex Rivera",
            onboarding_completed=True,
            monthly_income=5840.0,
            weekly_budget=1400.0,
            xp=1340,
            level=7,
            streak_days=12,
        )
        db.add(user)
        await db.flush()

        start = utcnow() - timedelta(weeks=12)
        expenses: list[Expense] = []
        for day in range(84):
            ts = start + timedelta(days=day)
            weekend = ts.weekday() >= 5
            n_txn = rng.randint(3, 6) if weekend else rng.randint(1, 4)
            for _ in range(n_txn):
                cat, merchants, base, std = rng.choice(_SPEND)
                amount = -abs(rng.gauss(base * (1.4 if weekend else 1.0), std))
                impulse = rng.random() < (0.35 if weekend else 0.12)
                hour = rng.randint(22, 25) % 24 if impulse else rng.randint(7, 21)
                expenses.append(
                    Expense(
                        user_id=user.id,
                        amount=round(amount, 2),
                        category_slug=cat,
                        occurred_at=ts.replace(hour=hour, minute=rng.randint(0, 59)),
                        merchant=rng.choice(merchants),
                        notes=None,
                        payment_method=PaymentMethod.CARD,
                        emotional_state=(
                            rng.choice(_IMPULSE_MOODS) if impulse else EmotionalState.NEUTRAL
                        ),
                        is_recurring=cat in {"bills", "fun"} and rng.random() < 0.5,
                        tags=["weekend"] if weekend else [],
                    )
                )
            if day % 14 == 0:  # bi-weekly salary
                expenses.append(
                    Expense(
                        user_id=user.id,
                        amount=2920.0,
                        category_slug="income",
                        occurred_at=ts.replace(hour=9, minute=0),
                        merchant="Salary · Stripe",
                        payment_method=PaymentMethod.DIRECT_DEPOSIT,
                        is_recurring=True,
                    )
                )
        db.add_all(expenses)
        await db.commit()
        log.info("Seeded demo user %s with %d expenses", user.id, len(expenses))
        log.info("Login: demo@flowmind.app / demo12345")


if __name__ == "__main__":
    configure_logging()
    asyncio.run(seed())
