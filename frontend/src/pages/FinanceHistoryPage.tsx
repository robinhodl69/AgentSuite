import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FinanceShell } from '../components/finance/FinanceShell'
import { formatDate, formatLabel, RunStatusBadge } from '../components/finance/RunPresentation'
import { type AgentRunRecord, listRuns } from '../lib/api/agent'

export function FinanceHistoryPage() {
  const [runs, setRuns] = useState<AgentRunRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void listRuns()
      .then((response) => {
        setRuns(response)
        setLoading(false)
      })
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar el historial.')
        setLoading(false)
      })
  }, [])

  const stats = useMemo(
    () => ({
      total: runs.length,
      completed: runs.filter((run) => run.status === 'completed').length,
      requiresReview: runs.filter((run) => run.status === 'requires_review').length,
      blocked: runs.filter((run) => run.status === 'blocked').length,
    }),
    [runs],
  )

  return (
    <FinanceShell
      title="Historial de ejecuciones"
      description="Consulta las corridas más recientes del agente, su estado final y accede al detalle completo de cada proceso."
      actions={
        <Link
          to="/erp/finanzas"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          Volver a operaciones
        </Link>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ['Total', stats.total],
            ['Completed', stats.completed],
            ['Requires review', stats.requiresReview],
            ['Blocked', stats.blocked],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-sm text-slate-400">
            Cargando historial...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-6 text-sm text-rose-200">
            {error}
          </div>
        ) : runs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-500">
            Aún no existen corridas registradas en esta sesión del backend.
          </div>
        ) : (
          <section className="grid gap-4">
            {runs.map((run) => {
              const summary =
                typeof run.final_output?.summary === 'string'
                  ? run.final_output.summary
                  : 'Sin resumen disponible.'

              return (
                <article
                  key={run.run_id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.28)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        {formatLabel(run.process_type)}
                      </p>
                      <h2 className="text-lg font-semibold text-white">{run.run_id}</h2>
                      <p className="max-w-4xl text-sm leading-6 text-slate-400">{summary}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <RunStatusBadge status={run.status} />
                      <span className="text-xs text-slate-500">{formatDate(run.created_at)}</span>
                      <Link
                        to={`/erp/finanzas/historial/${run.run_id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>
    </FinanceShell>
  )
}
