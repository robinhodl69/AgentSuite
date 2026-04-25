import { Link, Navigate } from 'react-router-dom'
import { getErpModule, type ErpModule } from '../lib/mock-data/erpModules'

type ModulePreviewPageProps = {
  moduleSlug: Exclude<ErpModule['slug'], 'finanzas'>
}

export function ModulePreviewPage({ moduleSlug }: ModulePreviewPageProps) {
  const module = getErpModule(moduleSlug)

  if (!module || !module.processes?.length) {
    return <Navigate to="/erp" replace />
  }

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col rounded-[32px] border border-white/10 bg-slate-950/60 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.72)] backdrop-blur-xl sm:p-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              AgentSuite / ERP / {module.title}
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Mockup del modulo {module.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              Preview
            </div>
            <Link
              to="/erp"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            >
              Ver modulos
            </Link>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-300">
                Proxima superficie
              </p>
              <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-white">
                {module.title} tendra sus procesos listos dentro del ERP.
              </h2>
              <p className="max-w-xl text-lg leading-8 text-slate-300">{module.description}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Estado del modulo
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Esta vista funciona como mockup navegable para validar la experiencia del ERP antes
                de conectar procesos reales.
              </p>
              <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                Coming soon
              </span>
            </div>
          </div>

          <section className="grid gap-4">
            {module.processes.map((process, index) => (
              <article
                key={process}
                className="rounded-3xl border border-white/10 bg-slate-900/70 p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-lg font-semibold text-white">{process}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">
                    Mock {index + 1}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Vista simulada para validar la navegacion del modulo y la estructura de procesos
                  que despues conectaremos al backend y a los agentes.
                </p>
                <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Coming soon
                </span>
              </article>
            ))}
          </section>
        </section>
      </div>
    </main>
  )
}
