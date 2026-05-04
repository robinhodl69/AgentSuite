import {
  AppstoreOutlined,
  ClockCircleOutlined,
  NodeIndexOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { Typography } from 'antd'
import { Card } from '../ui/Card'

export type ModuleWorkspaceTab = 'overview' | 'processes' | 'readiness' | 'roadmap'

type ModuleWorkspaceNavProps = {
  value: ModuleWorkspaceTab
  onChange: (value: ModuleWorkspaceTab) => void
}

const options: Array<{
  label: string
  value: ModuleWorkspaceTab
  description: string
  icon: typeof AppstoreOutlined
}> = [
  {
    label: 'Overview',
    value: 'overview',
    description: 'Positioning, workspace target, and user-facing summary.',
    icon: AppstoreOutlined,
  },
  {
    label: 'Processes',
    value: 'processes',
    description: 'Operational flows grouped as reusable module surfaces.',
    icon: NodeIndexOutlined,
  },
  {
    label: 'Readiness',
    value: 'readiness',
    description: 'Dependencies, data contracts, and implementation gates.',
    icon: ClockCircleOutlined,
  },
  {
    label: 'Roadmap',
    value: 'roadmap',
    description: 'Delivery sequence from mockup to production workspace.',
    icon: RocketOutlined,
  },
]

export function ModuleWorkspaceNav({ value, onChange }: ModuleWorkspaceNavProps) {
  const activeOption = options.find((option) => option.value === value) ?? options[0]

  return (
    <Card padding="md" className="space-y-4 bg-[var(--as-bg-secondary)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
          Module workspace
        </Typography.Text>
        <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
          Use local sections so each module feels like a real ERP workspace instead of a single saturated page.
        </Typography.Paragraph>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {options.map((option) => {
          const Icon = option.icon
          const isActive = option.value === value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'rounded-[var(--as-radius-lg)] border px-4 py-3 text-left transition-colors',
                isActive
                  ? 'border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-text-primary)]'
                  : 'border-[var(--as-border-default)] bg-[var(--as-bg-primary)] text-[var(--as-text-secondary)] hover:border-[var(--as-border-strong)] hover:text-[var(--as-text-primary)]',
              ].join(' ')}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    'mt-0.5 flex h-9 w-9 items-center justify-center rounded-[var(--as-radius-md)] border',
                    isActive
                      ? 'border-[var(--as-accent-border)] bg-[var(--as-bg-primary)] text-[var(--as-accent)]'
                      : 'border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] text-[var(--as-text-muted)]',
                  ].join(' ')}
                >
                  <Icon />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                    {option.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--as-text-secondary)]">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="rounded-[var(--as-radius-lg)] border border-[var(--as-border-default)] bg-[var(--as-bg-primary)] px-4 py-3">
        <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
          Current section
        </Typography.Text>
        <Typography.Title level={5} className="!mb-1 !mt-2 !text-[var(--as-text-primary)]">
          {activeOption.label}
        </Typography.Title>
        <Typography.Paragraph className="!mb-0 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
          {activeOption.description}
        </Typography.Paragraph>
      </div>
    </Card>
  )
}
