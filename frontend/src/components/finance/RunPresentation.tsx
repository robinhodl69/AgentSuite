import { SkeletonTimeline } from '../ui/Skeleton'
import type { AgentRunRecord, AuditEvent } from '../../lib/api/agent'
import {
  extractCounts,
  extractSpendRequest,
  formatDate,
  formatLabel,
  logStatusStyles,
  statusStyles,
  type ExecutionLogEntry,
} from './runPresentationUtils'

function formatOutputPreview(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} item${value.length === 1 ? '' : 's'}`
  }

  if (value && typeof value === 'object') {
    return `${Object.keys(value as Record<string, unknown>).length} field(s)`
  }

  return String(value)
}

export function RunStatusBadge({ status, loading = false }: { status: string | null; loading?: boolean }) {
  return (
    <span
      className={`rounded-[var(--as-radius-sm)] border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] font-mono ${statusStyles(
        loading ? 'online' : status,
      )}`}
    >
      {loading ? 'Running' : status ? formatLabel(status) : 'Idle'}
    </span>
  )
}

export function ExecutionTimeline({
  logs,
  loading,
  emptyMessage = 'No active run for this process yet.',
}: {
  logs: ExecutionLogEntry[]
  loading?: boolean
  emptyMessage?: string
}) {
  if (logs.length === 0) {
    if (loading) {
      return (
        <div className="rounded-[var(--as-radius-md)] border border-dashed border-[var(--as-border-default)] bg-[var(--as-bg-secondary)] p-4">
          <SkeletonTimeline />
        </div>
      )
    }
    return (
      <div className="rounded-[var(--as-radius-md)] border border-dashed border-[var(--as-border-default)] bg-[var(--as-bg-secondary)] p-4 text-xs text-[var(--as-text-muted)]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/40 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
            Execution status
          </p>
          <p className="mt-0.5 text-xs text-[var(--as-text-secondary)]">
            {loading ? 'Showing real-time progress.' : 'Last known process trace.'}
          </p>
        </div>
      </div>

      <div className="grid gap-1.5">
        {logs.map((entry) => (
          <div key={entry.id} className={`rounded-[var(--as-radius-sm)] border px-2.5 py-1.5 ${logStatusStyles(entry.status)}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] font-mono">{entry.label}</span>
              <span className="text-[10px] text-inherit/70 font-mono">
                {entry.timestamp ? formatDate(entry.timestamp) : entry.status}
              </span>
            </div>
            <p className="mt-1 text-xs leading-4 text-[var(--as-text-secondary)]">{entry.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RunOutputPanel({
  run,
  audit,
  emptyMessage = 'Select or run a process to review its output.',
}: {
  run: AgentRunRecord | null
  audit?: AuditEvent[] | null
  emptyMessage?: string
}) {
  if (!run) {
    return (
      <div className="rounded-[var(--as-radius-md)] border border-dashed border-[var(--as-border-default)] bg-[var(--as-bg-secondary)] p-4 text-xs text-[var(--as-text-muted)]">
        {emptyMessage}
      </div>
    )
  }

  const counts = extractCounts(run)
  const spendRequest = extractSpendRequest(run)
  const summary =
    typeof run.final_output?.summary === 'string'
      ? run.final_output.summary
      : 'Run completed without narrative summary.'
  const structuredEntries = Object.entries(run.final_output).filter(
    ([key]) => key !== 'summary' && key !== 'counts' && key !== 'executed_payments',
  )
  const visibleAudit = (audit ?? run.audit_log).slice(0, 6)

  return (
    <div className="space-y-3 rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-secondary)] p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
            Process output
          </p>
          <h3 className="mt-1 text-base font-semibold text-[var(--as-text-primary)]">{formatLabel(run.process_type)}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RunStatusBadge status={run.status} />
          <span className="text-[11px] font-mono text-[var(--as-text-muted)]">{formatDate(run.created_at)}</span>
        </div>
      </div>

      <div className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-2.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">Executive summary</p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--as-text-secondary)]">{summary}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {counts.map(([label, value]) => (
            <span
              key={label}
              className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-2 py-0.5 text-[10px] font-mono text-[var(--as-text-secondary)]"
            >
              {formatLabel(label)}: {value}
            </span>
          ))}
        </div>
      </div>

      {spendRequest ? (
        <div className="rounded-[var(--as-radius-sm)] border border-[var(--as-success)]/15 bg-[var(--as-success-subtle)] px-2.5 py-2 text-xs text-[var(--as-success)]">
          <p className="font-medium">Payment credential generated</p>
          {spendRequest.spendRequestId ? (
            <p className="mt-1 break-all text-[11px] font-mono text-[var(--as-success)]">
              Spend request: {spendRequest.spendRequestId}
            </p>
          ) : null}
          {spendRequest.credentialStatus ? (
            <p className="mt-1 text-[11px] font-mono text-[var(--as-success)]">
              Status: {spendRequest.credentialStatus}
            </p>
          ) : null}
          {spendRequest.cardLast4 ? (
            <p className="mt-1 text-[11px] font-mono text-[var(--as-success)]">
              Virtual card: ****{spendRequest.cardLast4}
            </p>
          ) : null}
          {spendRequest.approvalUrl ? (
            <a
              href={spendRequest.approvalUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center text-[11px] font-semibold text-[var(--as-success)] underline decoration-[var(--as-success)]/40 underline-offset-4 hover:text-[#6ee7b7]"
            >
              Approve in Link
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2">
        <div className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">Structured output</p>
          <div className="mt-2 grid gap-1.5">
            {structuredEntries.length ? (
              structuredEntries.slice(0, 6).map(([key, value]) => (
                <div key={key} className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-2.5 py-1.5">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--as-text-muted)] font-mono">
                    {formatLabel(key)}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--as-text-secondary)]">{formatOutputPreview(value)}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--as-text-muted)]">No additional structured fields to display.</p>
            )}
          </div>
        </div>

        <div className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">Recent audit</p>
          <div className="mt-2 grid gap-1.5">
            {visibleAudit.length ? (
              visibleAudit.map((event) => (
                <div key={`${event.timestamp}-${event.stage}`} className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-2.5 py-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--as-text-secondary)] font-mono">
                      {formatLabel(event.stage)}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--as-text-muted)]">{formatDate(event.timestamp)}</span>
                  </div>
                  <p className="mt-0.5 text-xs leading-4 text-[var(--as-text-secondary)]">{event.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--as-text-muted)]">No audit events available.</p>
            )}
          </div>
        </div>
      </div>

      <details className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/60 p-2.5">
        <summary className="cursor-pointer text-xs font-semibold text-[var(--as-text-primary)]">View full JSON output</summary>
        <pre className="mt-2 overflow-x-auto rounded-[var(--as-radius-sm)] bg-[var(--as-bg-primary)] p-2.5 text-[11px] leading-5 text-[var(--as-text-secondary)] font-mono">
          {JSON.stringify(run.final_output, null, 2)}
        </pre>
      </details>
    </div>
  )
}
