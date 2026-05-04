import { PublicSiteLayout } from '../components/layout/PublicSiteLayout'

const pillars = [
  {
    title: 'Human-in-the-loop by design',
    desc: 'Agents do not silently bypass policy. Standard cases auto-run; exceptions pause for review, approval, or missing context.',
  },
  {
    title: 'Durable audit trail',
    desc: 'Every execution keeps the input, decision path, output, and status so users can inspect what happened after the run.',
  },
  {
    title: 'Permission-aware workflows',
    desc: 'Operational surfaces can reflect role boundaries, so treasury, accounting, and approvers do not share the same execution rights.',
  },
  {
    title: 'Local-first deployment posture',
    desc: 'The product is designed to integrate with enterprise systems while keeping infrastructure, APIs, and workflows under customer control.',
  },
]

export function SecurityPage() {
  return (
    <PublicSiteLayout>
      <section className="max-w-6xl mx-auto px-5 py-20 sm:px-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Security
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-5xl leading-[1.1]">
          Built for controlled execution, not blind automation.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
          AgentSuite is designed so teams can automate real workflows without losing governance. The product should make action faster, but never less inspectable.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5"
            >
              <h3 className="text-sm font-semibold text-[var(--as-text-primary)]">{pillar.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--as-text-secondary)]">{pillar.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            'Approval checkpoints for policy-sensitive actions',
            'Traceability from inbox signal to final workflow output',
            'Operational segregation by role and module boundary',
          ].map((item) => (
            <div
              key={item}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5 text-xs leading-6 text-[var(--as-text-secondary)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </PublicSiteLayout>
  )
}
