import { request } from './http'

export type ProcessType = 'reconciliation' | 'supplier_payments' | 'budget_control'
export type RunStatus = 'queued' | 'running' | 'completed' | 'requires_review' | 'blocked' | 'failed'

export type AuditEvent = {
  timestamp: string
  stage: string
  message: string
  details: Record<string, unknown>
}

export type AgentRunRecord = {
  run_id: string
  process_type: ProcessType
  status: RunStatus
  created_at: string
  company_id?: string
  actor_role?: string | null
  input_payload?: Record<string, unknown> | null
  final_output: Record<string, unknown>
  audit_log: AuditEvent[]
}

export type SalesInvoiceInput = {
  invoice_id: string
  issued_at: string
  amount: number
  customer_name: string
  reference: string
  rfc?: string
  status: string
}

export type ExpenseRecordInput = {
  record_id: string
  booked_at: string
  amount: number
  description: string
  vendor_name: string
  reference: string
  category?: string
  status?: string
}

export type ReconciliationRequest = {
  statement_csv: string
  sales_invoices: SalesInvoiceInput[]
  expense_records: ExpenseRecordInput[]
  amount_tolerance: number
  matching_window_days: number
}

export type SupplierInvoiceInput = {
  invoice_id: string
  supplier_name: string
  issued_at: string
  due_at: string
  amount_due: number
  early_payment_discount_percent: number
  discount_deadline: string
  strategic: boolean
  status?: string
}

export type CashPositionInput = {
  available_balance: number
  reserved_balance: number
  currency: string
}

export type CashForecastInput = {
  expected_inflows: number
  expected_outflows: number
  window_days: number
}

export type PaymentPolicyInput = {
  min_discount_percent: number
  min_cash_reserve: number
  auto_execute: boolean
  require_manual_approval_over: number | null
}

export type SupplierPaymentRequest = {
  invoices: SupplierInvoiceInput[]
  cash_position: CashPositionInput
  cash_forecast: CashForecastInput
  policy: PaymentPolicyInput
  execution_mode: 'evaluate' | 'simulate' | 'execute'
}

export type SupplierPaymentApprovalRequest = SupplierPaymentRequest & {
  approved_invoice_ids: string[]
}

export type BudgetLimitInput = {
  category: string
  monthly_limit: number
  month: string
}

export type ExpenseInput = {
  expense_id: string
  booked_at: string
  amount: number
  description: string
  category: string
  vendor_name?: string
}

export type BudgetPolicyInput = {
  alert_threshold_percent: number
  critical_threshold_percent: number
  block_on_critical: boolean
}

export type BudgetControlRequest = {
  budgets: BudgetLimitInput[]
  existing_expenses: ExpenseInput[]
  new_expenses: ExpenseInput[]
  policy: BudgetPolicyInput
  categorization_rules: Record<string, string>
}

export function checkAgentHealth() {
  return request<{ status: string }>('/api/v1/health', {
    headers: {},
  })
}

export function runReconciliation(payload: ReconciliationRequest) {
  return request<AgentRunRecord>('/api/v1/agent/runs/reconciliation', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function evaluateSupplierPayments(payload: SupplierPaymentRequest) {
  return request<AgentRunRecord>('/api/v1/agent/runs/payments/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function approveSupplierPayments(payload: SupplierPaymentApprovalRequest) {
  return request<AgentRunRecord>('/api/v1/agent/runs/payments/approve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runBudgetControl(payload: BudgetControlRequest) {
  return request<AgentRunRecord>('/api/v1/agent/runs/budgets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getRun(runId: string) {
  return request<AgentRunRecord>(`/api/v1/agent/runs/${runId}`, {
    headers: {},
  })
}

export function listRuns() {
  return request<AgentRunRecord[]>('/api/v1/agent/runs', {
    headers: {},
  })
}

export function getAudit(runId: string) {
  return request<AuditEvent[]>(`/api/v1/agent/runs/${runId}/audit`, {
    headers: {},
  })
}
