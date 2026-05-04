import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { MetricStrip } from '../components/templates/MetricStrip'
import { PageIntro } from '../components/templates/PageIntro'
import { WorkspaceTemplate } from '../components/templates/WorkspaceTemplate'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function CreateTaskPage() {
  return (
    <AppShell>
      <WorkspaceTemplate
        intro={
          <PageIntro
            eyebrow="Task orchestration"
            title="Create task"
            description="Create cross-module tasks that can later become approvals, follow-ups, assignments, or agent-triggered work across the ERP."
            chips={
              <>
                <Badge variant="info">Cross-module</Badge>
                <Badge variant="muted">Task intake</Badge>
                <Badge variant="warning">Planned workspace</Badge>
              </>
            }
            actions={
              <Link to="/erp">
                <Button variant="secondary" size="sm">
                  Back to ERP
                </Button>
              </Link>
            }
          />
        }
        secondary={
          <>
            <Card padding="md" className="space-y-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
                Why it matters
              </p>
              <p className="text-xs leading-6 text-[var(--as-text-secondary)]">
                ERP users need a fast way to create operational follow-up work without jumping between modules first.
              </p>
            </Card>
            <Card padding="md" className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
                Future evolution
              </p>
              <p className="text-xs leading-6 text-[var(--as-text-secondary)]">
                This should later connect to approvals, assignments, due dates, and inbox-driven workflows.
              </p>
            </Card>
          </>
        }
      >
        <MetricStrip
          items={[
            { label: 'Scope', value: 'ERP-wide', helper: 'Not tied to one module only.' },
            { label: 'Mode', value: 'Planned', helper: 'Placeholder for upcoming workflow capture.' },
            { label: 'Primary user', value: 'Operator', helper: 'Create work from day-to-day activity.' },
            { label: 'Target', value: 'Inbox', helper: 'Should eventually feed approvals and assignments.' },
          ]}
        />

        <Card padding="lg" className="space-y-4 bg-[var(--as-bg-secondary)]">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)] font-mono">
              Planned capability
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--as-text-primary)]">
              Universal task intake for ERP users
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--as-text-secondary)]">
              This workspace is now represented in navigation so the ERP already reserves a clear place for task capture, assignment, and follow-up workflows.
            </p>
          </div>
        </Card>
      </WorkspaceTemplate>
    </AppShell>
  )
}
