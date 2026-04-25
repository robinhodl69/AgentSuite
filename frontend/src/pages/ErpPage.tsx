import { Link } from 'react-router-dom'
import { erpModules } from '../lib/mock-data/erpModules'

export function ErpPage() {
  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.72)] backdrop-blur-xl sm:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              AgentSuite / ERP
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Modulos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Selecciona un modulo para entrar a sus procesos y continuar desde ahi dentro del ERP.
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
                className="inline-flex min-h-10 items-center rounded-full px-4 transition hover:bg-slate-900 hover:text-white"
              >
                Integraciones
              </Link>
              <Link
                to="/erp"
                className="inline-flex min-h-10 items-center rounded-full bg-blue-600 px-4 font-semibold text-white transition hover:bg-blue-500"
              >
                App
              </Link>
            </nav>
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-8 md:grid-cols-2 xl:grid-cols-4">
          {erpModules.map((module) => (
            <article
              key={module.slug}
              className={`flex h-full flex-col rounded-3xl border p-6 ${
                module.featured
                  ? 'border-blue-400/20 bg-blue-400/10 shadow-[0_20px_60px_rgba(37,99,235,0.12)]'
                  : 'border-white/10 bg-slate-900/70'
              }`}
            >
              <div>
                <p className="text-xl font-semibold text-white">{module.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{module.description}</p>
              </div>

              <div className="mt-6">
                <Link
                  to={module.href}
                  className={`inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold text-white transition ${
                    module.featured
                      ? 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
                      : 'border border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  Entrar
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
