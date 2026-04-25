import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <main className="relative h-screen overflow-hidden px-6 py-5 text-slate-100">
      <div className="absolute inset-0">
        <div className="home-gradient" aria-hidden="true" />
        <div className="home-orb home-orb-blue" aria-hidden="true" />
        <div className="home-orb home-orb-violet" aria-hidden="true" />
        <div className="home-orb home-orb-cyan" aria-hidden="true" />
        <div className="home-noise" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col rounded-[32px] border border-white/10 bg-slate-950/42 p-6 shadow-[0_40px_120px_rgba(2,6,23,0.72)] backdrop-blur-xl sm:p-8">
        <nav className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            AgentSuite
          </Link>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <a
              href="https://github.com/robinhodl69/AgentSuite"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center rounded-full px-4 transition hover:bg-slate-900 hover:text-white"
            >
              GitHub
            </a>
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
          </div>
        </nav>

        <section className="flex flex-1 items-center justify-center">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              ERP Agentico.
            </h1>

            <h2
              id="como-funciona"
              className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-300 sm:text-xl"
            >
              Agentes IA para tus procesos de negocio.
            </h2>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/robinhodl69/AgentSuite"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
              >
                GitHub
              </a>
              <Link
                to="/erp"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                App
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export { HomePage }
export default HomePage
