const demoExecuteBeneficiary =
  import.meta.env.VITE_AGENT_EXECUTION_BENEFICIARY_ADDRESS ||
  '0x4ead8C47Aa0B3Ff749BB78AdC6bCe9f303694407'

export const reconciliationDemoRequest = {
  company_id: 'demo-company',
  actor_role: 'accountant',
  statement_csv:
    'date,amount,description,reference,counterparty\n2026-04-05,1000.00,Cobro factura FAC-1001,FAC-1001,Cliente Demo\n2026-04-06,25.00,Comision bancaria abril,BNK-001,Banco Demo\n2026-04-07,450.00,Pago proveedor UBER TRAVEL,EXP-200,Uber\n2026-04-08,3200.00,Cobro factura FAC-1002,FAC-1002,Cliente Norte\n',
  sales_invoices: [
    {
      invoice_id: 'FAC-1001',
      issued_at: '2026-04-04',
      amount: 1000,
      customer_name: 'Cliente Demo',
      reference: 'FAC-1001',
      status: 'pending',
    },
    {
      invoice_id: 'FAC-1002',
      issued_at: '2026-04-08',
      amount: 3200,
      customer_name: 'Cliente Norte',
      reference: 'FAC-1002',
      status: 'pending',
    },
  ],
  expense_records: [
    {
      record_id: 'EXP-200',
      booked_at: '2026-04-07',
      amount: 450,
      description: 'Uber aeropuerto',
      vendor_name: 'Uber',
      reference: 'EXP-200',
    },
  ],
}

export const supplierPaymentsEvaluateDemoRequest = {
  company_id: 'demo-company',
  actor_role: 'treasurer',
  execution_mode: 'evaluate',
  invoices: [
    {
      invoice_id: 'SUP-100',
      supplier_name: 'Proveedor XYZ',
      issued_at: '2026-04-01',
      due_at: '2026-04-20',
      amount_due: 10000,
      early_payment_discount_percent: 2,
      discount_deadline: '2099-04-10',
      strategic: true,
    },
    {
      invoice_id: 'SUP-200',
      supplier_name: 'Proveedor No Estrategico',
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

export const supplierPaymentsApproveDemoRequest = {
  company_id: 'demo-company',
  actor_role: 'treasurer',
  approved_invoice_ids: ['SUP-100'],
  execution_mode: 'execute',
  invoices: [
    {
      invoice_id: 'SUP-100',
      supplier_name: 'Proveedor XYZ',
      issued_at: '2026-04-01',
      due_at: '2026-04-20',
      amount_due: 0.001,
      early_payment_discount_percent: 2,
      discount_deadline: '2099-04-10',
      strategic: true,
      beneficiary_address: demoExecuteBeneficiary,
    },
  ],
  cash_position: {
    available_balance: 1,
    reserved_balance: 0,
    currency: 'MON',
  },
  cash_forecast: {
    expected_inflows: 0,
    expected_outflows: 0,
    window_days: 7,
  },
  policy: {
    min_discount_percent: 1.5,
    min_cash_reserve: 0,
    auto_execute: false,
  },
}

export const budgetControlDemoRequest = {
  company_id: 'demo-company',
  actor_role: 'finance_manager',
  budgets: [
    {
      category: 'Viaticos',
      monthly_limit: 8000,
      month: '2026-04-01',
    },
    {
      category: 'Marketing',
      monthly_limit: 15000,
      month: '2026-04-01',
    },
    {
      category: 'Operaciones',
      monthly_limit: 12000,
      month: '2026-04-01',
    },
  ],
  existing_expenses: [
    {
      expense_id: 'EXP-001',
      booked_at: '2026-04-20',
      amount: 6800,
      description: 'Uber aeropuerto',
      category: 'Viaticos',
    },
    {
      expense_id: 'EXP-002',
      booked_at: '2026-04-18',
      amount: 13200,
      description: 'Facebook Ads abril',
      category: 'Marketing',
    },
  ],
  new_expenses: [
    {
      expense_id: 'EXP-003',
      booked_at: '2026-04-24',
      amount: 450,
      description: 'Uber Aeropuerto',
    },
    {
      expense_id: 'EXP-004',
      booked_at: '2026-04-24',
      amount: 1200,
      description: 'Facebook Ads campana cierre',
    },
  ],
  policy: {
    alert_threshold_percent: 90,
    critical_threshold_percent: 100,
    block_on_critical: true,
  },
}
