import { Link } from 'react-router-dom'

const integrations = [
  {
    name: 'Mail',
    description: 'Sincronizacion de correos operativos, notificaciones y aprobaciones por email.',
  },
  {
    name: 'Bancos',
    description: 'Conexion con cuentas bancarias para movimientos, saldos y conciliacion.',
  },
  {
    name: 'Bases de datos',
    description: 'Lectura y escritura segura hacia sistemas SQL y repositorios corporativos.',
  },
  {
    name: 'Facturacion',
    description: 'Integracion con emision de CFDI, timbrado y validacion fiscal.',
  },
  {
    name: 'CRM',
    description: 'Cruce de clientes, oportunidades y cuentas para procesos comerciales.',
  },
  {
    name: 'Storage',
    description: 'Acceso a documentos, reportes y respaldos en nubes empresariales.',
  },
] as const

export function IntegrationsPage() {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.72)] backdrop-blur-xl sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              AgentSuite / Integraciones
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Integraciones
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Posibles conexiones que un ERP agentico puede usar para integrarse con sistemas
              externos y operar procesos reales.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <Link
                to="/"
                className="inline-flex min-h-10 items-center rounded-full px-4 transition hover:bg-slate-900 hover:text-white"
              >
                Home
              </Link>
              <Link
                to="/integraciones"
                className="inline-flex min-h-10 items-center rounded-full bg-blue-600 px-4 font-semibold text-white transition hover:bg-blue-500"
              >
                Integraciones
              </Link>
              <Link
                to="/erp"
                className="inline-flex min-h-10 items-center rounded-full px-4 transition hover:bg-slate-900 hover:text-white"
              >
                App
              </Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {integrations.length} integraciones
              </div>
              <Link
                to="/"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                Volver al home
              </Link>
            </div>
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-8 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <article
              key={integration.name}
              className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/70 p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">{integration.name}</h2>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                  Mock
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">{integration.description}</p>
              <span className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                Coming soon
              </span>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
