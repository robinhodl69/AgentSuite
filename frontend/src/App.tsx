function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-20">
        <div className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1 text-sm font-medium text-emerald-300">
          AgentSuite dev environment ready
        </div>

        <div className="max-w-4xl space-y-6">
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            IA financiera para operaciones empresariales, con Monad bajo el capot.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            El frontend quedó preparado con React, Vite, Tailwind y ethers.js para construir una
            experiencia fintech estilo ERP donde el usuario nunca ve wallets ni gas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-medium text-sky-300">Frontend</p>
            <h2 className="mt-3 text-xl font-semibold text-white">React + Vite + Tailwind</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Base lista para dashboards, conciliaciones y flujos tipo QuickBooks.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-medium text-fuchsia-300">Backend</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Python + LangGraph</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Estructura lista para agentes y skills en Markdown dentro de agent/skills.
            </p>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-sm font-medium text-amber-300">Blockchain</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Monad testnet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Red configurada con chain ID 10143 y RPC pública para demos verificables.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default App
