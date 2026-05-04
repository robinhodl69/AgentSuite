"""Add finance snapshot tables."""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


revision = "20250501_0002"
down_revision = "20250501_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "bank_transactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("transaction_id", sa.String(length=128), nullable=False),
        sa.Column("posted_at", sa.Date(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("reference", sa.String(length=255), nullable=True),
        sa.Column("counterparty", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_bank_transactions_company_id"),
        "bank_transactions",
        ["company_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_bank_transactions_run_id"), "bank_transactions", ["run_id"], unique=False
    )

    op.create_table(
        "sales_invoices",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("invoice_id", sa.String(length=128), nullable=False),
        sa.Column("issued_at", sa.Date(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("customer_name", sa.String(length=255), nullable=True),
        sa.Column("reference", sa.String(length=255), nullable=True),
        sa.Column("rfc", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sales_invoices_company_id"), "sales_invoices", ["company_id"], unique=False)
    op.create_index(op.f("ix_sales_invoices_run_id"), "sales_invoices", ["run_id"], unique=False)

    op.create_table(
        "expense_records",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("record_id", sa.String(length=128), nullable=False),
        sa.Column("booked_at", sa.Date(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("vendor_name", sa.String(length=255), nullable=True),
        sa.Column("reference", sa.String(length=255), nullable=True),
        sa.Column("category", sa.String(length=128), nullable=True),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_expense_records_company_id"), "expense_records", ["company_id"], unique=False)
    op.create_index(op.f("ix_expense_records_run_id"), "expense_records", ["run_id"], unique=False)

    op.create_table(
        "supplier_invoices",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("invoice_id", sa.String(length=128), nullable=False),
        sa.Column("supplier_name", sa.String(length=255), nullable=False),
        sa.Column("issued_at", sa.Date(), nullable=False),
        sa.Column("due_at", sa.Date(), nullable=False),
        sa.Column("amount_due", sa.Float(), nullable=False),
        sa.Column("early_payment_discount_percent", sa.Float(), nullable=False),
        sa.Column("discount_deadline", sa.Date(), nullable=True),
        sa.Column("strategic", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_supplier_invoices_company_id"), "supplier_invoices", ["company_id"], unique=False)
    op.create_index(op.f("ix_supplier_invoices_run_id"), "supplier_invoices", ["run_id"], unique=False)

    op.create_table(
        "budget_limits",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=128), nullable=False),
        sa.Column("monthly_limit", sa.Float(), nullable=False),
        sa.Column("month", sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_budget_limits_company_id"), "budget_limits", ["company_id"], unique=False)
    op.create_index(op.f("ix_budget_limits_run_id"), "budget_limits", ["run_id"], unique=False)

    op.create_table(
        "budget_expenses",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("expense_id", sa.String(length=128), nullable=False),
        sa.Column("expense_source", sa.String(length=32), nullable=False),
        sa.Column("booked_at", sa.Date(), nullable=False),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=128), nullable=True),
        sa.Column("vendor_name", sa.String(length=255), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_budget_expenses_company_id"), "budget_expenses", ["company_id"], unique=False)
    op.create_index(op.f("ix_budget_expenses_run_id"), "budget_expenses", ["run_id"], unique=False)

    op.create_table(
        "reconciliation_matches",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("bank_transaction_id", sa.String(length=128), nullable=False),
        sa.Column("ledger_record_id", sa.String(length=128), nullable=False),
        sa.Column("ledger_record_type", sa.String(length=64), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reconciliation_matches_company_id"), "reconciliation_matches", ["company_id"], unique=False)
    op.create_index(op.f("ix_reconciliation_matches_run_id"), "reconciliation_matches", ["run_id"], unique=False)

    op.create_table(
        "reconciliation_review_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("bank_transaction_id", sa.String(length=128), nullable=False),
        sa.Column("candidate_record_ids", sa.JSON(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_reconciliation_review_items_company_id"), "reconciliation_review_items", ["company_id"], unique=False)
    op.create_index(op.f("ix_reconciliation_review_items_run_id"), "reconciliation_review_items", ["run_id"], unique=False)

    op.create_table(
        "payment_decisions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("invoice_id", sa.String(length=128), nullable=False),
        sa.Column("supplier_name", sa.String(length=255), nullable=False),
        sa.Column("amount_due", sa.Float(), nullable=False),
        sa.Column("discount_percent", sa.Float(), nullable=False),
        sa.Column("discounted_amount", sa.Float(), nullable=False),
        sa.Column("savings_amount", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=64), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("spend_request_id", sa.String(length=255), nullable=True),
        sa.Column("credential_status", sa.String(length=64), nullable=True),
        sa.Column("card_last4", sa.String(length=8), nullable=True),
        sa.Column("card_exp_month", sa.Integer(), nullable=True),
        sa.Column("card_exp_year", sa.Integer(), nullable=True),
        sa.Column("approval_url", sa.Text(), nullable=True),
        sa.Column("valid_until", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payment_decisions_company_id"), "payment_decisions", ["company_id"], unique=False)
    op.create_index(op.f("ix_payment_decisions_run_id"), "payment_decisions", ["run_id"], unique=False)

    op.create_table(
        "payment_executions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("run_id", sa.String(length=64), nullable=False),
        sa.Column("company_id", sa.String(length=255), nullable=False),
        sa.Column("invoice_id", sa.String(length=128), nullable=False),
        sa.Column("supplier_name", sa.String(length=255), nullable=False),
        sa.Column("execution_status", sa.String(length=64), nullable=False),
        sa.Column("discounted_amount", sa.Float(), nullable=False),
        sa.Column("spend_request_id", sa.String(length=255), nullable=True),
        sa.Column("credential_status", sa.String(length=64), nullable=True),
        sa.Column("card_last4", sa.String(length=8), nullable=True),
        sa.Column("card_exp_month", sa.Integer(), nullable=True),
        sa.Column("card_exp_year", sa.Integer(), nullable=True),
        sa.Column("approval_url", sa.Text(), nullable=True),
        sa.Column("valid_until", sa.String(length=64), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.company_id"]),
        sa.ForeignKeyConstraint(["run_id"], ["agent_runs.run_id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_payment_executions_company_id"), "payment_executions", ["company_id"], unique=False)
    op.create_index(op.f("ix_payment_executions_run_id"), "payment_executions", ["run_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_payment_executions_run_id"), table_name="payment_executions")
    op.drop_index(op.f("ix_payment_executions_company_id"), table_name="payment_executions")
    op.drop_table("payment_executions")
    op.drop_index(op.f("ix_payment_decisions_run_id"), table_name="payment_decisions")
    op.drop_index(op.f("ix_payment_decisions_company_id"), table_name="payment_decisions")
    op.drop_table("payment_decisions")
    op.drop_index(op.f("ix_reconciliation_review_items_run_id"), table_name="reconciliation_review_items")
    op.drop_index(op.f("ix_reconciliation_review_items_company_id"), table_name="reconciliation_review_items")
    op.drop_table("reconciliation_review_items")
    op.drop_index(op.f("ix_reconciliation_matches_run_id"), table_name="reconciliation_matches")
    op.drop_index(op.f("ix_reconciliation_matches_company_id"), table_name="reconciliation_matches")
    op.drop_table("reconciliation_matches")
    op.drop_index(op.f("ix_budget_expenses_run_id"), table_name="budget_expenses")
    op.drop_index(op.f("ix_budget_expenses_company_id"), table_name="budget_expenses")
    op.drop_table("budget_expenses")
    op.drop_index(op.f("ix_budget_limits_run_id"), table_name="budget_limits")
    op.drop_index(op.f("ix_budget_limits_company_id"), table_name="budget_limits")
    op.drop_table("budget_limits")
    op.drop_index(op.f("ix_supplier_invoices_run_id"), table_name="supplier_invoices")
    op.drop_index(op.f("ix_supplier_invoices_company_id"), table_name="supplier_invoices")
    op.drop_table("supplier_invoices")
    op.drop_index(op.f("ix_expense_records_run_id"), table_name="expense_records")
    op.drop_index(op.f("ix_expense_records_company_id"), table_name="expense_records")
    op.drop_table("expense_records")
    op.drop_index(op.f("ix_sales_invoices_run_id"), table_name="sales_invoices")
    op.drop_index(op.f("ix_sales_invoices_company_id"), table_name="sales_invoices")
    op.drop_table("sales_invoices")
    op.drop_index(op.f("ix_bank_transactions_run_id"), table_name="bank_transactions")
    op.drop_index(op.f("ix_bank_transactions_company_id"), table_name="bank_transactions")
    op.drop_table("bank_transactions")
