import { AppShell } from '../components/layout/AppShell'
import { IntegrationCatalog } from '../components/organisms/IntegrationCatalog'
import { MetricStrip } from '../components/templates/MetricStrip'
import { PageIntro } from '../components/templates/PageIntro'
import { WorkspaceTemplate } from '../components/templates/WorkspaceTemplate'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

const integrations = [
  {
    name: 'Mail',
    description: 'Operational email sync, notifications, and email-based approvals.',
  },
  {
    name: 'Banks',
    description: 'Bank account connection for movements, balances, and reconciliation.',
  },
  {
    name: 'Databases',
    description: 'Secure read/write to SQL systems and corporate repositories.',
  },
  {
    name: 'Invoicing',
    description: 'Integration with CFDI issuance, stamping, and tax validation.',
  },
  {
    name: 'CRM',
    description: 'Cross-reference of customers, opportunities, and accounts for commercial processes.',
  },
  {
    name: 'Storage',
    description: 'Access to documents, reports, and backups in enterprise clouds.',
  },
] as const

export function IntegrationsPage() {
  return (
    <AppShell>
      <WorkspaceTemplate
        intro={
          <PageIntro
            eyebrow="Control center"
            title="Integrations workspace"
            description="Track the external systems the ERP will use to read data, trigger actions, and connect durable enterprise processes."
            chips={
              <>
                <Badge variant="muted">{integrations.length} connectors</Badge>
                <Badge variant="default">All mock</Badge>
                <Badge variant="success">Mail-first</Badge>
                <Badge variant="info">Control center layout</Badge>
              </>
            }
          />
        }
        secondary={
          <Card padding="md" className="space-y-3">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
              Readiness posture
            </p>
            <div className="space-y-2 text-xs text-[var(--as-text-secondary)]">
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
                Email is the primary connector because inbound mail can become the main trigger for agent workflows.
              </div>
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
                Next step: add mailbox readiness state, credentials, rules, and permission scope per connector.
              </div>
            </div>
          </Card>
        }
      >
        <MetricStrip
          items={[
            { label: 'Connectors', value: integrations.length },
            { label: 'Operational status', value: 'Mock' },
            { label: 'Primary domain', value: 'Mail' },
            { label: 'Model', value: 'Control center' },
          ]}
        />
        <IntegrationCatalog integrations={integrations} />
      </WorkspaceTemplate>
    </AppShell>
  )
}
