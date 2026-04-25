import { Link } from 'react-router-dom'
import { FinanceDashboard } from '../components/finance/FinanceDashboard'
import { FinanceShell } from '../components/finance/FinanceShell'

export function FinancePage() {
  return (
    <FinanceShell
      title="Consola financiera agéntica"
      description="Opera los procesos financieros del agente, observa su avance en tiempo real y revisa el output generado por cada corrida."
      actions={
        <Link
          to="/erp/finanzas/historial"
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          Ver historial
        </Link>
      }
    >
      <FinanceDashboard />
    </FinanceShell>
  )
}
