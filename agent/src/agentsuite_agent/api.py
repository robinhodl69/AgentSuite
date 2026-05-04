from __future__ import annotations

from contextlib import asynccontextmanager
import json
import logging
from pathlib import Path
import time
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from .auth import AuthService, CurrentUser, get_current_user, require_roles
from .config import Settings
from .database import build_database_manager
from .errors import AgentSuiteError
from .llm import BaseLLMClient, build_llm_client
from .models import (
    AuthSessionResponse,
    BudgetControlRequest,
    CreateUserRequest,
    LoginRequest,
    ProcessType,
    ReconciliationRequest,
    SupplierPaymentApprovalRequest,
    SupplierPaymentRequest,
    UserRole,
)
from .runs import SqlAlchemyRunRepository
from .workflows import build_runner


def create_app(
    *,
    settings: Settings | None = None,
    llm_client: BaseLLMClient | None = None,
) -> FastAPI:
    resolved_settings = settings or Settings.from_env()
    resolved_llm = llm_client or build_llm_client(resolved_settings)
    base_dir = Path(__file__).resolve().parents[2]
    database_manager = build_database_manager(resolved_settings)
    if resolved_settings.database_auto_create:
        database_manager.create_schema()
    auth_service = AuthService(database_manager, resolved_settings)
    auth_service.ensure_bootstrap_admin()
    logger = logging.getLogger("agentsuite.api")
    runner = build_runner(
        base_dir,
        resolved_llm,
        SqlAlchemyRunRepository(database_manager),
    )

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        try:
            yield
        finally:
            database_manager.close()

    app = FastAPI(
        title="AgentSuite Agent API",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.state.runner = runner
    app.state.database_manager = database_manager
    app.state.auth_service = auth_service

    if resolved_settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=list(resolved_settings.cors_origins),
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.middleware("http")
    async def request_context_middleware(request: Request, call_next):
        request_id = request.headers.get("x-request-id") or uuid4().hex
        request.state.request_id = request_id
        started_at = time.perf_counter()
        response: Response | None = None

        try:
            response = await call_next(request)
            return response
        finally:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            status_code = response.status_code if response is not None else 500
            if response is not None:
                response.headers["x-request-id"] = request_id
            logger.info(
                json.dumps(
                    {
                        "event": "request_completed",
                        "request_id": request_id,
                        "method": request.method,
                        "path": request.url.path,
                        "status_code": status_code,
                        "duration_ms": duration_ms,
                    }
                )
            )

    @app.exception_handler(AgentSuiteError)
    async def agent_exception_handler(_, exc: AgentSuiteError):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.get("/health", include_in_schema=False)
    @app.get("/api/v1/health")
    def healthcheck() -> dict[str, str]:
        with database_manager.engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "ok"}

    @app.post("/api/v1/auth/login")
    def login(payload: LoginRequest, response: Response):
        issued_session = auth_service.authenticate(payload)
        auth_service.set_session_cookie(response, issued_session.session_id)
        return jsonable_encoder(issued_session.response)

    @app.post("/api/v1/auth/logout")
    def logout(request: Request, response: Response):
        session_id = request.cookies.get(auth_service.settings.session_cookie_name)
        auth_service.delete_session(session_id)
        auth_service.clear_session_cookie(response)
        return {"status": "ok"}

    @app.post("/api/v1/auth/refresh")
    def refresh(request: Request, response: Response):
        session_id = request.cookies.get(auth_service.settings.session_cookie_name)
        session_response = auth_service.refresh_session(session_id)
        if session_id:
            auth_service.set_session_cookie(response, session_id)
        return jsonable_encoder(session_response)

    @app.get("/api/v1/auth/me")
    def auth_me(current_user: CurrentUser = Depends(get_current_user)):
        return jsonable_encoder(
            AuthSessionResponse(
                user={
                    "user_id": current_user.user_id,
                    "company_id": current_user.company_id,
                    "email": current_user.email,
                    "role": current_user.role,
                }
            )
        )

    @app.post("/api/v1/auth/users")
    def create_user(
        payload: CreateUserRequest,
        current_user: CurrentUser = Depends(
            require_roles(UserRole.FINANCE_ADMIN)
        ),
    ):
        user = auth_service.create_user(current_user, payload)
        return jsonable_encoder(user)

    @app.post("/agent/runs/reconciliation", include_in_schema=False)
    @app.post("/api/v1/agent/runs/reconciliation")
    def run_reconciliation(
        http_request: Request,
        request: ReconciliationRequest,
        current_user: CurrentUser = Depends(
            require_roles(UserRole.FINANCE_ADMIN, UserRole.ACCOUNTANT)
        ),
    ):
        run = runner.run(
            ProcessType.RECONCILIATION,
            request.model_copy(
                update={
                    "company_id": current_user.company_id,
                    "actor_role": current_user.role.value,
                }
            ),
            request_id=getattr(http_request.state, "request_id", None),
        )
        return jsonable_encoder(run)

    @app.post("/agent/runs/payments/evaluate", include_in_schema=False)
    @app.post("/api/v1/agent/runs/payments/evaluate")
    def evaluate_supplier_payments(
        http_request: Request,
        request: SupplierPaymentRequest,
        current_user: CurrentUser = Depends(
            require_roles(UserRole.FINANCE_ADMIN, UserRole.TREASURER)
        ),
    ):
        run = runner.run(
            ProcessType.SUPPLIER_PAYMENTS,
            request.model_copy(
                update={
                    "execution_mode": "evaluate",
                    "company_id": current_user.company_id,
                    "actor_role": current_user.role.value,
                }
            ),
            request_id=getattr(http_request.state, "request_id", None),
        )
        return jsonable_encoder(run)

    @app.post("/agent/runs/payments/approve", include_in_schema=False)
    @app.post("/api/v1/agent/runs/payments/approve")
    def approve_supplier_payments(
        http_request: Request,
        request: SupplierPaymentApprovalRequest,
        current_user: CurrentUser = Depends(
            require_roles(UserRole.FINANCE_ADMIN, UserRole.TREASURER)
        ),
    ):
        run = runner.run(
            ProcessType.SUPPLIER_PAYMENTS,
            request.model_copy(
                update={
                    "company_id": current_user.company_id,
                    "actor_role": current_user.role.value,
                }
            ),
            request_id=getattr(http_request.state, "request_id", None),
        )
        return jsonable_encoder(run)

    @app.post("/agent/runs/budgets", include_in_schema=False)
    @app.post("/api/v1/agent/runs/budgets")
    def run_budget_control(
        http_request: Request,
        request: BudgetControlRequest,
        current_user: CurrentUser = Depends(
            require_roles(UserRole.FINANCE_ADMIN, UserRole.ACCOUNTANT)
        ),
    ):
        run = runner.run(
            ProcessType.BUDGET_CONTROL,
            request.model_copy(
                update={
                    "company_id": current_user.company_id,
                    "actor_role": current_user.role.value,
                }
            ),
            request_id=getattr(http_request.state, "request_id", None),
        )
        return jsonable_encoder(run)

    @app.get("/agent/runs/{run_id}", include_in_schema=False)
    @app.get("/api/v1/agent/runs/{run_id}")
    def get_run(
        run_id: str,
        current_user: CurrentUser = Depends(get_current_user),
    ):
        run = runner.run_repository.get(run_id, company_id=current_user.company_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found.")
        return jsonable_encoder(run)

    @app.get("/agent/runs", include_in_schema=False)
    @app.get("/api/v1/agent/runs")
    def list_runs(current_user: CurrentUser = Depends(get_current_user)):
        return jsonable_encoder(runner.run_repository.list(company_id=current_user.company_id))

    @app.get("/agent/runs/{run_id}/audit", include_in_schema=False)
    @app.get("/api/v1/agent/runs/{run_id}/audit")
    def get_audit(
        run_id: str,
        current_user: CurrentUser = Depends(get_current_user),
    ):
        audit_log = runner.run_repository.audit(run_id, company_id=current_user.company_id)
        if audit_log is None:
            raise HTTPException(status_code=404, detail="Run not found.")
        return jsonable_encoder(audit_log)

    return app
