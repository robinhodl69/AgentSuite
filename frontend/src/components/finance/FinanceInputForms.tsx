import { Collapse, Typography } from 'antd'
import { useMemo, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'
import type {
  BudgetControlRequest,
  ExpenseInput,
  ExpenseRecordInput,
  ReconciliationRequest,
  SalesInvoiceInput,
  SupplierInvoiceInput,
  SupplierPaymentApprovalRequest,
} from '../../lib/api/agent'
import { Button } from '../ui/Button'

const fieldClassName =
  'w-full rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] px-3 py-2 text-sm text-[var(--as-text-primary)] outline-none transition focus:border-[var(--as-accent-border)]'
const textareaClassName = `${fieldClassName} min-h-36 resize-y font-mono text-[12px]`

function parseNumber(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function FormSection({
  title,
  description,
  action,
  children,
}: {
  title: string
  description: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-secondary)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
            {title}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--as-text-secondary)]">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="space-y-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-text-muted)] font-mono">
        {label}
      </span>
      {children}
    </label>
  )
}

function RowToolbar({
  onAdd,
  addLabel,
}: {
  onAdd: () => void
  addLabel: string
}) {
  return (
    <div className="flex justify-end">
      <Button type="button" variant="secondary" size="sm" onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  )
}

function InlineCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] px-3 py-2 text-xs text-[var(--as-text-secondary)]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--as-accent)]"
      />
      <span>{label}</span>
    </label>
  )
}

function FormSummary({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-secondary)]/70 p-3">
      <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
        {title}
      </Typography.Text>
      <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
        {description}
      </Typography.Paragraph>
      <div className="mt-3">{children}</div>
    </div>
  )
}

export function ReconciliationForm({
  value,
  onChange,
  onReset,
}: {
  value: ReconciliationRequest
  onChange: Dispatch<SetStateAction<ReconciliationRequest>>
  onReset: () => void
}) {
  function updateInvoice(index: number, patch: Partial<SalesInvoiceInput>) {
    onChange((current) => ({
      ...current,
      sales_invoices: current.sales_invoices.map((invoice, currentIndex) =>
        currentIndex === index ? { ...invoice, ...patch } : invoice,
      ),
    }))
  }

  function updateExpense(index: number, patch: Partial<ExpenseRecordInput>) {
    onChange((current) => ({
      ...current,
      expense_records: current.expense_records.map((expense, currentIndex) =>
        currentIndex === index ? { ...expense, ...patch } : expense,
      ),
    }))
  }

  function importStatement(event: ChangeEvent<HTMLInputElement>) {
    const [file] = event.target.files ?? []
    if (!file) {
      return
    }

    void file.text().then((text) => {
      onChange((current) => ({
        ...current,
        statement_csv: text,
      }))
    })
    event.target.value = ''
  }

  return (
    <div className="space-y-3">
      <FormSummary
        title="Payload summary"
        description={`${value.sales_invoices.length} invoice(s), ${value.expense_records.length} expense record(s), tolerance ${value.amount_tolerance}.`}
      >
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onReset}>
            Restore sample
          </Button>
          <span className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-2 py-1 text-[11px] text-[var(--as-text-muted)]">
            Statement rows: {value.statement_csv.trim().length > 0 ? value.statement_csv.split('\n').filter(Boolean).length - 1 : 0}
          </span>
        </div>
      </FormSummary>

      <Collapse
        defaultActiveKey={['intake']}
        ghost
        items={[
          {
            key: 'intake',
            label: 'Statement intake',
            children: (
              <FormSection
                title="Statement intake"
                description="Paste a bank statement CSV or import a file. The agent will reconcile it against invoices and expense records."
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.5fr)]">
                  <Field label="Statement CSV">
                    <textarea
                      value={value.statement_csv}
                      onChange={(event) =>
                        onChange((current) => ({
                          ...current,
                          statement_csv: event.target.value,
                        }))
                      }
                      className={textareaClassName}
                      placeholder="date,amount,description,reference,counterparty"
                    />
                  </Field>

                  <div className="space-y-3">
                    <Field label="Import file">
                      <input type="file" accept=".csv,text/csv" onChange={importStatement} className={fieldClassName} />
                    </Field>
                    <Field label="Amount tolerance">
                      <input
                        type="number"
                        step="0.01"
                        value={value.amount_tolerance}
                        onChange={(event) =>
                          onChange((current) => ({
                            ...current,
                            amount_tolerance: parseNumber(event.target.value),
                          }))
                        }
                        className={fieldClassName}
                      />
                    </Field>
                    <Field label="Matching window (days)">
                      <input
                        type="number"
                        step="1"
                        value={value.matching_window_days}
                        onChange={(event) =>
                          onChange((current) => ({
                            ...current,
                            matching_window_days: parseNumber(event.target.value),
                          }))
                        }
                        className={fieldClassName}
                      />
                    </Field>
                  </div>
                </div>
              </FormSection>
            ),
          },
          {
            key: 'ledger',
            label: `Ledger references (${value.sales_invoices.length + value.expense_records.length})`,
            children: (
              <div className="space-y-3">
                <FormSection
                  title="Sales invoices"
                  description="Maintain the invoice ledger the agent should match against the statement."
                  action={<span className="text-[11px] text-[var(--as-text-muted)]">{value.sales_invoices.length} invoice(s)</span>}
                >
                  <RowToolbar
                    onAdd={() =>
                      onChange((current) => ({
                        ...current,
                        sales_invoices: [
                          ...current.sales_invoices,
                          {
                            invoice_id: '',
                            issued_at: '',
                            amount: 0,
                            customer_name: '',
                            reference: '',
                            status: 'pending',
                          },
                        ],
                      }))
                    }
                    addLabel="Add invoice"
                  />
                  <div className="space-y-2">
                    {value.sales_invoices.map((invoice, index) => (
                      <div
                        key={`invoice-${index}`}
                        className="grid gap-2 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
                      >
                        <input value={invoice.invoice_id} onChange={(event) => updateInvoice(index, { invoice_id: event.target.value })} className={fieldClassName} placeholder="Invoice ID" />
                        <input type="date" value={invoice.issued_at} onChange={(event) => updateInvoice(index, { issued_at: event.target.value })} className={fieldClassName} />
                        <input type="number" step="0.01" value={invoice.amount} onChange={(event) => updateInvoice(index, { amount: parseNumber(event.target.value) })} className={fieldClassName} placeholder="Amount" />
                        <input value={invoice.customer_name} onChange={(event) => updateInvoice(index, { customer_name: event.target.value })} className={fieldClassName} placeholder="Customer" />
                        <input value={invoice.reference} onChange={(event) => updateInvoice(index, { reference: event.target.value })} className={fieldClassName} placeholder="Reference" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onChange((current) => ({
                              ...current,
                              sales_invoices: current.sales_invoices.filter((_, currentIndex) => currentIndex !== index),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormSection>

                <FormSection
                  title="Expense records"
                  description="Add operational expenses so the reconciliation run can explain outbound bank movements."
                  action={<span className="text-[11px] text-[var(--as-text-muted)]">{value.expense_records.length} expense(s)</span>}
                >
                  <RowToolbar
                    onAdd={() =>
                      onChange((current) => ({
                        ...current,
                        expense_records: [
                          ...current.expense_records,
                          {
                            record_id: '',
                            booked_at: '',
                            amount: 0,
                            description: '',
                            vendor_name: '',
                            reference: '',
                          },
                        ],
                      }))
                    }
                    addLabel="Add expense"
                  />
                  <div className="space-y-2">
                    {value.expense_records.map((expense, index) => (
                      <div
                        key={`expense-${index}`}
                        className="grid gap-2 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-3 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
                      >
                        <input value={expense.record_id} onChange={(event) => updateExpense(index, { record_id: event.target.value })} className={fieldClassName} placeholder="Expense ID" />
                        <input type="date" value={expense.booked_at} onChange={(event) => updateExpense(index, { booked_at: event.target.value })} className={fieldClassName} />
                        <input type="number" step="0.01" value={expense.amount} onChange={(event) => updateExpense(index, { amount: parseNumber(event.target.value) })} className={fieldClassName} placeholder="Amount" />
                        <input value={expense.description} onChange={(event) => updateExpense(index, { description: event.target.value })} className={fieldClassName} placeholder="Description" />
                        <input value={expense.vendor_name} onChange={(event) => updateExpense(index, { vendor_name: event.target.value })} className={fieldClassName} placeholder="Vendor" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onChange((current) => ({
                              ...current,
                              expense_records: current.expense_records.filter((_, currentIndex) => currentIndex !== index),
                            }))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormSection>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export function SupplierPaymentsForm({
  value,
  onChange,
  onReset,
}: {
  value: SupplierPaymentApprovalRequest
  onChange: Dispatch<SetStateAction<SupplierPaymentApprovalRequest>>
  onReset: () => void
}) {
  const approvedCount = useMemo(() => value.approved_invoice_ids.length, [value.approved_invoice_ids.length])

  function updateInvoice(index: number, patch: Partial<SupplierInvoiceInput>) {
    onChange((current) => {
      const currentInvoice = current.invoices[index]
      const nextInvoices = current.invoices.map((invoice, currentIndex) =>
        currentIndex === index ? { ...invoice, ...patch } : invoice,
      )
      let nextApprovedIds = current.approved_invoice_ids

      if (patch.invoice_id !== undefined && currentInvoice.invoice_id !== patch.invoice_id) {
        nextApprovedIds = nextApprovedIds
          .map((invoiceId) => (invoiceId === currentInvoice.invoice_id ? patch.invoice_id ?? '' : invoiceId))
          .filter((invoiceId) => invoiceId.length > 0)
      }

      return {
        ...current,
        invoices: nextInvoices,
        approved_invoice_ids: nextApprovedIds,
      }
    })
  }

  function toggleApproval(invoiceId: string, checked: boolean) {
    onChange((current) => ({
      ...current,
      approved_invoice_ids: checked
        ? [...new Set([...current.approved_invoice_ids, invoiceId])]
        : current.approved_invoice_ids.filter((currentId) => currentId !== invoiceId),
    }))
  }

  return (
    <div className="space-y-3">
      <FormSummary
        title="Batch summary"
        description={`${value.invoices.length} invoice(s), ${approvedCount} approved, ${value.cash_position.currency} as settlement currency.`}
      >
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>
          Restore sample
        </Button>
      </FormSummary>

      <Collapse defaultActiveKey={['candidates']} ghost items={[{
        key: 'candidates',
        label: `Invoice candidates (${value.invoices.length})`,
        children: (
      <FormSection
        title="Treasury batch"
        description="Prepare invoice candidates, choose which ones are approved for simulate or execute, and control treasury policy."
        action={<span className="text-[11px] text-[var(--as-text-muted)]">{approvedCount} approved</span>}
      >
        <RowToolbar
          onAdd={() =>
            onChange((current) => ({
              ...current,
              invoices: [
                ...current.invoices,
                {
                  invoice_id: '',
                  supplier_name: '',
                  issued_at: '',
                  due_at: '',
                  amount_due: 0,
                  early_payment_discount_percent: 0,
                  discount_deadline: '',
                  strategic: false,
                },
              ],
            }))
          }
          addLabel="Add invoice"
        />
        <div className="space-y-2">
          {value.invoices.map((invoice, index) => (
            <div
              key={`supplier-${index}`}
              className="space-y-2 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-3"
            >
              <div className="grid gap-2 xl:grid-cols-[auto_repeat(6,minmax(0,1fr))_auto]">
                <InlineCheckbox
                  checked={invoice.invoice_id.length > 0 && value.approved_invoice_ids.includes(invoice.invoice_id)}
                  onChange={(checked) => toggleApproval(invoice.invoice_id, checked)}
                  label="Approved"
                />
                <input
                  value={invoice.invoice_id}
                  onChange={(event) => updateInvoice(index, { invoice_id: event.target.value })}
                  className={fieldClassName}
                  placeholder="Invoice ID"
                />
                <input
                  value={invoice.supplier_name}
                  onChange={(event) => updateInvoice(index, { supplier_name: event.target.value })}
                  className={fieldClassName}
                  placeholder="Supplier"
                />
                <input
                  type="date"
                  value={invoice.issued_at}
                  onChange={(event) => updateInvoice(index, { issued_at: event.target.value })}
                  className={fieldClassName}
                />
                <input
                  type="date"
                  value={invoice.due_at}
                  onChange={(event) => updateInvoice(index, { due_at: event.target.value })}
                  className={fieldClassName}
                />
                <input
                  type="number"
                  step="0.01"
                  value={invoice.amount_due}
                  onChange={(event) => updateInvoice(index, { amount_due: parseNumber(event.target.value) })}
                  className={fieldClassName}
                  placeholder="Amount due"
                />
                <input
                  type="number"
                  step="0.1"
                  value={invoice.early_payment_discount_percent}
                  onChange={(event) =>
                    updateInvoice(index, { early_payment_discount_percent: parseNumber(event.target.value) })
                  }
                  className={fieldClassName}
                  placeholder="Discount %"
                />
                <input
                  type="date"
                  value={invoice.discount_deadline}
                  onChange={(event) => updateInvoice(index, { discount_deadline: event.target.value })}
                  className={fieldClassName}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange((current) => ({
                      ...current,
                      invoices: current.invoices.filter((_, currentIndex) => currentIndex !== index),
                      approved_invoice_ids: current.approved_invoice_ids.filter(
                        (currentId) => currentId !== invoice.invoice_id,
                      ),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
              <InlineCheckbox
                checked={invoice.strategic}
                onChange={(checked) => updateInvoice(index, { strategic: checked })}
                label="Strategic supplier"
              />
            </div>
          ))}
        </div>
      </FormSection>
        ),
      },{
        key: 'treasury-context',
        label: 'Treasury context',
        children: (
      <div className="grid gap-3 xl:grid-cols-3">
        <FormSection title="Cash position" description="Current liquidity available for the decision.">
          <Field label="Available balance">
            <input
              type="number"
              step="0.01"
              value={value.cash_position.available_balance}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  cash_position: {
                    ...current.cash_position,
                    available_balance: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Reserved balance">
            <input
              type="number"
              step="0.01"
              value={value.cash_position.reserved_balance}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  cash_position: {
                    ...current.cash_position,
                    reserved_balance: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Currency">
            <input
              value={value.cash_position.currency}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  cash_position: {
                    ...current.cash_position,
                    currency: event.target.value,
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
        </FormSection>

        <FormSection title="Forecast" description="Short-term cash view used for the payment decision.">
          <Field label="Expected inflows">
            <input
              type="number"
              step="0.01"
              value={value.cash_forecast.expected_inflows}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  cash_forecast: {
                    ...current.cash_forecast,
                    expected_inflows: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Expected outflows">
            <input
              type="number"
              step="0.01"
              value={value.cash_forecast.expected_outflows}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  cash_forecast: {
                    ...current.cash_forecast,
                    expected_outflows: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Window days">
            <input
              type="number"
              step="1"
              value={value.cash_forecast.window_days}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  cash_forecast: {
                    ...current.cash_forecast,
                    window_days: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
        </FormSection>

        <FormSection title="Policy" description="Guardrails for discounts, liquidity and approval thresholds.">
          <Field label="Minimum discount %">
            <input
              type="number"
              step="0.1"
              value={value.policy.min_discount_percent}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  policy: {
                    ...current.policy,
                    min_discount_percent: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Minimum cash reserve">
            <input
              type="number"
              step="0.01"
              value={value.policy.min_cash_reserve}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  policy: {
                    ...current.policy,
                    min_cash_reserve: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Manual approval over">
            <input
              type="number"
              step="0.01"
              value={value.policy.require_manual_approval_over ?? 0}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  policy: {
                    ...current.policy,
                    require_manual_approval_over: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <InlineCheckbox
            checked={value.policy.auto_execute}
            onChange={(checked) =>
              onChange((current) => ({
                ...current,
                policy: {
                  ...current.policy,
                  auto_execute: checked,
                },
              }))
            }
            label="Auto execute when policy allows"
          />
        </FormSection>
      </div>
        ),
      }]} />
    </div>
  )
}

export function BudgetControlForm({
  value,
  onChange,
  onReset,
}: {
  value: BudgetControlRequest
  onChange: Dispatch<SetStateAction<BudgetControlRequest>>
  onReset: () => void
}) {
  function updateBudget(index: number, patch: Partial<BudgetControlRequest['budgets'][number]>) {
    onChange((current) => ({
      ...current,
      budgets: current.budgets.map((budget, currentIndex) =>
        currentIndex === index ? { ...budget, ...patch } : budget,
      ),
    }))
  }

  function updateExpense(
    key: 'existing_expenses' | 'new_expenses',
    index: number,
    patch: Partial<ExpenseInput>,
  ) {
    onChange((current) => ({
      ...current,
      [key]: current[key].map((expense, currentIndex) =>
        currentIndex === index ? { ...expense, ...patch } : expense,
      ),
    }))
  }

  return (
    <div className="space-y-3">
      <FormSummary
        title="Budget summary"
        description={`${value.budgets.length} budget envelope(s), ${value.existing_expenses.length} historical expenses, ${value.new_expenses.length} new request(s).`}
      >
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>
          Restore sample
        </Button>
      </FormSummary>

      <Collapse defaultActiveKey={['envelopes']} ghost items={[{
        key: 'envelopes',
        label: `Budget envelopes (${value.budgets.length})`,
        children: (
      <FormSection
        title="Budget envelopes"
        description="Define monthly limits and upcoming expense requests before the agent evaluates variances."
      >
        <RowToolbar
          onAdd={() =>
            onChange((current) => ({
              ...current,
              budgets: [...current.budgets, { category: '', monthly_limit: 0, month: '' }],
            }))
          }
          addLabel="Add budget"
        />
        <div className="space-y-2">
          {value.budgets.map((budget, index) => (
            <div
              key={`budget-${index}`}
              className="grid gap-2 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]"
            >
              <input
                value={budget.category}
                onChange={(event) => updateBudget(index, { category: event.target.value })}
                className={fieldClassName}
                placeholder="Category"
              />
              <input
                type="number"
                step="0.01"
                value={budget.monthly_limit}
                onChange={(event) => updateBudget(index, { monthly_limit: parseNumber(event.target.value) })}
                className={fieldClassName}
                placeholder="Monthly limit"
              />
              <input
                type="date"
                value={budget.month}
                onChange={(event) => updateBudget(index, { month: event.target.value })}
                className={fieldClassName}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  onChange((current) => ({
                    ...current,
                    budgets: current.budgets.filter((_, currentIndex) => currentIndex !== index),
                  }))
                }
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </FormSection>
        ),
      },{
        key: 'expenses',
        label: `Expense inputs (${value.existing_expenses.length + value.new_expenses.length})`,
        children: (
      <div className="space-y-3">
      {(['existing_expenses', 'new_expenses'] as const).map((expenseKey) => (
        <FormSection
          key={expenseKey}
          title={expenseKey === 'existing_expenses' ? 'Existing expenses' : 'New expenses'}
          description={
            expenseKey === 'existing_expenses'
              ? 'Historical spend already booked in the month.'
              : 'New requests the agent should evaluate against the available budget.'
          }
          action={
            <span className="text-[11px] text-[var(--as-text-muted)]">
              {value[expenseKey].length} expense(s)
            </span>
          }
        >
          <RowToolbar
            onAdd={() =>
              onChange((current) => ({
                ...current,
                [expenseKey]: [
                  ...current[expenseKey],
                  {
                    expense_id: '',
                    booked_at: '',
                    amount: 0,
                    description: '',
                    category: '',
                  },
                ],
              }))
            }
            addLabel="Add expense"
          />
          <div className="space-y-2">
            {value[expenseKey].map((expense, index) => (
              <div
                key={`${expenseKey}-${index}`}
                className="grid gap-2 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-3 xl:grid-cols-[repeat(5,minmax(0,1fr))_auto]"
              >
                <input
                  value={expense.expense_id}
                  onChange={(event) => updateExpense(expenseKey, index, { expense_id: event.target.value })}
                  className={fieldClassName}
                  placeholder="Expense ID"
                />
                <input
                  type="date"
                  value={expense.booked_at}
                  onChange={(event) => updateExpense(expenseKey, index, { booked_at: event.target.value })}
                  className={fieldClassName}
                />
                <input
                  type="number"
                  step="0.01"
                  value={expense.amount}
                  onChange={(event) => updateExpense(expenseKey, index, { amount: parseNumber(event.target.value) })}
                  className={fieldClassName}
                  placeholder="Amount"
                />
                <input
                  value={expense.description}
                  onChange={(event) => updateExpense(expenseKey, index, { description: event.target.value })}
                  className={fieldClassName}
                  placeholder="Description"
                />
                <input
                  value={expense.category}
                  onChange={(event) => updateExpense(expenseKey, index, { category: event.target.value })}
                  className={fieldClassName}
                  placeholder="Category"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange((current) => ({
                      ...current,
                      [expenseKey]: current[expenseKey].filter((_, currentIndex) => currentIndex !== index),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </FormSection>
      ))}
      </div>
        ),
      },{
        key: 'policy',
        label: 'Policy',
        children: (
      <FormSection title="Policy" description="Configure when the budget agent should alert, request approval or block.">
        <div className="grid gap-3 lg:grid-cols-3">
          <Field label="Alert threshold %">
            <input
              type="number"
              step="0.1"
              value={value.policy.alert_threshold_percent}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  policy: {
                    ...current.policy,
                    alert_threshold_percent: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <Field label="Critical threshold %">
            <input
              type="number"
              step="0.1"
              value={value.policy.critical_threshold_percent}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  policy: {
                    ...current.policy,
                    critical_threshold_percent: parseNumber(event.target.value),
                  },
                }))
              }
              className={fieldClassName}
            />
          </Field>
          <div className="flex items-end">
            <InlineCheckbox
              checked={value.policy.block_on_critical}
              onChange={(checked) =>
                onChange((current) => ({
                  ...current,
                  policy: {
                    ...current.policy,
                    block_on_critical: checked,
                  },
                }))
              }
              label="Block on critical overspend"
            />
          </div>
        </div>
      </FormSection>
        ),
      }]} />
    </div>
  )
}
