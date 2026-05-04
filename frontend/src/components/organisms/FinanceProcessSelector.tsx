import { Segmented, Typography } from 'antd'
import type { ModuleDefinition, ModuleKey, ModuleState } from '../finance/financeDashboardModel'
import { Card } from '../ui/Card'
import { RunStatusBadge } from '../finance/RunPresentation'
import { formatDate } from '../finance/runPresentationUtils'

type FinanceProcessSelectorProps = {
  moduleDefinitions: ModuleDefinition[]
  modules: Record<ModuleKey, ModuleState>
  activeModuleKey: ModuleKey
  onChange: (key: ModuleKey) => void
}

export function FinanceProcessSelector({
  moduleDefinitions,
  modules,
  activeModuleKey,
  onChange,
}: FinanceProcessSelectorProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
            Process navigator
          </Typography.Text>
          <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
            Switch between reconciliation, treasury, and budget control while keeping run state and
            audit context per process.
          </Typography.Paragraph>
        </div>
        <Segmented
          value={activeModuleKey}
          onChange={(value) => onChange(value as ModuleKey)}
          options={moduleDefinitions.map((module) => ({
            label: module.eyebrow,
            value: module.key,
          }))}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        {moduleDefinitions.map((module) => {
          const state = modules[module.key]
          const isSelected = activeModuleKey === module.key

          return (
            <button key={module.key} type="button" className="text-left" onClick={() => onChange(module.key)}>
              <Card
                padding="sm"
                className={[
                  'h-full min-h-[152px] transition-colors',
                  isSelected
                    ? 'border-[var(--as-accent-border)] bg-[var(--as-bg-elevated)]'
                    : 'bg-[var(--as-bg-secondary)]',
                ].join(' ')}
              >
                <div className="flex h-full flex-col justify-between gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                        {module.eyebrow}
                      </Typography.Text>
                      <Typography.Title level={5} className="!mb-0.5 !mt-1.5 !text-[var(--as-text-primary)]">
                        {module.title}
                      </Typography.Title>
                      <Typography.Paragraph className="!mb-0 !mt-2 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
                        {module.description}
                      </Typography.Paragraph>
                    </div>
                    <RunStatusBadge status={state.run?.status ?? null} loading={state.loading} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--as-text-muted)] font-mono">
                      {module.permissionLabel}
                    </span>
                    <span className="text-[11px] text-[var(--as-text-muted)]">
                      {state.run ? (
                        <>
                          Last run: <span className="font-mono">{formatDate(state.run.created_at)}</span>
                        </>
                      ) : (
                        'No run yet.'
                      )}
                    </span>
                  </div>
                </div>
              </Card>
            </button>
          )
        })}
      </div>
    </section>
  )
}
