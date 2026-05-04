from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import Settings


class Base(DeclarativeBase):
    pass


def _build_engine_kwargs(settings: Settings) -> dict[str, Any]:
    kwargs: dict[str, Any] = {
        "echo": settings.database_echo,
        "future": True,
    }
    if settings.database_url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
        if settings.database_url.endswith(":memory:"):
            kwargs["poolclass"] = StaticPool
    return kwargs


@dataclass(slots=True)
class DatabaseManager:
    engine: Engine
    session_factory: sessionmaker[Session]

    def create_session(self) -> Session:
        return self.session_factory()

    def create_schema(self) -> None:
        from . import persistence_models  # noqa: F401

        Base.metadata.create_all(self.engine)

    def close(self) -> None:
        self.engine.dispose()


def build_database_manager(settings: Settings) -> DatabaseManager:
    engine = create_engine(settings.database_url, **_build_engine_kwargs(settings))
    session_factory = sessionmaker(
        bind=engine,
        autocommit=False,
        autoflush=False,
        expire_on_commit=False,
    )
    return DatabaseManager(engine=engine, session_factory=session_factory)
