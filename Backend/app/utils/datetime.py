"""Date / time helpers used by analytics and ML feature extraction."""

from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone

WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def as_utc(dt: datetime) -> datetime:
    """Coerce a datetime to tz-aware UTC.

    PostgreSQL returns tz-aware datetimes; SQLite (used in tests) returns
    naive ones. Normalising here keeps window comparisons portable.
    """
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def start_of_week(d: date | datetime) -> date:
    """Monday of the week containing ``d``."""
    d = d.date() if isinstance(d, datetime) else d
    return d - timedelta(days=d.weekday())


def start_of_month(d: date | datetime) -> date:
    d = d.date() if isinstance(d, datetime) else d
    return d.replace(day=1)


def week_bounds(reference: datetime | None = None) -> tuple[datetime, datetime]:
    """Return [start, end) datetimes for the week containing ``reference``."""
    ref = reference or utcnow()
    start = datetime.combine(start_of_week(ref), time.min, tzinfo=timezone.utc)
    return start, start + timedelta(days=7)


def month_bounds(reference: datetime | None = None) -> tuple[datetime, datetime]:
    ref = reference or utcnow()
    start = datetime.combine(start_of_month(ref), time.min, tzinfo=timezone.utc)
    if start.month == 12:
        end = start.replace(year=start.year + 1, month=1)
    else:
        end = start.replace(month=start.month + 1)
    return start, end


def is_weekend(dt: datetime) -> bool:
    return dt.weekday() >= 5


def is_late_night(dt: datetime) -> bool:
    """Late-night window (22:00–05:00) — a known impulse-spend signal."""
    return dt.hour >= 22 or dt.hour < 5
