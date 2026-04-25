import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

type FinanceShellProps = {
  title: string
  description: string
  children: ReactNode
  actions?: ReactNode
}

const navItemClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400',
    isActive
      ? 'border-sky-400/40 bg-sky-400/10 text-sky-200'
      : 'border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-500 hover:bg-slate-800',
  ].join(' ')

export function FinanceShell({ title, description, children, actions }: FinanceShellProps) {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.72)] backdrop-blur-xl sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                AgentSuite / ERP / Finanzas
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-slate-400">{description}</p>
            <div className="flex flex-wrap gap-2">
              <NavLink to="/erp/finanzas" end className={navItemClassName}>
                Operaciones
              </NavLink>
              <NavLink to="/erp/finanzas/historial" className={navItemClassName}>
                Historial
              </NavLink>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {actions}
            <Link
              to="/erp"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              Ver módulos
            </Link>
          </div>
        </header>

        <section className="py-8">{children}</section>
      </div>
    </main>
  )
}
