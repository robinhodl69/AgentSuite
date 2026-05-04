import { PublicSiteLayout } from '../components/layout/PublicSiteLayout'

const groups = [
  'Email & communication',
  'Banking & payments',
  'ERP & databases',
  'CRM & sales',
  'Invoicing & tax',
  'Storage & documents',
  'HR & payroll',
  'Compliance & identity',
]

export function PublicIntegrationsPage() {
  return (
    <PublicSiteLayout>
      <section className="max-w-6xl mx-auto px-5 py-20 sm:px-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Integrations
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-5xl leading-[1.1]">
          Agents need to speak every system you already use.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
          The platform is designed around real business signals coming from inboxes, banking systems, ERP records, and operational tools. Mail is the primary intake surface, but the workflow becomes valuable only when every downstream system can participate.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map((group) => (
            <div
              key={group}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5"
            >
              <h3 className="text-sm font-semibold text-[var(--as-text-primary)]">{group}</h3>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[var(--as-radius-md)] border border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
            Mail-first model
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
            The inbox is the best entry point for agent workflows because requests, approvals, exceptions, and replies already happen there. The role of integrations is to turn that inbound signal into real action across the ERP stack.
          </p>
        </div>
      </section>
    </PublicSiteLayout>
  )
}
