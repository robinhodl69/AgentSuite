from datetime import date

from fastapi.testclient import TestClient

from agentsuite_agent.api import create_app
from agentsuite_agent.chain import MonadChainExecutor
from agentsuite_agent.config import Settings
from agentsuite_agent.llm import RuleBasedLLMClient


def build_client() -> TestClient:
    app = create_app(
        settings=Settings(llm_provider="rule-based"),
        llm_client=RuleBasedLLMClient(),
        chain_executor=MonadChainExecutor(Settings(llm_provider="rule-based")),
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

