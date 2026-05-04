import { Link } from 'react-router-dom'
import { ModuleSectionIntro } from '../components/templates/ModuleSectionIntro'
import { WorkspaceTemplate } from '../components/templates/WorkspaceTemplate'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { moduleDefinitions } from '../components/finance/financeDashboardModel'

export function FinanceOverviewPage() {
  return (
    <WorkspaceTemplate
      intro={
        <ModuleSectionIntro
          eyebrow="Finance overview"
          title="Choose the right work area first"
          description="Keep module orientation separate from execution. Use overview to understand the Finance operating model, then move into operations or history with a clear task in mind."
        />
      }
      secondary={
        <>
          <Card padding="md" className="space-y-3">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
              Structure intent
            </p>
            <div className="space-y-2 text-xs text-[var(--as-text-secondary)]">
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
                Overview explains the module before any process form appears.
              </div>
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
                Operations stays focused on inputs, execution, and output.
              </div>
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2">
                History and detail stay together as the review surface.
              </div>
            </div>
          </Card>
          <Card padding="md" className="space-y-3">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
              Recommended path
            </p>
            <p className="text-xs leading-6 text-[var(--as-text-secondary)]">
              Start in Operations when you need to run a process now. Move to History when you need audit, comparison, or post-run review.
            </p>
          </Card>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Card padding="lg" className="space-y-4 bg-[var(--as-bg-secondary)]">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
              Primary work area
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--as-text-primary)]">Operations workbench</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--as-text-secondary)]">
              Run live Finance processes with explicit inputs, execution trace, and output review.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Execution</Badge>
            <Badge variant="muted">Inputs + output</Badge>
            <Badge variant="muted">Agent-assisted</Badge>
          </div>
          <Link to="/erp/finance/operations">
            <Button size="sm">Open operations</Button>
          </Link>
        </Card>

        <Card padding="lg" className="space-y-4 bg-[var(--as-bg-secondary)]">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
              Review work area
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--as-text-primary)]">History and run detail</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--as-text-secondary)]">
              Inspect stored runs, filter execution posture, and open durable run detail without mixing that flow into daily operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Review</Badge>
            <Badge variant="muted">Run list</Badge>
            <Badge variant="muted">Audit detail</Badge>
          </div>
          <Link to="/erp/finance/history">
            <Button variant="secondary" size="sm">Open history</Button>
          </Link>
        </Card>
      </div>

      <section className="space-y-4">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
            Finance processes
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--as-text-secondary)]">
            The module still supports multiple process types, but they now live under a clearer module structure.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {moduleDefinitions.map((module) => (
            <Card key={module.key} padding="md" className="space-y-3">
              <div>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
                  {module.eyebrow}
                </p>
                <h3 className="mt-2 text-base font-semibold text-[var(--as-text-primary)]">{module.title}</h3>
                <p className="mt-2 text-xs leading-6 text-[var(--as-text-secondary)]">{module.description}</p>
              </div>
              <div className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2 text-xs text-[var(--as-text-secondary)]">
                Access policy: {module.permissionLabel}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </WorkspaceTemplate>
  )
}
