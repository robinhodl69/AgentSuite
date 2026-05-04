import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ModuleCatalog } from '../components/organisms/ModuleCatalog'
import { MetricStrip } from '../components/templates/MetricStrip'
import { PageIntro } from '../components/templates/PageIntro'
import { WorkspaceTemplate } from '../components/templates/WorkspaceTemplate'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { erpModules } from '../lib/mock-data/erpModules'

export function ErpPage() {
  const liveModules = erpModules.filter((m) => m.featured)
  const upcomingModules = erpModules.filter((m) => !m.featured)
  const quickAccess = liveModules.slice(0, 3)
  const primaryWorkspace = liveModules[0]

  return (
    <AppShell>
      <WorkspaceTemplate
        intro={
          <PageIntro
            eyebrow="Workspace home"
            title="ERP command center"
            description="Move between live agent workspaces, review what is ready to operate now, and keep planned modules visible as part of a coherent enterprise information architecture."
            chips={
              <>
                <Badge variant="success">{liveModules.length} live workspaces</Badge>
                <Badge variant="muted">{upcomingModules.length} planned surfaces</Badge>
                <Badge variant="info">Agentic ERP</Badge>
              </>
            }
            actions={
              <>
                <Link to={primaryWorkspace?.href ?? '/erp/mail'}>
                  <Button size="sm">Open Mail</Button>
                </Link>
                <Link to="/erp/integrations">
                  <Button variant="secondary" size="sm">
                    View integrations
                  </Button>
                </Link>
              </>
            }
          />
        }
        secondary={
          <>
            <Card padding="md" className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
                Quick access
              </p>
              <div className="space-y-2">
                {quickAccess.map((module) => (
                  <Link
                    key={module.slug}
                    to={module.href}
                    className="flex items-center justify-between rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2 text-xs text-[var(--as-text-secondary)] transition hover:border-[var(--as-border-strong)] hover:text-[var(--as-text-primary)]"
                  >
                    <span>{module.title}</span>
                    <span className="font-mono uppercase tracking-[0.12em]">{module.featured ? 'Open' : 'Plan'}</span>
                  </Link>
                ))}
              </div>
            </Card>
            <Card padding="md" className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
                Layout intent
              </p>
              <p className="text-xs leading-6 text-[var(--as-text-secondary)]">
                This home page acts as the ERP workspace launcher: live operations first, planned domains second, and quick navigation always visible.
              </p>
            </Card>
          </>
        }
      >
        <MetricStrip
          items={[
            { label: 'Live', value: liveModules.length, helper: 'Ready for real operation flows.' },
            { label: 'Planned', value: upcomingModules.length, helper: 'Visible in IA before implementation.' },
            {
              label: 'Primary workspace',
              value: primaryWorkspace?.title ?? 'Mail',
              helper: 'Mail-first intake for agent execution.',
            },
            { label: 'Navigation mode', value: 'Sidebar', helper: 'Persistent ERP shell.' },
          ]}
        />
        <ModuleCatalog
          title="Live"
          description="Operational surfaces already connected to real workflows, review output, and durable history."
          modules={liveModules}
          variant="live"
        />
        <ModuleCatalog
          title="Coming soon"
          description="Planned ERP workspaces already represented in navigation so IA and product scope can mature early."
          modules={upcomingModules}
          variant="upcoming"
        />
      </WorkspaceTemplate>
    </AppShell>
  )
}
