import { Link } from 'react-router-dom'
import { PublicSiteLayout } from '../components/layout/PublicSiteLayout'

const useCases = [
  {
    title: 'Finance operations',
    desc: 'Reconciliation, supplier payment evaluation, approvals, and budget control with durable history and explicit escalation.',
  },
  {
    title: 'Mail-driven execution',
    desc: 'Inbound requests become agent-ready workflows instead of getting trapped in shared inboxes and manual forwarding chains.',
  },
  {
    title: 'Procurement intelligence',
    desc: 'Vendor evaluation, sourcing decisions, and purchase exceptions routed with policy context and approval posture.',
  },
  {
    title: 'Revenue operations',
    desc: 'Orders, quotes, invoicing, and follow-up signals coordinated across CRM, commerce, and tax systems.',
  },
  {
    title: 'Budget guardrails',
    desc: 'Agents monitor spend in real time, identify policy breaches, and stop overruns before they happen.',
  },
  {
    title: 'Cross-module tasking',
    desc: 'When a workflow cannot auto-run, create the next task with context, owner, and audit trace already attached.',
  },
]

export function UseCasesPage() {
  return (
    <PublicSiteLayout>
      <section className="max-w-6xl mx-auto px-5 py-20 sm:px-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Use cases
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-5xl leading-[1.1]">
          Real workflows that agents can actually operate.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
          AgentSuite is designed for business processes that combine structured data, unstructured requests, approvals, and traceability — the exact workflows that usually fall between ERP screens and inbox threads.
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {useCases.map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5"
            >
              <h3 className="text-sm font-semibold text-[var(--as-text-primary)]">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--as-text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[var(--as-radius-md)] border border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
            Product direction
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
            The product is strongest when the signal enters through Mail, the workflow runs in the right module, and the exception lands in the correct approval or task queue without losing context.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/how-it-works"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-border-strong)] px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-[var(--as-text-secondary)] hover:text-[var(--as-text-primary)]"
          >
            See the execution loop
          </Link>
          <Link
            to="/book-demo"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4] px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-white"
          >
            Book demo
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  )
}
