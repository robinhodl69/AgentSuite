export type AuditEvent = {
  timestamp: string
  stage: string
  message: string
  details: Record<string, unknown>
}

export type AgentRunRecord = {
  run_id: string
  process_type: string
  status: 'completed' | 'requires_review' | 'blocked'
  created_at: string
  final_output: Record<string, unknown>
  audit_log: AuditEvent[]
}

const configuredBaseUrl = import.meta.env.VITE_AGENT_API_URL?.replace(/\/$/, '') ?? ''

function getApiUrl(path: string) {
  if (import.meta.env.DEV) {
    return path
  }

  return configuredBaseUrl ? `${configuredBaseUrl}${path}` : path
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`
    try {
      const error = (await response.json()) as { detail?: string }
      if (error.detail) {
        message = error.detail
      }
    } catch {}
    throw new Error(message)
  }

  return (await response.json()) as T
}

export function checkAgentHealth() {
  return request<{ status: string }>('/health', {
    headers: {},
  })
}

export function runReconciliation(payload: Record<string, unknown>) {
  return request<AgentRunRecord>('/agent/runs/reconciliation', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function evaluateSupplierPayments(payload: Record<string, unknown>) {
  return request<AgentRunRecord>('/agent/runs/payments/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function approveSupplierPayments(payload: Record<string, unknown>) {
  return request<AgentRunRecord>('/agent/runs/payments/approve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function runBudgetControl(payload: Record<string, unknown>) {
  return request<AgentRunRecord>('/agent/runs/budgets', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getRun(runId: string) {
  return request<AgentRunRecord>(`/agent/runs/${runId}`, {
    headers: {},
  })
}

export function listRuns() {
  return request<AgentRunRecord[]>('/agent/runs', {
    headers: {},
  })
}

export function getAudit(runId: string) {
  return request<AuditEvent[]>(`/agent/runs/${runId}/audit`, {
    headers: {},
  })
}
