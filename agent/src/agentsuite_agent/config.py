from __future__ import annotations

from dataclasses import dataclass
from os import getenv

from dotenv import load_dotenv


def _env_bool(name: str, default: bool) -> bool:
    value = getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(slots=True)
class Settings:
    llm_provider: str = "openai"
    openai_api_key: str | None = None
    openai_model_fast: str = "gpt-4.1-mini"
    openai_model_reasoning: str = "gpt-4.1"
    openai_temperature: float = 0.1
    cors_origins: tuple[str, ...] = ()
    database_url: str = "sqlite:///./agentsuite-agent.db"
    database_echo: bool = False
    database_auto_create: bool = True
    session_cookie_name: str = "agentsuite_session"
    session_ttl_hours: int = 12
    session_cookie_secure: bool = False
    bootstrap_company_id: str = "demo-company"
    bootstrap_company_name: str = "AgentSuite Demo Workspace"
    bootstrap_admin_email: str | None = None
    bootstrap_admin_password: str | None = None
    payments_service_url: str = "http://127.0.0.1:3001"

    @classmethod
    def from_env(cls) -> "Settings":
        load_dotenv()
        cors_origins = tuple(
            origin.strip()
            for origin in getenv("AGENT_CORS_ORIGINS", "").split(",")
            if origin.strip()
        )
        database_url = getenv("DATABASE_URL", "sqlite:///./agentsuite-agent.db")
        auto_create_default = database_url.startswith("sqlite")
        return cls(
            llm_provider=getenv("LLM_PROVIDER", "openai"),
            openai_api_key=getenv("OPENAI_API_KEY"),
            openai_model_fast=getenv("OPENAI_MODEL_FAST", "gpt-4.1-mini"),
            openai_model_reasoning=getenv("OPENAI_MODEL_REASONING", "gpt-4.1"),
            openai_temperature=float(getenv("OPENAI_TEMPERATURE", "0.1")),
            cors_origins=cors_origins,
            database_url=database_url,
            database_echo=_env_bool("DATABASE_ECHO", False),
            database_auto_create=_env_bool(
                "DATABASE_AUTO_CREATE", auto_create_default
            ),
            session_cookie_name=getenv("SESSION_COOKIE_NAME", "agentsuite_session"),
            session_ttl_hours=int(getenv("SESSION_TTL_HOURS", "12")),
            session_cookie_secure=_env_bool("SESSION_COOKIE_SECURE", False),
            bootstrap_company_id=getenv("BOOTSTRAP_COMPANY_ID", "demo-company"),
            bootstrap_company_name=getenv(
                "BOOTSTRAP_COMPANY_NAME", "AgentSuite Demo Workspace"
            ),
            bootstrap_admin_email=getenv("BOOTSTRAP_ADMIN_EMAIL"),
            bootstrap_admin_password=getenv("BOOTSTRAP_ADMIN_PASSWORD"),
            payments_service_url=getenv(
                "PAYMENTS_SERVICE_URL", "http://127.0.0.1:3001"
            ),
        )
