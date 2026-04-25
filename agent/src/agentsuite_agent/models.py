from __future__ import annotations

from datetime import UTC, date, datetime
from enum import Enum
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field, ConfigDict


class ProcessType(str, Enum):
    RECONCILIATION = "reconciliation"
    SUPPLIER_PAYMENTS = "supplier_payments"
    BUDGET_CONTROL = "budget_control"


class RunStatus(str, Enum):
    COMPLETED = "completed"
    REQUIRES_REVIEW = "requires_review"
    BLOCKED = "blocked"


class AuditEvent(BaseModel):
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))
    stage: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class SkillDefinition(BaseModel):
    skill_id: str
    process: ProcessType
    purpose: str
    required_inputs: list[str] = Field(default_factory=list)
    decision_rules: list[str] = Field(default_factory=list)
    approval_requirements: list[str] = Field(default_factory=list)
    output_contract: list[str] = Field(default_factory=list)
    failure_modes: list[str] = Field(default_factory=list)
    body: str


class BankTransaction(BaseModel):
    transaction_id: str = Field(default_factory=lambda: f"txn-{uuid4().hex[:10]}")
    posted_at: date
    amount: float
    description: str
    reference: str | None = None
    counterparty: str | None = None


class SalesInvoice(BaseModel):
    invoice_id: str
    issued_at: date
    amount: float
    customer_name: str | None = None
    reference: str | None = None
    rfc: str | None = None
    status: str = "pending"


class ExpenseRecord(BaseModel):
    record_id: str
    booked_at: date
    amount: float
    description: str
    vendor_name: str | None = None
    reference: str | None = None
    category: str | None = None
    status: str = "recorded"


class SupplierInvoice(BaseModel):
    invoice_id: str
    supplier_name: str
    issued_at: date
    due_at: date
    amount_due: float
    early_payment_discount_percent: float = 0.0
    discount_deadline: date | None = None
    strategic: bool = False
    status: str = "pending"
    beneficiary_reference: str | None = None
    beneficiary_address: str | None = None


class CashPosition(BaseModel):
    available_balance: float
    reserved_balance: float = 0.0
    currency: str = "MXN"


class CashForecast(BaseModel):
    expected_inflows: float = 0.0
    expected_outflows: float = 0.0
    window_days: int = 30


class PaymentPolicy(BaseModel):
    min_discount_percent: float = 1.5
    min_cash_reserve: float = 0.0
    auto_execute: bool = False
    require_manual_approval_over: float | None = None


class BudgetLimit(BaseModel):
    category: str
    monthly_limit: float
    month: date


class BudgetPolicy(BaseModel):
    alert_threshold_percent: float = 90.0
    critical_threshold_percent: float = 100.0
    block_on_critical: bool = True


class ExpenseInput(BaseModel):
    expense_id: str
    booked_at: date
    amount: float
    description: str
    category: str | None = None
    vendor_name: str | None = None


class ReconciliationMatch(BaseModel):
    bank_transaction_id: str
    ledger_record_id: str
    ledger_record_type: Literal["sales_invoice", "expense_record"]
    score: int
    reason: str


class ReconciliationReviewItem(BaseModel):
    bank_transaction_id: str
    candidate_record_ids: list[str]
    reason: str


class ChainExecutionResult(BaseModel):
    status: Literal["simulated", "executed"]
    tx_hash: str
    explorer_url: str
    network: str = "Monad Testnet"


class PaymentDecision(BaseModel):
    invoice_id: str
    supplier_name: str
    amount_due: float
    discount_percent: float
    discounted_amount: float
    savings_amount: float
    status: Literal[
        "wait",
        "ready_to_pay",
        "pending_approval",
        "blocked",
        "simulated",
        "executed",
    ]
    reason: str
    tx_hash: str | None = None
    explorer_url: str | None = None


class BudgetDecision(BaseModel):
    expense_id: str
    category: str
    amount: float
    monthly_limit: float
    monthly_spent: float
    monthly_spent_percent: float
    projected_month_end_spend: float
    status: Literal["approved", "alerted", "pending_approval", "blocked"]
    reason: str


class ReconciliationRequest(BaseModel):
    company_id: str = "demo-company"
    actor_role: str = "accountant"
    statement_csv: str
    sales_invoices: list[SalesInvoice] = Field(default_factory=list)
    expense_records: list[ExpenseRecord] = Field(default_factory=list)
    amount_tolerance: float = 0.01
    matching_window_days: int = 1


class SupplierPaymentRequest(BaseModel):
    company_id: str = "demo-company"
    actor_role: str = "treasurer"
    invoices: list[SupplierInvoice]
    cash_position: CashPosition
    cash_forecast: CashForecast = Field(default_factory=CashForecast)
    policy: PaymentPolicy = Field(default_factory=PaymentPolicy)
    execution_mode: Literal["evaluate", "simulate", "execute"] = "evaluate"


class SupplierPaymentApprovalRequest(SupplierPaymentRequest):
    approved_invoice_ids: list[str] = Field(default_factory=list)
    execution_mode: Literal["simulate", "execute"] = "simulate"


class BudgetControlRequest(BaseModel):
    company_id: str = "demo-company"
    actor_role: str = "finance_manager"
    budgets: list[BudgetLimit]
    existing_expenses: list[ExpenseInput] = Field(default_factory=list)
    new_expenses: list[ExpenseInput] = Field(default_factory=list)
    policy: BudgetPolicy = Field(default_factory=BudgetPolicy)
    categorization_rules: dict[str, str] = Field(default_factory=dict)


class RunRecord(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    run_id: str
    process_type: ProcessType
    status: RunStatus
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    final_output: dict[str, Any]
    audit_log: list[AuditEvent]
