import type { AgentRunRecord, AuditEvent } from '../../lib/api/agent'
import type { ExecutionLogEntry } from './runPresentationUtils'

export type ModuleKey = 'reconciliation' | 'supplierPayments' | 'budgetControl'

export type ModuleState = {
  run: AgentRunRecord | null
  audit: AuditEvent[] | null
  progressLogs: ExecutionLogEntry[]
  loading: boolean
  auditLoading: boolean
  error: string | null
  actionLabel: string | null
}

export type ModuleDefinition = {
  key: ModuleKey
  eyebrow: string
  title: string
  description: string
  permissionLabel: string
}

export const initialModuleState: Record<ModuleKey, ModuleState> = {
  reconciliation: {
    run: null,
    audit: null,
    progressLogs: [],
    loading: false,
    auditLoading: false,
    error: null,
    actionLabel: null,
  },
  supplierPayments: {
    run: null,
    audit: null,
    progressLogs: [],
    loading: false,
    auditLoading: false,
    error: null,
    actionLabel: null,
  },
  budgetControl: {
    run: null,
    audit: null,
    progressLogs: [],
    loading: false,
    auditLoading: false,
    error: null,
    actionLabel: null,
  },
}

export const moduleDefinitions: ModuleDefinition[] = [
  {
    key: 'reconciliation',
    eyebrow: 'Bank reconciliation',
    title: 'Statement cross-check with invoices and expenses',
    description:
      'Import a statement, maintain the finance ledger, and surface matches or unexplained movements with durable audit.',
    permissionLabel: 'Finance Admin or Accountant',
  },
  {
    key: 'supplierPayments',
    eyebrow: 'Supplier payments',
    title: 'Evaluate, simulate, and execute payment decisions',
    description:
      'Prepare the treasury batch, choose approved invoices, and control when the agent only evaluates or actually submits execution.',
    permissionLabel: 'Finance Admin or Treasurer',
  },
  {
    key: 'budgetControl',
    eyebrow: 'Budget control',
    title: 'Budget variance and overspend prevention',
    description:
      'Model budget envelopes, historical spend, and new requests to identify alerts, approvals, and critical blocks.',
    permissionLabel: 'Finance Admin or Accountant',
  },
]
