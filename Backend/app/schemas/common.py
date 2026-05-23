"""Shared schema primitives: ORM base, pagination, generic envelopes."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class ORMModel(BaseModel):
    """Base for any schema serialised directly from a SQLAlchemy row."""

    model_config = ConfigDict(from_attributes=True)


class PageParams(BaseModel):
    """Reusable pagination query parameters."""

    page: int = Field(1, ge=1, description="1-indexed page number")
    size: int = Field(20, ge=1, le=100, description="Items per page")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.size


class Page(BaseModel, Generic[T]):
    """Standard paginated response envelope consumed by the frontend."""

    items: list[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def create(cls, items: list[T], total: int, params: PageParams) -> "Page[T]":
        pages = (total + params.size - 1) // params.size if params.size else 0
        return cls(items=items, total=total, page=params.page, size=params.size, pages=pages)


class Message(BaseModel):
    detail: str
