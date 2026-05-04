import { Alert, Typography } from 'antd'
import { Link } from 'react-router-dom'
import type { ModuleDefinition, ModuleState } from '../finance/financeDashboardModel'
import { ExecutionTimeline, RunOutputPanel } from '../finance/RunPresentation'
import type { ExecutionLogEntry } from '../finance/runPresentationUtils'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

type FinanceWorkbenchProps = {
  activeModuleDefinition: ModuleDefinition
  activeState: ModuleState
  activeInputSummary: string
  latestRunLabel: string
  renderActiveActions: () => React.ReactNode
  renderActiveForm: () => React.ReactNode
  renderOperatorHint: () => string
  onRefreshAudit: () => void
  progressLogs: ExecutionLogEntry[]
  timelineLoading?: boolean
  timelineEmptyMessage?: string
  error?: string | null
}

export function FinanceWorkbench({
  activeModuleDefinition,
  activeState,
  activeInputSummary,
  latestRunLabel,
  renderActiveActions,
  renderActiveForm,
  renderOperatorHint,
  onRefreshAudit,
  progressLogs,
  timelineLoading,
  timelineEmptyMessage,
  error,
}: FinanceWorkbenchProps) {
  return (
    <section className="space-y-4">
      <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
              Selected process
            </Typography.Text>
            <Typography.Title level={4} className="!mb-0 !text-[var(--as-text-primary)]">
              {activeModuleDefinition.title}
            </Typography.Title>
            <Typography.Paragraph className="!mb-0 !max-w-3xl !text-xs !leading-6 !text-[var(--as-text-secondary)]">
              {activeModuleDefinition.description}
            </Typography.Paragraph>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefreshAudit}
              disabled={!activeState.run || activeState.auditLoading}
              isLoading={activeState.auditLoading}
            >
              Refresh audit
            </Button>
            {activeState.run ? (
              <Link to={`/erp/finance/history/${activeState.run.run_id}`}>
                <Button variant="secondary" size="sm">
                  View full detail
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {[
            { label: 'Current input set', value: activeInputSummary },
            { label: 'Workspace permission', value: activeModuleDefinition.permissionLabel },
            { label: 'Last run', value: latestRunLabel },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-3 py-3"
            >
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--as-text-muted)]">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--as-text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1.05fr)_420px]">
        <div className="space-y-4">
          <Card padding="md" className="space-y-3 bg-[var(--as-bg-secondary)]">
            <div className="flex flex-wrap gap-2">{renderActiveActions()}</div>
            <Typography.Paragraph className="!mb-0 !text-xs !leading-5 !text-[var(--as-text-muted)]">
              {renderOperatorHint()}
            </Typography.Paragraph>
          </Card>

          {renderActiveForm()}

          <ExecutionTimeline
            logs={progressLogs}
            loading={timelineLoading}
            emptyMessage={timelineEmptyMessage ?? 'No execution trace yet.'}
          />

          {error ? <Alert type="error" showIcon message="Process error" description={error} /> : null}
        </div>

        <div className="space-y-3 xl:sticky xl:top-6 xl:self-start">
          <RunOutputPanel
            run={activeState.run}
            audit={activeState.audit}
            emptyMessage="Pick a process, prepare its inputs, and run it to review the output, decisions, and audit trail."
          />
        </div>
      </div>
    </section>
  )
}
