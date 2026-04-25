import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  approveSupplierPayments,
  type AgentRunRecord,
  checkAgentHealth,
  evaluateSupplierPayments,
  getAudit,
  runBudgetControl,
  runReconciliation,
  type AuditEvent,
} from '../../lib/api/agent'
import {
  budgetControlDemoRequest,
  reconciliationDemoRequest,
  supplierPaymentsApproveDemoRequest,
  supplierPaymentsEvaluateDemoRequest,
} from '../../lib/mock-data/agentDemoPayloads'
import {
  advanceProgressLogs,
  buildInitialProgressLogs,
  ExecutionTimeline,
  failProgressLogs,
  finalizeProgressLogs,
  formatDate,
  formatLabel,
  mapAuditToLogs,
  RunOutputPanel,
  RunStatusBadge,
  statusStyles,
  type ExecutionLogEntry,
} from './RunPresentation'

type ModuleKey = 'reconciliation' | 'supplierPayments' | 'budgetControl'

type ModuleState = {
  run: AgentRunRecord | null
  audit: AuditEvent[] | null
  progressLogs: ExecutionLogEntry[]
  loading: boolean
  auditLoading: boolean
  error: string | null
}

const initialModuleState: Record<ModuleKey, ModuleState> = {
  reconciliation: { run: null, audit: null, progressLogs: [], loading: false, auditLoading: false, error: null },
  supplierPayments: { run: null, audit: null, progressLogs: [], loading: false, auditLoading: false, error: null },
  budgetControl: { run: null, audit: null, progressLogs: [], loading: false, auditLoading: false, error: null },
}

export function FinanceDashboard() {
  const [modules, setModules] = useState(initialModuleState)
  const [activeModuleKey, setActiveModuleKey] = useState<ModuleKey>('supplierPayments')
  const [agentStatus, setAgentStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [agentError, setAgentError] = useState<string | null>(null)
  const executionTimers = useRef<Partial<Record<ModuleKey, number>>>({})

  useEffect(() => {
    void checkAgentHealth()
      .then(() => {
        setAgentStatus('online')
      })
      .catch((error: unknown) => {
        setAgentStatus('offline')
        setAgentError(error instanceof Error ? error.message : 'No fue posible conectar con el agente.')
      })
  }, [])

  useEffect(() => () => {
    Object.values(executionTimers.current).forEach((timerId) => {
      if (timerId) {
        window.clearInterval(timerId)
      }
    })
  }, [])

  const moduleDefinitions = [
    {
      key: 'reconciliation' as const,
      eyebrow: 'Conciliación bancaria',
      title: 'Cruce inteligente de extracto contra ventas y gastos',
      description:
        'Ejecuta la corrida de conciliación demo y devuelve conciliados, movimientos no contabilizados y registros sin respaldo bancario.',
      primaryLabel: 'Ejecutar conciliación',
      execute: () => runReconciliation(reconciliationDemoRequest),
    },
    {
      key: 'supplierPayments' as const,
      eyebrow: 'Pagos a proveedores',
      title: 'Evaluación de descuentos y liberación de pago',
      description:
        'Evalúa facturas estratégicas con descuento por pronto pago y luego permite liberar un pago real en Monad testnet con la corrida demo.',
      primaryLabel: 'Evaluar facturas',
      secondaryLabel: 'Ejecutar pago',
      execute: () => evaluateSupplierPayments(supplierPaymentsEvaluateDemoRequest),
      secondaryExecute: () => approveSupplierPayments(supplierPaymentsApproveDemoRequest),
    },
    {
      key: 'budgetControl' as const,
      eyebrow: 'Control presupuestal',
      title: 'Monitoreo operativo contra presupuesto mensual',
      description:
        'Lanza el control demo de gastos y expone alertas preventivas o bloqueos según el consumo y la proyección.',
      primaryLabel: 'Ejecutar control',
      execute: () => runBudgetControl(budgetControlDemoRequest),
    },
  ]

  const activeModuleDefinition =
    moduleDefinitions.find((module) => module.key === activeModuleKey) ?? moduleDefinitions[0]
  const activeState = modules[activeModuleKey]

  const latestRun = useMemo(() => {
    return Object.values(modules)
      .map((module) => module.run)
      .filter((run): run is AgentRunRecord => Boolean(run))
      .sort((left, right) => Date.parse(right.created_at) - Date.parse(left.created_at))[0] ?? null
  }, [modules])

  function clearExecutionTimer(key: ModuleKey) {
    const timerId = executionTimers.current[key]
    if (timerId) {
      window.clearInterval(timerId)
      delete executionTimers.current[key]
    }
  }

  async function runModule(key: ModuleKey, executor: () => Promise<AgentRunRecord>) {
    clearExecutionTimer(key)
    setActiveModuleKey(key)

    setModules((current) => ({
      ...current,
      [key]: {
        ...current[key],
        loading: true,
        error: null,
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
          progressLogs: auditLogs.length ? auditLogs : finalizeProgressLogs(current[key].progressLogs),
          loading: false,
          error: null,
        },
      }))
    } catch (error) {
      clearExecutionTimer(key)
      const message = error instanceof Error ? error.message : 'La corrida falló.'

      setModules((current) => ({
        ...current,
        [key]: {
          ...current[key],
          loading: false,
          error: message,
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
          error: error instanceof Error ? error.message : 'No fue posible cargar la auditoría.',
        },
      }))
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusStyles(
              agentStatus === 'online' ? 'online' : null,
            )}`}
          >
            {agentStatus === 'checking'
              ? 'Verificando agente'
              : agentStatus === 'online'
                ? 'Online'
                : 'Agente no disponible'}
          </span>
          {latestRun ? (
            <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Última corrida:
              {' '}
              {formatLabel(latestRun.process_type)}
            </span>
          ) : null}
        </div>

        {agentError ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            No se pudo validar el agente local. Revisa que esté corriendo en
            {' '}
            <code className="rounded bg-slate-900 px-2 py-1 text-slate-100">http://127.0.0.1:8001</code>
            .
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-3">
          {moduleDefinitions.map((module) => {
            const state = modules[module.key]
            const isSelected = activeModuleKey === module.key

            return (
              <article
                key={module.key}
                className={[
                  'rounded-2xl border p-5 shadow-[0_18px_40px_rgba(2,6,23,0.28)] transition',
                  isSelected
                    ? 'border-sky-400/30 bg-slate-900'
                    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => setActiveModuleKey(module.key)}
                  className="w-full text-left"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    {module.eyebrow}
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-white">{module.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{module.description}</p>
                </button>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <RunStatusBadge status={state.run?.status ?? null} loading={state.loading} />
                  {state.run ? <span className="text-xs text-slate-500">{formatDate(state.run.created_at)}</span> : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void runModule(module.key, module.execute)}
                    disabled={state.loading}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {state.loading ? 'Ejecutando...' : module.primaryLabel}
                  </button>

                  {'secondaryExecute' in module && module.secondaryExecute ? (
                    <button
                      type="button"
                      onClick={() => void runModule(module.key, module.secondaryExecute)}
                      disabled={state.loading}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {module.secondaryLabel}
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Proceso seleccionado
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">{activeModuleDefinition.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">{activeModuleDefinition.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void loadAudit(activeModuleKey)}
                  disabled={!activeState.run || activeState.auditLoading}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activeState.auditLoading ? 'Actualizando...' : 'Refrescar auditoría'}
                </button>
                {activeState.run ? (
                  <Link
                    to={`/erp/finanzas/historial/${activeState.run.run_id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                  >
                    Ver detalle completo
                  </Link>
                ) : null}
              </div>
            </div>

            {activeState.run ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Run ID</p>
                  <p className="mt-2 break-all text-sm text-slate-200">{activeState.run.run_id}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Proceso</p>
                  <p className="mt-2 text-sm text-slate-200">{formatLabel(activeState.run.process_type)}</p>
                </div>
              </div>
            ) : null}
          </div>

          <ExecutionTimeline
            logs={activeState.progressLogs}
            loading={activeState.loading}
            emptyMessage="Ejecuta alguno de los procesos para ver su timeline en tiempo real."
          />

          {activeState.error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {activeState.error}
            </div>
          ) : null}
        </div>

        <RunOutputPanel
          run={activeState.run}
          audit={activeState.audit}
          emptyMessage="Selecciona un proceso y ejecútalo para ver aquí el output completo, la auditoría y el resultado estructurado."
        />
      </section>
    </div>
  )
}
