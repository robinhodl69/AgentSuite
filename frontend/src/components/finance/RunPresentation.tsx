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
  {
    id: 'intake',
    label: 'Inicio',
    message: 'Recibiendo la instrucción y preparando la corrida.',
  },
  {
    id: 'normalize',
    label: 'Normalización',
    message: 'Ordenando insumos y validando la estructura del payload.',
  },
  {
    id: 'skill_selection',
    label: 'Skills',
    message: 'Cargando skills y reglas del proceso seleccionado.',
  },
  {
    id: 'analysis',
    label: 'Análisis',
    message: 'Evaluando datos y generando criterio operativo.',
  },
  {
    id: 'policy',
    label: 'Política',
    message: 'Aplicando umbrales, aprobaciones y reglas de decisión.',
  },
  {
    id: 'action',
    label: 'Acción',
    message: 'Ejecutando la acción prevista o la simulación del proceso.',
  },
  {
    id: 'response',
    label: 'Respuesta',
    message: 'Preparando el resumen final y la traza operativa.',
  },
] as const

export function statusStyles(status: string | null) {
  switch (status) {
    case 'completed':
      return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    case 'requires_review':
      return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
    case 'blocked':
      return 'border-rose-400/30 bg-rose-400/10 text-rose-300'
    case 'online':
      return 'border-sky-400/30 bg-sky-400/10 text-sky-300'
    default:
      return 'border-slate-700 bg-slate-900 text-slate-300'
  }
}

export function logStatusStyles(status: LogStatus) {
  switch (status) {
    case 'active':
      return 'border-sky-400/30 bg-sky-400/10 text-sky-200'
    case 'done':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'error':
      return 'border-rose-400/20 bg-rose-400/10 text-rose-200'
    default:
      return 'border-slate-800 bg-slate-950/80 text-slate-500'
  }
}

export function formatLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString('es-MX', {
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

export function extractExecutedPayment(run: AgentRunRecord | null) {
  const payments = run?.final_output?.executed_payments
  if (!Array.isArray(payments) || payments.length === 0) {
    return null
  }

  const [payment] = payments
  if (!payment || typeof payment !== 'object') {
    return null
  }

  const txHash =
    typeof payment.tx_hash === 'string' && payment.tx_hash.length > 0 ? payment.tx_hash : null
  const explorerUrl =
    typeof payment.explorer_url === 'string' && payment.explorer_url.length > 0
      ? payment.explorer_url
      : null

  return txHash || explorerUrl ? { txHash, explorerUrl } : null
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
    if (index < activeIndex || index === activeIndex) {
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
      {
        id: `error-${Date.now()}`,
        label: 'Error',
        message,
        status: 'error' as const,
      },
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

function formatOutputPreview(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} elemento${value.length === 1 ? '' : 's'}`
  }

  if (value && typeof value === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} campo(s)`
  }

  return String(value)
}

export function RunStatusBadge({ status, loading = false }: { status: string | null; loading?: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusStyles(
        loading ? 'online' : status,
      )}`}
    >
      {loading ? 'En ejecución' : status ? formatLabel(status) : 'Idle'}
    </span>
  )
}

export function ExecutionTimeline({
  logs,
  loading,
  emptyMessage = 'Aún no hay una corrida activa para este proceso.',
}: {
  logs: ExecutionLogEntry[]
  loading?: boolean
  emptyMessage?: string
}) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Estado de ejecución
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? 'Mostrando avance en tiempo real.' : 'Última traza conocida del proceso.'}
          </p>
        </div>
      </div>

      <div className="grid gap-2">
        {logs.map((entry) => (
          <div key={entry.id} className={`rounded-xl border px-3 py-2 ${logStatusStyles(entry.status)}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{entry.label}</span>
              <span className="text-[11px] text-inherit/70">
                {entry.timestamp ? formatDate(entry.timestamp) : entry.status}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-5 text-slate-300">{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RunOutputPanel({
  run,
  audit,
  emptyMessage = 'Selecciona o ejecuta un proceso para revisar su salida.',
}: {
  run: AgentRunRecord | null
  audit?: AuditEvent[] | null
  emptyMessage?: string
}) {
  if (!run) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  const counts = extractCounts(run)
  const executedPayment = extractExecutedPayment(run)
  const summary =
    typeof run.final_output?.summary === 'string'
      ? run.final_output.summary
      : 'La corrida finalizó sin resumen narrativo.'
  const structuredEntries = Object.entries(run.final_output).filter(
    ([key]) => key !== 'summary' && key !== 'counts' && key !== 'executed_payments',
  )
  const visibleAudit = (audit ?? run.audit_log).slice(0, 6)

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Output del proceso
          </p>
          <h3 className="mt-2 text-lg font-semibold text-white">{formatLabel(run.process_type)}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RunStatusBadge status={run.status} />
          <span className="text-xs text-slate-500">{formatDate(run.created_at)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Resumen ejecutivo</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">{summary}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {counts.map(([label, value]) => (
            <span
              key={label}
              className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300"
            >
              {formatLabel(label)}
              :
              {' '}
              {value}
            </span>
          ))}
        </div>
      </div>

      {executedPayment ? (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3 text-sm text-emerald-100">
          <p className="font-medium">Pago onchain registrado</p>
          {executedPayment.txHash ? (
            <p className="mt-1 break-all text-xs text-emerald-200/90">{executedPayment.txHash}</p>
          ) : null}
          {executedPayment.explorerUrl ? (
            <a
              href={executedPayment.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-200 underline decoration-emerald-300/50 underline-offset-4 hover:text-emerald-100"
            >
              Ver transacción en explorer
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Salida estructurada</p>
          <div className="mt-3 grid gap-2">
            {structuredEntries.length ? (
              structuredEntries.slice(0, 6).map(([key, value]) => (
                <div key={key} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {formatLabel(key)}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{formatOutputPreview(value)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No hay campos estructurados adicionales para mostrar.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Auditoría reciente</p>
          <div className="mt-3 grid gap-2">
            {visibleAudit.length ? (
              visibleAudit.map((event) => (
                <div key={`${event.timestamp}-${event.stage}`} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {formatLabel(event.stage)}
                    </span>
                    <span className="text-[11px] text-slate-500">{formatDate(event.timestamp)}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-300">{event.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No hay eventos de auditoría disponibles.</p>
            )}
          </div>
        </div>
      </div>

      <details className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-slate-200">Ver output completo JSON</summary>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs leading-6 text-slate-300">
          {JSON.stringify(run.final_output, null, 2)}
        </pre>
      </details>
    </div>
  )
}
