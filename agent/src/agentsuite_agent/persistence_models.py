from __future__ import annotations

from datetime import UTC, date, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class CompanyModel(Base):
    __tablename__ = "companies"

    company_id: Mapped[str] = mapped_column(String(255), primary_key=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    runs: Mapped[list["AgentRunModel"]] = relationship(back_populates="company")
    users: Mapped[list["UserModel"]] = relationship(back_populates="company")


class UserModel(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    email: Mapped[str | None] = mapped_column(String(320), unique=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[str] = mapped_column(String(64), nullable=False, default="viewer")
    is_active: Mapped[bool] = mapped_column(nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )

    company: Mapped[CompanyModel] = relationship(back_populates="users")
    sessions: Mapped[list["AuthSessionModel"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class AgentRunModel(Base):
    __tablename__ = "agent_runs"

    run_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    actor_role: Mapped[str | None] = mapped_column(String(64), nullable=True)
    process_type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    input_payload: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    final_output: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        index=True,
        nullable=False,
    )

    company: Mapped[CompanyModel] = relationship(back_populates="runs")
    audit_events: Mapped[list["AuditEventModel"]] = relationship(
        back_populates="run",
        cascade="all, delete-orphan",
        order_by="AuditEventModel.event_index",
    )


class AuditEventModel(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    event_index: Mapped[int] = mapped_column(Integer, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    stage: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    details: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)

    run: Mapped[AgentRunModel] = relationship(back_populates="audit_events")


class BankTransactionModel(Base):
    __tablename__ = "bank_transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    transaction_id: Mapped[str] = mapped_column(String(128), nullable=False)
    posted_at: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    counterparty: Mapped[str | None] = mapped_column(String(255), nullable=True)


class SalesInvoiceModel(Base):
    __tablename__ = "sales_invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    invoice_id: Mapped[str] = mapped_column(String(128), nullable=False)
    issued_at: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    customer_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    rfc: Mapped[str | None] = mapped_column(String(64), nullable=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False)


class ExpenseRecordModel(Base):
    __tablename__ = "expense_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    record_id: Mapped[str] = mapped_column(String(128), nullable=False)
    booked_at: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    vendor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reference: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False)


class SupplierInvoiceModel(Base):
    __tablename__ = "supplier_invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    invoice_id: Mapped[str] = mapped_column(String(128), nullable=False)
    supplier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    issued_at: Mapped[date] = mapped_column(Date, nullable=False)
    due_at: Mapped[date] = mapped_column(Date, nullable=False)
    amount_due: Mapped[float] = mapped_column(Float, nullable=False)
    early_payment_discount_percent: Mapped[float] = mapped_column(Float, nullable=False)
    discount_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    strategic: Mapped[bool] = mapped_column(Boolean, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)


class BudgetLimitModel(Base):
    __tablename__ = "budget_limits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    category: Mapped[str] = mapped_column(String(128), nullable=False)
    monthly_limit: Mapped[float] = mapped_column(Float, nullable=False)
    month: Mapped[date] = mapped_column(Date, nullable=False)


class BudgetExpenseModel(Base):
    __tablename__ = "budget_expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    expense_id: Mapped[str] = mapped_column(String(128), nullable=False)
    expense_source: Mapped[str] = mapped_column(String(32), nullable=False)
    booked_at: Mapped[date] = mapped_column(Date, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(String(128), nullable=True)
    vendor_name: Mapped[str | None] = mapped_column(String(255), nullable=True)


class ReconciliationMatchModel(Base):
    __tablename__ = "reconciliation_matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    bank_transaction_id: Mapped[str] = mapped_column(String(128), nullable=False)
    ledger_record_id: Mapped[str] = mapped_column(String(128), nullable=False)
    ledger_record_type: Mapped[str] = mapped_column(String(64), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)


class ReconciliationReviewItemModel(Base):
    __tablename__ = "reconciliation_review_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    bank_transaction_id: Mapped[str] = mapped_column(String(128), nullable=False)
    candidate_record_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)


class PaymentDecisionModel(Base):
    __tablename__ = "payment_decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    invoice_id: Mapped[str] = mapped_column(String(128), nullable=False)
    supplier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    amount_due: Mapped[float] = mapped_column(Float, nullable=False)
    discount_percent: Mapped[float] = mapped_column(Float, nullable=False)
    discounted_amount: Mapped[float] = mapped_column(Float, nullable=False)
    savings_amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(64), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    spend_request_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    credential_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    card_last4: Mapped[str | None] = mapped_column(String(8), nullable=True)
    card_exp_month: Mapped[int | None] = mapped_column(Integer, nullable=True)
    card_exp_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    approval_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    valid_until: Mapped[str | None] = mapped_column(String(64), nullable=True)


class PaymentExecutionModel(Base):
    __tablename__ = "payment_executions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    run_id: Mapped[str] = mapped_column(
        ForeignKey("agent_runs.run_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    invoice_id: Mapped[str] = mapped_column(String(128), nullable=False)
    supplier_name: Mapped[str] = mapped_column(String(255), nullable=False)
    execution_status: Mapped[str] = mapped_column(String(64), nullable=False)
    discounted_amount: Mapped[float] = mapped_column(Float, nullable=False)
    spend_request_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    credential_status: Mapped[str | None] = mapped_column(String(64), nullable=True)
    card_last4: Mapped[str | None] = mapped_column(String(8), nullable=True)
    card_exp_month: Mapped[int | None] = mapped_column(Integer, nullable=True)
    card_exp_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    approval_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    valid_until: Mapped[str | None] = mapped_column(String(64), nullable=True)


class AuthSessionModel(Base):
    __tablename__ = "auth_sessions"

    session_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.user_id"),
        index=True,
        nullable=False,
    )
    company_id: Mapped[str] = mapped_column(
        ForeignKey("companies.company_id"),
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=False,
    )

    user: Mapped[UserModel] = relationship(back_populates="sessions")
