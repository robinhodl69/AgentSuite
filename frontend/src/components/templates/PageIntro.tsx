import { Typography } from 'antd'
import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

type PageIntroProps = {
  eyebrow?: string
  title: string
  description?: string
  chips?: ReactNode
  actions?: ReactNode
}

export function PageIntro({
  eyebrow = 'Workspace',
  title,
  description,
  chips,
  actions,
}: PageIntroProps) {
  return (
    <Card padding="lg" className="bg-[var(--as-bg-secondary)]">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1 space-y-2.5">
          <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
            {eyebrow}
          </Typography.Text>
          <Typography.Title level={2} className="!mb-0 !text-[var(--as-text-primary)]">
            {title}
          </Typography.Title>
          {description ? (
            <Typography.Paragraph className="!mb-0 max-w-3xl !text-sm !leading-7 !text-[var(--as-text-secondary)]">
              {description}
            </Typography.Paragraph>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>

      {chips ? <div className="mt-5 flex flex-wrap gap-2.5">{chips}</div> : null}
    </Card>
  )
}
