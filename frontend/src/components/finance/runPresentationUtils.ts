import type { AgentRunRecord, AuditEvent } from '../../lib/api/agent'

export type LogStatus = 'pending' | 'active' | 'done' | 'error'

export type ExecutionLogEntry = {
  id: string
  label: string
  message: string
  status: LogStatus
  timestamp?: string
}

export const workflowStageDefinitions = [
  { id: 'intake', label: 'Intake', message: 'Receiving instruction and preparing the run.' },
  { id: 'normalize', label: 'Normalization', message: 'Organizing inputs and validating payload structure.' },
  { id: 'skill_selection', label: 'Skills', message: 'Loading skills and rules for the selected process.' },
  { id: 'analysis', label: 'Analysis', message: 'Evaluating data and generating operational criteria.' },
  { id: 'policy', label: 'Policy', message: 'Applying thresholds, approvals, and decision rules.' },
  { id: 'action', label: 'Action', message: 'Executing the planned action or process simulation.' },
  { id: 'response', label: 'Response', message: 'Preparing final summary and operational trace.' },
] as const

export function statusStyles(status: string | null) {
  switch (status) {
    case 'completed':
      return 'border-[var(--as-success)]/20 bg-[var(--as-success-subtle)] text-[var(--as-success)]'
    case 'requires_review':
      return 'border-[var(--as-warning)]/20 bg-[var(--as-warning-subtle)] text-[var(--as-warning)]'
    case 'blocked':
      return 'border-[var(--as-error)]/20 bg-[var(--as-error-subtle)] text-[var(--as-error)]'
    case 'online':
      return 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]'
    default:
      return 'border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] text-[var(--as-text-secondary)]'
  }
}

export function logStatusStyles(status: LogStatus) {
  switch (status) {
    case 'active':
      return 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]'
    case 'done':
      return 'border-[var(--as-success)]/15 bg-[var(--as-success-subtle)] text-[var(--as-success)]'
    case 'error':
      return 'border-[var(--as-error)]/15 bg-[var(--as-error-subtle)] text-[var(--as-error)]'
    default:
      return 'border-[var(--as-border-default)] bg-[var(--as-bg-secondary)] text-[var(--as-text-muted)]'
  }
}

export function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function extractCounts(run: AgentRunRecord | null) {
  const counts = run?.final_output?.counts
  if (!counts || typeof counts !== 'object') {
    return []
  }

  return Object.entries(counts)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .slice(0, 6)
}

export function extractSpendRequest(run: AgentRunRecord | null) {
  const payments = run?.final_output?.executed_payments
  if (!Array.isArray(payments) || payments.length === 0) {
    return null
  }

  const [payment] = payments
  if (!payment || typeof payment !== 'object') {
    return null
  }

  const spendRequestId =
    typeof payment.spend_request_id === 'string' && payment.spend_request_id.length > 0
      ? payment.spend_request_id
      : null
  const credentialStatus =
    typeof payment.credential_status === 'string' ? payment.credential_status : null
  const cardLast4 =
    typeof payment.card_last4 === 'string' ? payment.card_last4 : null
  const approvalUrl =
    typeof payment.approval_url === 'string' && payment.approval_url.length > 0
      ? payment.approval_url
      : null

  return spendRequestId
    ? { spendRequestId, credentialStatus, cardLast4, approvalUrl }
    : null
}

export function buildInitialProgressLogs() {
  return workflowStageDefinitions.map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    message: stage.message,
    status: index === 0 ? 'active' : 'pending',
  })) satisfies ExecutionLogEntry[]
}

export function advanceProgressLogs(logs: ExecutionLogEntry[]) {
  const activeIndex = logs.findIndex((entry) => entry.status === 'active')
  if (activeIndex === -1 || activeIndex === logs.length - 1) {
    return logs
  }

  return logs.map((entry, index) => {
    if (index <= activeIndex) {
      return { ...entry, status: 'done' as const }
    }
    if (index === activeIndex + 1) {
      return { ...entry, status: 'active' as const }
    }
    return entry
  })
}

export function finalizeProgressLogs(logs: ExecutionLogEntry[]) {
  return logs.map((entry) => ({ ...entry, status: 'done' as const }))
}

export function failProgressLogs(logs: ExecutionLogEntry[], message: string) {
  const activeIndex = logs.findIndex((entry) => entry.status === 'active')

  if (activeIndex === -1) {
    return [
      ...logs,
      { id: `error-${Date.now()}`, label: 'Error', message, status: 'error' as const },
    ]
  }

  return logs.map((entry, index) => {
    if (index < activeIndex) {
      return { ...entry, status: 'done' as const }
    }
    if (index === activeIndex) {
      return { ...entry, status: 'error' as const, message }
    }
    return entry
  })
}

export function mapAuditToLogs(audit: AuditEvent[]) {
  return audit.map((event) => {
    const stageDefinition = workflowStageDefinitions.find((stage) => stage.id === event.stage)

    return {
      id: `${event.timestamp}-${event.stage}`,
      label: stageDefinition?.label ?? formatLabel(event.stage),
      message: event.message,
      status: 'done' as const,
      timestamp: event.timestamp,
    }
  })
}
