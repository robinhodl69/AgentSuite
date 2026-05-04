import { Link } from 'react-router-dom'
import { PublicSiteLayout } from '../components/layout/PublicSiteLayout'

export function BookDemoPage() {
  return (
    <PublicSiteLayout>
      <section className="max-w-6xl mx-auto px-5 py-20 sm:px-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Book demo
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-5xl leading-[1.1]">
          See how AgentSuite turns inboxes and workflows into execution.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
          This page is the starting point for a real demo flow. It is ready to become the public handoff into scheduling, sales qualification, or onboarding.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: 'What we show',
              desc: 'Mail intake, workflow routing, approvals, Finance execution, and durable audit surfaces.',
            },
            {
              title: 'Who it is for',
              desc: 'Operators, finance leaders, founders, and teams replacing manual inbox-to-ERP coordination.',
            },
            {
              title: 'Expected outcome',
              desc: 'A concrete view of how the product fits your existing systems, controls, and workflow boundaries.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5"
            >
              <h3 className="text-sm font-semibold text-[var(--as-text-primary)]">{item.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--as-text-secondary)]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/how-it-works"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4] px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-white"
          >
            See product flow
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-border-strong)] px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-[var(--as-text-secondary)] hover:text-[var(--as-text-primary)]"
          >
            Login
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  )
}
