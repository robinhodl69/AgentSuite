import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FinanceShell } from '../components/finance/FinanceShell'
import {
  ExecutionTimeline,
  formatDate,
  formatLabel,
  mapAuditToLogs,
  RunOutputPanel,
  RunStatusBadge,
} from '../components/finance/RunPresentation'
import { getAudit, getRun, type AgentRunRecord, type AuditEvent } from '../lib/api/agent'

export function FinanceRunDetailPage() {
  const { runId } = useParams<{ runId: string }>()
  const [run, setRun] = useState<AgentRunRecord | null>(null)
  const [audit, setAudit] = useState<AuditEvent[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!runId) {
      setError('Run inválido.')
      setLoading(false)
      return
    }

    void Promise.all([getRun(runId), getAudit(runId)])
      .then(([runResponse, auditResponse]) => {
        setRun(runResponse)
        setAudit(auditResponse)
        setLoading(false)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la corrida.')
        setLoading(false)
      })
  }, [runId])

  return (
    <FinanceShell
      title="Detalle de ejecución"
      description="Revisa el resultado completo de una corrida: output, auditoría por etapas y estado final del proceso."
      actions={
        <Link
          to="/erp/finanzas/historial"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          Volver al historial
        </Link>
      }
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-400">
          Cargando detalle de la corrida...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-6 text-sm text-rose-200">
          {error}
        </div>
      ) : run ? (
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {formatLabel(run.process_type)}
                </p>
                <h2 className="text-lg font-semibold text-white">{run.run_id}</h2>
                <p className="text-sm text-slate-400">Creada el {formatDate(run.created_at)}</p>
              </div>
              <RunStatusBadge status={run.status} />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <ExecutionTimeline
              logs={mapAuditToLogs(audit ?? run.audit_log)}
              emptyMessage="No hay eventos de auditoría para esta corrida."
            />
            <RunOutputPanel
              run={run}
              audit={audit}
              emptyMessage="No hay output disponible para esta corrida."
            />
          </section>
        </div>
      ) : null}
    </FinanceShell>
  )
}
