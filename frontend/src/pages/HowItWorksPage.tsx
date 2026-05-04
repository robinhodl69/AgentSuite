import { Link } from 'react-router-dom'
import { PublicSiteLayout } from '../components/layout/PublicSiteLayout'

const steps = [
  {
    num: '01',
    title: 'Capture the signal',
    desc: 'A request arrives from email, ERP records, banking events, CRM activity, or operational alerts.',
  },
  {
    num: '02',
    title: 'Classify the intent',
    desc: 'The agent detects what the message or event means, which module owns it, and how confident the routing should be.',
  },
  {
    num: '03',
    title: 'Prepare the workflow',
    desc: 'Inputs are normalized, policy checks are applied, and the system decides whether the case is auto-runnable or needs human review.',
  },
  {
    num: '04',
    title: 'Execute or escalate',
    desc: 'Standard cases run automatically. Exceptions are sent to the right person with context, recommendations, and missing data.',
  },
  {
    num: '05',
    title: 'Persist the audit',
    desc: 'Every action, approval, reply, and system decision becomes part of a durable operational trail.',
  },
]

export function HowItWorksPage() {
  return (
    <PublicSiteLayout>
      <section className="max-w-6xl mx-auto px-5 py-20 sm:px-6">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          How it works
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-5xl leading-[1.1]">
          From signal to execution, with agents in the loop.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
          AgentSuite is not just another dashboard. It is an execution system that ingests real-world business signals, classifies intent, runs the correct workflow, and preserves every decision in an auditable trail.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)]">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--as-accent)] font-mono">
                  {step.num}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--as-text-primary)]">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-[var(--as-text-secondary)]">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: 'Mail-first intake',
              desc: 'Use inbound email as a real operating surface. Agents read threads, detect intent, and suggest workflows before a user clicks anything.',
            },
            {
              title: 'Human-in-the-loop',
              desc: 'Approvals and exceptions are explicit. The system auto-runs standard cases and escalates policy edges with full context.',
            },
            {
              title: 'Durable execution',
              desc: 'Runs do not disappear in chats or inboxes. Inputs, outputs, approvals, and traces remain inspectable inside the ERP.',
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
            to="/book-demo"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4] px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-white"
          >
            Book demo
          </Link>
          <Link
            to="/use-cases"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-border-strong)] px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-[var(--as-text-secondary)] hover:text-[var(--as-text-primary)]"
          >
            Explore use cases
          </Link>
        </div>
      </section>
    </PublicSiteLayout>
  )
}
