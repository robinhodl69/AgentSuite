import type {
  BudgetControlRequest,
  ReconciliationRequest,
  SupplierPaymentApprovalRequest,
} from '../../lib/api/agent'

export function createReconciliationTemplate(): ReconciliationRequest {
  return {
    statement_csv:
      'date,amount,description,reference,counterparty\n2026-04-05,1000.00,Invoice collection FAC-1001,FAC-1001,Client Demo\n2026-04-06,25.00,Bank commission April,BNK-001,Demo Bank\n2026-04-07,450.00,Supplier payment UBER TRAVEL,EXP-200,Uber\n2026-04-08,3200.00,Invoice collection FAC-1002,FAC-1002,North Client\n',
    sales_invoices: [
      {
        invoice_id: 'FAC-1001',
        issued_at: '2026-04-04',
        amount: 1000,
        customer_name: 'Client Demo',
        reference: 'FAC-1001',
        status: 'pending',
      },
      {
        invoice_id: 'FAC-1002',
        issued_at: '2026-04-08',
        amount: 3200,
        customer_name: 'North Client',
        reference: 'FAC-1002',
        status: 'pending',
      },
    ],
    expense_records: [
      {
        record_id: 'EXP-200',
        booked_at: '2026-04-07',
        amount: 450,
        description: 'Uber airport',
        vendor_name: 'Uber',
        reference: 'EXP-200',
      },
    ],
    amount_tolerance: 0.01,
    matching_window_days: 1,
  }
}

export function createSupplierPaymentsTemplate(): SupplierPaymentApprovalRequest {
  return {
    execution_mode: 'evaluate',
    approved_invoice_ids: [],
    invoices: [
      {
        invoice_id: 'SUP-300',
        supplier_name: 'Supplier XYZ',
        issued_at: '2026-04-01',
        due_at: '2026-04-20',
        amount_due: 10000,
        early_payment_discount_percent: 2,
        discount_deadline: '2099-04-10',
        strategic: true,
      },
      {
        invoice_id: 'SUP-310',
        supplier_name: 'North Logistics Supplier',
        issued_at: '2026-04-04',
        due_at: '2026-04-24',
        amount_due: 6800,
        early_payment_discount_percent: 1.8,
        discount_deadline: '2099-04-15',
        strategic: true,
      },
      {
        invoice_id: 'SUP-200',
        supplier_name: 'Non-Strategic Supplier',
        issued_at: '2026-04-03',
        due_at: '2026-04-30',
        amount_due: 4500,
        early_payment_discount_percent: 3,
        discount_deadline: '2099-04-12',
        strategic: false,
      },
    ],
    cash_position: {
      available_balance: 60000,
      reserved_balance: 5000,
      currency: 'MXN',
    },
    cash_forecast: {
      expected_inflows: 3000,
      expected_outflows: 5000,
      window_days: 30,
    },
    policy: {
      min_discount_percent: 1.5,
      min_cash_reserve: 10000,
      auto_execute: false,
      require_manual_approval_over: 9000,
    },
  }
}

export function createBudgetControlTemplate(): BudgetControlRequest {
  return {
    budgets: [
      {
        category: 'Travel',
        monthly_limit: 8000,
        month: '2026-04-01',
      },
      {
        category: 'Marketing',
        monthly_limit: 15000,
        month: '2026-04-01',
      },
      {
        category: 'Operations',
        monthly_limit: 12000,
        month: '2026-04-01',
      },
    ],
    existing_expenses: [
      {
        expense_id: 'EXP-001',
        booked_at: '2026-04-20',
        amount: 6800,
        description: 'Uber airport',
        category: 'Travel',
      },
      {
        expense_id: 'EXP-002',
        booked_at: '2026-04-18',
        amount: 13200,
        description: 'Facebook Ads April',
        category: 'Marketing',
      },
    ],
    new_expenses: [
      {
        expense_id: 'EXP-003',
        booked_at: '2026-04-24',
        amount: 450,
        description: 'Uber Airport',
        category: 'Travel',
      },
      {
        expense_id: 'EXP-004',
        booked_at: '2026-04-24',
        amount: 1200,
        description: 'Facebook Ads closing campaign',
        category: 'Marketing',
      },
    ],
    policy: {
      alert_threshold_percent: 90,
      critical_threshold_percent: 100,
      block_on_critical: true,
    },
    categorization_rules: {},
  }
}
