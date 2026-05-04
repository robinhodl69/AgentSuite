import { Typography } from 'antd'
import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

type DetailHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  status?: ReactNode
  metadata?: ReactNode
  actions?: ReactNode
}

export function DetailHeader({
  eyebrow = 'Record detail',
  title,
  description,
  status,
  metadata,
  actions,
}: DetailHeaderProps) {
  return (
    <Card padding="lg" className="bg-[var(--as-bg-secondary)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
            {eyebrow}
          </Typography.Text>
          <div className="flex flex-wrap items-center gap-2">
            <Typography.Title level={3} className="!mb-0 !font-mono !text-[var(--as-text-primary)]">
              {title}
            </Typography.Title>
            {status}
          </div>
          {description ? (
            <Typography.Paragraph className="!mb-0 max-w-3xl !text-sm !leading-7 !text-[var(--as-text-secondary)]">
              {description}
            </Typography.Paragraph>
          ) : null}
          {metadata ? <div className="flex flex-wrap gap-2">{metadata}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </Card>
  )
}
