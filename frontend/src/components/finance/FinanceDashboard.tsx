import { useEffect, useMemo, useRef, useState } from 'react'
import {
  approveSupplierPayments,
  type AgentRunRecord,
  type BudgetControlRequest,
  checkAgentHealth,
  evaluateSupplierPayments,
  getAudit,
  runBudgetControl,
  runReconciliation,
  type ReconciliationRequest,
  type SupplierPaymentApprovalRequest,
} from '../../lib/api/agent'
import { useAuth } from '../../lib/auth-context'
import { FinanceProcessSelector } from '../organisms/FinanceProcessSelector'
import { FinanceStatusStrip } from '../organisms/FinanceStatusStrip'
import { FinanceWorkbench } from '../organisms/FinanceWorkbench'
import { Button } from '../ui/Button'
import {
  BudgetControlForm,
  ReconciliationForm,
  SupplierPaymentsForm,
} from './FinanceInputForms'
import {
  initialModuleState,
  moduleDefinitions,
  type ModuleKey,
} from './financeDashboardModel'
import {
  createBudgetControlTemplate,
  createReconciliationTemplate,
  createSupplierPaymentsTemplate,
} from './financeFormDefaults'
import {
  advanceProgressLogs,
  buildInitialProgressLogs,
  failProgressLogs,
  finalizeProgressLogs,
  formatDate,
  mapAuditToLogs,
} from './runPresentationUtils'

const configuredAgentUrl = import.meta.env.VITE_AGENT_API_URL || 'http://127.0.0.1:8000'

function countStatementRows(statementCsv: string) {
  const rows = statementCsv
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
  return rows.length > 0 ? rows.length - 1 : 0
}

export function FinanceDashboard() {
  const { user } = useAuth()
  const [modules, setModules] = useState(initialModuleState)
  const [activeModuleKey, setActiveModuleKey] = useState<ModuleKey>('supplierPayments')
  const [agentStatus, setAgentStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [agentError, setAgentError] = useState<string | null>(null)
  const [reconciliationForm, setReconciliationForm] = useState<ReconciliationRequest>(() =>
    createReconciliationTemplate(),
  )
  const [supplierPaymentsForm, setSupplierPaymentsForm] =
    useState<SupplierPaymentApprovalRequest>(() => createSupplierPaymentsTemplate())
  const [budgetControlForm, setBudgetControlForm] = useState<BudgetControlRequest>(() =>
    createBudgetControlTemplate(),
  )
  const executionTimers = useRef<Partial<Record<ModuleKey, number>>>({})

  useEffect(() => {
    void checkAgentHealth()
      .then(() => {
        setAgentStatus('online')
        setAgentError(null)
      })
      .catch((error: unknown) => {
        setAgentStatus('offline')
        setAgentError(error instanceof Error ? error.message : 'Unable to connect to agent.')
      })
  }, [])

  useEffect(
    () => () => {
      Object.values(executionTimers.current).forEach((timerId) => {
        if (timerId) {
          window.clearInterval(timerId)
        }
      })
    },
    [],
  )

  const activeModuleDefinition =
    moduleDefinitions.find((module) => module.key === activeModuleKey) ?? moduleDefinitions[0]
  const activeState = modules[activeModuleKey]

  const canManageAccounting = user?.role === 'finance_admin' || user?.role === 'accountant'
  const canManageTreasury = user?.role === 'finance_admin' || user?.role === 'treasurer'
  const canOperateReconciliation = canManageAccounting && agentStatus === 'online'
  const canOperateBudget = canManageAccounting && agentStatus === 'online'
  const canOperatePayments = canManageTreasury && agentStatus === 'online'

  const reconciliationReady = reconciliationForm.statement_csv.trim().length > 0
  const supplierReady = supplierPaymentsForm.invoices.some(
    (invoice) => invoice.invoice_id.trim().length > 0,
  )
  const approvedInvoiceIds = supplierPaymentsForm.approved_invoice_ids.filter(
    (invoiceId) => invoiceId.length > 0,
  )
  const budgetReady =
    budgetControlForm.budgets.length > 0 && budgetControlForm.new_expenses.length > 0

  const activeInputSummary = useMemo(() => {
    if (activeModuleKey === 'reconciliation') {
      return `${countStatementRows(reconciliationForm.statement_csv)} bank rows, ${reconciliationForm.sales_invoices.length} invoices, ${reconciliationForm.expense_records.length} expenses`
    }
    if (activeModuleKey === 'supplierPayments') {
      return `${supplierPaymentsForm.invoices.length} invoice(s), ${approvedInvoiceIds.length} approved for simulate or execute`
    }
    return `${budgetControlForm.budgets.length} budgets, ${budgetControlForm.existing_expenses.length} posted expenses, ${budgetControlForm.new_expenses.length} new request(s)`
  }, [
    activeModuleKey,
    approvedInvoiceIds.length,
    budgetControlForm.budgets.length,
    budgetControlForm.existing_expenses.length,
    budgetControlForm.new_expenses.length,
    reconciliationForm.expense_records.length,
    reconciliationForm.sales_invoices.length,
    reconciliationForm.statement_csv,
    supplierPaymentsForm.invoices.length,
  ])

  function clearExecutionTimer(key: ModuleKey) {
    const timerId = executionTimers.current[key]
    if (timerId) {
      window.clearInterval(timerId)
      delete executionTimers.current[key]
    }
  }

  async function runModule(
    key: ModuleKey,
    actionLabel: string,
    executor: () => Promise<AgentRunRecord>,
  ) {
    clearExecutionTimer(key)
    setActiveModuleKey(key)

    setModules((current) => ({
      ...current,
      [key]: {
        ...current[key],
        loading: true,
        error: null,
        actionLabel,
        progressLogs: buildInitialProgressLogs(),
      },
    }))

    executionTimers.current[key] = window.setInterval(() => {
      setModules((current) => {
        const moduleState = current[key]
        if (!moduleState.loading) {
          return current
        }

        return {
          ...current,
          [key]: {
            ...moduleState,
            progressLogs: advanceProgressLogs(moduleState.progressLogs),
          },
        }
      })
    }, 900)

    try {
      const run = await executor()
      clearExecutionTimer(key)
      const auditLogs = mapAuditToLogs(run.audit_log)

      setModules((current) => ({
        ...current,
        [key]: {
          ...current[key],
          run,
          audit: run.audit_log,
          progressLogs: auditLogs.length
            ? auditLogs
            : finalizeProgressLogs(current[key].progressLogs),
          loading: false,
          error: null,
          actionLabel: null,
        },
      }))
    } catch (error) {
      clearExecutionTimer(key)
      const message = error instanceof Error ? error.message : 'Run failed.'

      setModules((current) => ({
        ...current,
        [key]: {
          ...current[key],
          loading: false,
          error: message,
          actionLabel: null,
          progressLogs: failProgressLogs(current[key].progressLogs, message),
        },
      }))
    }
  }

  async function loadAudit(key: ModuleKey) {
    const runId = modules[key].run?.run_id
    if (!runId) {
      return
    }

    setModules((current) => ({
      ...current,
      [key]: { ...current[key], auditLoading: true, error: null },
    }))

    try {
      const audit = await getAudit(runId)
      const progressLogs = mapAuditToLogs(audit)
      setModules((current) => ({
        ...current,
        [key]: {
          ...current[key],
          audit,
          progressLogs,
          auditLoading: false,
        },
      }))
    } catch (error) {
      setModules((current) => ({
        ...current,
        [key]: {
          ...current[key],
          auditLoading: false,
          error: error instanceof Error ? error.message : 'Unable to load audit.',
        },
      }))
    }
  }

  function renderActiveForm() {
    if (activeModuleKey === 'reconciliation') {
      return (
        <ReconciliationForm
          value={reconciliationForm}
          onChange={setReconciliationForm}
          onReset={() => setReconciliationForm(createReconciliationTemplate())}
        />
      )
    }

    if (activeModuleKey === 'supplierPayments') {
      return (
        <SupplierPaymentsForm
          value={supplierPaymentsForm}
          onChange={setSupplierPaymentsForm}
          onReset={() => setSupplierPaymentsForm(createSupplierPaymentsTemplate())}
        />
      )
    }

    return (
      <BudgetControlForm
        value={budgetControlForm}
        onChange={setBudgetControlForm}
        onReset={() => setBudgetControlForm(createBudgetControlTemplate())}
      />
    )
  }

  function renderActiveActions() {
    if (activeModuleKey === 'reconciliation') {
      return (
        <>
          <Button
            onClick={() =>
              void runModule('reconciliation', 'Run reconciliation', () =>
                runReconciliation(reconciliationForm),
              )
            }
            disabled={!canOperateReconciliation || !reconciliationReady || activeState.loading}
            isLoading={activeState.loading && activeState.actionLabel === 'Run reconciliation'}
            size="sm"
          >
            Run reconciliation
          </Button>
          <p className="text-xs leading-5 text-[var(--as-text-secondary)]">
            Analysis-only flow. Import the statement and ledger records, then let the agent
            reconcile and surface exceptions.
          </p>
        </>
      )
    }

    if (activeModuleKey === 'supplierPayments') {
      const supplierPaymentEvaluatePayload = {
        invoices: supplierPaymentsForm.invoices,
        cash_position: supplierPaymentsForm.cash_position,
        cash_forecast: supplierPaymentsForm.cash_forecast,
        policy: supplierPaymentsForm.policy,
        execution_mode: 'evaluate' as const,
      }

      const supplierPaymentDecisionPayload = {
        ...supplierPaymentsForm,
        approved_invoice_ids: approvedInvoiceIds,
      }

      return (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                void runModule('supplierPayments', 'Evaluate batch', () =>
                  evaluateSupplierPayments(supplierPaymentEvaluatePayload),
                )
              }
              disabled={!canOperatePayments || !supplierReady || activeState.loading}
              isLoading={activeState.loading && activeState.actionLabel === 'Evaluate batch'}
              size="sm"
            >
              Evaluate batch
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                void runModule('supplierPayments', 'Simulate payment', () =>
                  approveSupplierPayments({
                    ...supplierPaymentDecisionPayload,
                    execution_mode: 'simulate',
                  }),
                )
              }
              disabled={!canOperatePayments || approvedInvoiceIds.length === 0 || activeState.loading}
              isLoading={activeState.loading && activeState.actionLabel === 'Simulate payment'}
              size="sm"
            >
              Simulate payment
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                void runModule('supplierPayments', 'Execute payment', () =>
                  approveSupplierPayments({
                    ...supplierPaymentDecisionPayload,
                    execution_mode: 'execute',
                  }),
                )
              }
              disabled={!canOperatePayments || approvedInvoiceIds.length === 0 || activeState.loading}
              isLoading={activeState.loading && activeState.actionLabel === 'Execute payment'}
              size="sm"
            >
              Execute payment
            </Button>
          </div>
          <p className="text-xs leading-5 text-[var(--as-text-secondary)]">
            Evaluate scores the batch without side effects. Simulate submits only approved invoice
            IDs in non-final mode. Execute uses the same approval list for real action.
          </p>
        </>
      )
    }

    return (
      <>
        <Button
          onClick={() =>
            void runModule('budgetControl', 'Run budget control', () =>
              runBudgetControl(budgetControlForm),
            )
          }
          disabled={!canOperateBudget || !budgetReady || activeState.loading}
          isLoading={activeState.loading && activeState.actionLabel === 'Run budget control'}
          size="sm"
        >
          Run budget control
        </Button>
        <p className="text-xs leading-5 text-[var(--as-text-secondary)]">
          Analysis-only flow. Use this to inspect budget variance, projected overspend and policy
          thresholds before approvals happen.
        </p>
      </>
    )
  }

  function renderOperatorHint() {
    if (agentStatus !== 'online') {
      return 'Execution is disabled until the Finance agent is reachable from the current workspace.'
    }

    if (activeModuleKey === 'supplierPayments') {
      if (!canManageTreasury) {
        return 'Your role can review treasury output, but only Finance Admin or Treasurer can evaluate, simulate, or execute payments.'
      }
      if (approvedInvoiceIds.length === 0) {
        return 'Select at least one approved invoice before using simulate or execute.'
      }
      return 'Approved invoice IDs will be sent only for simulate or execute. Evaluate ignores approvals and only scores the batch.'
    }

    if (!canManageAccounting) {
      return 'Your role can review accounting output, but only Finance Admin or Accountant can run this process.'
    }

    return 'This process is ready to run against the current input set.'
  }

  return (
    <div data-density="compact" className="space-y-5 lg:space-y-6">
      <FinanceStatusStrip
        agentStatus={agentStatus}
        agentError={agentError}
        configuredAgentUrl={configuredAgentUrl}
      />

      <FinanceProcessSelector
        moduleDefinitions={moduleDefinitions}
        modules={modules}
        activeModuleKey={activeModuleKey}
        onChange={setActiveModuleKey}
      />

      <FinanceWorkbench
        activeModuleDefinition={activeModuleDefinition}
        activeState={activeState}
        activeInputSummary={activeInputSummary}
        latestRunLabel={
          activeState.run
            ? `${activeState.run.status.replace(/_/g, ' ')} - ${formatDate(activeState.run.created_at)}`
            : 'No run recorded yet.'
        }
        renderActiveActions={renderActiveActions}
        renderActiveForm={renderActiveForm}
        renderOperatorHint={renderOperatorHint}
        onRefreshAudit={() => void loadAudit(activeModuleKey)}
        progressLogs={activeState.progressLogs}
        timelineLoading={activeState.loading || activeState.auditLoading}
        timelineEmptyMessage="Submit the selected process to see its real-time timeline and durable audit trace."
        error={activeState.error}
      />
    </div>
  )
}
