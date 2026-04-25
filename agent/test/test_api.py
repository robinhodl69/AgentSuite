from datetime import date

from fastapi.testclient import TestClient

from agentsuite_agent.api import create_app
from agentsuite_agent.chain import BaseChainExecutor, MonadChainExecutor
from agentsuite_agent.config import Settings
from agentsuite_agent.llm import RuleBasedLLMClient
from agentsuite_agent.models import ChainExecutionResult, PaymentDecision


class RecordingChainExecutor(BaseChainExecutor):
    def __init__(self) -> None:
        self.calls: list[dict[str, str | None]] = []

    def simulate_supplier_payment(
        self,
        decision: PaymentDecision,
        *,
        beneficiary_address: str | None = None,
        run_id: str | None = None,
        currency: str | None = None,
    ) -> ChainExecutionResult:
        return ChainExecutionResult(
            status="simulated",
            tx_hash="0xsimulated",
            explorer_url="https://example.test/tx/0xsimulated",
        )

    def execute_supplier_payment(
        self,
        decision: PaymentDecision,
        *,
        beneficiary_address: str | None,
        run_id: str,
        currency: str,
    ) -> ChainExecutionResult:
        self.calls.append(
            {
                "invoice_id": decision.invoice_id,
                "beneficiary_address": beneficiary_address,
                "run_id": run_id,
                "currency": currency,
            }
        )
        return ChainExecutionResult(
            status="executed",
            tx_hash="0xexecuted",
            explorer_url="https://example.test/tx/0xexecuted",
        )


def build_client(chain_executor: BaseChainExecutor | None = None) -> TestClient:
    app = create_app(
        settings=Settings(llm_provider="rule-based"),
        llm_client=RuleBasedLLMClient(),
        chain_executor=chain_executor
        or MonadChainExecutor(Settings(llm_provider="rule-based")),
    )
    return TestClient(app)


def test_reconciliation_run_and_audit():
    client = build_client()
    response = client.post(
        "/agent/runs/reconciliation",
        json={
            "statement_csv": (
                "date,amount,description,reference\n"
                "2026-04-05,1000.00,Cobro factura FAC-1001,FAC-1001\n"
                "2026-04-06,25.00,Comision bancaria,BNK-001\n"
                "2026-04-07,450.00,Pago proveedor UBER TRAVEL,EXP-200\n"
            ),
            "sales_invoices": [
                {
                    "invoice_id": "FAC-1001",
                    "issued_at": "2026-04-04",
                    "amount": 1000.00,
                    "customer_name": "Cliente Demo",
                    "reference": "FAC-1001",
                    "status": "pending",
                }
            ],
            "expense_records": [
                {
                    "record_id": "EXP-200",
                    "booked_at": "2026-04-07",
                    "amount": 450.00,
                    "description": "Uber aeropuerto",
                    "vendor_name": "Uber",
                    "reference": "EXP-200",
                }
            ],
        },
    )
    assert response.status_code == 200
    payload = response.json()
    counts = payload["final_output"]["counts"]
    assert counts["matched"] == 2
    assert counts["bank_only"] == 1

    audit_response = client.get(f"/agent/runs/{payload['run_id']}/audit")
    assert audit_response.status_code == 200
    assert len(audit_response.json()) >= 6


def test_supplier_payment_approval_simulates_monad_tx():
    client = build_client()
    response = client.post(
        "/agent/runs/payments/approve",
        json={
            "approved_invoice_ids": ["SUP-1"],
            "execution_mode": "simulate",
            "invoices": [
                {
                    "invoice_id": "SUP-1",
                    "supplier_name": "Proveedor XYZ",
                    "issued_at": "2026-04-01",
                    "due_at": "2026-04-20",
                    "amount_due": 10000,
                    "early_payment_discount_percent": 2.0,
                    "discount_deadline": "2099-04-10",
                    "strategic": True,
                }
            ],
            "cash_position": {"available_balance": 60000, "reserved_balance": 5000},
            "cash_forecast": {"expected_inflows": 3000, "expected_outflows": 5000},
            "policy": {"min_discount_percent": 1.5, "min_cash_reserve": 10000},
        },
    )
    assert response.status_code == 200
    payload = response.json()
    decisions = payload["final_output"]["decisions"]
    assert decisions[0]["status"] == "simulated"
    assert payload["final_output"]["executed_payments"][0]["tx_hash"].startswith("0x")


def test_budget_control_alerts_and_blocks():
    client = build_client()
    response = client.post(
        "/agent/runs/budgets",
        json={
            "budgets": [
                {"category": "Viaticos", "monthly_limit": 8000, "month": "2026-04-01"},
                {"category": "Marketing", "monthly_limit": 15000, "month": "2026-04-01"},
            ],
            "existing_expenses": [
                {
                    "expense_id": "EXP-1",
                    "booked_at": "2026-04-20",
                    "amount": 6800,
                    "description": "Uber aeropuerto",
                    "category": "Viaticos",
                }
            ],
            "new_expenses": [
                {
                    "expense_id": "EXP-2",
                    "booked_at": "2026-04-24",
                    "amount": 450,
                    "description": "Uber Aeropuerto",
                },
                {
                    "expense_id": "EXP-3",
                    "booked_at": "2026-04-24",
                    "amount": 1200,
                    "description": "Facebook Ads campaña cierre",
                },
            ],
        },
    )
    assert response.status_code == 200
    payload = response.json()
    results = payload["final_output"]["results"]
    viaticos = next(item for item in results if item["expense_id"] == "EXP-2")
    marketing = next(item for item in results if item["expense_id"] == "EXP-3")
    assert viaticos["status"] == "alerted"
    assert marketing["status"] in {"approved", "alerted"}


def test_list_runs_returns_recent_runs_first():
    client = build_client()

    reconciliation_response = client.post(
        "/agent/runs/reconciliation",
        json={
            "statement_csv": "date,amount,description\n2026-04-05,1000.00,Cobro factura demo\n",
        },
    )
    assert reconciliation_response.status_code == 200

    budget_response = client.post(
        "/agent/runs/budgets",
        json={
            "budgets": [{"category": "Viaticos", "monthly_limit": 8000, "month": "2026-04-01"}],
            "new_expenses": [
                {
                    "expense_id": "EXP-20",
                    "booked_at": "2026-04-24",
                    "amount": 450,
                    "description": "Uber Aeropuerto",
                }
            ],
        },
    )
    assert budget_response.status_code == 200

    response = client.get("/agent/runs")
    assert response.status_code == 200
    payload = response.json()

    assert len(payload) >= 2
    assert payload[0]["run_id"] == budget_response.json()["run_id"]
    assert payload[1]["run_id"] == reconciliation_response.json()["run_id"]


def test_supplier_payment_execute_uses_run_id_and_beneficiary():
    executor = RecordingChainExecutor()
    client = build_client(chain_executor=executor)

    response = client.post(
        "/agent/runs/payments/approve",
        json={
            "approved_invoice_ids": ["SUP-EXEC-1"],
            "execution_mode": "execute",
            "invoices": [
                {
                    "invoice_id": "SUP-EXEC-1",
                    "supplier_name": "Proveedor Ejecutable",
                    "issued_at": "2026-04-01",
                    "due_at": "2026-04-20",
                    "amount_due": 0.001,
                    "early_payment_discount_percent": 2.0,
                    "discount_deadline": "2099-04-10",
                    "strategic": True,
                    "beneficiary_address": "0x1111111111111111111111111111111111111111",
                }
            ],
            "cash_position": {
                "available_balance": 10,
                "reserved_balance": 0,
                "currency": "MON",
            },
            "cash_forecast": {"expected_inflows": 0, "expected_outflows": 0},
            "policy": {"min_discount_percent": 1.5, "min_cash_reserve": 0},
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["final_output"]["decisions"][0]["status"] == "executed"
    assert payload["final_output"]["decisions"][0]["discounted_amount"] == 0.00098
    assert executor.calls[0]["invoice_id"] == "SUP-EXEC-1"
    assert (
        executor.calls[0]["beneficiary_address"]
        == "0x1111111111111111111111111111111111111111"
    )
    assert executor.calls[0]["currency"] == "MON"
    assert isinstance(executor.calls[0]["run_id"], str)
    assert executor.calls[0]["run_id"]


def test_supplier_payment_execute_requires_beneficiary_address():
    executor = RecordingChainExecutor()
    client = build_client(chain_executor=executor)

    response = client.post(
        "/agent/runs/payments/approve",
        json={
            "approved_invoice_ids": ["SUP-EXEC-2"],
            "execution_mode": "execute",
            "invoices": [
                {
                    "invoice_id": "SUP-EXEC-2",
                    "supplier_name": "Proveedor Sin Wallet",
                    "issued_at": "2026-04-01",
                    "due_at": "2026-04-20",
                    "amount_due": 0.001,
                    "early_payment_discount_percent": 2.0,
                    "discount_deadline": "2099-04-10",
                    "strategic": True,
                }
            ],
            "cash_position": {
                "available_balance": 10,
                "reserved_balance": 0,
                "currency": "MON",
            },
            "cash_forecast": {"expected_inflows": 0, "expected_outflows": 0},
            "policy": {"min_discount_percent": 1.5, "min_cash_reserve": 0},
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == (
        "beneficiary_address is required for execution_mode=execute."
    )
