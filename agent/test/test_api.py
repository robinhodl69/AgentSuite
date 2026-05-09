from fastapi.testclient import TestClient
from sqlalchemy import func, select

from agentsuite_agent.api import create_app
from agentsuite_agent.config import Settings
from agentsuite_agent.llm import RuleBasedLLMClient
from agentsuite_agent.persistence_models import (
    BankTransactionModel,
    BudgetExpenseModel,
    BudgetLimitModel,
    ExpenseRecordModel,
    PaymentDecisionModel,
    PaymentExecutionModel,
    ReconciliationMatchModel,
    SalesInvoiceModel,
    SupplierInvoiceModel,
)

ADMIN_EMAIL = "admin@agentsuite.local"
ADMIN_PASSWORD = "dev-password-123"


def build_client() -> TestClient:
    app = create_app(
        settings=Settings(
            llm_provider="rule-based",
            database_url="sqlite+pysqlite:///:memory:",
            database_auto_create=True,
            bootstrap_admin_email=ADMIN_EMAIL,
            bootstrap_admin_password=ADMIN_PASSWORD,
        ),
        llm_client=RuleBasedLLMClient(),
    )
    return TestClient(app)


def model_count(client: TestClient, model: type) -> int:
    with client.app.state.database_manager.create_session() as session:
        return session.execute(select(func.count()).select_from(model)).scalar_one()


def login(
    client: TestClient,
    email: str = ADMIN_EMAIL,
    password: str = ADMIN_PASSWORD,
) -> None:
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200


def test_reconciliation_run_and_audit():
    client = build_client()
    login(client)
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
    assert model_count(client, BankTransactionModel) == 3
    assert model_count(client, SalesInvoiceModel) == 1
    assert model_count(client, ExpenseRecordModel) == 1
    assert model_count(client, ReconciliationMatchModel) == 2


def test_supplier_payment_evaluate_only_analysis():
    client = build_client()
    login(client)
    response = client.post(
        "/agent/runs/payments/evaluate",
        json={
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
    assert decisions[0]["status"] == "ready_to_pay"
    assert payload["final_output"]["counts"]["executed_or_simulated"] == 0
    assert model_count(client, SupplierInvoiceModel) == 1
    assert model_count(client, PaymentDecisionModel) == 1
    assert model_count(client, PaymentExecutionModel) == 0


def test_supplier_payment_simulate_requires_payments_service():
    """Simulate mode attempts to call the payments service; without it we get a 400."""
    client = build_client()
    login(client)
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
                    "amount_due": 100,
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
    # Without a running payments service the request will fail with 400
    assert response.status_code == 400

    runs_response = client.get("/agent/runs")
    assert runs_response.status_code == 200
    latest_run = runs_response.json()[0]
    assert latest_run["status"] == "failed"
    assert latest_run["final_output"]["error"]
    assert any(
        event["details"].get("status") == "failed"
        for event in latest_run["audit_log"]
    )


def test_budget_control_alerts_and_blocks():
    client = build_client()
    login(client)
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
    assert model_count(client, BudgetLimitModel) == 2
    assert model_count(client, BudgetExpenseModel) == 3


def test_list_runs_returns_recent_runs_first():
    client = build_client()
    login(client)

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


def test_api_v1_routes_are_available():
    client = build_client()

    health_response = client.get("/api/v1/health")
    assert health_response.status_code == 200
    assert health_response.json() == {"status": "ok", "database": "ok"}
    assert health_response.headers["x-request-id"]

    login(client)
    me_response = client.get("/api/v1/auth/me")
    assert me_response.status_code == 200
    payload = me_response.json()
    assert payload["user"]["email"] == ADMIN_EMAIL
    assert payload["user"]["role"] == "finance_admin"


def test_viewer_cannot_execute_finance_run():
    client = build_client()
    login(client)

    create_user_response = client.post(
        "/api/v1/auth/users",
        json={
            "email": "viewer@agentsuite.local",
            "password": "viewer-password",
            "role": "viewer",
        },
    )
    assert create_user_response.status_code == 200

    logout_response = client.post("/api/v1/auth/logout")
    assert logout_response.status_code == 200

    login(client, email="viewer@agentsuite.local", password="viewer-password")
    blocked_response = client.post(
        "/agent/runs/reconciliation",
        json={"statement_csv": "date,amount,description\n2026-04-05,1000.00,Cobro factura demo\n"},
    )
    assert blocked_response.status_code == 403
