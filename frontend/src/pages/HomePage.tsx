import { Link } from 'react-router-dom'
import { PublicSiteLayout } from '../components/layout/PublicSiteLayout'

/* ================================================================== */
/*  Icons — inline SVGs for the ecosystem grid                         */
/* ================================================================== */
const IconBanking = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>
)

const IconMail = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
)

const IconInvoice = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const IconCrm = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const IconEcommerce = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
)

const IconPayroll = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
  </svg>
)

const IconLogistics = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
)

const IconFactory = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v-.228a4.5 4.5 0 00-.12-1.03l-2.268-9.64a3.375 3.375 0 00-3.285-2.602H7.923a3.375 3.375 0 00-3.285 2.602l-2.268 9.64a4.5 4.5 0 00-.12 1.03v.228m19.5 0a3 3 0 01-3 3H5.25a3 3 0 01-3-3m19.5 0v.913a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 17.25v.913a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839-9.027l-3.558 1.918M9.806 20.91l3.558-1.918m-3.558 1.918l3.558 1.918m-3.558-1.918l-3.558-1.918" />
  </svg>
)

const IconData = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
  </svg>
)

const IconSign = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
)

const IconCompliance = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const IconKyc = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
)

const integrations = [
  { name: 'Banking & Payments', icon: <IconBanking /> },
  { name: 'Email & Communication', icon: <IconMail /> },
  { name: 'E-invoicing & Tax', icon: <IconInvoice /> },
  { name: 'CRM & Sales', icon: <IconCrm /> },
  { name: 'E-commerce & Marketplaces', icon: <IconEcommerce /> },
  { name: 'Payroll & HR', icon: <IconPayroll /> },
  { name: 'Logistics & Supply Chain', icon: <IconLogistics /> },
  { name: 'Production & IoT', icon: <IconFactory /> },
  { name: 'Data Warehouse & BI', icon: <IconData /> },
  { name: 'Electronic Signatures', icon: <IconSign /> },
  { name: 'Regulatory & Compliance', icon: <IconCompliance /> },
  { name: 'KYC / AML', icon: <IconKyc /> },
]

/* ================================================================== */
/*  Section 1 — Hero                                                   */
/* ================================================================== */
function HeroSection() {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] flex items-center px-5 py-16 sm:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
              The Agentic ERP
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-5xl leading-[1.1]">
              Your business processes, running themselves.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 text-[var(--as-text-secondary)]">
              AgentSuite is the next-generation ERP. AI agents execute financial, operational,
              and commercial workflows end-to-end — across your internal systems and external
              integrations — while your team focuses on decisions that matter.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/erp"
                className="group relative inline-flex min-h-10 items-center justify-center overflow-hidden rounded-[var(--as-radius-md)] bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4] px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-white shadow-[0_0_16px_rgba(59,130,246,0.25)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(59,130,246,0.45)]"
              >
                {/* Top sheen line */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-0 left-0 right-0 h-px z-[1] opacity-60"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  }}
                />
                <span className="relative z-10 flex items-center gap-1.5">
                  Open ERP
                  <svg
                    className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-border-strong)] bg-transparent px-5 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-[var(--as-text-secondary)] transition-all duration-200 hover:border-[var(--as-text-muted)] hover:text-[var(--as-text-primary)] hover:bg-[var(--as-bg-hover)]"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* Decorative terminal — enterprise credibility */}
          <div className="hidden lg:block">
            <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-4 font-mono text-[11px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[var(--as-text-secondary)]">run_rec_bnk_20260430_001</span>
                <span className="rounded-[var(--as-radius-sm)] border border-[var(--as-success)]/15 bg-[var(--as-success-subtle)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--as-success)]">
                  Completed
                </span>
              </div>
              <div className="space-y-1.5">
                {[
                  ['Ingest', 'Bank statement: 1,247 transactions'],
                  ['Normalize', 'Matched to invoices and POs'],
                  ['Analysis', '12 flagged for review'],
                  ['Policy', 'Auto-approved: $847K · Blocked: $23K'],
                  ['Action', 'Reconciled. Exceptions routed to controller.'],
                ].map(([stage, msg]) => (
                  <div key={stage} className="flex items-center gap-3">
                    <span className="w-16 text-[10px] uppercase tracking-[0.12em] text-[var(--as-text-secondary)]">{stage}</span>
                    <span className="text-[var(--as-text-muted)]">{msg}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 border-t border-[var(--as-border-default)] pt-2.5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--as-text-muted)] mb-1">Executive summary</p>
                <p className="text-[var(--as-text-secondary)] leading-4">
                  Daily reconciliation completed. $847K auto-matched. 12 exceptions flagged for human review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Section 2 — The Shift                                              */
/* ================================================================== */
function ShiftSection() {
  const columns = [
    {
      label: 'Legacy ERP',
      color: 'text-[var(--as-text-muted)]',
      items: [
        'Passive data storage. Processes wait for humans.',
        '18-month implementations. Months before any workflow runs.',
        'You adapt to the software.',
      ],
    },
    {
      label: 'RPA',
      color: 'text-[var(--as-text-muted)]',
      items: [
        'Fragile screen-scraping. Breaks on any UI change.',
        'High maintenance. One bot per screen, no context.',
        'Automates clicks, not decisions.',
      ],
    },
    {
      label: 'AgentSuite',
      color: 'text-[var(--as-text-primary)]',
      items: [
        'Active execution. Agents run workflows 24/7 in the background.',
        'Deploys in days. Adapts via policy, not code.',
        'Understands context, makes decisions, escalates exceptions.',
      ],
    },
  ]

  return (
    <section>
      <div className="max-w-5xl mx-auto px-5 py-24 sm:px-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          The next generation
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-3xl">
          From passive records to active execution.
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {columns.map((col) => {
            const isFeatured = col.label === 'AgentSuite'
            return (
              <div
                key={col.label}
                className={[
                  'rounded-[var(--as-radius-md)] border p-4 transition-all duration-200',
                  isFeatured
                    ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] shadow-[inset_0_1px_0_rgba(59,130,246,0.08)] hover:-translate-y-px hover:shadow-[inset_0_1px_0_rgba(59,130,246,0.12),0_4px_12px_rgba(0,0,0,0.2)]'
                    : 'border-[var(--as-border-subtle)] bg-[var(--as-bg-base)] opacity-70 hover:opacity-100 hover:border-[var(--as-border-default)]',
                ].join(' ')}
              >
                <p className={`text-[11px] font-medium uppercase tracking-[0.14em] font-mono mb-4 ${col.color}`}>
                  {col.label}
                </p>
                <ul className="space-y-3">
                  {col.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-5 text-[var(--as-text-secondary)]">
                      <span className={`mt-1.5 block h-1 w-1 rounded-full shrink-0 ${isFeatured ? 'bg-[var(--as-accent)]' : 'bg-[var(--as-border-strong)]'}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Section 3 — The Loop                                               */
/* ================================================================== */
function LoopSection() {
  const steps = [
    {
      num: '01',
      title: 'Ingest',
      desc: 'Agents consume structured and unstructured data from your ERP, banks, email, CRM, and e-commerce platforms.',
    },
    {
      num: '02',
      title: 'Evaluate',
      desc: 'AI analyzes inputs against business rules, policy thresholds, historical patterns, and real-time market data.',
    },
    {
      num: '03',
      title: 'Decide',
      desc: 'Auto-execute standard cases. Escalate exceptions to the right human with full context and recommendations.',
    },
    {
      num: '04',
      title: 'Execute',
      desc: 'Complete transactions, send payments, update records, notify stakeholders. Every action is auditable.',
    },
  ]

  return (
    <section>
      <div className="max-w-5xl mx-auto px-5 py-24 sm:px-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          How it works
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-3xl">
          Set the policy. Let agents run.
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-4 transition-all duration-200 hover:-translate-y-px hover:border-[var(--as-border-strong)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--as-border-strong)] bg-[var(--as-bg-secondary)] transition-colors group-hover:border-[var(--as-accent-border)]">
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--as-text-muted)] font-mono group-hover:text-[var(--as-accent)]">
                  {step.num}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[var(--as-text-primary)]">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--as-text-secondary)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Section 4 — Use Cases                                              */
/* ================================================================== */
function UseCasesSection() {
  const cases = [
    {
      title: 'Financial Close',
      desc: 'Agents reconcile bank statements, match invoices to payments, and generate payment batches — every morning, without manual intervention.',
    },
    {
      title: 'Procurement Intelligence',
      desc: 'Agents score vendors, monitor price deviations, and block out-of-policy purchases — running continuously in the background.',
    },
    {
      title: 'Revenue Operations',
      desc: 'Agents sync orders across channels, validate tax compliance, generate stamped invoices, and track collections — end to end.',
    },
    {
      title: 'Budget Guardrails',
      desc: 'Agents monitor spend in real time, block overruns before they happen, and alert stakeholders — so finance stays in control.',
    },
  ]

  return (
    <section>
      <div className="max-w-5xl mx-auto px-5 py-24 sm:px-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Use cases
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-3xl">
          Workflows that used to take hours, now run in minutes.
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {cases.map((c) => (
            <div
              key={c.title}
              className="group rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5 transition-all duration-200 hover:-translate-y-px hover:border-[var(--as-border-strong)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            >
              <h3 className="text-sm font-semibold text-[var(--as-text-primary)]">{c.title}</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--as-text-secondary)]">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Section 5 — Connected Ecosystem                                    */
/* ================================================================== */
function EcosystemSection() {
  return (
    <section>
      <div className="max-w-5xl mx-auto px-5 py-24 sm:px-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Connected ecosystem
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-3xl">
          Your agents speak every system.
        </h2>
        <p className="mt-2 max-w-xl text-xs leading-5 text-[var(--as-text-secondary)]">
          Agents do not live in a bubble. They operate across your entire technology stack — internal databases and external services alike.
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {integrations.map((item) => (
            <div
              key={item.name}
              className="group flex items-center gap-2.5 rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-2.5 text-[var(--as-text-secondary)] transition-all duration-200 hover:border-[var(--as-border-strong)] hover:bg-[var(--as-bg-hover)] hover:text-[var(--as-text-primary)]"
            >
              <span className="text-[var(--as-text-muted)] transition-colors group-hover:text-[var(--as-text-secondary)]">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Section 6 — Architecture                                           */
/* ================================================================== */
function ArchitectureSection() {
  const pillars = [
    {
      title: 'Agent-native architecture',
      desc: 'Legacy ERPs bolt AI onto 1990s databases. AgentSuite was designed for autonomous execution from day one.',
    },
    {
      title: 'Human-in-the-loop by design',
      desc: 'Agents execute standard cases and escalate exceptions to the right human. Every decision is auditable, traceable, and reversible.',
    },
    {
      title: 'Local-first, API-native',
      desc: 'Runs on your infrastructure. Connects via modern REST APIs and webhooks. No middleware spaghetti, no vendor lock-in.',
    },
  ]

  return (
    <section>
      <div className="max-w-5xl mx-auto px-5 py-24 sm:px-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Architecture
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-3xl">
          Built for agents. Not retrofitted.
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5 transition-all duration-200 hover:-translate-y-px hover:border-[var(--as-border-strong)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
            >
              <h3 className="text-sm font-semibold text-[var(--as-text-primary)]">{p.title}</h3>
              <p className="mt-2 text-xs leading-5 text-[var(--as-text-secondary)]">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  Section 7 — CTA                                                    */
/* ================================================================== */
function CTASection() {
  return (
    <section>
      <div className="max-w-5xl mx-auto px-5 py-28 sm:px-6 text-center">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
          Ready
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-4xl">
          Let your processes run themselves.
        </h2>
        <p className="mt-3 max-w-lg mx-auto text-sm leading-6 text-[var(--as-text-secondary)]">
          Deploy AgentSuite and turn your ERP into an active execution engine. Agents handle the routine. Your team drives the strategy.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/erp"
            className="group relative inline-flex min-h-10 items-center justify-center overflow-hidden rounded-[var(--as-radius-md)] bg-gradient-to-r from-[#1d4ed8] via-[#3b82f6] to-[#06b6d4] px-6 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-white shadow-[0_0_16px_rgba(59,130,246,0.25)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(59,130,246,0.45)]"
          >
            {/* Top sheen line */}
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-px z-[1] opacity-60"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              }}
            />
            <span className="relative z-10 flex items-center gap-1.5">
              Open ERP
              <svg
                className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          <Link
            to="/book-demo"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-border-strong)] bg-transparent px-6 py-2 text-sm font-semibold font-mono uppercase tracking-[0.12em] text-[var(--as-text-secondary)] transition-all duration-200 hover:border-[var(--as-text-muted)] hover:text-[var(--as-text-primary)] hover:bg-[var(--as-bg-hover)]"
          >
            Book demo
          </Link>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <PublicSiteLayout>
      <div>
        <HeroSection />
        <ShiftSection />
        <LoopSection />
        <UseCasesSection />
        <EcosystemSection />
        <ArchitectureSection />
        <CTASection />
      </div>
    </PublicSiteLayout>
  )
}

export { HomePage }
export default HomePage
