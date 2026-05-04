from __future__ import annotations

from typing import Any

from fastapi.encoders import jsonable_encoder
from sqlalchemy import delete
from sqlalchemy.orm import Session

from .models import (
    BudgetLimit,
    ExpenseInput,
    ExpenseRecord,
    PaymentDecision,
    ProcessType,
    ReconciliationMatch,
    ReconciliationReviewItem,
    RunRecord,
    SalesInvoice,
    SupplierInvoice,
)
from .persistence_models import (
    BankTransactionModel,
    BudgetExpenseModel,
    BudgetLimitModel,
    ExpenseRecordModel,
    PaymentDecisionModel,
    PaymentExecutionModel,
    ReconciliationMatchModel,
    ReconciliationReviewItemModel,
    SalesInvoiceModel,
    SupplierInvoiceModel,
)
from .services import parse_statement_csv


class FinanceRunSnapshotWriter:
    def persist(self, session: Session, run: RunRecord) -> None:
        self._clear_existing(session, run.run_id)
        if run.process_type == ProcessType.RECONCILIATION:
            self._persist_reconciliation(session, run)
        elif run.process_type == ProcessType.SUPPLIER_PAYMENTS:
            self._persist_supplier_payments(session, run)
        elif run.process_type == ProcessType.BUDGET_CONTROL:
            self._persist_budget_control(session, run)

    def _clear_existing(self, session: Session, run_id: str) -> None:
        for model in (
            BankTransactionModel,
            SalesInvoiceModel,
            ExpenseRecordModel,
            SupplierInvoiceModel,
            BudgetLimitModel,
            BudgetExpenseModel,
            ReconciliationMatchModel,
            ReconciliationReviewItemModel,
            PaymentDecisionModel,
            PaymentExecutionModel,
        ):
            session.execute(delete(model).where(model.run_id == run_id))

    def _persist_reconciliation(self, session: Session, run: RunRecord) -> None:
        payload = run.input_payload or {}
        statement_csv = payload.get("statement_csv")
        if isinstance(statement_csv, str):
            for item in parse_statement_csv(statement_csv):
                session.add(
                    BankTransactionModel(
                        run_id=run.run_id,
                        company_id=run.company_id,
                        transaction_id=item.transaction_id,
                        posted_at=item.posted_at,
                        amount=item.amount,
                        description=item.description,
                        reference=item.reference,
                        counterparty=item.counterparty,
                    )
                )

        for raw_invoice in payload.get("sales_invoices", []):
            invoice = SalesInvoice.model_validate(raw_invoice)
            session.add(
                SalesInvoiceModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    invoice_id=invoice.invoice_id,
                    issued_at=invoice.issued_at,
                    amount=invoice.amount,
                    customer_name=invoice.customer_name,
                    reference=invoice.reference,
                    rfc=invoice.rfc,
                    status=invoice.status,
                )
            )

        for raw_record in payload.get("expense_records", []):
            record = ExpenseRecord.model_validate(raw_record)
            session.add(
                ExpenseRecordModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    record_id=record.record_id,
                    booked_at=record.booked_at,
                    amount=record.amount,
                    description=record.description,
                    vendor_name=record.vendor_name,
                    reference=record.reference,
                    category=record.category,
                    status=record.status,
                )
            )

        for raw_match in self._extract_list(run.final_output, "matched_transactions"):
            match = ReconciliationMatch.model_validate(raw_match)
            session.add(
                ReconciliationMatchModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    bank_transaction_id=match.bank_transaction_id,
                    ledger_record_id=match.ledger_record_id,
                    ledger_record_type=match.ledger_record_type,
                    score=match.score,
                    reason=match.reason,
                )
            )

        for raw_item in self._extract_list(run.final_output, "manual_review"):
            item = ReconciliationReviewItem.model_validate(raw_item)
            session.add(
                ReconciliationReviewItemModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    bank_transaction_id=item.bank_transaction_id,
                    candidate_record_ids=jsonable_encoder(item.candidate_record_ids),
                    reason=item.reason,
                )
            )

    def _persist_supplier_payments(self, session: Session, run: RunRecord) -> None:
        payload = run.input_payload or {}
        for raw_invoice in payload.get("invoices", []):
            invoice = SupplierInvoice.model_validate(raw_invoice)
            session.add(
                SupplierInvoiceModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    invoice_id=invoice.invoice_id,
                    supplier_name=invoice.supplier_name,
                    issued_at=invoice.issued_at,
                    due_at=invoice.due_at,
                    amount_due=invoice.amount_due,
                    early_payment_discount_percent=invoice.early_payment_discount_percent,
                    discount_deadline=invoice.discount_deadline,
                    strategic=invoice.strategic,
                    status=invoice.status,
                )
            )

        for raw_decision in self._extract_list(run.final_output, "decisions"):
            decision = PaymentDecision.model_validate(raw_decision)
            session.add(
                PaymentDecisionModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    invoice_id=decision.invoice_id,
                    supplier_name=decision.supplier_name,
                    amount_due=decision.amount_due,
                    discount_percent=decision.discount_percent,
                    discounted_amount=decision.discounted_amount,
                    savings_amount=decision.savings_amount,
                    status=decision.status,
                    reason=decision.reason,
                    spend_request_id=decision.spend_request_id,
                    credential_status=decision.credential_status,
                    card_last4=decision.card_last4,
                    card_exp_month=decision.card_exp_month,
                    card_exp_year=decision.card_exp_year,
                    approval_url=decision.approval_url,
                    valid_until=decision.valid_until,
                )
            )

        for raw_execution in self._extract_list(run.final_output, "executed_payments"):
            execution = PaymentDecision.model_validate(raw_execution)
            session.add(
                PaymentExecutionModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    invoice_id=execution.invoice_id,
                    supplier_name=execution.supplier_name,
                    execution_status=execution.status,
                    discounted_amount=execution.discounted_amount,
                    spend_request_id=execution.spend_request_id,
                    credential_status=execution.credential_status,
                    card_last4=execution.card_last4,
                    card_exp_month=execution.card_exp_month,
                    card_exp_year=execution.card_exp_year,
                    approval_url=execution.approval_url,
                    valid_until=execution.valid_until,
                )
            )

    def _persist_budget_control(self, session: Session, run: RunRecord) -> None:
        payload = run.input_payload or {}
        for raw_budget in payload.get("budgets", []):
            budget = BudgetLimit.model_validate(raw_budget)
            session.add(
                BudgetLimitModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    category=budget.category,
                    monthly_limit=budget.monthly_limit,
                    month=budget.month,
                )
            )

        self._persist_budget_expense_group(
            session,
            run,
            payload.get("existing_expenses", []),
            "existing",
        )
        self._persist_budget_expense_group(
            session,
            run,
            payload.get("new_expenses", []),
            "new",
        )

    def _persist_budget_expense_group(
        self,
        session: Session,
        run: RunRecord,
        expenses: Any,
        source: str,
    ) -> None:
        for raw_expense in expenses if isinstance(expenses, list) else []:
            expense = ExpenseInput.model_validate(raw_expense)
            session.add(
                BudgetExpenseModel(
                    run_id=run.run_id,
                    company_id=run.company_id,
                    expense_id=expense.expense_id,
                    expense_source=source,
                    booked_at=expense.booked_at,
                    amount=expense.amount,
                    description=expense.description,
                    category=expense.category,
                    vendor_name=expense.vendor_name,
                )
            )

    def _extract_list(
        self, payload: dict[str, Any] | None, key: str
    ) -> list[dict[str, Any]]:
        if not payload:
            return []
        value = payload.get(key)
        if not isinstance(value, list):
            return []
        return [item for item in value if isinstance(item, dict)]
