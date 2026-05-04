import { Link, Outlet } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ModuleSectionNav } from '../components/organisms/ModuleSectionNav'
import { MetricStrip } from '../components/templates/MetricStrip'
import { PageIntro } from '../components/templates/PageIntro'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const financeNavItems = [
  {
    label: 'Overview',
    description: 'Module orientation, work areas, and operating model.',
    to: '/erp/finance',
    end: true,
  },
  {
    label: 'Operations',
    description: 'Execute reconciliation, supplier payments, and budget control.',
    to: '/erp/finance/operations',
  },
  {
    label: 'History',
    description: 'Review runs and drill into durable audit detail.',
    to: '/erp/finance/history',
  },
]

export function FinanceModuleLayout() {
  return (
    <AppShell>
      <section className="space-y-6 lg:space-y-7">
        <PageIntro
          eyebrow="Finance module"
          title="Finance workspace"
          description="Use a stable module frame for treasury and accounting work: orient first, move into the right section, and keep execution history close to operations."
          chips={
            <>
              <Badge variant="info">Finance</Badge>
              <Badge variant="success">3 live processes</Badge>
              <Badge variant="muted">Overview + operations + history</Badge>
            </>
          }
          actions={
            <>
              <Link to="/erp/finance/operations">
                <Button size="sm">Open operations</Button>
              </Link>
              <Link to="/erp/finance/history">
                <Button variant="secondary" size="sm">
                  View history
                </Button>
              </Link>
            </>
          }
        />

        <MetricStrip
          items={[
            { label: 'Module mode', value: 'Operational', helper: 'Live execution plus durable history.' },
            { label: 'Processes', value: 3, helper: 'Reconciliation, payments, and budget control.' },
            { label: 'Work areas', value: 3, helper: 'Overview, operations, and history.' },
            { label: 'Layout pattern', value: 'Module frame', helper: 'Stable intro with subroutes below.' },
          ]}
        />

        <ModuleSectionNav items={financeNavItems} />

        <Outlet />
      </section>
    </AppShell>
  )
}
