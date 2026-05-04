import { ClockCircleOutlined, RocketOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Divider, Typography } from 'antd'
import type { ErpModule } from '../../lib/mock-data/erpModules'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export function ModulePreviewBoard({
  module,
  futureLayout,
}: {
  module: ErpModule
  futureLayout: string
}) {
  return (
    <div className="grid gap-7 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-5">
        <div className="space-y-3">
          <Badge variant="info">Operating model</Badge>
          <Typography.Title level={2} className="!mb-0 !max-w-2xl !text-[var(--as-text-primary)]">
            {module.title} is being shaped as a reusable ERP workspace.
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 !max-w-2xl !text-sm !leading-7 !text-[var(--as-text-secondary)]">
            The goal is to move this module from mockup to a production-ready floorplan with stable navigation, process grouping, and a predictable review model.
          </Typography.Paragraph>
        </div>

        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)] text-[var(--as-text-secondary)]">
              <ClockCircleOutlined />
            </div>
            <div className="space-y-2">
              <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                Module status
              </Typography.Text>
              <Typography.Paragraph className="!mb-0 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
                This page is a navigable blueprint used to validate IA, process grouping, and the
                future list-detail experience before backend workflows are connected.
              </Typography.Paragraph>
              <Badge variant="muted">{module.status}</Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]">
              <SafetyCertificateOutlined />
            </div>
            <div className="space-y-2">
              <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
                Future floorplan
              </Typography.Text>
              <Typography.Paragraph className="!mb-0 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
                This module is currently classified to evolve into a <strong>{futureLayout}</strong> once backend capabilities and review flows are connected.
              </Typography.Paragraph>
            </div>
          </div>
        </Card>
      </div>

      <section className="grid gap-4">
        {module.processes?.map((process, index) => (
          <Card key={process}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[var(--as-radius-md)] border border-[var(--as-accent-border)] bg-[var(--as-accent-subtle)] text-[var(--as-accent)]">
                  <RocketOutlined />
                </div>
                <div>
                  <Typography.Title level={5} className="!mb-1 !text-[var(--as-text-primary)]">
                    {process}
                  </Typography.Title>
                  <Typography.Paragraph className="!mb-0 !text-xs !leading-6 !text-[var(--as-text-secondary)]">
                    Planned as an enterprise workflow with operational inputs, live execution state,
                    review output, and durable history.
                  </Typography.Paragraph>
                </div>
              </div>
              <Badge variant="muted">Mock {index + 1}</Badge>
            </div>

            <Divider className="!my-4 !border-[var(--as-border-default)]" />
            <div className="rounded-[var(--as-radius-sm)] border border-[var(--as-border-default)] bg-[var(--as-bg-elevated)]/45 px-3 py-2 text-xs text-[var(--as-text-secondary)]">
              Enterprise process template queued for implementation.
            </div>
          </Card>
        ))}
      </section>
    </div>
  )
}
