from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from .chain import BaseChainExecutor, MonadChainExecutor
from .config import Settings
from .errors import AgentSuiteError
from .llm import BaseLLMClient, build_llm_client
from .models import (
    BudgetControlRequest,
    ProcessType,
    ReconciliationRequest,
    SupplierPaymentApprovalRequest,
    SupplierPaymentRequest,
)
from .workflows import build_runner


def create_app(
    *,
    settings: Settings | None = None,
    llm_client: BaseLLMClient | None = None,
    chain_executor: BaseChainExecutor | None = None,
) -> FastAPI:
    resolved_settings = settings or Settings.from_env()
    resolved_llm = llm_client or build_llm_client(resolved_settings)
    resolved_chain = chain_executor or MonadChainExecutor(resolved_settings)
    base_dir = Path(__file__).resolve().parents[2]
    runner = build_runner(base_dir, resolved_llm, resolved_chain)

    app = FastAPI(title="AgentSuite Agent API", version="0.1.0")
    app.state.runner = runner

    @app.exception_handler(AgentSuiteError)
    async def agent_exception_handler(_, exc: AgentSuiteError):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.get("/health")
    def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/agent/runs/reconciliation")
    def run_reconciliation(request: ReconciliationRequest):
        run = runner.run(ProcessType.RECONCILIATION, request)
        return jsonable_encoder(run)

    @app.post("/agent/runs/payments/evaluate")
    def evaluate_supplier_payments(request: SupplierPaymentRequest):
        run = runner.run(
            ProcessType.SUPPLIER_PAYMENTS,
            request.model_copy(update={"execution_mode": "evaluate"}),
        )
        return jsonable_encoder(run)

    @app.post("/agent/runs/payments/approve")
    def approve_supplier_payments(request: SupplierPaymentApprovalRequest):
        run = runner.run(ProcessType.SUPPLIER_PAYMENTS, request)
        return jsonable_encoder(run)

    @app.post("/agent/runs/budgets")
    def run_budget_control(request: BudgetControlRequest):
        run = runner.run(ProcessType.BUDGET_CONTROL, request)
        return jsonable_encoder(run)

    @app.get("/agent/runs/{run_id}")
    def get_run(run_id: str):
        run = runner.run_repository.get(run_id)
        if run is None:
            raise HTTPException(status_code=404, detail="Run not found.")
        return jsonable_encoder(run)

    @app.get("/agent/runs/{run_id}/audit")
    def get_audit(run_id: str):
        audit_log = runner.run_repository.audit(run_id)
        if audit_log is None:
            raise HTTPException(status_code=404, detail="Run not found.")
        return jsonable_encoder(audit_log)

    return app
