from __future__ import annotations

import csv
from abc import ABC, abstractmethod
from collections import defaultdict
from datetime import UTC, date, datetime
from io import StringIO
from typing import Any

from .chain import BaseChainExecutor
from .errors import ExecutionError
from .llm import BaseLLMClient
from .models import (
    BankTransaction,
    BudgetControlRequest,
    BudgetDecision,
    BudgetLimit,
    ExpenseInput,
    ExpenseRecord,
    PaymentDecision,
    ProcessType,
    ReconciliationMatch,
    ReconciliationRequest,
    ReconciliationReviewItem,
    RunStatus,
    SkillDefinition,
    SupplierPaymentApprovalRequest,
    SupplierPaymentRequest,
)


def _money(value: float, decimals: int = 2) -> float:
    return round(value + 1e-9, decimals)


def _currency_decimals(currency: str | None) -> int:
    return 6 if (currency or "").strip().upper() == "MON" else 2


def _parse_date(value: str | date) -> date:
    if isinstance(value, date):
        return value
    text = value.strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%d-%m-%Y"):
        try:
            return datetime.strptime(text, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Unsupported date format: {value}")


def _normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def _month_label(values: list[date]) -> str:
    if not values:
        return "sin periodo"
    periods = [(value.year, value.month) for value in values]
    common = max(set(periods), key=periods.count)
    return datetime(common[0], common[1], 1).strftime("%B %Y")


def _score_reference_match(transaction_text: str, candidate_tokens: list[str]) -> int:
    score = 0
    text = _normalize_text(transaction_text)
    for token in candidate_tokens:
        token_text = _normalize_text(token)
        if token_text and token_text in text:
            score += 30
    return score


def _days_between(left: date, right: date) -> int:
    return abs((left - right).days)


def _days_in_month(value: date) -> int:
    if value.month == 12:
        return 31
    next_month = date(value.year + (1 if value.month == 12 else 0), 1 if value.month == 12 else value.month + 1, 1)
    return (next_month - date(value.year, value.month, 1)).days


def parse_statement_csv(statement_csv: str) -> list[BankTransaction]:
    reader = csv.DictReader(StringIO(statement_csv))
    transactions: list[BankTransaction] = []
    for index, row in enumerate(reader, start=1):
        lowered = {key.lower().strip(): (value or "").strip() for key, value in row.items()}
        posted_at = lowered.get("date") or lowered.get("fecha")
        amount = lowered.get("amount") or lowered.get("monto")
        description = lowered.get("description") or lowered.get("descripcion") or lowered.get("concepto")
        reference = lowered.get("reference") or lowered.get("referencia") or lowered.get("folio")
        counterparty = lowered.get("counterparty") or lowered.get("contraparte") or lowered.get("beneficiario")
        if not posted_at or not amount or not description:
            raise ValueError(
                "Each bank CSV row must include date/fecha, amount/monto, and description/descripcion."
            )
        cleaned_amount = amount.replace(",", "")
        transactions.append(
            BankTransaction(
                transaction_id=reference or f"bank-{index}",
                posted_at=_parse_date(posted_at),
                amount=_money(float(cleaned_amount)),
                description=description,
                reference=reference or None,
                counterparty=counterparty or None,
            )
        )
    return transactions


class ProcessService(ABC):
    process_type: ProcessType
    request_model: type

    @abstractmethod
    def normalize(self, input_payload: Any) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def analyze(
        self,
        normalized_inputs: dict[str, Any],
        skills: list[SkillDefinition],
        llm_client: BaseLLMClient,
    ) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def apply_policy(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
    ) -> tuple[dict[str, Any], RunStatus]:
        raise NotImplementedError

    @abstractmethod
    def execute_actions(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        run_id: str,
        chain_executor: BaseChainExecutor,
    ) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def build_response(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        actions: dict[str, Any],
    ) -> dict[str, Any]:
        raise NotImplementedError


class ReconciliationService(ProcessService):
    process_type = ProcessType.RECONCILIATION
    request_model = ReconciliationRequest

    def normalize(self, input_payload: Any) -> dict[str, Any]:
        request = self.request_model.model_validate(input_payload)
        return {
            "request": request,
            "bank_transactions": parse_statement_csv(request.statement_csv),
            "sales_invoices": request.sales_invoices,
            "expense_records": request.expense_records,
        }

    def analyze(
        self,
        normalized_inputs: dict[str, Any],
        skills: list[SkillDefinition],
        llm_client: BaseLLMClient,
    ) -> dict[str, Any]:
        request: ReconciliationRequest = normalized_inputs["request"]
        bank_transactions: list[BankTransaction] = normalized_inputs["bank_transactions"]
        open_sales = {invoice.invoice_id: invoice for invoice in normalized_inputs["sales_invoices"]}
        open_expenses = {record.record_id: record for record in normalized_inputs["expense_records"]}
        matches: list[ReconciliationMatch] = []
        bank_only: list[BankTransaction] = []
        manual_review: list[ReconciliationReviewItem] = []
        matched_ledger_ids: set[str] = set()

        for transaction in bank_transactions:
            candidates: list[tuple[str, str, str, int]] = []
            transaction_text = " ".join(
                part for part in [transaction.description, transaction.reference, transaction.counterparty] if part
            )

            for invoice in open_sales.values():
                if invoice.invoice_id in matched_ledger_ids:
                    continue
                if _days_between(transaction.posted_at, invoice.issued_at) > request.matching_window_days:
                    continue
                if abs(transaction.amount - invoice.amount) > request.amount_tolerance:
                    continue
                score = 50
                score += 20 if _days_between(transaction.posted_at, invoice.issued_at) <= request.matching_window_days else 0
                score += _score_reference_match(
                    transaction_text, [invoice.invoice_id, invoice.reference or "", invoice.rfc or "", invoice.customer_name or ""]
                )
                candidates.append((invoice.invoice_id, "sales_invoice", invoice.invoice_id, score))

            for expense in open_expenses.values():
                if expense.record_id in matched_ledger_ids:
                    continue
                if _days_between(transaction.posted_at, expense.booked_at) > request.matching_window_days:
                    continue
                if abs(transaction.amount - expense.amount) > request.amount_tolerance:
                    continue
                score = 50
                score += 20 if _days_between(transaction.posted_at, expense.booked_at) <= request.matching_window_days else 0
                score += _score_reference_match(
                    transaction_text, [expense.record_id, expense.reference or "", expense.vendor_name or "", expense.description]
                )
                candidates.append((expense.record_id, "expense_record", expense.record_id, score))

            if not candidates:
                bank_only.append(transaction)
                continue

            candidates.sort(key=lambda item: item[3], reverse=True)
            top_score = candidates[0][3]
            top_candidates = [candidate for candidate in candidates if candidate[3] == top_score]

            if len(top_candidates) == 1:
                best_id, ledger_type, _, score = top_candidates[0]
            else:
                resolved_id = llm_client.resolve_reconciliation_candidate(
                    transaction_text=transaction_text,
                    candidates=[(candidate_id, candidate_label) for candidate_id, _, candidate_label, _ in top_candidates],
                    skills=skills,
                )
                if not resolved_id:
                    manual_review.append(
                        ReconciliationReviewItem(
                            bank_transaction_id=transaction.transaction_id,
                            candidate_record_ids=[candidate_id for candidate_id, _, _, _ in top_candidates],
                            reason="Multiple ledger candidates matched the same bank movement.",
                        )
                    )
                    continue
                best_candidate = next(
                    candidate for candidate in top_candidates if candidate[0] == resolved_id
                )
                best_id, ledger_type, _, score = best_candidate

            matched_ledger_ids.add(best_id)
            matches.append(
                ReconciliationMatch(
                    bank_transaction_id=transaction.transaction_id,
                    ledger_record_id=best_id,
                    ledger_record_type=ledger_type,
                    score=score,
                    reason="Matched on amount, date window, and textual references.",
                )
            )

        ledger_only = [
            invoice for invoice in open_sales.values() if invoice.invoice_id not in matched_ledger_ids
        ] + [
            expense for expense in open_expenses.values() if expense.record_id not in matched_ledger_ids
        ]

        return {
            "matches": matches,
            "bank_only": bank_only,
            "ledger_only": ledger_only,
            "manual_review": manual_review,
        }

    def apply_policy(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
    ) -> tuple[dict[str, Any], RunStatus]:
        manual_review: list[ReconciliationReviewItem] = analysis["manual_review"]
        status = RunStatus.REQUIRES_REVIEW if manual_review else RunStatus.COMPLETED
        return (
            {
                "requires_manual_review": bool(manual_review),
                "manual_review_count": len(manual_review),
            },
            status,
        )

    def execute_actions(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        run_id: str,
        chain_executor: BaseChainExecutor,
    ) -> dict[str, Any]:
        return {"actions": []}

    def build_response(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        actions: dict[str, Any],
    ) -> dict[str, Any]:
        request: ReconciliationRequest = normalized_inputs["request"]
        bank_transactions: list[BankTransaction] = normalized_inputs["bank_transactions"]
        period = _month_label([transaction.posted_at for transaction in bank_transactions])
        summary = (
            f"Revisé el extracto de {period}: {len(analysis['matches'])} transacciones conciliadas, "
            f"{len(analysis['bank_only'])} movimientos bancarios sin contabilización y "
            f"{len(analysis['ledger_only'])} registros contables sin movimiento bancario."
        )
        return {
            "process": self.process_type,
            "company_id": request.company_id,
            "summary": summary,
            "counts": {
                "matched": len(analysis["matches"]),
                "bank_only": len(analysis["bank_only"]),
                "ledger_only": len(analysis["ledger_only"]),
                "manual_review": len(analysis["manual_review"]),
            },
            "matched_transactions": [item.model_dump(mode="json") for item in analysis["matches"]],
            "bank_only_transactions": [item.model_dump(mode="json") for item in analysis["bank_only"]],
            "ledger_only_records": [item.model_dump(mode="json") for item in analysis["ledger_only"]],
            "manual_review": [item.model_dump(mode="json") for item in analysis["manual_review"]],
        }


class SupplierPaymentService(ProcessService):
    process_type = ProcessType.SUPPLIER_PAYMENTS
    request_model = SupplierPaymentRequest

    def normalize(self, input_payload: Any) -> dict[str, Any]:
        if isinstance(input_payload, SupplierPaymentApprovalRequest):
            request = input_payload
        elif isinstance(input_payload, SupplierPaymentRequest):
            request = input_payload
        elif "approved_invoice_ids" in input_payload:
            request = SupplierPaymentApprovalRequest.model_validate(input_payload)
        else:
            request = self.request_model.model_validate(input_payload)
        return {"request": request, "invoices": request.invoices}

    def analyze(
        self,
        normalized_inputs: dict[str, Any],
        skills: list[SkillDefinition],
        llm_client: BaseLLMClient,
    ) -> dict[str, Any]:
        request: SupplierPaymentRequest = normalized_inputs["request"]
        amount_decimals = _currency_decimals(request.cash_position.currency)
        available_cash = (
            request.cash_position.available_balance
            - request.cash_position.reserved_balance
            + request.cash_forecast.expected_inflows
            - request.cash_forecast.expected_outflows
        )
        decisions: list[PaymentDecision] = []
        today = datetime.now(UTC).date()

        for invoice in request.invoices:
            discounted_amount = _money(
                invoice.amount_due
                * (1 - (invoice.early_payment_discount_percent / 100)),
                amount_decimals,
            )
            savings = _money(invoice.amount_due - discounted_amount, amount_decimals)
            if not invoice.strategic:
                decisions.append(
                    PaymentDecision(
                        invoice_id=invoice.invoice_id,
                        supplier_name=invoice.supplier_name,
                        amount_due=invoice.amount_due,
                        discount_percent=invoice.early_payment_discount_percent,
                        discounted_amount=discounted_amount,
                        savings_amount=savings,
                        status="wait",
                        reason="Supplier is not marked as strategic.",
                    )
                )
                continue

            if invoice.early_payment_discount_percent < request.policy.min_discount_percent:
                decisions.append(
                    PaymentDecision(
                        invoice_id=invoice.invoice_id,
                        supplier_name=invoice.supplier_name,
                        amount_due=invoice.amount_due,
                        discount_percent=invoice.early_payment_discount_percent,
                        discounted_amount=discounted_amount,
                        savings_amount=savings,
                        status="wait",
                        reason="Discount is below the configured threshold.",
                    )
                )
                continue

            if invoice.discount_deadline and invoice.discount_deadline < today:
                decisions.append(
                    PaymentDecision(
                        invoice_id=invoice.invoice_id,
                        supplier_name=invoice.supplier_name,
                        amount_due=invoice.amount_due,
                        discount_percent=invoice.early_payment_discount_percent,
                        discounted_amount=discounted_amount,
                        savings_amount=savings,
                        status="wait",
                        reason="The early-payment discount window has expired.",
                    )
                )
                continue

            post_payment_cash = available_cash - discounted_amount
            if post_payment_cash < request.policy.min_cash_reserve:
                decisions.append(
                    PaymentDecision(
                        invoice_id=invoice.invoice_id,
                        supplier_name=invoice.supplier_name,
                        amount_due=invoice.amount_due,
                        discount_percent=invoice.early_payment_discount_percent,
                        discounted_amount=discounted_amount,
                        savings_amount=savings,
                        status="blocked",
                        reason="Projected cash after payment would violate the reserve threshold.",
                    )
                )
                continue

            requires_manual = (
                request.policy.require_manual_approval_over is not None
                and discounted_amount >= request.policy.require_manual_approval_over
            )
            decisions.append(
                PaymentDecision(
                    invoice_id=invoice.invoice_id,
                    supplier_name=invoice.supplier_name,
                    amount_due=invoice.amount_due,
                    discount_percent=invoice.early_payment_discount_percent,
                    discounted_amount=discounted_amount,
                    savings_amount=savings,
                    status="pending_approval" if requires_manual else "ready_to_pay",
                    reason=(
                        "Invoice qualifies, but needs manual approval by policy."
                        if requires_manual
                        else "Invoice qualifies for discounted payment."
                    ),
                )
            )
        return {"decisions": decisions}

    def apply_policy(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
    ) -> tuple[dict[str, Any], RunStatus]:
        request = normalized_inputs["request"]
        decisions: list[PaymentDecision] = analysis["decisions"]
        approved_invoice_ids = set(
            getattr(request, "approved_invoice_ids", [])
        )
        requires_review = False
        for decision in decisions:
            if decision.status == "pending_approval":
                requires_review = True
            if approved_invoice_ids and decision.invoice_id in approved_invoice_ids:
                if decision.status in {"ready_to_pay", "pending_approval"}:
                    decision.status = "ready_to_pay"
                    decision.reason = "Approved for payment execution."
        status = RunStatus.REQUIRES_REVIEW if requires_review and not approved_invoice_ids else RunStatus.COMPLETED
        return ({"approved_invoice_ids": sorted(approved_invoice_ids)}, status)

    def execute_actions(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        run_id: str,
        chain_executor: BaseChainExecutor,
    ) -> dict[str, Any]:
        request: SupplierPaymentRequest = normalized_inputs["request"]
        invoices_by_id = {invoice.invoice_id: invoice for invoice in request.invoices}
        executed: list[PaymentDecision] = []
        if request.execution_mode == "evaluate":
            return {"executed_payments": executed}

        for decision in analysis["decisions"]:
            if decision.status != "ready_to_pay":
                continue
            invoice = invoices_by_id.get(decision.invoice_id)
            if invoice is None:
                raise ExecutionError(
                    f"Invoice {decision.invoice_id} is missing from the normalized supplier payload."
                )
            if (
                request.execution_mode == "execute"
                and not invoice.beneficiary_address
            ):
                raise ExecutionError(
                    "beneficiary_address is required for execution_mode=execute."
                )
            if request.execution_mode == "simulate":
                result = chain_executor.simulate_supplier_payment(
                    decision,
                    beneficiary_address=invoice.beneficiary_address,
                    run_id=run_id,
                    currency=request.cash_position.currency,
                )
            else:
                result = chain_executor.execute_supplier_payment(
                    decision,
                    beneficiary_address=invoice.beneficiary_address,
                    run_id=run_id,
                    currency=request.cash_position.currency,
                )
            decision.status = result.status
            decision.tx_hash = result.tx_hash
            decision.explorer_url = result.explorer_url
            executed.append(decision)

        return {"executed_payments": executed}

    def build_response(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        actions: dict[str, Any],
    ) -> dict[str, Any]:
        request: SupplierPaymentRequest = normalized_inputs["request"]
        decisions: list[PaymentDecision] = analysis["decisions"]
        executed = actions["executed_payments"]
        total_savings = _money(
            sum(item.savings_amount for item in executed),
            _currency_decimals(request.cash_position.currency),
        )
        summary = (
            f"Evalué {len(decisions)} facturas de proveedor: {sum(1 for item in decisions if item.status == 'ready_to_pay')} listas para pago, "
            f"{sum(1 for item in decisions if item.status == 'pending_approval')} pendientes de aprobación y "
            f"{len(executed)} {request.execution_mode if request.execution_mode != 'evaluate' else 'evaluadas'} "
            f"con ahorro potencial de ${total_savings:,.2f}."
        )
        return {
            "process": self.process_type,
            "summary": summary,
            "counts": {
                "evaluated": len(decisions),
                "ready_to_pay": sum(1 for item in decisions if item.status == "ready_to_pay"),
                "pending_approval": sum(1 for item in decisions if item.status == "pending_approval"),
                "blocked": sum(1 for item in decisions if item.status == "blocked"),
                "executed_or_simulated": len(executed),
            },
            "decisions": [item.model_dump(mode="json") for item in decisions],
            "executed_payments": [item.model_dump(mode="json") for item in executed],
        }


class BudgetControlService(ProcessService):
    process_type = ProcessType.BUDGET_CONTROL
    request_model = BudgetControlRequest

    DEFAULT_RULES = {
        "uber": "Viaticos",
        "taxi": "Viaticos",
        "hotel": "Viaticos",
        "flight": "Viaticos",
        "facebook ads": "Marketing",
        "google ads": "Marketing",
        "ads": "Marketing",
    }

    def normalize(self, input_payload: Any) -> dict[str, Any]:
        request = self.request_model.model_validate(input_payload)
        return {
            "request": request,
            "budgets": request.budgets,
            "existing_expenses": request.existing_expenses,
            "new_expenses": request.new_expenses,
        }

    def _categorize(
        self,
        expense: ExpenseInput,
        budgets: list[BudgetLimit],
        request: BudgetControlRequest,
        skills: list[SkillDefinition],
        llm_client: BaseLLMClient,
    ) -> str:
        if expense.category:
            return expense.category

        rules = {**self.DEFAULT_RULES, **request.categorization_rules}
        description = _normalize_text(expense.description)
        for keyword, category in rules.items():
            if keyword.lower() in description:
                return category

        categories = [budget.category for budget in budgets]
        inferred = llm_client.categorize_expense(expense.description, categories, skills)
        return inferred or "Uncategorized"

    def analyze(
        self,
        normalized_inputs: dict[str, Any],
        skills: list[SkillDefinition],
        llm_client: BaseLLMClient,
    ) -> dict[str, Any]:
        request: BudgetControlRequest = normalized_inputs["request"]
        budgets: list[BudgetLimit] = normalized_inputs["budgets"]
        existing_expenses: list[ExpenseInput] = normalized_inputs["existing_expenses"]
        new_expenses: list[ExpenseInput] = normalized_inputs["new_expenses"]

        budgets_by_key = {(budget.category, budget.month): budget for budget in budgets}
        running_totals = defaultdict(float)

        for expense in existing_expenses:
            category = expense.category or self._categorize(expense, budgets, request, skills, llm_client)
            running_totals[(category, date(expense.booked_at.year, expense.booked_at.month, 1))] += expense.amount

        decisions: list[BudgetDecision] = []
        for expense in new_expenses:
            category = self._categorize(expense, budgets, request, skills, llm_client)
            month_key = date(expense.booked_at.year, expense.booked_at.month, 1)
            budget = budgets_by_key.get((category, month_key))
            if budget is None:
                decisions.append(
                    BudgetDecision(
                        expense_id=expense.expense_id,
                        category=category,
                        amount=expense.amount,
                        monthly_limit=0.0,
                        monthly_spent=_money(expense.amount),
                        monthly_spent_percent=100.0,
                        projected_month_end_spend=_money(expense.amount),
                        status="pending_approval",
                        reason="No budget exists for this category and month.",
                    )
                )
                continue

            running_totals[(category, month_key)] += expense.amount
            monthly_spent = _money(running_totals[(category, month_key)])
            monthly_spent_percent = _money((monthly_spent / budget.monthly_limit) * 100) if budget.monthly_limit else 100.0
            elapsed_days = max(1, expense.booked_at.day)
            projected = _money(monthly_spent / elapsed_days * _days_in_month(expense.booked_at))
            decisions.append(
                BudgetDecision(
                    expense_id=expense.expense_id,
                    category=category,
                    amount=expense.amount,
                    monthly_limit=budget.monthly_limit,
                    monthly_spent=monthly_spent,
                    monthly_spent_percent=monthly_spent_percent,
                    projected_month_end_spend=projected,
                    status="approved",
                    reason="Expense is within budget.",
                )
            )
        return {"decisions": decisions}

    def apply_policy(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
    ) -> tuple[dict[str, Any], RunStatus]:
        request: BudgetControlRequest = normalized_inputs["request"]
        alerts: list[BudgetDecision] = []
        blocked = False
        for decision in analysis["decisions"]:
            if decision.monthly_limit == 0:
                decision.status = "pending_approval"
                alerts.append(decision)
                continue
            if decision.monthly_spent_percent >= request.policy.critical_threshold_percent:
                decision.status = "blocked" if request.policy.block_on_critical else "pending_approval"
                decision.reason = "Budget threshold exceeded and requires intervention."
                alerts.append(decision)
                blocked = blocked or decision.status == "blocked"
            elif decision.monthly_spent_percent >= request.policy.alert_threshold_percent or decision.projected_month_end_spend > decision.monthly_limit:
                decision.status = "alerted"
                decision.reason = "Budget consumption is nearing or projected to exceed the monthly limit."
                alerts.append(decision)
        status = RunStatus.BLOCKED if blocked else RunStatus.COMPLETED
        return ({"alerts": alerts}, status)

    def execute_actions(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        run_id: str,
        chain_executor: BaseChainExecutor,
    ) -> dict[str, Any]:
        return {"actions": []}

    def build_response(
        self,
        normalized_inputs: dict[str, Any],
        analysis: dict[str, Any],
        policy: dict[str, Any],
        actions: dict[str, Any],
    ) -> dict[str, Any]:
        decisions: list[BudgetDecision] = analysis["decisions"]
        alerted = sum(1 for item in decisions if item.status == "alerted")
        blocked = sum(1 for item in decisions if item.status == "blocked")
        summary = (
            f"Procesé {len(decisions)} gastos nuevos: {alerted} con alerta preventiva y "
            f"{blocked} bloqueados por presupuesto."
        )
        return {
            "process": self.process_type,
            "summary": summary,
            "counts": {
                "processed": len(decisions),
                "approved": sum(1 for item in decisions if item.status == "approved"),
                "alerted": alerted,
                "pending_approval": sum(1 for item in decisions if item.status == "pending_approval"),
                "blocked": blocked,
            },
            "results": [item.model_dump(mode="json") for item in decisions],
            "alerts": [item.model_dump(mode="json") for item in policy["alerts"]],
        }
