import { Typography } from 'antd'
import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

type InspectorRailProps = {
  title: string
  description?: string
  children: ReactNode
}

export function InspectorRail({ title, description, children }: InspectorRailProps) {
  return (
    <Card padding="md" className="space-y-3">
      <div>
        <Typography.Text className="font-mono text-[10px] uppercase tracking-[0.18em] !text-[var(--as-text-muted)]">
          {title}
        </Typography.Text>
        {description ? (
          <Typography.Paragraph className="!mb-0 !mt-1 !text-xs !leading-5 !text-[var(--as-text-secondary)]">
            {description}
          </Typography.Paragraph>
        ) : null}
      </div>
      {children}
    </Card>
  )
}
