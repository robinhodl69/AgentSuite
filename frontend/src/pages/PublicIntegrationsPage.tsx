import { PublicSiteLayout } from '../components/layout/PublicSiteLayout'
import { useScrollDepth } from '../lib/useScrollDepth'

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

const networkNodes = [
  { title: 'Mail intake', subtitle: 'Requests · replies · approvals', left: '8%', top: '14%' },
  { title: 'Banking', subtitle: 'Statements · payments', left: '66%', top: '12%' },
  { title: 'Documents', subtitle: 'Invoices · contracts', left: '10%', top: '66%' },
]

const networkBeams = [
  { left: '26%', top: '24%', width: '26%', rotate: '14deg' },
  { left: '48%', top: '24%', width: '20%', rotate: '-16deg' },
  { left: '22%', top: '54%', width: '30%', rotate: '-10deg' },
  { left: '48%', top: '56%', width: '22%', rotate: '10deg' },
]

function IntegrationsMesh() {
  const scrollDepth = useScrollDepth(300)
  const stageShift = Math.min(scrollDepth * 0.05, 14)
  const nodeShift = Math.min(scrollDepth * 0.11, 28)
  const busShift = Math.min(scrollDepth * 0.08, 20)

  return (
    <div className="relative mx-auto w-full max-w-[34rem]" style={{ perspective: '1600px' }}>
      <div
        className="hero-depth-stage relative h-[28rem] w-full overflow-hidden rounded-[24px]"
        style={{ transform: `translate3d(0, ${stageShift}px, 0)` }}
      >
        <div
          className="hero-depth-grid"
          aria-hidden="true"
          style={{ transform: `rotateX(68deg) rotateZ(-10deg) translate3d(0, ${stageShift}px, -120px)` }}
        />

        {networkBeams.map((beam) => (
          <div
            key={`${beam.left}-${beam.top}`}
            className="hero-depth-beam"
            style={{ left: beam.left, top: beam.top, width: beam.width, transform: `rotate(${beam.rotate})` }}
          />
        ))}

        {networkNodes.map((node, index) => (
          <div
            key={node.title}
            className="absolute"
            style={{
              left: node.left,
              top: node.top,
              transform:
                index % 2 === 0
                  ? `rotateX(14deg) rotateY(-14deg) rotateZ(-4deg) translate3d(0, ${nodeShift}px, 80px)`
                  : `rotateX(12deg) rotateY(18deg) rotateZ(5deg) translate3d(0, ${nodeShift * 0.75}px, 90px)`,
            }}
          >
            <div className="hero-depth-panel w-36 p-3">
              <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--as-text-muted)]">
                {node.title}
              </div>
              <div className="mt-2 text-xs leading-5 text-[var(--as-text-secondary)]">{node.subtitle}</div>
            </div>
          </div>
        ))}

        <span className="hero-depth-node" style={{ left: '45%', top: '42%' }} />
        <span className="hero-depth-node" style={{ left: '22%', top: '30%' }} />
        <span className="hero-depth-node" style={{ right: '24%', top: '26%' }} />
        <span className="hero-depth-node" style={{ left: '27%', bottom: '27%' }} />

        <div
          className="hero-depth-panel absolute left-[24%] top-[34%] w-[42%] p-4"
          style={{ transform: `rotateX(16deg) rotateY(2deg) rotateZ(-2deg) translate3d(0, ${busShift}px, 116px)` }}
        >
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--as-accent)]">Agent orchestration</div>
          <div className="mt-2 text-lg font-semibold text-[var(--as-text-primary)]">ERP action bus</div>
          <p className="mt-2 text-xs leading-5 text-[var(--as-text-secondary)]">
            Mail triggers the workflow. Agents evaluate intent, call downstream connectors, and synchronize results back into the operating system.
          </p>
        </div>
      </div>
    </div>
  )
}

export function PublicIntegrationsPage() {
  return (
    <PublicSiteLayout>
      <section className="max-w-6xl mx-auto px-5 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--as-accent)] font-mono">
              Integrations
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--as-text-primary)] sm:text-5xl leading-[1.1]">
              Agents need to speak every system you already use.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--as-text-secondary)]">
              The platform is designed around real business signals coming from inboxes, banking systems, ERP records, and operational tools. Mail is the primary intake surface, but the workflow becomes valuable only when every downstream system can participate.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                ['Mail first', 'Starts from real inbound work'],
                ['Policy aware', 'Executes with thresholds and approvals'],
                ['Bidirectional', 'Writes back to source systems'],
              ].map(([title, subtitle]) => (
                <div
                  key={title}
                  className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[rgba(255,255,255,0.02)] p-4"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--as-text-primary)]">
                    {title}
                  </div>
                  <div className="mt-2 text-xs leading-5 text-[var(--as-text-secondary)]">{subtitle}</div>
                </div>
              ))}
            </div>
          </div>

          <IntegrationsMesh />
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {groups.map((group) => (
            <div
              key={group}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] p-5 transition-transform duration-200 hover:-translate-y-1"
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
